/**
 * Game API client for RAWG
 * Documentation: https://api.rawg.io/docs/
 */

// Base URL for RAWG API
const API_BASE_URL = process.env.NEXT_PUBLIC_GAME_API_URL || 'https://api.rawg.io/api'
const API_KEY = process.env.NEXT_PUBLIC_GAME_API_KEY

/**
 * Fetch games from the RAWG API
 * @param {Object} params - Query parameters for the API request
 * @returns {Promise<Object>} - API response with games data
 */
export async function fetchGames(params = {}) {
  // Ensure we have an API key
  if (!API_KEY) {
    console.error('Game API key is missing. Please add it to your .env.local file.')
    return { results: [] }
  }

  // Build the query string from params
  const queryParams = new URLSearchParams({
    key: API_KEY,
    ...params,
  })

  try {
    const response = await fetch(`${API_BASE_URL}/games?${queryParams}`)
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching games:', error)
    return { results: [] }
  }
}

/**
 * Fetch game details by ID
 * @param {string|number} gameId - The ID of the game to fetch
 * @returns {Promise<Object>} - Game details
 */
export async function fetchGameById(gameId) {
  if (!API_KEY || !gameId) {
    console.error('Game API key or game ID is missing')
    return null
  }

  try {
    const response = await fetch(`${API_BASE_URL}/games/${gameId}?key=${API_KEY}`)
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`Error fetching game with ID ${gameId}:`, error)
    return null
  }
}

/**
 * Search games by query string
 * @param {string} query - Search query
 * @param {Object} additionalParams - Additional query parameters
 * @returns {Promise<Object>} - Search results
 */
export async function searchGames(query, additionalParams = {}) {
  return fetchGames({
    search: query,
    page_size: 20,
    ...additionalParams,
  })
}

/**
 * Filter games by mood-related parameters
 * This is a custom function for BZGamers that maps mood/time/genre to API parameters
 * @param {Object} filters - Mood-based filters
 * @param {string} filters.mood - User's current mood (e.g., 'relaxed', 'excited', 'focused')
 * @param {string} filters.timeAvailable - User's available time (e.g., 'short', 'medium', 'long')
 * @param {string} filters.genre - Preferred genre
 * @returns {Promise<Object>} - Filtered games
 */
export async function findGamesByMood({ mood, timeAvailable, genre }) {
  // Map moods to tags or other RAWG parameters
  const moodMappings = {
    relaxed: { tags: 'relaxing,casual', ordering: '-rating' },
    excited: { tags: 'action,fast-paced', ordering: '-rating' },
    focused: { tags: 'strategy,puzzle', ordering: '-rating' },
    social: { tags: 'multiplayer,co-op', ordering: '-rating' },
    creative: { tags: 'sandbox,building', ordering: '-rating' },
    nostalgic: { tags: 'retro,classic', ordering: '-rating' },
  }

  // Map time available to game length (using metacritic as a rough proxy)
  const timeMappings = {
    short: { metacritic: '1,75' }, // Lower metacritic often correlates with shorter games
    medium: { metacritic: '75,85' },
    long: { metacritic: '85,100' }, // Higher metacritic often correlates with longer, more complex games
  }

  // Combine parameters based on mood and time
  const moodParams = moodMappings[mood] || {}
  const timeParams = timeMappings[timeAvailable] || {}
  
  // Add genre if provided
  const genreParam = genre ? { genres: genre } : {}

  return fetchGames({
    page_size: 10,
    ...moodParams,
    ...timeParams,
    ...genreParam,
  })
}

/**
 * Get available genres from the API
 * @returns {Promise<Array>} - List of genres
 */
export async function fetchGenres() {
  if (!API_KEY) {
    console.error('Game API key is missing')
    return []
  }

  try {
    const response = await fetch(`${API_BASE_URL}/genres?key=${API_KEY}`)
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }
    
    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error('Error fetching genres:', error)
    return []
  }
}
