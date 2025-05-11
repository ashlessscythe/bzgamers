/**
 * Game API client for IGDB
 * Documentation: https://api.igdb.com/v4/docs
 * 
 * This module provides functions to interact with the IGDB API,
 * with built-in caching and error handling.
 * 
 * When API credentials are not available, it falls back to mock data.
 */

// Import cache and error handling modules
const { withCache, setCachedItem, getCachedItem } = require('./api-cache')
const { handleApiError, ERROR_TYPES, createError } = require('./error-handler')
const { MOCK_GENRES, MOCK_GAMES, filterGamesByMood } = require('./mock-data')

// Flag to determine if we're using mock data
const USE_MOCK_DATA = process.env.NODE_ENV === 'development' && 
  (!process.env.NEXT_API_CLIENT_ID || !process.env.NEXT_API_CLIENT_SECRET)

// Log whether we're using mock data
if (USE_MOCK_DATA) {
  console.log('⚠️ API credentials not found. Using mock data for development.')
}

// Base URLs for IGDB API
const TWITCH_AUTH_URL = process.env.NEXT_PUBLIC_GAME_API_URL || 'https://id.twitch.tv/oauth2/token'
const IGDB_API_URL = 'https://api.igdb.com/v4'
const CLIENT_ID = process.env.NEXT_API_CLIENT_ID
const CLIENT_SECRET = process.env.NEXT_API_CLIENT_SECRET

// Cache keys
const CACHE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  GENRES: 'genres',
  THEMES: 'themes',
  GAME_PREFIX: 'game_',
  SEARCH_PREFIX: 'search_',
  MOOD_PREFIX: 'mood_'
}

