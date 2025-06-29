/**
 * Enhanced Game API client for IGDB with Database Caching
 * 
 * This module provides functions to interact with the IGDB API,
 * with database-based caching and improved data persistence.
 */

// Load environment variables
require('dotenv').config()

// Import modules
const { handleApiError, ERROR_TYPES, createError } = require('./error-handler')
const { MOCK_GENRES, MOCK_GAMES, filterGamesByMood } = require('./mock-data')
const rateLimiter = require('./rate-limiter')
const dbCache = require('./db-cache')

// Flag to determine if we're using mock data
const USE_MOCK_DATA = process.env.NODE_ENV === 'development' && 
  (!process.env.NEXT_API_CLIENT_ID || !process.env.NEXT_API_CLIENT_SECRET)

// Log whether we're using mock data
if (USE_MOCK_DATA) {
  console.log('⚠️ API credentials not found. Using mock data for development.')
} else {
  console.log('✅ Using real IGDB API with database caching')
}

// Base URLs for IGDB API
const TWITCH_AUTH_URL = process.env.NEXT_PUBLIC_GAME_API_URL || 'https://id.twitch.tv/oauth2/token'
const IGDB_API_URL = 'https://api.igdb.com/v4'
const CLIENT_ID = process.env.NEXT_API_CLIENT_ID
const CLIENT_SECRET = process.env.NEXT_API_CLIENT_SECRET

/**
 * Get an access token from Twitch for IGDB API
 * @returns {Promise<string>} - Access token
 */
async function getAccessToken() {
  // If using mock data, return a fake token
  if (USE_MOCK_DATA) {
    return 'mock_access_token'
  }
  
  try {
    // Check if we have a cached token in the database
    const cachedToken = await dbCache.getCachedSearch({ type: 'auth_token' })
    
    if (cachedToken && cachedToken.token) {
      // Check if token is still valid (with 5 minute buffer)
      const now = Date.now()
      const tokenExpiryTime = cachedToken.createdAt + (cachedToken.expiresIn * 1000)
      const bufferTime = 5 * 60 * 1000 // 5 minutes in milliseconds
      
      if (now < (tokenExpiryTime - bufferTime)) {
        console.log(`✅ Using cached token (expires in ${Math.round((tokenExpiryTime - now) / 1000)}s)`)
        return cachedToken.token
      } else {
        console.log(`🔄 Cached token expired or expiring soon, refreshing...`)
      }
    }

    // Ensure we have client credentials
    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw createError(
        ERROR_TYPES.AUTH, 
        'IGDB API client ID or secret is missing. Please add them to your .env file.'
      )
    }

    console.log(`🔐 Requesting new Twitch OAuth2 token...`)
    
    // Request a new token
    const response = await fetch(
      `${TWITCH_AUTH_URL}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`,
      { method: 'POST' }
    )
    
    if (!response.ok) {
      const error = new Error(`Auth request failed with status ${response.status}`)
      error.status = response.status
      throw error
    }
    
    const data = await response.json()
    
    // Store token data with creation timestamp
    const tokenData = {
      token: data.access_token,
      expiresIn: data.expires_in,
      createdAt: Date.now(),
      tokenType: data.token_type
    }
    
    // Cache the token in the database
    await dbCache.cacheSearch(
      { type: 'auth_token' }, 
      tokenData, 
      (data.expires_in * 1000) - 300000 // Expire 5 minutes early
    )
    
    console.log(`✅ New token obtained (expires in ${data.expires_in}s)`)
    
    return data.access_token
  } catch (error) {
    throw handleApiError(error, 'getAccessToken')
  }
}

/**
 * Make a request to the IGDB API
 * @param {string} endpoint - API endpoint (e.g., 'games', 'genres')
 * @param {string} query - IGDB query string
 * @returns {Promise<Array>} - API response data
 */
