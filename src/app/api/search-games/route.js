/**
 * API route for searching games by name
 * 
 * This endpoint searches for games by query string
 */

import { searchGames } from '@/lib/api'
import { getCachedSearch, cacheSearch } from '@/lib/db-cache'
import { rateLimit } from '@/lib/request-limiter'
import { clampInt } from '@/lib/igdb-sanitize'
import { trackVisitorEventAsync } from '@/lib/analytics'

export async function POST(request) {
  try {
    const limited = await rateLimit(request, 'search-games', { limit: 60, windowMs: 60000 })
    if (limited) return limited

    const body = await request.json()
    const query = typeof body.query === 'string' ? body.query.slice(0, 200) : ''
    const limit = clampInt(body.limit, 1, 50, 20)
    const offset = clampInt(body.offset, 0, 5000, 0)
    
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
      { error: 'Failed to search games' },
      { status: 500 }
    )
  }
}
