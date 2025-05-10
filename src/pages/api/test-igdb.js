/**
 * API route for testing IGDB API integration
 * 
 * This endpoint tests the IGDB API integration by:
 * 1. Testing authentication with Twitch
 * 2. Testing fetching games from IGDB
 * 3. Testing fetching genres
 * 4. Testing the mood-based game finder
 * 
 * Access this endpoint at: /api/test-igdb
 */

import {
  getAccessToken,
  igdbRequest,
  fetchGames,
  fetchGameById,
  searchGames,
  findGamesByMood,
  fetchGenres,
  fetchThemes,
  testApiConnection
} from '../../lib/api';

export default async function handler(req, res) {
  const results = {
    timestamp: new Date().toISOString(),
    tests: {}
  };

  try {
    // Test 1: API Connection Test
    try {
      const connectionTest = await testApiConnection();
      results.tests.connection = {
        status: connectionTest.status === 'success' ? 'success' : 'failed',
        details: connectionTest
      };
      
      // If connection failed, return early
      if (connectionTest.status !== 'success') {
        return res.status(500).json({
          ...results,
          status: 'error',
          message: 'API connection failed. Check your credentials.'
        });
      }
    } catch (error) {
      results.tests.connection = {
        status: 'failed',
        error: error.message
      };
      
      return res.status(500).json({
        ...results,
        status: 'error',
        message: 'API connection test threw an exception.'
      });
    }
    
    // Test 2: Fetch Games
    try {
      const games = await fetchGames({ 
        limit: 5,
        fields: 'name,first_release_date,rating,summary',
        sort: 'rating desc'
      });
      
      results.tests.fetchGames = {
        status: games.length > 0 ? 'success' : 'failed',
        count: games.length,
        sample: games.slice(0, 2) // Just include a sample in the response
      };
    } catch (error) {
      results.tests.fetchGames = {
        status: 'failed',
        error: error.message
      };
    }
    
    // Test 3: Search Games
    try {
      const searchResults = await searchGames('zelda', { 
        limit: 5,
        fields: 'name,first_release_date,rating'
      });
      
      results.tests.searchGames = {
        status: searchResults.length > 0 ? 'success' : 'failed',
        count: searchResults.length,
        sample: searchResults.slice(0, 2)
      };
    } catch (error) {
      results.tests.searchGames = {
        status: 'failed',
        error: error.message
      };
    }
    
    // Test 4: Fetch Genres
    try {
      const genres = await fetchGenres();
      
      results.tests.fetchGenres = {
        status: genres.length > 0 ? 'success' : 'failed',
        count: genres.length,
        sample: genres.slice(0, 5)
      };
    } catch (error) {
      results.tests.fetchGenres = {
        status: 'failed',
        error: error.message
      };
    }
    
    // Test 5: Fetch Themes
    try {
      const themes = await fetchThemes();
      
      results.tests.fetchThemes = {
        status: themes.length > 0 ? 'success' : 'failed',
        count: themes.length,
        sample: themes.slice(0, 5)
      };
    } catch (error) {
      results.tests.fetchThemes = {
        status: 'failed',
        error: error.message
      };
    }
    
    // Test 6: Find Games by Mood
    try {
      const moodGames = await findGamesByMood({
        mood: 'relaxed',
        timeAvailable: 'short'
      });
      
      results.tests.findGamesByMood = {
        status: moodGames.length > 0 ? 'success' : 'failed',
        count: moodGames.length,
        sample: moodGames.slice(0, 2)
      };
    } catch (error) {
      results.tests.findGamesByMood = {
        status: 'failed',
        error: error.message
      };
    }
    
    // Calculate overall status
    const testStatuses = Object.values(results.tests).map(test => test.status);
    const allPassed = testStatuses.every(status => status === 'success');
    
    return res.status(200).json({
      ...results,
      status: allPassed ? 'success' : 'partial',
      message: allPassed 
        ? 'All API tests passed successfully!' 
        : 'Some API tests failed. Check individual test results for details.'
    });
    
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred during testing.',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
