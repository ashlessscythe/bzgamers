/**
 * Rate Limiter for IGDB API
 * 
 * Ensures compliance with IGDB's rate limits:
 * - 4 requests per second
 * - Maximum 8 concurrent requests
 */

class RateLimiter {
  constructor() {
    this.requestTimes = []
    this.concurrentRequests = 0
    this.maxRequestsPerSecond = 4
    this.maxConcurrentRequests = 8
    this.windowMs = 1000 // 1 second window
  }

  /**
   * Wait if necessary to respect rate limits
   * @returns {Promise<void>}
   */
  async waitForSlot() {
    const now = Date.now()
    
    // Remove requests older than 1 second
    this.requestTimes = this.requestTimes.filter(time => now - time < this.windowMs)
    
    // Check if we're at the rate limit
    if (this.requestTimes.length >= this.maxRequestsPerSecond) {
      const oldestRequest = this.requestTimes[0]
      const waitTime = this.windowMs - (now - oldestRequest)
      
      if (waitTime > 0) {
        console.log(`Rate limit reached. Waiting ${waitTime}ms...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
    
    // Check concurrent request limit
    if (this.concurrentRequests >= this.maxConcurrentRequests) {
      console.log('Concurrent request limit reached. Waiting for slot...')
      await new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (this.concurrentRequests < this.maxConcurrentRequests) {
            clearInterval(checkInterval)
            resolve()
          }
        }, 100)
      })
    }
    
    // Record this request
    this.requestTimes.push(Date.now())
    this.concurrentRequests++
  }

  /**
   * Release a concurrent request slot
   */
  releaseSlot() {
    this.concurrentRequests = Math.max(0, this.concurrentRequests - 1)
  }

  /**
   * Get current rate limit status
   * @returns {Object} Current status
   */
  getStatus() {
    const now = Date.now()
    const recentRequests = this.requestTimes.filter(time => now - time < this.windowMs)
    
    return {
      requestsInWindow: recentRequests.length,
      maxRequestsPerSecond: this.maxRequestsPerSecond,
      concurrentRequests: this.concurrentRequests,
      maxConcurrentRequests: this.maxConcurrentRequests,
      isAtLimit: recentRequests.length >= this.maxRequestsPerSecond || 
                 this.concurrentRequests >= this.maxConcurrentRequests
    }
  }

  /**
   * Reset the rate limiter
   */
  reset() {
    this.requestTimes = []
    this.concurrentRequests = 0
  }
}

// Create a singleton instance
const rateLimiter = new RateLimiter()

module.exports = rateLimiter 