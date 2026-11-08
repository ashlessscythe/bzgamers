/**
 * "Give me a game like…" focus tags: the user can narrow a similar-games
 * search to up to MAX_FOCUS_TAGS of the seed game's own genres/themes.
 */
import { toIgdbId } from './igdb-sanitize'

export const MAX_FOCUS_TAGS = 4

function idsOf(items) {
  if (!Array.isArray(items)) return []
  return items.map((i) => (typeof i === 'number' ? i : i?.id)).filter((id) => Number.isInteger(id))
}

function cleanIds(raw, allowed) {
  if (!Array.isArray(raw)) return []
  const out = []
  for (const value of raw) {
    let id
    try {
      id = toIgdbId(value)
    } catch {
      continue
    }
    // Only tags that actually belong to the seed game are accepted
    if (allowed.has(id) && !out.includes(id)) out.push(id)
  }
  return out
}

/**
 * Validate a client-supplied focus against the seed game.
 * @param {{genres?: unknown[], themes?: unknown[]}|undefined} rawFocus
 * @param {object} baseGame - IGDB game with genres/themes
 * @returns {{genres: number[], themes: number[]}|null} null when no valid focus
 */
export function parseFocus(rawFocus, baseGame) {
  if (!rawFocus || typeof rawFocus !== 'object') return null
  const genres = cleanIds(rawFocus.genres, new Set(idsOf(baseGame?.genres)))
  const themes = cleanIds(rawFocus.themes, new Set(idsOf(baseGame?.themes)))

  // Enforce the overall cap (genres first, matching UI order)
  const limitedGenres = genres.slice(0, MAX_FOCUS_TAGS)
  const limitedThemes = themes.slice(0, MAX_FOCUS_TAGS - limitedGenres.length)
  if (limitedGenres.length + limitedThemes.length === 0) return null
  return { genres: limitedGenres, themes: limitedThemes }
}

/** Seed game whose genres/themes are replaced by the focus, for scoring/querying. */
export function applyFocus(baseGame, focus) {
  if (!focus) return baseGame
  return { ...baseGame, genres: focus.genres, themes: focus.themes }
}

/** Stable string for cache keys. */
export function focusKey(focus) {
  if (!focus) return ''
  return `g:${[...focus.genres].sort((a, b) => a - b).join(',')}|t:${[...focus.themes].sort((a, b) => a - b).join(',')}`
}
