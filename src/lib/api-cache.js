/**
 * API Cache Service
 * 
 * This module provides caching functionality for API requests to reduce
 * the number of calls to the IGDB API and improve performance.
 */

// In-memory cache storage
const cache = {
  data: new Map(),
  metadata: new Map()
}

// Cache configuration
const DEFAULT_TTL = 3600000 // 1 hour in milliseconds
const MAX_CACHE_SIZE = 100 // Maximum number of items to cache

/**
 * Get an item from the cache
 * @param {string} key - Cache key
 * @returns {any|null} - Cached value or null if not found/expired
 */
function getCachedItem(key) {
  if (!cache.data.has(key)) {
    return null
  }
  
  const metadata = cache.metadata.get(key)
  const now = Date.now()
  
  // Check if the item has expired
  if (metadata.expiresAt < now) {
    // Remove expired item
    cache.data.delete(key)
    cache.metadata.delete(key)
    return null
  }
  
  // Update last accessed time
  metadata.lastAccessed = now
  cache.metadata.set(key, metadata)
  
  return cache.data.get(key)
}

/**
 * Set an item in the cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in milliseconds (optional)
 */
function setCachedItem(key, value, ttl = DEFAULT_TTL) {
  // If cache is at capacity, remove least recently used item
  if (cache.data.size >= MAX_CACHE_SIZE && !cache.data.has(key)) {
    const lruKey = findLeastRecentlyUsed()
    if (lruKey) {
      cache.data.delete(lruKey)
      cache.metadata.delete(lruKey)
    }
  }
  
  const now = Date.now()
  
  // Store the value
  cache.data.set(key, value)
  
  // Store metadata
  cache.metadata.set(key, {
    createdAt: now,
    lastAccessed: now,
    expiresAt: now + ttl
  })
}

/**
 * Find the least recently used cache item
 * @returns {string|null} - Key of the least recently used item
 */
function findLeastRecentlyUsed() {
  let lruKey = null
  let oldestAccess = Infinity
  
  for (const [key, metadata] of cache.metadata.entries()) {
    if (metadata.lastAccessed < oldestAccess) {
      oldestAccess = metadata.lastAccessed
      lruKey = key
    }
  }
  
  return lruKey
}

/**
 * Clear the entire cache or a specific item
 * @param {string} key - Specific key to clear (optional)
 */
function clearCache(key = null) {
  if (key) {
    cache.data.delete(key)
    cache.metadata.delete(key)
  } else {
    cache.data.clear()
    cache.metadata.clear()
  }
}

/**
 * Get cache statistics
 * @returns {Object} - Cache statistics
 */
function getCacheStats() {
  return {
    size: cache.data.size,
    maxSize: MAX_CACHE_SIZE,
    keys: Array.from(cache.data.keys())
  }
}

/**
 * Wrap an async function with caching
 * @param {Function} fn - Async function to wrap
 * @param {Function} keyGenerator - Function to generate cache key from args
 * @param {number} ttl - Time to live in milliseconds (optional)
 * @returns {Function} - Wrapped function with caching
 */
function withCache(fn, keyGenerator, ttl = DEFAULT_TTL) {
  return async function(...args) {
    const key = keyGenerator(...args)
    
    // Try to get from cache first
    const cachedResult = getCachedItem(key)
    if (cachedResult !== null) {
      return cachedResult
    }
    
    // If not in cache, call the original function
    const result = await fn(...args)
    
    // Cache the result
    setCachedItem(key, result, ttl)
    
    return result
  }
}

module.exports = {
  getCachedItem,
  setCachedItem,
  clearCache,
  getCacheStats,
  withCache
}
