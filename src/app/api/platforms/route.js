/**
 * API route for fetching platforms from IGDB
 * 
 * This endpoint fetches platforms from the IGDB API and returns them to the client.
 * This keeps the API credentials secure on the server side.
 */

import { fetchPlatforms } from '../../../lib/api-enhanced'

export async function GET() {
  try {
    const platforms = await fetchPlatforms()
    return Response.json(platforms)
  } catch (error) {
    console.error('Error fetching platforms:', error)
    return Response.json({ 
      error: 'Failed to fetch platforms',
      message: error.message || 'Unknown error'
    }, { status: 500 })
  }
} 