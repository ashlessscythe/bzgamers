/**
 * API route for finding similar games
 * 
 * This endpoint finds games similar to a given game, filtered by the same platforms
 */

import { fetchGames } from '../../../lib/api'
import { getCachedSearch, cacheSearch } from '../../../lib/db-cache'

export async function POST(request) {
  try {
    const { gameId, offset = 0 } = await request.json()
    
    if (!gameId) {
      return Response.json(
        { error: 'Game ID is required' },
        { status: 400 }
      )
    }

    // Create cache key
    const cacheKey = {
      type: 'similar_games',
      gameId,
      offset
    }

    // Try to get cached results
    if (offset === 0) {
      const cached = await getCachedSearch(cacheKey)
      if (cached) {
        return Response.json(cached)
      }
    }

    // Fetch the base game to get its genres, themes, and platforms
    const baseGames = await fetchGames({
      limit: 1,
      offset: 0,
      fields: 'id,name,genres.*,themes.*,platforms.*',
      where: `id = ${gameId}`
    })
    
    if (!baseGames || baseGames.length === 0) {
      return Response.json(
        { error: 'Game not found' },
        { status: 404 }
      )
    }
    
    const baseGame = baseGames[0]

    // Extract genres, themes, and platforms from the base game
    const genreIds = baseGame.genres && baseGame.genres.length > 0
      ? baseGame.genres.map(g => g.id)
      : []
    
    const themeIds = baseGame.themes && baseGame.themes.length > 0
      ? baseGame.themes.map(t => t.id)
      : []
    
    const platformIds = baseGame.platforms && baseGame.platforms.length > 0
      ? baseGame.platforms.map(p => p.id)
      : []

    // Build where clause for similar games
    let whereClause = []
    
    // Exclude the original game
    whereClause.push(`id != ${gameId}`)
    
    // Filter by platforms (must match at least one platform) - REQUIRED
    if (platformIds.length > 0) {
      whereClause.push(`platforms = (${platformIds.join(',')})`)
    } else {
      // If no platforms, we can't filter properly, return empty
      return Response.json([])
    }
    
    // Build similarity filters (genres OR themes) - at least one must match
    const similarityFilters = []
    
    if (genreIds.length > 0) {
      similarityFilters.push(`genres = (${genreIds.join(',')})`)
    }
    
    if (themeIds.length > 0) {
      similarityFilters.push(`themes = (${themeIds.join(',')})`)
    }
    
    // Add similarity filter if we have any genres or themes
    if (similarityFilters.length > 0) {
      // Use OR logic: match games that share genres OR themes
      whereClause.push(`(${similarityFilters.join(' | ')})`)
    } else {
      // If no genres or themes, we can't find similar games
      // Return games on same platforms but without similarity filter
      console.warn(`Game ${gameId} has no genres or themes for similarity matching`)
    }

    // Combine all filters with AND
    const where = whereClause.length > 0 
      ? whereClause.join(' & ') 
      : `id != ${gameId}`

    // Fetch similar games
    const similarGames = await fetchGames({
      limit: 12,
      offset,
      fields: 'name,cover.*,first_release_date,total_rating,summary,url,genres.*,themes.*,platforms.*',
      where,
      sort: 'total_rating desc'
    })

    // Cache the results (only for first page)
    if (offset === 0) {
      await cacheSearch(cacheKey, similarGames)
    }

    return Response.json(similarGames)
  } catch (error) {
    console.error('Error finding similar games:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Failed to find similar games'
    let statusCode = 500
    
    if (error.status === 400) {
      errorMessage = 'Invalid request to game database. Please try again.'
      statusCode = 400
    } else if (error.status === 404) {
      errorMessage = 'Game not found'
      statusCode = 404
    } else if (error.message) {
      errorMessage = error.message
    }
    
    return Response.json(
      { 
        error: errorMessage, 
        message: error.message || 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: statusCode }
    )
  }
}

