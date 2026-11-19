/**
 * API route for fetching platforms from IGDB
 * 
 * This endpoint fetches platforms from the IGDB API and returns them to the client.
 * This keeps the API credentials secure on the server side.
 */

import { fetchPlatforms } from '@/lib/api-enhanced'
import { rateLimit } from '@/lib/request-limiter'

export async function GET(request) {
  try {
    const limited = await rateLimit(request, 'platforms', { limit: 60, windowMs: 60_000 })
    if (limited) return limited

    const platforms = await fetchPlatforms()
    return Response.json(platforms)
  } catch (error) {
    console.error('Error fetching platforms:', error)
    return Response.json({ 
      error: 'Failed to fetch platforms'
    }, { status: 500 })
  }
} 