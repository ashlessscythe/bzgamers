/**
 * API route for fetching genres from IGDB
 * 
 * This endpoint fetches genres from the IGDB API and returns them to the client.
 * This keeps the API credentials secure on the server side.
 */

import { fetchGenres } from '../../lib/api'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const genres = await fetchGenres()
    res.status(200).json(genres)
  } catch (error) {
    console.error('Error fetching genres:', error)
    res.status(500).json({ 
      error: 'Failed to fetch genres',
      message: error.message || 'Unknown error'
    })
  }
} 