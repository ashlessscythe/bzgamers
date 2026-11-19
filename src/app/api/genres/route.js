/**
 * API route for fetching genres from IGDB
 * 
 * This endpoint fetches genres from the IGDB API and returns them to the client.
 * This keeps the API credentials secure on the server side.
 */

import { fetchGenres } from '@/lib/api'
import { rateLimit } from '@/lib/request-limiter'

export async function GET(request) {
  try {
    const limited = await rateLimit(request, 'genres', { limit: 60, windowMs: 60_000 })
    if (limited) return limited

    const genres = await fetchGenres()
    return Response.json(genres)
  } catch (error) {
    console.error('Error fetching genres:', error)
    return Response.json({ 
      error: 'Failed to fetch genres'
    }, { status: 500 })
  }
} 