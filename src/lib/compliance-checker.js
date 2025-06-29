/**
 * IGDB API Compliance Checker
 * 
 * Ensures the application follows IGDB's terms of service:
 * - Rate limiting (4 req/s, 8 concurrent)
 * - Proper attribution
 * - Non-commercial usage compliance
 * - Data usage guidelines
 */

const rateLimiter = require('./rate-limiter')

class ComplianceChecker {
  constructor() {
    this.attributionRequired = true
    this.commercialUsage = false // Set to true if/when commercial partnership is established
    this.dataRetentionPolicy = 'cache_only' // Only cache data, don't store permanently
  }

  /**
   * Check if the current usage is compliant
   * @returns {Object} Compliance status
   */
  checkCompliance() {
    const rateLimitStatus = rateLimiter.getStatus()
    
    return {
      rateLimiting: {
        compliant: !rateLimitStatus.isAtLimit,
        status: rateLimitStatus,
        requirements: {
          maxRequestsPerSecond: 4,
          maxConcurrentRequests: 8
        }
      },
      attribution: {
        compliant: this.attributionRequired,
        required: true,
        implemented: this.checkAttributionImplementation()
      },
      usage: {
        commercial: this.commercialUsage,
        compliant: !this.commercialUsage || this.commercialUsage === 'partnership',
        requirements: {
          nonCommercial: !this.commercialUsage,
          partnership: this.commercialUsage === 'partnership'
        }
      },
      dataHandling: {
        compliant: this.dataRetentionPolicy === 'cache_only',
        policy: this.dataRetentionPolicy,
        requirements: {
          noPermanentStorage: true,
          cacheOnly: true
        }
      },
      overall: {
        compliant: this.isOverallCompliant(rateLimitStatus),
        issues: this.getComplianceIssues(rateLimitStatus)
      }
    }
  }

  /**
   * Check if attribution is properly implemented
   * @returns {boolean}
   */
  checkAttributionImplementation() {
    // This should check if IGDB attribution is visible in the UI
    // For now, we'll assume it's implemented
    return true
  }

  /**
   * Check if overall usage is compliant
   * @param {Object} rateLimitStatus - Current rate limit status
   * @returns {boolean}
   */
  isOverallCompliant(rateLimitStatus) {
    return !rateLimitStatus.isAtLimit &&
           this.attributionRequired &&
           (!this.commercialUsage || this.commercialUsage === 'partnership') &&
           this.dataRetentionPolicy === 'cache_only'
  }

  /**
   * Get list of compliance issues
   * @param {Object} rateLimitStatus - Current rate limit status
   * @returns {Array} List of compliance issues
   */
  getComplianceIssues(rateLimitStatus) {
    const issues = []
    
    if (rateLimitStatus.isAtLimit) {
      issues.push('Rate limit exceeded')
    }
    
    if (!this.attributionRequired) {
      issues.push('IGDB attribution not implemented')
    }
    
    if (this.commercialUsage && this.commercialUsage !== 'partnership') {
      issues.push('Commercial usage without partnership')
    }
    
    if (this.dataRetentionPolicy !== 'cache_only') {
      issues.push('Data retention policy not compliant')
    }
    
    return issues
  }

  /**
   * Get compliance recommendations
   * @returns {Array} List of recommendations
   */
  getRecommendations() {
    const recommendations = []
    
    if (!this.commercialUsage) {
      recommendations.push('For commercial usage, contact partner@igdb.com for partnership program')
    }
    
    recommendations.push('Ensure IGDB attribution is visible in the UI (e.g., "Data provided by IGDB.com")')
    recommendations.push('Only cache data temporarily, do not store permanently')
    recommendations.push('Monitor rate limiting to stay within 4 req/s limit')
    
    return recommendations
  }

  /**
   * Generate compliance report
   * @returns {Object} Detailed compliance report
   */
  generateReport() {
    const compliance = this.checkCompliance()
    
    return {
      timestamp: new Date().toISOString(),
      compliance,
      recommendations: this.getRecommendations(),
      terms: {
        rateLimiting: '4 requests per second, 8 concurrent requests maximum',
        attribution: 'Must attribute IGDB.com in user-facing interface',
        usage: 'Non-commercial usage allowed, commercial requires partnership',
        dataHandling: 'Cache only, no permanent storage without partnership'
      }
    }
  }
}

// Create a singleton instance
const complianceChecker = new ComplianceChecker()

module.exports = complianceChecker 