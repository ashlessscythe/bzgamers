/**
 * Database Cache Service for IGDB API
 * 
 * This module provides database-based caching functionality using Prisma
 * to store IGDB API data persistently and reduce API calls.
 */

const { PrismaClient } = require('../generated/prisma')
const crypto = require('crypto')

const prisma = new PrismaClient()

// Cache TTLs (in milliseconds)
const CACHE_TTL = {
  AUTH_TOKEN: 3600000, // 1 hour
  GENRES: 86400000, // 24 hours
  THEMES: 86400000, // 24 hours
  PLATFORMS: 86400000, // 24 hours
  GAMES: 3600000, // 1 hour
  SEARCH: 1800000, // 30 minutes
  MOOD_RESULTS: 1800000, // 30 minutes
  IMAGES: 604800000 // 7 days
}

/**
 * Generate a hash for search parameters
 * @param {Object} params - Search parameters
 * @returns {string} - Hash string
 */
function generateQueryHash(params) {
  const sortedParams = JSON.stringify(params, Object.keys(params).sort())
  return crypto.createHash('md5').update(sortedParams).digest('hex')
}

/**
 * Get cached search results
 * @param {Object} queryParams - Search parameters
 * @returns {Promise<Object|null>} - Cached results or null
 */
async function getCachedSearch(queryParams) {
  try {
    const queryHash = generateQueryHash(queryParams)
    
    const cached = await prisma.searchCache.findUnique({
      where: { queryHash }
    })
    
    if (!cached) {
      return null
    }
    
    // Check if cache has expired
    if (new Date() > cached.ttl) {
      // Delete expired cache
      await prisma.searchCache.delete({
        where: { queryHash }
      })
      return null
    }
    
    // Update last accessed time
    await prisma.searchCache.update({
      where: { queryHash },
      data: { lastAccessed: new Date() }
    })
    
    console.log(`[DB CACHE HIT] Search query: ${queryHash}`)
    return JSON.parse(cached.results)
  } catch (error) {
    console.error('Error getting cached search:', error)
    return null
  }
}

/**
 * Cache search results
 * @param {Object} queryParams - Search parameters
 * @param {Object} results - Search results
 * @param {number} ttl - Time to live in milliseconds
 */
async function cacheSearch(queryParams, results, ttl = CACHE_TTL.SEARCH) {
  try {
    const queryHash = generateQueryHash(queryParams)
    const ttlDate = new Date(Date.now() + ttl)
    
    await prisma.searchCache.upsert({
      where: { queryHash },
      update: {
        results: JSON.stringify(results),
        resultCount: Array.isArray(results) ? results.length : 0,
        ttl: ttlDate,
        lastAccessed: new Date()
      },
      create: {
        queryHash,
        queryParams,
        results: JSON.stringify(results),
        resultCount: Array.isArray(results) ? results.length : 0,
        ttl: ttlDate
      }
    })
    
    console.log(`[DB CACHE SET] Search query: ${queryHash}`)
  } catch (error) {
    console.error('Error caching search:', error)
  }
}

/**
 * Cache a game with all its relationships
 * @param {Object} gameData - Game data from IGDB API
 * @returns {Promise<Object>} - Cached game object
 */
