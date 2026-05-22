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
  if (!gameData.cover?.url) return true
  return false
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
  if (!cover?.url) return null
  let url = cover.url.startsWith('//') ? `https:${cover.url}` : cover.url
  if (size === 'small') {
    url = url.replace('t_thumb', 't_cover_small')
  } else {
    url = url.replace('t_thumb', 't_cover_big')
  }
  return url
}
