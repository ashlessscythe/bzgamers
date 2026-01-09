/**
 * API route for finding games by mood
 * 
 * This endpoint uses the findGamesByMood function to get games based on
 * mood, time available, and genre preferences.
 */

import { findGamesByMood } from '@/lib/api'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { mood, timeAvailable, genre } = req.body

    // Validate input
    if (!mood && !timeAvailable && !genre) {
      return res.status(400).json({ 
        error: 'At least one parameter (mood, timeAvailable, or genre) is required' 
      })
    }

    const games = await findGamesByMood({ mood, timeAvailable, genre })
    res.status(200).json(games)
  } catch (error) {
    console.error('Error finding games by mood:', error)
    res.status(500).json({ 
      error: 'Failed to find games',
      message: error.message || 'Unknown error'
    })
  }
} 