async function cacheGame(gameData) {
  try {
    // Upsert the main game
    const game = await prisma.cachedGame.upsert({
      where: { igdbId: gameData.id },
      update: {
        name: gameData.name,
        slug: gameData.slug,
        summary: gameData.summary,
        storyline: gameData.storyline,
        rating: gameData.rating,
        ratingCount: gameData.rating_count,
        firstReleaseDate: gameData.first_release_date ? new Date(gameData.first_release_date * 1000) : null,
        category: gameData.category,
        status: gameData.status,
        lastUpdated: new Date()
      },
      create: {
        igdbId: gameData.id,
        name: gameData.name,
        slug: gameData.slug,
        summary: gameData.summary,
        storyline: gameData.storyline,
        rating: gameData.rating,
        ratingCount: gameData.rating_count,
        firstReleaseDate: gameData.first_release_date ? new Date(gameData.first_release_date * 1000) : null,
        category: gameData.category,
        status: gameData.status
      }
    })
    
    // Cache genres if present
    if (gameData.genres && Array.isArray(gameData.genres)) {
      for (const genreData of gameData.genres) {
        // Ensure genreData has an id field
        if (genreData.id) {
          await cacheGenre(genreData)
          
          // Get the cached genre to get its database ID
          const cachedGenre = await prisma.cachedGenre.findUnique({
            where: { igdbId: genreData.id }
          })
          
          if (cachedGenre) {
            await prisma.cachedGameGenre.upsert({
              where: {
                gameId_genreId: {
                  gameId: game.id,
                  genreId: cachedGenre.id
                }
              },
              update: {},
              create: {
                gameId: game.id,
                genreId: cachedGenre.id
              }
            })
          }
        }
      }
    }
    
    // Cache platforms if present
    if (gameData.platforms && Array.isArray(gameData.platforms)) {
      for (const platformData of gameData.platforms) {
        if (platformData.id) {
          await cachePlatform(platformData)
          
          const cachedPlatform = await prisma.cachedPlatform.findUnique({
            where: { igdbId: platformData.id }
          })
          
          if (cachedPlatform) {
            await prisma.cachedGamePlatform.upsert({
              where: {
                gameId_platformId: {
                  gameId: game.id,
                  platformId: cachedPlatform.id
                }
              },
              update: {},
              create: {
                gameId: game.id,
                platformId: cachedPlatform.id
              }
            })
          }
        }
      }
    }
    
    // Cache themes if present
    if (gameData.themes && Array.isArray(gameData.themes)) {
      for (const themeData of gameData.themes) {
        if (themeData.id) {
          await cacheTheme(themeData)
          
          const cachedTheme = await prisma.cachedTheme.findUnique({
            where: { igdbId: themeData.id }
          })
          
          if (cachedTheme) {
            await prisma.cachedGameTheme.upsert({
              where: {
                gameId_themeId: {
                  gameId: game.id,
                  themeId: cachedTheme.id
                }
              },
              update: {},
              create: {
                gameId: game.id,
                themeId: cachedTheme.id
              }
            })
          }
        }
      }
    }
    
    // Cache images if present
    if (gameData.screenshots && Array.isArray(gameData.screenshots)) {
      for (const screenshotData of gameData.screenshots) {
        if (screenshotData.id) {
          await cacheImage(screenshotData, 'SCREENSHOT')
          
          const cachedImage = await prisma.cachedImage.findUnique({
            where: { igdbId: screenshotData.id }
          })
          
          if (cachedImage) {
            await prisma.cachedScreenshot.upsert({
              where: {
                gameId_imageId: {
                  gameId: game.id,
                  imageId: cachedImage.id
                }
              },
              update: {},
              create: {
                gameId: game.id,
                imageId: cachedImage.id
              }
            })
          }
        }
      }
    }
    
    if (gameData.artworks && Array.isArray(gameData.artworks)) {
      for (const artworkData of gameData.artworks) {
        if (artworkData.id) {
          await cacheImage(artworkData, 'ARTWORK')
          
          const cachedImage = await prisma.cachedImage.findUnique({
            where: { igdbId: artworkData.id }
          })
          
          if (cachedImage) {
            await prisma.cachedArtwork.upsert({
              where: {
                gameId_imageId: {
                  gameId: game.id,
                  imageId: cachedImage.id
                }
              },
              update: {},
              create: {
                gameId: game.id,
                imageId: cachedImage.id
              }
            })
          }
        }
      }
    }
    
    if (gameData.cover && gameData.cover.id) {
      await cacheImage(gameData.cover, 'COVER')
      
      const cachedImage = await prisma.cachedImage.findUnique({
        where: { igdbId: gameData.cover.id }
      })
      
      if (cachedImage) {
        await prisma.cachedCover.upsert({
          where: {
            gameId_imageId: {
              gameId: game.id,
              imageId: cachedImage.id
            }
          },
          update: {},
          create: {
            gameId: game.id,
            imageId: cachedImage.id
          }
        })
      }
    }
    
    console.log(`[DB CACHE] Cached game: ${gameData.name} (ID: ${gameData.id})`)
    return game
  } catch (error) {
    console.error('Error caching game:', error)
    throw error
  }
}

/**
 * Cache a genre
 * @param {Object} genreData - Genre data from IGDB API
 * @returns {Promise<Object>} - Cached genre object
 */
async function cacheGenre(genreData) {
  try {
    // Ensure we have the required fields
    if (!genreData.id) {
      console.warn('Skipping genre cache - missing id:', genreData)
      return null
    }
    
    return await prisma.cachedGenre.upsert({
      where: { igdbId: genreData.id },
      update: {
        name: genreData.name,
        slug: genreData.slug,
        url: genreData.url,
        lastUpdated: new Date()
      },
      create: {
        igdbId: genreData.id,
        name: genreData.name,
        slug: genreData.slug,
        url: genreData.url
      }
    })
  } catch (error) {
    console.error('Error caching genre:', error)
    throw error
  }
}

/**
 * Cache a platform
 * @param {Object} platformData - Platform data from IGDB API
 * @returns {Promise<Object>} - Cached platform object
 */
