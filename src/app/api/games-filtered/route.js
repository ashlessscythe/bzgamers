/**
 * API route for advanced game filtering
 * 
 * This endpoint allows filtering games by multiple criteria including:
 * - Platforms
 * - Release year range
 * - Rating range
 * - Genres
 * - Themes
 * - Original mood/time parameters
 */

import { findGamesByMood } from '@/lib/api-enhanced'
import { getCachedSearch, cacheSearch } from '@/lib/db-cache'
import { rateLimit } from '@/lib/request-limiter'

const shortText = (v) => (typeof v === 'string' && v.length <= 100 ? v : undefined)
const intOrUndefined = (v) => {
  const n = Number(v)
  return v !== '' && v != null && Number.isFinite(n) ? Math.trunc(n) : undefined
}
const idList = (v) =>
  Array.isArray(v)
    ? v
        .slice(0, 30)
        .map((x) => Number(x && typeof x === 'object' ? x.id : x))
        .filter((n) => Number.isInteger(n) && n > 0)
    : []

export async function POST(request) {
  try {
    const limited = await rateLimit(request, 'games-filtered', { limit: 30, windowMs: 60_000 })
    if (limited) return limited

    let body
    try {
      body = await request.json()
    } catch {
      return Response.json({ error: 'Invalid request body. Expected JSON.' }, { status: 400 })
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return Response.json({ error: 'Invalid request body' }, { status: 400 })
    }

    // Normalise untrusted input: these values end up in cache keys and IGDB queries
    const mood = shortText(body.mood)
    const timeAvailable = shortText(body.timeAvailable)
    const genre = Number.isInteger(body.genre) ? body.genre : shortText(body.genre)
    const platforms = idList(body.platforms)
    const themes = idList(body.themes)
    const releaseYearStart = intOrUndefined(body.releaseYearStart)
    const releaseYearEnd = intOrUndefined(body.releaseYearEnd)
    const minRating = intOrUndefined(body.minRating)
    const maxRating = intOrUndefined(body.maxRating)
    const sortBy = shortText(body.sortBy) ?? 'total_rating'
    const sortOrder = body.sortOrder === 'asc' ? 'asc' : 'desc'
    const limit = Math.min(Math.max(intOrUndefined(body.limit) ?? 20, 1), 50)

    // Create cache key for this specific filter combination
    const cacheKey = {
      type: 'advanced_filter',
      mood,
      timeAvailable,
      genre,
      platforms,
      releaseYearStart,
      releaseYearEnd,
      minRating,
      maxRating,
      themes,
      sortBy,
      sortOrder,
      limit
    }

    // Try to get cached results
    const cached = await getCachedSearch(cacheKey)
    if (cached) {
      return Response.json(cached)
    }

    // Build advanced filter parameters
    const filterParams = {
      mood,
      timeAvailable,
      genre,
      platforms,
      releaseYearStart,
      releaseYearEnd,
      minRating,
      maxRating,
      themes,
      sortBy,
      sortOrder,
      limit
    }

    // Get filtered games
    const games = await findGamesByMood(filterParams)

    // Cache the results
    await cacheSearch(cacheKey, games)

    return Response.json(games)
  } catch (error) {
    console.error('Error filtering games:', error)
    return Response.json(
      { error: 'Failed to filter games' },
      { status: 500 }
    )
  }
} 