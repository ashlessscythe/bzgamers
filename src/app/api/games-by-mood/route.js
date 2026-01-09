/**
 * API route for finding games by mood
 * 
 * This endpoint uses the findGamesByMood function to get games based on
 * mood, time available, and genre preferences.
 */

import { findGamesByMood } from '@/lib/api'
import { getCachedSearch, cacheSearch } from '@/lib/db-cache'

export async function POST(request) {
  try {
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      return Response.json(
        { error: 'Invalid request body. Expected JSON.' },
        { status: 400 }
      )
    }
    
    const { mood, timeAvailable, genre, offset = 0 } = body
    const params = { mood, timeAvailable, genre, offset }

    // 1. Try to get cached results (only for first page)
    if (offset === 0) {
      const cached = await getCachedSearch({ mood, timeAvailable, genre })
      if (cached) {
        return Response.json(cached)
      }
    }

    // 2. Fetch from IGDB with offset
    const games = await findGamesByMood(params)

    // 3. Cache the results (only for first page)
    if (offset === 0) {
      await cacheSearch({ mood, timeAvailable, genre }, games)
    }

    return Response.json(games)
  } catch (error) {
    console.error('Error finding games by mood:', error)
    return Response.json(
      { error: 'Failed to find games', message: error.message || 'Unknown error' },
      { status: 500 }
    )
  }
} 