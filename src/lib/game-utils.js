/** IGDB fields for single-game fetches (must include cover.* for image URLs). */
export const GAME_DETAIL_FIELDS =
  'name,cover.*,first_release_date,total_rating,summary,url,slug,genres.*,themes.*,platforms.*,storyline,rating,rating_count'

/**
 * Normalize game objects from API, favorites JSON, or legacy seed data.
 */
export function getGameId(game, fallbackId) {
  if (!game) return fallbackId ?? null
  return game.id ?? game.igdbId ?? fallbackId ?? null
}

export function isStaleGameData(gameData, gameId) {
  if (!gameData || typeof gameData !== 'object') return true
  const id = getGameId(gameData, gameId)
  if (!id || Number(id) !== Number(gameId)) return true
  if (!gameData.url) return true
  if (!hasResolvableCover(gameData.cover)) return true
  return false
}

/** True when cover has enough data to build an image URL. */
export function hasResolvableCover(cover) {
  if (cover == null || typeof cover === 'number') return false
  return !!(cover.url || cover.image_id)
}

export function normalizeGame(game, gameId) {
  const id = getGameId(game, gameId)
  if (!id) return game

  return {
    ...game,
    id: Number(id),
    name: game?.name ?? game?.gameName ?? 'Unknown Game',
    url: game?.url || getIgdbFallbackUrl(id),
  }
}

/** IGDB web URL when API url is missing (legacy favorites). */
export function getIgdbFallbackUrl(gameId) {
  return `https://www.igdb.com/games/${gameId}`
}

export function getLearnMoreUrl(game, gameId) {
  const normalized = normalizeGame(game, gameId)
  const url = normalized?.url
  if (url && url !== '#') return url
  const id = getGameId(game, gameId)
  return id ? getIgdbFallbackUrl(id) : '#'
}

export function getCoverImageUrl(cover, size = 'big') {
  if (!hasResolvableCover(cover)) return null

  const sizeToken = size === 'small' ? 't_cover_small' : 't_cover_big'

  if (cover.image_id) {
    return `https://images.igdb.com/igdb/image/upload/${sizeToken}/${cover.image_id}.jpg`
  }

  let url = cover.url.startsWith('//') ? `https:${cover.url}` : cover.url
  if (url.includes('images.igdb.com')) {
    return url.replace(/\/t_[^/]+\//, `/${sizeToken}/`)
  }
  return url.replace('t_thumb', sizeToken)
}