async function igdbRequest(endpoint, query) {
  // If using mock data, return appropriate mock data based on endpoint
  if (USE_MOCK_DATA) {
    if (endpoint === 'genres') {
      return MOCK_GENRES
    } else if (endpoint === 'games') {
      return MOCK_GAMES
    } else if (endpoint === 'platforms') {
      return [
        { id: 48, name: 'PlayStation 4' },
        { id: 49, name: 'Xbox One' },
        { id: 130, name: 'Nintendo Switch' },
        { id: 6, name: 'PC' },
        { id: 167, name: 'PlayStation 5' }
      ]
    } else if (endpoint === 'themes') {
      return [
        { id: 1, name: 'Action', slug: 'action' },
        { id: 2, name: 'Fantasy', slug: 'fantasy' },
        { id: 3, name: 'Science Fiction', slug: 'science-fiction' },
        { id: 4, name: 'Horror', slug: 'horror' },
        { id: 5, name: 'Thriller', slug: 'thriller' }
      ]
    }
    return []
  }
  
  try {
    // Wait for rate limit slot before making request
    await rateLimiter.waitForSlot()
    
    const accessToken = await getAccessToken()
    
    // LOGGING: Print outgoing request
    console.log(`\n[IGDB REQUEST] Endpoint: ${endpoint}`)
    console.log(`[IGDB REQUEST] Query: ${query}`)
    
    const response = await fetch(`${IGDB_API_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Client-ID': CLIENT_ID,
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'text/plain'
      },
      body: query
    })
    
    // Release the rate limit slot
    rateLimiter.releaseSlot()
    
    if (!response.ok) {
      const error = new Error(`API request failed with status ${response.status}`)
      error.status = response.status
      error.endpoint = endpoint
      error.query = query
      throw error
    }
    
    const data = await response.json()
    
    // Cache the data in the database based on endpoint
    if (endpoint === 'games' && Array.isArray(data)) {
      for (const game of data) {
        await dbCache.cacheGame(game)
      }
    } else if (endpoint === 'genres' && Array.isArray(data)) {
      for (const genre of data) {
        await dbCache.cacheGenre(genre)
      }
    } else if (endpoint === 'platforms' && Array.isArray(data)) {
      for (const platform of data) {
        await dbCache.cachePlatform(platform)
      }
    } else if (endpoint === 'themes' && Array.isArray(data)) {
      for (const theme of data) {
        await dbCache.cacheTheme(theme)
      }
    }
    
    // LOGGING: Print part of the response
    console.log(`[IGDB RESPONSE] First 2 results:`, Array.isArray(data) ? data.slice(0,2) : data)
    
    return data
  } catch (error) {
    // Release the rate limit slot on error
    rateLimiter.releaseSlot()
    
    const handledError = handleApiError(error, `igdbRequest:${endpoint}`)
    
    // For some errors, we want to return an empty array instead of throwing
    if (handledError.type === ERROR_TYPES.NETWORK || 
        handledError.type === ERROR_TYPES.API) {
      console.error(`Error making IGDB request to ${endpoint}:`, handledError)
      return []
    }
    
    throw handledError
  }
}

/**
 * Fetch games from the IGDB API with database caching
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of results to return (default: 10)
 * @param {number} options.offset - Offset for pagination (default: 0)
 * @param {string} options.fields - Fields to include (default: all fields)
 * @param {string} options.where - Where clause for filtering
 * @param {string} options.sort - Sort field and direction
 * @returns {Promise<Array>} - Array of games
 */
async function fetchGames({ 
  limit = 10, 
  offset = 0, 
  fields = '*', 
  where = '', 
  sort = 'total_rating desc' 
} = {}) {
  // Check database cache first
  const cacheKey = { type: 'games', limit, offset, fields, where, sort }
  const cachedResults = await dbCache.getCachedSearch(cacheKey)
  
  if (cachedResults) {
    console.log(`[DB CACHE HIT] Games query`)
    return cachedResults
  }
  
  console.log(`[DB CACHE MISS] Games query - calling IGDB API`)
  
  let query = `fields ${fields};`
  
  if (where) {
    query += ` where ${where};`
  }
  
  query += ` sort ${sort}; limit ${limit}; offset ${offset};`
  
  const results = await igdbRequest('games', query)
  
  // Cache the results
  await dbCache.cacheSearch(cacheKey, results, dbCache.CACHE_TTL.GAMES)
  
  return results
}

/**
 * Fetch game details by ID with database caching
 * @param {number} gameId - The ID of the game to fetch
 * @returns {Promise<Object>} - Game details
 */
async function fetchGameById(gameId) {
  if (!gameId) {
    throw createError(ERROR_TYPES.VALIDATION, 'Game ID is missing')
  }

  // Check database cache first
  const cacheKey = { type: 'game_by_id', gameId }
  const cachedResults = await dbCache.getCachedSearch(cacheKey)
  
  if (cachedResults) {
    console.log(`[DB CACHE HIT] Game by ID: ${gameId}`)
    return cachedResults
  }
  
  console.log(`[DB CACHE MISS] Game by ID: ${gameId} - calling IGDB API`)

  const results = await igdbRequest('games', `fields *; where id = ${gameId};`)
  
  if (results.length === 0) {
    throw createError(ERROR_TYPES.NOT_FOUND, `Game with ID ${gameId} not found`)
  }
  
  const game = results[0]
  
  // Cache the result
  await dbCache.cacheSearch(cacheKey, game, dbCache.CACHE_TTL.GAMES)
  
  return game
}

/**
 * Search games by query string with database caching
 * @param {string} searchQuery - Search query
 * @param {Object} options - Additional options
 * @returns {Promise<Array>} - Search results
 */
async function searchGames(searchQuery, options = {}) {
  const { limit = 20, offset = 0, fields = '*' } = options
  
  if (!searchQuery) {
    throw createError(ERROR_TYPES.VALIDATION, 'Search query is missing')
  }
  
  // Check database cache first
  const cacheKey = { type: 'search', query: searchQuery, limit, offset, fields }
  const cachedResults = await dbCache.getCachedSearch(cacheKey)
  
  if (cachedResults) {
    console.log(`[DB CACHE HIT] Search: ${searchQuery}`)
    return cachedResults
  }
  
  console.log(`[DB CACHE MISS] Search: ${searchQuery} - calling IGDB API`)
  
  const query = `fields ${fields}; search "${searchQuery}"; limit ${limit}; offset ${offset};`
  const results = await igdbRequest('games', query)
  
  // Cache the results
  await dbCache.cacheSearch(cacheKey, results, dbCache.CACHE_TTL.SEARCH)
  
  return results
}

/**
 * Filter games by mood-related parameters with database caching
 * This is a custom function for BZGamers that maps mood/time/genre to IGDB parameters
 * @param {Object} filters - Mood-based filters
 * @param {string} filters.mood - User's current mood (e.g., 'relaxed', 'excited', 'focused')
 * @param {string} filters.timeAvailable - User's available time (e.g., 'short', 'medium', 'long')
 * @param {string|number} filters.genre - Preferred genre ID or name
 * @returns {Promise<Array>} - Filtered games
 */
async function findGamesByMood({ mood, timeAvailable, genre }) {
  console.log(`\n[FIND_GAMES_BY_MOOD] Called with:`, { mood, timeAvailable, genre })
  
  // If using mock data, use the mock filtering function
  if (USE_MOCK_DATA) {
    console.log('[FIND_GAMES_BY_MOOD] Using mock data')
    return filterGamesByMood(mood, timeAvailable, genre)
  }
  
  // Check database cache first
  const cacheKey = { type: 'mood_search', mood, timeAvailable, genre }
  const cachedResults = await dbCache.getCachedSearch(cacheKey)
  
  if (cachedResults) {
    console.log(`[DB CACHE HIT] Mood search: ${mood}/${timeAvailable}/${genre}`)
    return cachedResults
  }
  
  // Try to get results from cached games in database
  const cachedGames = await dbCache.getCachedGamesByMood({ 
    genres: genre ? [genre] : undefined,
    themes: mood ? [mood] : undefined
  })
  
  if (cachedGames.length > 0) {
    console.log(`[DB CACHE HIT] Found ${cachedGames.length} cached games for mood search`)
    await dbCache.cacheSearch(cacheKey, cachedGames, dbCache.CACHE_TTL.MOOD_RESULTS)
    return cachedGames
  }
  
  console.log('[FIND_GAMES_BY_MOOD] Using real IGDB API')
  
  // Map moods to IGDB themes and game modes
  const moodMappings = {
    relaxed: 'themes != (42) & genres != (5, 10, 14)', // Not shooter, racing, or sports
    excited: 'themes = (42) | genres = (5, 10, 14)', // Action themes, shooter, racing, or sports genres
    focused: 'genres = (15, 16)', // Strategy or puzzle genres
    social: 'game_modes = (2, 3, 4, 5)', // Multiplayer, co-op modes
    creative: 'genres = (13, 32)', // Simulator or indie genres
    nostalgic: 'first_release_date < 946684800', // Games released before 2000
  }

  // Map time available to game length using aggregated_rating as a proxy
  const timeMappings = {
    short: 'total_rating_count > 0 & total_rating < 75',
    medium: 'total_rating_count > 0 & total_rating >= 75 & total_rating < 85',
    long: 'total_rating_count > 0 & total_rating >= 85',
  }

  // Build the where clause
  let whereClause = []
  
  // Add mood filter
  if (mood && moodMappings[mood]) {
    whereClause.push(`(${moodMappings[mood]})`)
  }
  
  // Add time filter
  if (timeAvailable && timeMappings[timeAvailable]) {
    whereClause.push(`(${timeMappings[timeAvailable]})`)
  }
  
  // Add genre filter
  if (genre) {
    // Check if genre is a number (ID) or string (name)
    let genreFilter;
    
    if (isNaN(genre)) {
      // For string genre names, use a case-insensitive search
      genreFilter = `genres.name ~ "${genre}"`
    } else {
      // For numeric IDs, use exact match
      genreFilter = `genres = (${genre})`
    }
    
    whereClause.push(genreFilter)
  }
  
  // Combine all filters with AND
  const where = whereClause.length > 0 
    ? whereClause.join(' & ') 
    : ''
  
  console.log('Generated where clause:', where);
  
  const results = await fetchGames({
    limit: 12,
    fields: 'name,cover.*,first_release_date,total_rating,summary,url,genres.*,themes.*',
    where,
    sort: 'total_rating desc'
  })
  
  // Cache the results
  await dbCache.cacheSearch(cacheKey, results, dbCache.CACHE_TTL.MOOD_RESULTS)
  
  return results
}

/**
 * Get available genres from the API with database caching
 * @returns {Promise<Array>} - List of genres
 */
async function fetchGenres() {
  // If using mock data, return mock genres directly
  if (USE_MOCK_DATA) {
    return MOCK_GENRES
  }
  
  // Check database cache first
  const cachedGenres = await dbCache.getCachedGenres()
  
  if (cachedGenres.length > 0) {
    console.log(`[DB CACHE HIT] Found ${cachedGenres.length} cached genres`)
    return cachedGenres
  }
  
  console.log(`[DB CACHE MISS] Genres - calling IGDB API`)
  
  const results = await igdbRequest('genres', 'fields name,slug,url; sort name asc;')
  
  // Cache the results
  for (const genre of results) {
    await dbCache.cacheGenre(genre)
  }
  
  return results
}

/**
 * Get available platforms from the API with database caching
 * @returns {Promise<Array>} - List of platforms
 */
async function fetchPlatforms() {
  // If using mock data, return mock platforms
  if (USE_MOCK_DATA) {
    return [
      { id: 48, name: 'PlayStation 4' },
      { id: 49, name: 'Xbox One' },
      { id: 130, name: 'Nintendo Switch' },
      { id: 6, name: 'PC' },
      { id: 167, name: 'PlayStation 5' }
    ]
  }
  
  // Check database cache first
  const cachedPlatforms = await dbCache.getCachedPlatforms()
  
  if (cachedPlatforms.length > 0) {
    console.log(`[DB CACHE HIT] Found ${cachedPlatforms.length} cached platforms`)
    return cachedPlatforms
  }
  
  console.log(`[DB CACHE MISS] Platforms - calling IGDB API`)
  
  const results = await igdbRequest('platforms', 'fields name,slug,abbreviation,url; sort name asc;')
  
  // Cache the results
  for (const platform of results) {
    await dbCache.cachePlatform(platform)
  }
  
  return results
}

/**
 * Get available themes from the API with database caching
 * @returns {Promise<Array>} - List of themes
 */
async function fetchThemes() {
  // If using mock data, return mock themes
  if (USE_MOCK_DATA) {
    return [
      { id: 1, name: 'Action', slug: 'action' },
      { id: 2, name: 'Fantasy', slug: 'fantasy' },
      { id: 3, name: 'Science Fiction', slug: 'science-fiction' },
      { id: 4, name: 'Horror', slug: 'horror' },
      { id: 5, name: 'Thriller', slug: 'thriller' }
    ]
  }
  
  // Check database cache first
  const cachedThemes = await dbCache.getCachedThemes()
  
  if (cachedThemes.length > 0) {
    console.log(`[DB CACHE HIT] Found ${cachedThemes.length} cached themes`)
    return cachedThemes
  }
  
  console.log(`[DB CACHE MISS] Themes - calling IGDB API`)
  
  const results = await igdbRequest('themes', 'fields name,slug,url; sort name asc;')
  
  // Cache the results
  for (const theme of results) {
    await dbCache.cacheTheme(theme)
  }
  
  return results
}

/**
 * Test the API connection and database cache
 * @returns {Promise<Object>} - Test results
 */
async function testApiConnection() {
  try {
    console.log('🧪 Testing API connection and database cache...')
    
    const results = {
      apiConnection: false,
      databaseConnection: false,
      cacheStats: null,
      sampleData: null
    }
    
    // Test API connection
    try {
      const genres = await fetchGenres()
      results.apiConnection = genres.length > 0
      console.log(`✅ API connection: ${genres.length} genres fetched`)
    } catch (error) {
      console.error('❌ API connection failed:', error.message)
    }
    
    // Test database connection and get cache stats
    try {
      const stats = await dbCache.getCacheStats()
      results.databaseConnection = true
      results.cacheStats = stats
      console.log(`✅ Database connection: Cache stats retrieved`)
    } catch (error) {
      console.error('❌ Database connection failed:', error.message)
    }
    
    // Test sample data retrieval
    try {
      const games = await fetchGames({ limit: 3 })
      results.sampleData = games.length
      console.log(`✅ Sample data: ${games.length} games fetched`)
    } catch (error) {
      console.error('❌ Sample data failed:', error.message)
    }
    
    return results
  } catch (error) {
    console.error('❌ API test failed:', error)
    throw error
  }
}

/**
 * Get cache statistics
 * @returns {Promise<Object>} - Cache statistics
 */
async function getCacheStats() {
  return await dbCache.getCacheStats()
}

/**
 * Clean up expired cache entries
 */
async function cleanupCache() {
  return await dbCache.cleanupExpiredCache()
}

module.exports = {
  fetchGames,
  fetchGameById,
  searchGames,
  findGamesByMood,
  fetchGenres,
  fetchPlatforms,
  fetchThemes,
  testApiConnection,
  getCacheStats,
  cleanupCache,
  getAccessToken,
  igdbRequest
} 