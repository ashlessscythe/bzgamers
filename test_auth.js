/**
 * Test script for Twitch OAuth2 authentication
 * This demonstrates the automatic token refresh functionality
 */

const { 
  getAccessToken, 
  getTokenStatus, 
  refreshAccessToken, 
  getAuthConfig,
  testApiConnection 
} = require('./src/lib/api')

async function testAuthentication() {
  console.log('🔐 Testing Twitch OAuth2 Authentication System\n')
  
  // Check auth configuration
  console.log('📋 Auth Configuration:')
  const config = getAuthConfig()
  console.log(JSON.stringify(config, null, 2))
  console.log()
  
  // Test initial token status
  console.log('🔍 Initial Token Status:')
  let status = getTokenStatus()
  console.log(JSON.stringify(status, null, 2))
  console.log()
  
  // Get access token (this will trigger auth if needed)
  console.log('🚀 Getting Access Token...')
  try {
    const token = await getAccessToken()
    console.log(`✅ Token obtained: ${token.substring(0, 20)}...`)
    console.log()
    
    // Check token status after getting it
    console.log('🔍 Token Status After Auth:')
    status = getTokenStatus()
    console.log(JSON.stringify(status, null, 2))
    console.log()
    
    // Test API connection
    console.log('🌐 Testing API Connection...')
    const apiStatus = await testApiConnection()
    console.log(JSON.stringify(apiStatus, null, 2))
    console.log()
    
    // Test token refresh
    console.log('🔄 Testing Token Refresh...')
    const newToken = await refreshAccessToken()
    console.log(`✅ New token obtained: ${newToken.substring(0, 20)}...`)
    console.log()
    
    // Check final token status
    console.log('🔍 Final Token Status:')
    status = getTokenStatus()
    console.log(JSON.stringify(status, null, 2))
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message)
    console.error('Stack:', error.stack)
  }
}

// Run the test
testAuthentication() 