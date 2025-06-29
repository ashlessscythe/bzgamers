/**
 * API route for finding games by mood
 * 
 * This endpoint uses the findGamesByMood function to get games based on
 * mood, time available, and genre preferences.
 */

import { findGamesByMood } from '../../../lib/api'
import { getCachedSearch, cacheSearch } from '../../../lib/db-cache'

export async function POST(request) {
  try {
    const { mood, timeAvailable, genre } = await request.json()
    const params = { mood, timeAvailable, genre }

    // 1. Try to get cached results
    const cached = await getCachedSearch(params)
    if (cached) {
      return Response.json(cached)
    }

    // 2. If not cached, fetch from IGDB
    const games = await findGamesByMood(params)

    // 3. Cache the results
    await cacheSearch(params, games)

    return Response.json(games)
  } catch (error) {
    console.error('Error finding games by mood:', error)
    return Response.json(
      { error: 'Failed to find games', message: error.message || 'Unknown error' },
      { status: 500 }
    )
  }
} 