async function cachePlatform(platformData) {
  try {
    if (!platformData.id) {
      console.warn('Skipping platform cache - missing id:', platformData)
      return null
    }
    
    return await prisma.cachedPlatform.upsert({
      where: { igdbId: platformData.id },
      update: {
        name: platformData.name,
        slug: platformData.slug,
        abbreviation: platformData.abbreviation,
        url: platformData.url,
        lastUpdated: new Date()
      },
      create: {
        igdbId: platformData.id,
        name: platformData.name,
        slug: platformData.slug,
        abbreviation: platformData.abbreviation,
        url: platformData.url
      }
    })
  } catch (error) {
    console.error('Error caching platform:', error)
    throw error
  }
}

/**
 * Cache a theme
 * @param {Object} themeData - Theme data from IGDB API
 * @returns {Promise<Object>} - Cached theme object
 */
async function cacheTheme(themeData) {
  try {
    if (!themeData.id) {
      console.warn('Skipping theme cache - missing id:', themeData)
      return null
    }
    
    return await prisma.cachedTheme.upsert({
      where: { igdbId: themeData.id },
      update: {
        name: themeData.name,
        slug: themeData.slug,
        url: themeData.url,
        lastUpdated: new Date()
      },
      create: {
        igdbId: themeData.id,
        name: themeData.name,
        slug: themeData.slug,
        url: themeData.url
      }
    })
  } catch (error) {
    console.error('Error caching theme:', error)
    throw error
  }
}

/**
 * Cache an image
 * @param {Object} imageData - Image data from IGDB API
 * @param {string} type - Image type (SCREENSHOT, ARTWORK, COVER)
 * @returns {Promise<Object>} - Cached image object
 */
async function cacheImage(imageData, type) {
  try {
    if (!imageData.id) {
      console.warn('Skipping image cache - missing id:', imageData)
      return null
    }
    
    return await prisma.cachedImage.upsert({
      where: { igdbId: imageData.id },
      update: {
        url: imageData.url,
        width: imageData.width,
        height: imageData.height,
        imageId: imageData.image_id,
        type,
        lastUpdated: new Date()
      },
      create: {
        igdbId: imageData.id,
        url: imageData.url,
        width: imageData.width,
        height: imageData.height,
        imageId: imageData.image_id,
        type
      }
    })
  } catch (error) {
    console.error('Error caching image:', error)
    throw error
  }
}

/**
 * Get cached games by mood/parameters
 * @param {Object} params - Search parameters
 * @returns {Promise<Array>} - Array of cached games
 */
async function getCachedGamesByMood(params) {
  try {
    const { genres, themes, platforms, minRating, maxPlaytime, releaseYear } = params
    
    let whereClause = {}
    
    // Add genre filter
    if (genres && genres.length > 0) {
      // Check if genres are IDs or names
      const isNumeric = genres.every(g => typeof g === 'number' || !isNaN(Number(g)))
      
      if (isNumeric) {
        // Use ID-based filtering
        whereClause.genres = {
          some: {
            genre: {
              igdbId: {
                in: genres.map(g => Number(g))
              }
            }
          }
        }
      } else {
        // Use name-based filtering
        whereClause.genres = {
          some: {
            genre: {
              name: {
                in: genres
              }
            }
          }
        }
      }
    }
    
    // Add theme filter
    if (themes && themes.length > 0) {
      // Check if themes are IDs or names
      const isNumeric = themes.every(t => typeof t === 'number' || !isNaN(Number(t)))
      
      if (isNumeric) {
        // Use ID-based filtering
        whereClause.themes = {
          some: {
            theme: {
              igdbId: {
                in: themes.map(t => Number(t))
              }
            }
          }
        }
      } else {
        // Use name-based filtering
        whereClause.themes = {
          some: {
            theme: {
              name: {
                in: themes
              }
            }
          }
        }
      }
    }
    
    // Add platform filter
    if (platforms && platforms.length > 0) {
      // Check if platforms are IDs or names
      const isNumeric = platforms.every(p => typeof p === 'number' || !isNaN(Number(p)))
      
      if (isNumeric) {
        // Use ID-based filtering
        whereClause.platforms = {
          some: {
            platform: {
              igdbId: {
                in: platforms.map(p => Number(p))
              }
            }
          }
        }
      } else {
        // Use name-based filtering
        whereClause.platforms = {
          some: {
            platform: {
              name: {
                in: platforms
              }
            }
          }
        }
      }
    }
    
    // Add rating filter
    if (minRating) {
      whereClause.rating = {
        gte: Number(minRating)
      }
    }
    
    // Add release year filter
    if (releaseYear) {
      const startDate = new Date(releaseYear, 0, 1)
      const endDate = new Date(releaseYear, 11, 31)
      whereClause.firstReleaseDate = {
        gte: startDate,
        lte: endDate
      }
    }
    
    const games = await prisma.cachedGame.findMany({
      where: whereClause,
      include: {
        genres: {
          include: {
            genre: true
          }
        },
        platforms: {
          include: {
            platform: true
          }
        },
        themes: {
          include: {
            theme: true
          }
        },
        covers: {
          include: {
            image: true
          }
        },
        screenshots: {
          include: {
            image: true
          }
        }
      },
      orderBy: {
        rating: 'desc'
      },
      take: 50 // Limit results
    })
    
    // Transform the data to match the expected format
    return games.map(game => ({
      id: game.igdbId,
      name: game.name,
      slug: game.slug,
      summary: game.summary,
      storyline: game.storyline,
      rating: game.rating,
      rating_count: game.ratingCount,
      first_release_date: game.firstReleaseDate ? Math.floor(game.firstReleaseDate.getTime() / 1000) : null,
      category: game.category,
      status: game.status,
      genres: game.genres.map(g => g.genre),
      platforms: game.platforms.map(p => p.platform),
      themes: game.themes.map(t => t.theme),
      cover: game.covers[0]?.image || null,
      screenshots: game.screenshots.map(s => s.image)
    }))
  } catch (error) {
    console.error('Error getting cached games by mood:', error)
    return []
  }
}

