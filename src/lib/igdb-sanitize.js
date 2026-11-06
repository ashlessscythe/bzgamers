/**
 * Helpers for safely interpolating user input into IGDB (Apicalypse) queries.
 */

/** Escape a value for use inside a double-quoted Apicalypse string. */
function escapeIgdbString(value) {
  return String(value)
    .replace(/[\u0000-\u001f]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
}

/** Coerce to a positive integer or throw. */
function toIgdbId(value) {
  const n = Number(value)
  if (!Number.isInteger(n) || n <= 0) {
    throw new TypeError('Invalid ID')
  }
  return n
}

/** Coerce a list of ids (numbers or {id}) to a deduped integer list. */
function toIgdbIdList(values) {
  if (!Array.isArray(values)) return []
  return [...new Set(values.map((v) => toIgdbId(v && typeof v === 'object' ? v.id : v)))]
}

const SORT_FIELDS = new Set([
  'total_rating',
  'rating',
  'first_release_date',
  'name',
  'total_rating_count',
  'popularity',
])

/** Allow-list sort field/direction. */
function safeSort(sortBy, sortOrder) {
  return {
    sortBy: SORT_FIELDS.has(sortBy) ? sortBy : 'total_rating',
    sortOrder: sortOrder === 'asc' ? 'asc' : 'desc',
  }
}

/** Clamp a number into [min, max], falling back to `fallback`. */
function clampInt(value, min, max, fallback) {
  const n = parseInt(value, 10)
  if (!Number.isFinite(n)) return fallback
  return Math.min(Math.max(n, min), max)
}

module.exports = { escapeIgdbString, toIgdbId, toIgdbIdList, safeSort, clampInt }
