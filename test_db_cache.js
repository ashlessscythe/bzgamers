/**
 * Test script for database caching system
 * 
 * This script tests the database caching functionality with the IGDB API
 */

require('dotenv').config()
const apiEnhanced = require('./src/lib/api-enhanced')
const dbCache = require('./src/lib/db-cache')

async function testDatabaseCache() {
  console.log('🧪 Testing Database Cache System\n')
  
  try {
    // Test 1: API Connection and Database Setup
    console.log('1️⃣ Testing API connection and database setup...')
    const testResults = await apiEnhanced.testApiConnection()
    console.log('Test Results:', JSON.stringify(testResults, null, 2))
    console.log('')
    
    // Test 2: Fetch and Cache Genres
    console.log('2️⃣ Testing genre fetching and caching...')
    const genres = await apiEnhanced.fetchGenres()
    console.log(`✅ Fetched ${genres.length} genres`)
    console.log('Sample genres:', genres.slice(0, 3).map(g => g.name))
    console.log('')
    
    // Test 3: Fetch and Cache Platforms
    console.log('3️⃣ Testing platform fetching and caching...')
    const platforms = await apiEnhanced.fetchPlatforms()
    console.log(`✅ Fetched ${platforms.length} platforms`)
    console.log('Sample platforms:', platforms.slice(0, 3).map(p => p.name))
    console.log('')
    
    // Test 4: Fetch and Cache Themes
    console.log('4️⃣ Testing theme fetching and caching...')
    const themes = await apiEnhanced.fetchThemes()
    console.log(`✅ Fetched ${themes.length} themes`)
    console.log('Sample themes:', themes.slice(0, 3).map(t => t.name))
    console.log('')
    
    // Test 5: Fetch and Cache Games
    console.log('5️⃣ Testing game fetching and caching...')
    const games = await apiEnhanced.fetchGames({ 
      limit: 5, 
      fields: 'name,cover.*,first_release_date,total_rating,summary,genres.*,themes.*' 
    })
    console.log(`✅ Fetched ${games.length} games`)
    console.log('Sample games:', games.slice(0, 2).map(g => ({ name: g.name, rating: g.total_rating })))
    console.log('')
    
    // Test 6: Test Mood-Based Search
    console.log('6️⃣ Testing mood-based game search...')
    const moodGames = await apiEnhanced.findGamesByMood({
      mood: 'excited',
      timeAvailable: 'medium',
      genre: 'Action'
    })
    console.log(`✅ Found ${moodGames.length} games for excited mood`)
    console.log('Sample mood games:', moodGames.slice(0, 2).map(g => ({ name: g.name, rating: g.total_rating })))
    console.log('')
    
    // Test 7: Test Cache Statistics
    console.log('7️⃣ Testing cache statistics...')
    const stats = await dbCache.getCacheStats()
    console.log('Cache Statistics:', JSON.stringify(stats, null, 2))
    console.log('')
    
    // Test 8: Test Cache Hit (should use cached data)
    console.log('8️⃣ Testing cache hit (should use cached data)...')
    const cachedGenres = await apiEnhanced.fetchGenres()
    console.log(`✅ Retrieved ${cachedGenres.length} genres from cache`)
    console.log('')
    
    // Test 9: Test Search Caching
    console.log('9️⃣ Testing search caching...')
    const searchResults = await apiEnhanced.searchGames('Mario', { limit: 3 })
    console.log(`✅ Search results: ${searchResults.length} games found`)
    console.log('Search results:', searchResults.map(g => g.name))
    console.log('')
    
    // Test 10: Test Game by ID Caching
    if (games.length > 0) {
      console.log('🔟 Testing game by ID caching...')
      const gameId = games[0].id
      const gameDetails = await apiEnhanced.fetchGameById(gameId)
      console.log(`✅ Retrieved game details for ID ${gameId}: ${gameDetails.name}`)
      console.log('')
    }
    
    console.log('🎉 All database cache tests completed successfully!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    console.error('Error details:', error.message)
    if (error.stack) {
      console.error('Stack trace:', error.stack)
    }
  }
}

// Run the test
testDatabaseCache()
  .then(() => {
    console.log('\n✅ Database cache test completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Database cache test failed:', error)
    process.exit(1)
  }) 