/**
 * Get cached genres
 * @returns {Promise<Array>} - Array of cached genres
 */
async function getCachedGenres() {
  try {
    const genres = await prisma.cachedGenre.findMany({
      orderBy: {
        name: 'asc'
      }
    })
    
    return genres.map(genre => ({
      id: genre.igdbId,
      name: genre.name,
      slug: genre.slug,
      url: genre.url
    }))
  } catch (error) {
    console.error('Error getting cached genres:', error)
    return []
  }
}

/**
 * Get cached platforms
 * @returns {Promise<Array>} - Array of cached platforms
 */
async function getCachedPlatforms() {
  try {
    const platforms = await prisma.cachedPlatform.findMany({
      orderBy: {
        name: 'asc'
      }
    })
    
    return platforms.map(platform => ({
      id: platform.igdbId,
      name: platform.name,
      slug: platform.slug,
      abbreviation: platform.abbreviation,
      url: platform.url
    }))
  } catch (error) {
    console.error('Error getting cached platforms:', error)
    return []
  }
}

/**
 * Get cached themes
 * @returns {Promise<Array>} - Array of cached themes
 */
async function getCachedThemes() {
  try {
    const themes = await prisma.cachedTheme.findMany({
      orderBy: {
        name: 'asc'
      }
    })
    
    return themes.map(theme => ({
      id: theme.igdbId,
      name: theme.name,
      slug: theme.slug,
      url: theme.url
    }))
  } catch (error) {
    console.error('Error getting cached themes:', error)
    return []
  }
}

/**
 * Clean up expired cache entries
 */
async function cleanupExpiredCache() {
  try {
    const now = new Date()
    
    // Clean up expired search cache
    const deletedSearches = await prisma.searchCache.deleteMany({
      where: {
        ttl: {
          lt: now
        }
      }
    })
    
    console.log(`[DB CACHE CLEANUP] Deleted ${deletedSearches.count} expired search cache entries`)
  } catch (error) {
    console.error('Error cleaning up expired cache:', error)
  }
}

/**
 * Get cache statistics
 * @returns {Promise<Object>} - Cache statistics
 */
async function getCacheStats() {
  try {
    const [
      gameCount,
      genreCount,
      platformCount,
      themeCount,
      imageCount,
      searchCount
    ] = await Promise.all([
      prisma.cachedGame.count(),
      prisma.cachedGenre.count(),
      prisma.cachedPlatform.count(),
      prisma.cachedTheme.count(),
      prisma.cachedImage.count(),
      prisma.searchCache.count()
    ])
    
    return {
      games: gameCount,
      genres: genreCount,
      platforms: platformCount,
      themes: themeCount,
      images: imageCount,
      searches: searchCount,
      total: gameCount + genreCount + platformCount + themeCount + imageCount + searchCount
    }
  } catch (error) {
    console.error('Error getting cache stats:', error)
    return {}
  }
}

module.exports = {
  getCachedSearch,
  cacheSearch,
  cacheGame,
  cacheGenre,
  cachePlatform,
  cacheTheme,
  cacheImage,
  getCachedGamesByMood,
  getCachedGenres,
  getCachedPlatforms,
  getCachedThemes,
  cleanupExpiredCache,
  getCacheStats,
  CACHE_TTL
} 