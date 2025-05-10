/**
 * Game API client for IGDB
 * Documentation: https://api.igdb.com/v4/docs
 */

// Base URLs for IGDB API
const TWITCH_AUTH_URL = process.env.NEXT_PUBLIC_GAME_API_URL || 'https://id.twitch.tv/oauth2/token'
const IGDB_API_URL = 'https://api.igdb.com/v4'
const CLIENT_ID = process.env.NEXT_API_CLIENT_ID
const CLIENT_SECRET = process.env.NEXT_API_CLIENT_SECRET

// Cache for the access token
let accessTokenCache = {
  token: null,
  expiry: 0
}

/**
 * Get an access token from Twitch for IGDB API
 * @returns {Promise<string>} - Access token
 */
async function getAccessToken() {
  // Check if we have a valid cached token
  const now = Date.now()
  if (accessTokenCache.token && accessTokenCache.expiry > now) {
    return accessTokenCache.token
  }

  // Ensure we have client credentials
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('IGDB API client ID or secret is missing. Please add them to your .env file.')
    throw new Error('API credentials missing')
  }

  try {
    // Request a new token
    const response = await fetch(
      `${TWITCH_AUTH_URL}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`,
      { method: 'POST' }
    )
    
    if (!response.ok) {
      throw new Error(`Auth request failed with status ${response.status}`)
    }
    
    const data = await response.json()
    
    // Cache the token
    accessTokenCache = {
      token: data.access_token,
      expiry: now + (data.expires_in * 1000) - 300000 // Expire 5 minutes early to be safe
    }
    
    return data.access_token
  } catch (error) {
    console.error('Error getting access token:', error)
    throw error
  }
}

/**
 * Make a request to the IGDB API
 * @param {string} endpoint - API endpoint (e.g., 'games', 'genres')
 * @param {string} query - IGDB query string
 * @returns {Promise<Array>} - API response data
 */
async function igdbRequest(endpoint, query) {
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
      throw new Error(`API request failed with status ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`Error making IGDB request to ${endpoint}:`, error)
    return []
  }
}

/**
 * Fetch games from the IGDB API
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
  let query = `fields ${fields};`
  
  if (where) {
    query += ` where ${where};`
  }
  
  query += ` sort ${sort}; limit ${limit}; offset ${offset};`
  
  return igdbRequest('games', query)
}

/**
 * Fetch game details by ID
 * @param {number} gameId - The ID of the game to fetch
 * @returns {Promise<Object>} - Game details
 */
async function fetchGameById(gameId) {
  if (!gameId) {
    console.error('Game ID is missing')
    return null
  }

  try {
    const results = await igdbRequest('games', `fields *; where id = ${gameId};`)
    return results.length > 0 ? results[0] : null
  } catch (error) {
    console.error(`Error fetching game with ID ${gameId}:`, error)
    return null
  }
}

/**
 * Search games by query string
 * @param {string} query - Search query
 * @param {Object} options - Additional options
 * @returns {Promise<Array>} - Search results
 */
async function searchGames(searchQuery, options = {}) {
  const { limit = 20, offset = 0, fields = '*' } = options
  
  const query = `fields ${fields}; search "${searchQuery}"; limit ${limit}; offset ${offset};`
  
  return igdbRequest('games', query)
}

/**
 * Filter games by mood-related parameters
 * This is a custom function for BZGamers that maps mood/time/genre to IGDB parameters
 * @param {Object} filters - Mood-based filters
 * @param {string} filters.mood - User's current mood (e.g., 'relaxed', 'excited', 'focused')
 * @param {string} filters.timeAvailable - User's available time (e.g., 'short', 'medium', 'long')
 * @param {string|number} filters.genre - Preferred genre ID or name
 * @returns {Promise<Array>} - Filtered games
 */
async function findGamesByMood({ mood, timeAvailable, genre }) {
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
    const genreFilter = isNaN(genre) 
      ? `genres.name = "${genre}"` 
      : `genres = (${genre})`
    
    whereClause.push(genreFilter)
  }
  
  // Combine all filters with AND
  const where = whereClause.length > 0 
    ? whereClause.join(' & ') 
    : ''
  
  return fetchGames({
    limit: 10,
    fields: 'name,cover.*,first_release_date,total_rating,summary,url,genres.*,themes.*',
    where,
    sort: 'total_rating desc'
  })
}

/**
 * Get available genres from the API
 * @returns {Promise<Array>} - List of genres
 */
async function fetchGenres() {
  return igdbRequest('genres', 'fields id,name,slug; sort name asc;')
}

/**
 * Get available themes from the API
 * @returns {Promise<Array>} - List of themes
 */
async function fetchThemes() {
  return igdbRequest('themes', 'fields id,name,slug; sort name asc;')
}

/**
 * Test the API connection and return basic stats
 * @returns {Promise<Object>} - API status and stats
 */
async function testApiConnection() {
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
      }
    }
  } catch (error) {
    console.error('API connection test failed:', error)
    return {
      status: 'error',
      message: error.message,
      authenticated: false,
      endpoints: {
        games: false,
        genres: false,
        platforms: false
      }
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
