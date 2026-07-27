/**
 * API route for finding similar games
 *
 * Uses IGDB's curated similar_games when available, then supplements with
 * candidates ranked by genre/theme/game-mode overlap (not just rating).
 */

import { fetchGames } from '../../../lib/api'
import { getCachedSearch, cacheSearch } from '../../../lib/db-cache'
import { trackVisitorEventAsync } from '@/lib/analytics'

const PAGE_SIZE = 12
const CANDIDATE_POOL = 60
const IGDB_SIMILAR_BOOST = 1000
const INDIE_GENRE_ID = 32

const RESULT_FIELDS =
  'name,cover.*,first_release_date,total_rating,summary,url,genres.*,themes.*,platforms.*,game_modes.*,player_perspectives.*'

function idsFromRelation(items) {
  if (!items?.length) return []
  return items.map((item) => (typeof item === 'number' ? item : item.id)).filter(Boolean)
}

function scoreSimilarity(candidate, base) {
  const baseGenreIds = new Set(idsFromRelation(base.genres))
  const baseThemeIds = new Set(idsFromRelation(base.themes))
  const baseModeIds = new Set(idsFromRelation(base.game_modes))
  const basePerspectiveIds = new Set(idsFromRelation(base.player_perspectives))

  const candidateGenreIds = idsFromRelation(candidate.genres)
  const candidateThemeIds = idsFromRelation(candidate.themes)
  const genreOverlapCount = candidateGenreIds.filter((id) => baseGenreIds.has(id)).length

  // Require genre overlap when the base game has genres (themes alone are too broad)
  if (baseGenreIds.size > 0) {
    if (genreOverlapCount === 0) return -1
    // One shared genre (e.g. "Adventure") is weak when the base has several
    if (baseGenreIds.size >= 2 && genreOverlapCount < 2) return -1
    // Indie-tagged games are usually a different slice than AAA action titles
    if (baseGenreIds.has(INDIE_GENRE_ID) && !candidateGenreIds.includes(INDIE_GENRE_ID)) {
      return -1
    }
  } else if (baseThemeIds.size > 0) {
    if (!candidateThemeIds.some((id) => baseThemeIds.has(id))) return -1
  } else {
    return -1
  }

  let score = genreOverlapCount * 4
  for (const id of candidateThemeIds) {
    if (baseThemeIds.has(id)) score += 2
  }
  for (const id of idsFromRelation(candidate.game_modes)) {
    if (baseModeIds.has(id)) score += 2
  }
  for (const id of idsFromRelation(candidate.player_perspectives)) {
    if (basePerspectiveIds.has(id)) score += 1
  }

  return score
}

function orderByIdList(games, idOrder) {
  const byId = new Map(games.map((g) => [g.id, g]))
  return idOrder.map((id) => byId.get(id)).filter(Boolean)
}

function compareRanked(a, b) {
  if (b.score !== a.score) return b.score - a.score
  return (b.game.total_rating || 0) - (a.game.total_rating || 0)
}

async function buildRankedSimilarGames(baseGame, gameId) {
  const platformIds = idsFromRelation(baseGame.platforms)
  if (platformIds.length === 0) return []

  const excludeId = Number(gameId)
  const genreIds = idsFromRelation(baseGame.genres)
  const themeIds = idsFromRelation(baseGame.themes)
  const seen = new Set([excludeId])
  const ranked = []

  // 1. IGDB curated similar games (strong signal)
  const similarGameIds = idsFromRelation(baseGame.similar_games)
  if (similarGameIds.length > 0) {
    const igdbSimilar = await fetchGames({
      limit: similarGameIds.length,
      offset: 0,
      fields: RESULT_FIELDS,
      where: `id = (${similarGameIds.join(',')}) & platforms = (${platformIds.join(',')})`,
      sort: 'total_rating desc',
    })
    for (const game of orderByIdList(igdbSimilar, similarGameIds)) {
      if (seen.has(game.id)) continue
      const overlap = scoreSimilarity(game, baseGame)
      if (overlap < 0) continue
      seen.add(game.id)
      ranked.push({
        game,
        score: IGDB_SIMILAR_BOOST + overlap,
      })
    }
  }

  // 2. Broader pool, ranked by tag overlap
  const whereParts = [`id != ${excludeId}`, `platforms = (${platformIds.join(',')})`]
  if (genreIds.length > 0) {
    whereParts.push(`genres = (${genreIds.join(',')})`)
  } else if (themeIds.length > 0) {
    whereParts.push(`themes = (${themeIds.join(',')})`)
  } else {
    return ranked.sort(compareRanked)
  }

  const candidates = await fetchGames({
    limit: CANDIDATE_POOL,
    offset: 0,
    fields: RESULT_FIELDS,
    where: whereParts.join(' & '),
    sort: 'total_rating desc',
  })

  for (const game of candidates) {
    if (seen.has(game.id)) continue
    const score = scoreSimilarity(game, baseGame)
    if (score < 0) continue
    seen.add(game.id)
    ranked.push({ game, score })
  }

  ranked.sort(compareRanked)
  return ranked
}

export async function POST(request) {
  try {
    const { gameId, offset = 0, gameName } = await request.json()

    if (!gameId) {
      return Response.json({ error: 'Game ID is required' }, { status: 400 })
    }

    const cacheKey = {
      type: 'similar_games_v3',
      gameId,
      offset,
    }

    if (offset === 0) {
      const cached = await getCachedSearch(cacheKey)
      if (cached) {
        trackVisitorEventAsync(request, {
          eventType: 'similar_search',
          gameId,
          gameName: gameName || null,
          resultCount: Array.isArray(cached) ? cached.length : null,
          metadata: { offset, cached: true },
        })
        return Response.json(cached)
      }
    }

    const baseGames = await fetchGames({
      limit: 1,
      offset: 0,
      fields:
        'id,name,similar_games,genres.*,themes.*,platforms.*,game_modes.*,player_perspectives.*',
      where: `id = ${gameId}`,
    })

    if (!baseGames?.length) {
      return Response.json({ error: 'Game not found' }, { status: 404 })
    }

    const baseGame = baseGames[0]
    const ranked = await buildRankedSimilarGames(baseGame, gameId)
    const page = ranked
      .slice(offset, offset + PAGE_SIZE)
      .map((entry) => entry.game)

    if (offset === 0) {
      await cacheSearch(cacheKey, page)
    }

    trackVisitorEventAsync(request, {
      eventType: 'similar_search',
      gameId,
      gameName: gameName || baseGame.name || null,
      resultCount: Array.isArray(page) ? page.length : null,
      metadata: { offset, cached: false },
    })

    return Response.json(page)
  } catch (error) {
    console.error('Error finding similar games:', error)

    let errorMessage = 'Failed to find similar games'
    let statusCode = 500

    if (error.status === 400) {
      errorMessage = 'Invalid request to game database. Please try again.'
      statusCode = 400
    } else if (error.status === 404) {
      errorMessage = 'Game not found'
      statusCode = 404
    } else if (error.message) {
      errorMessage = error.message
    }

    return Response.json(
      {
        error: errorMessage,
        message: error.message || 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: statusCode }
    )
  }
}
