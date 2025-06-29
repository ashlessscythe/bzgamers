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

import { findGamesByMood } from '../../../lib/api-enhanced'
import { getCachedSearch, cacheSearch } from '../../../lib/db-cache'

export async function POST(request) {
  try {
    const { 
      mood, 
      timeAvailable, 
      genre,
      platforms = [],
      releaseYearStart,
      releaseYearEnd,
      minRating,
      maxRating,
      themes = [],
      sortBy = 'total_rating',
      sortOrder = 'desc',
      limit = 20
    } = await request.json()

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
      { error: 'Failed to filter games', message: error.message || 'Unknown error' },
      { status: 500 }
    )
  }
} 