// Cache TTLs (in milliseconds)
const CACHE_TTL = {
  AUTH_TOKEN: 3600000, // 1 hour
  GENRES: 86400000, // 24 hours
  THEMES: 86400000, // 24 hours
  GAMES: 3600000, // 1 hour
  SEARCH: 1800000, // 30 minutes
  MOOD_RESULTS: 1800000 // 30 minutes
}

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
    // Check if we have a valid cached token
    const cachedToken = getCachedItem(CACHE_KEYS.AUTH_TOKEN)
    if (cachedToken) {
      return cachedToken.token
    }

    // Ensure we have client credentials
    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw createError(
        ERROR_TYPES.AUTH, 
        'IGDB API client ID or secret is missing. Please add them to your .env file.'
      )
    }

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
    
    // Cache the token with TTL slightly shorter than the actual expiry
    const tokenData = {
      token: data.access_token,
      expiresIn: data.expires_in
    }
    
    setCachedItem(
      CACHE_KEYS.AUTH_TOKEN, 
      tokenData, 
      (data.expires_in * 1000) - 300000 // Expire 5 minutes early to be safe
    )
    
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
    const accessToken = await getAccessToken()
    
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
    
    if (!response.ok) {
      const error = new Error(`API request failed with status ${response.status}`)
      error.status = response.status
      error.endpoint = endpoint
      error.query = query
      throw error
    }
    
    return await response.json()
  } catch (error) {
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
 * Generate a cache key for fetchGames
 * @param {Object} options - Query options
 * @returns {string} - Cache key
 */
function generateGamesCacheKey(options) {
  const { limit, offset, fields, where, sort } = options
  return `${CACHE_KEYS.GAME_PREFIX}${where}_${sort}_${limit}_${offset}_${fields.replace(/\s/g, '')}`
}

/**
 * Fetch games from the IGDB API with caching
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of results to return (default: 10)
 * @param {number} options.offset - Offset for pagination (default: 0)
 * @param {string} options.fields - Fields to include (default: all fields)
 * @param {string} options.where - Where clause for filtering
 * @param {string} options.sort - Sort field and direction
 * @returns {Promise<Array>} - Array of games
 */
const fetchGames = withCache(
  async function({ 
    limit = 10, 
    offset = 0, 
    fields = '*', 
    where = '', 
    sort = 'total_rating desc' 
  } = {}) {
    let query = `fields ${fields};`
    
    if (where) {
      query += ` where ${where};`
    }
    
    query += ` sort ${sort}; limit ${limit}; offset ${offset};`
    
    return igdbRequest('games', query)
  },
  generateGamesCacheKey,
  CACHE_TTL.GAMES
)

/**
 * Fetch game details by ID with caching
 * @param {number} gameId - The ID of the game to fetch
 * @returns {Promise<Object>} - Game details
 */
const fetchGameById = withCache(
  async function(gameId) {
    if (!gameId) {
      throw createError(ERROR_TYPES.VALIDATION, 'Game ID is missing')
    }

    const results = await igdbRequest('games', `fields *; where id = ${gameId};`)
    
    if (results.length === 0) {
      throw createError(ERROR_TYPES.NOT_FOUND, `Game with ID ${gameId} not found`)
    }
    
    return results[0]
  },
  (gameId) => `${CACHE_KEYS.GAME_PREFIX}id_${gameId}`,
  CACHE_TTL.GAMES
)

/**
 * Search games by query string with caching
 * @param {string} searchQuery - Search query
 * @param {Object} options - Additional options
 * @returns {Promise<Array>} - Search results
 */
const searchGames = withCache(
  async function(searchQuery, options = {}) {
    const { limit = 20, offset = 0, fields = '*' } = options
    
    if (!searchQuery) {
      throw createError(ERROR_TYPES.VALIDATION, 'Search query is missing')
    }
    
    const query = `fields ${fields}; search "${searchQuery}"; limit ${limit}; offset ${offset};`
    
    return igdbRequest('games', query)
  },
  (searchQuery, options = {}) => {
    const { limit = 20, offset = 0 } = options
    return `${CACHE_KEYS.SEARCH_PREFIX}${searchQuery}_${limit}_${offset}`
  },
  CACHE_TTL.SEARCH
)

/**
 * Filter games by mood-related parameters with caching
 * This is a custom function for BZGamers that maps mood/time/genre to IGDB parameters
 * @param {Object} filters - Mood-based filters
 * @param {string} filters.mood - User's current mood (e.g., 'relaxed', 'excited', 'focused')
 * @param {string} filters.timeAvailable - User's available time (e.g., 'short', 'medium', 'long')
 * @param {string|number} filters.genre - Preferred genre ID or name
 * @returns {Promise<Array>} - Filtered games
 */
const findGamesByMood = withCache(
  async function({ mood, timeAvailable, genre }) {
    // If using mock data, use the mock filtering function
    if (USE_MOCK_DATA) {
      return filterGamesByMood(mood, timeAvailable, genre)
    }
    
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
        genreFilter = `genres.name ~ *"${genre}"*`
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
    
    return fetchGames({
      limit: 12,
      fields: 'name,cover.*,first_release_date,total_rating,summary,url,genres.*,themes.*',
      where,
      sort: 'total_rating desc'
    })
  },
  ({ mood, timeAvailable, genre }) => 
    `${CACHE_KEYS.MOOD_PREFIX}${mood || 'any'}_${timeAvailable || 'any'}_${genre || 'any'}`,
  CACHE_TTL.MOOD_RESULTS
)

/**
 * Get available genres from the API with caching
 * @returns {Promise<Array>} - List of genres
 */
const fetchGenres = withCache(
  async function() {
    // If using mock data, return mock genres directly
    if (USE_MOCK_DATA) {
      return MOCK_GENRES
    }
    return igdbRequest('genres', 'fields id,name,slug; sort name asc;')
  },
  () => CACHE_KEYS.GENRES,
  CACHE_TTL.GENRES
)

/**
 * Get available themes from the API with caching
 * @returns {Promise<Array>} - List of themes
 */
const fetchThemes = withCache(
  async function() {
    return igdbRequest('themes', 'fields id,name,slug; sort name asc;')
  },
  () => CACHE_KEYS.THEMES,
  CACHE_TTL.THEMES
)

/**
 * Test the API connection and return basic stats
 * @returns {Promise<Object>} - API status and stats
 */
async function testApiConnection() {
  // If using mock data, return a mock success response
  if (USE_MOCK_DATA) {
    return {
      status: 'success',
      authenticated: true,
      endpoints: {
        games: true,
        genres: true,
        platforms: true
      },
      cacheEnabled: true,
      mockData: true
    }
  }
  
  try {
    // Test authentication
    const accessToken = await getAccessToken()
    
    // Test a simple games query
    const games = await igdbRequest('games', 'fields name; limit 1;')
    
    // Test genres
    const genres = await fetchGenres()
    
    // Test platforms
    const platforms = await igdbRequest('platforms', 'fields name; limit 5;')
    
    return {
      status: 'success',
      authenticated: !!accessToken,
      endpoints: {
        games: games.length > 0,
        genres: genres.length > 0,
        platforms: platforms.length > 0
      },
      cacheEnabled: true,
      mockData: false
    }
  } catch (error) {
    console.error('API connection test failed:', error)
    return {
      status: 'error',
      message: error.message || 'Unknown error',
      authenticated: false,
      endpoints: {
        games: false,
        genres: false,
        platforms: false
      },
      cacheEnabled: true,
      mockData: false
    }
  }
}

// Export all API functions
module.exports = {
  getAccessToken,
  igdbRequest,
  fetchGames,
  fetchGameById,
  searchGames,
  findGamesByMood,
  fetchGenres,
  fetchThemes,
  testApiConnection
}
