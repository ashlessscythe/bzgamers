/**
 * API route for fetching genres from IGDB
 * 
 * This endpoint fetches genres from the IGDB API and returns them to the client.
 * This keeps the API credentials secure on the server side.
 */

import { fetchGenres } from '../../../lib/api'

export async function GET() {
  try {
    const genres = await fetchGenres()
    return Response.json(genres)
  } catch (error) {
    console.error('Error fetching genres:', error)
    return Response.json({ 
      error: 'Failed to fetch genres',
      message: error.message || 'Unknown error'
    }, { status: 500 })
  }
} 