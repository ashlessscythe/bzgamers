/**
 * Test script for IGDB API integration
 * 
 * This script tests the IGDB API integration by:
 * 1. Testing authentication with Twitch
 * 2. Testing fetching games from IGDB
 * 3. Testing fetching genres
 * 4. Testing the mood-based game finder
 * 
 * Run this script with: node src/lib/api-test.js
 */

// Load environment variables
require('dotenv').config();

// Import the API functions
const {
  getAccessToken,
  igdbRequest,
  fetchGames,
  fetchGameById,
  searchGames,
  findGamesByMood,
  fetchGenres,
  fetchThemes,
  testApiConnection
} = require('./api');

// Helper function to log test results
function logTestResult(testName, result, error = null) {
  console.log(`\n----- ${testName} -----`)
  if (error) {
    console.log('❌ FAILED')
    console.error(error)
    return
  }
  
  console.log('✅ SUCCESS')
  console.log(JSON.stringify(result, null, 2))
}

// Main test function
async function runTests() {
  console.log('🎮 IGDB API Integration Tests 🎮')
  console.log('===============================')
  
  try {
    // Test 1: API Connection Test
    try {
      console.log('\n🔍 Testing API Connection...')
      const connectionTest = await testApiConnection()
      logTestResult('API Connection Test', connectionTest)
      
      if (connectionTest.status !== 'success') {
        console.log('❌ API connection failed. Stopping tests.')
        return
      }
    } catch (error) {
      logTestResult('API Connection Test', null, error)
      console.log('❌ API connection failed. Stopping tests.')
      return
    }
    
    // Test 2: Fetch Games
    try {
      console.log('\n🔍 Testing Fetch Games...')
      const games = await fetchGames({ 
        limit: 5,
        fields: 'name,first_release_date,rating,summary',
        sort: 'rating desc'
      })
      logTestResult('Fetch Games Test', games)
    } catch (error) {
      logTestResult('Fetch Games Test', null, error)
    }
    
    // Test 3: Search Games
    try {
      console.log('\n🔍 Testing Search Games...')
      const searchResults = await searchGames('zelda', { 
        limit: 5,
        fields: 'name,first_release_date,rating'
      })
      logTestResult('Search Games Test', searchResults)
    } catch (error) {
      logTestResult('Search Games Test', null, error)
    }
    
    // Test 4: Fetch Game by ID
    // Using The Legend of Zelda: Breath of the Wild as an example (ID may vary)
    try {
      console.log('\n🔍 Testing Fetch Game by ID...')
      // First search for the game to get its ID
      const zeldaSearch = await searchGames('breath of the wild', { 
        limit: 1,
        fields: 'id,name'
      })
      
      if (zeldaSearch.length > 0) {
        const gameId = zeldaSearch[0].id
        const gameDetails = await fetchGameById(gameId)
        logTestResult('Fetch Game by ID Test', gameDetails)
      } else {
        logTestResult('Fetch Game by ID Test', null, new Error('Could not find game ID for test'))
      }
    } catch (error) {
      logTestResult('Fetch Game by ID Test', null, error)
    }
    
    // Test 5: Fetch Genres
    try {
      console.log('\n🔍 Testing Fetch Genres...')
      const genres = await fetchGenres()
      logTestResult('Fetch Genres Test', genres)
    } catch (error) {
      logTestResult('Fetch Genres Test', null, error)
    }
    
    // Test 6: Fetch Themes
    try {
      console.log('\n🔍 Testing Fetch Themes...')
      const themes = await fetchThemes()
      logTestResult('Fetch Themes Test', themes)
    } catch (error) {
      logTestResult('Fetch Themes Test', null, error)
    }
    
    // Test 7: Find Games by Mood
    try {
      console.log('\n🔍 Testing Find Games by Mood...')
      const moodGames = await findGamesByMood({
        mood: 'relaxed',
        timeAvailable: 'short'
      })
      logTestResult('Find Games by Mood Test', moodGames)
    } catch (error) {
      logTestResult('Find Games by Mood Test', null, error)
    }
    
    console.log('\n===============================')
    console.log('🎉 All tests completed!')
    
  } catch (error) {
    console.error('❌ An unexpected error occurred during testing:', error)
  }
}

// Run the tests
runTests()
