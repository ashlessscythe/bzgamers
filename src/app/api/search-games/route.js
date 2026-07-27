/**
 * API route for searching games by name
 * 
 * This endpoint searches for games by query string
 */

import { searchGames } from '@/lib/api'
import { getCachedSearch, cacheSearch } from '@/lib/db-cache'
import { trackVisitorEventAsync } from '@/lib/analytics'

export async function POST(request) {
  try {
    const { query, limit = 20, offset = 0 } = await request.json()
    
    if (!query || query.trim() === '') {
      return Response.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    // Create cache key
    const cacheKey = {
      type: 'game_search',
      query: query.trim(),
      limit,
      offset
    }

    // Try to get cached results
    if (offset === 0) {
      const cached = await getCachedSearch(cacheKey)
      if (cached) {
        trackVisitorEventAsync(request, {
          eventType: 'game_search',
          searchQuery: query.trim(),
          resultCount: Array.isArray(cached) ? cached.length : null,
          metadata: { limit, offset, cached: true },
        })
        return Response.json(cached)
      }
    }

    // Search for games
    const games = await searchGames(query.trim(), {
      limit,
      offset,
      fields: 'name,cover.*,first_release_date,total_rating,summary,url,genres.*,themes.*,platforms.*'
    })

    // Cache the results (only for first page)
    if (offset === 0) {
      await cacheSearch(cacheKey, games)
    }

    trackVisitorEventAsync(request, {
      eventType: 'game_search',
      searchQuery: query.trim(),
      resultCount: Array.isArray(games) ? games.length : null,
      metadata: { limit, offset, cached: false },
    })

    return Response.json(games)
  } catch (error) {
    console.error('Error searching games:', error)
    return Response.json(
      { error: 'Failed to search games', message: error.message || 'Unknown error' },
      { status: 500 }
    )
  }
}
