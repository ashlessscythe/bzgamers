"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'

/**
 * CompactGameCard component - smaller version for profile page
 */
export default function CompactGameCard({ game, onFavoriteChange }) {
  const { data: session, status } = useSession()
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showAuthMessage, setShowAuthMessage] = useState(false)

  if (!game) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3">
        <p className="text-gray-600 dark:text-gray-400 text-sm">Game data not available</p>
      </div>
    )
  }

  const cardVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 100 
      }
    },
    hover: { 
      y: -5,
      transition: { 
        type: "spring", 
        stiffness: 300,
        damping: 10
      }
    }
  }

  // Format release date
  const formatDate = (timestamp) => {
    if (!timestamp) return null
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
  }

  // Get cover image URL
  const getCoverUrl = (cover) => {
    if (cover && cover.url) {
      return cover.url.replace('t_thumb', 't_cover_small')
    }
    return 'https://via.placeholder.com/90x128?text=No+Image'
  }

  // Check if game is favorited on mount
  useEffect(() => {
    if (status === 'authenticated' && game?.id) {
      checkFavoriteStatus()
    }
  }, [status, game?.id])

  const checkFavoriteStatus = async () => {
    if (!game?.id || status !== 'authenticated') return

    try {
      const response = await fetch('/api/favorites/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameIds: [game.id] })
      })
      const data = await response.json()
      if (data.success) {
        setIsFavorited(data.favoritedGameIds.includes(game.id))
      }
    } catch (error) {
      console.error('Error checking favorite status:', error)
    }
  }

  const handleFavoriteToggle = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (status !== 'authenticated') {
      setShowAuthMessage(true)
      setTimeout(() => setShowAuthMessage(false), 3000)
      return
    }

    if (!game?.id || isLoading) return

    setIsLoading(true)
    try {
      if (isFavorited) {
        const response = await fetch(`/api/favorites?gameId=${game.id}`, {
          method: 'DELETE'
        })
        const data = await response.json()
        if (data.success) {
          setIsFavorited(false)
          if (onFavoriteChange) onFavoriteChange(game.id, false)
        }
      } else {
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId: game.id,
            gameName: game.name,
            gameData: game
          })
        })
        const data = await response.json()
        if (data.success) {
          setIsFavorited(true)
          if (onFavoriteChange) onFavoriteChange(game.id, true)
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
      variants={cardVariants}
      whileHover="hover"
    >
      <div className="flex gap-3 p-3">
        {/* Cover Image */}
        <div className="relative flex-shrink-0 w-20 h-28 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
          <img 
            src={getCoverUrl(game.cover)} 
            alt={game.name || 'Game'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {game.total_rating && (
            <div className="absolute top-1 right-1 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              {Math.round(game.total_rating)}
            </div>
          )}
          {/* Favorite button */}
          <button
            onClick={handleFavoriteToggle}
            disabled={isLoading}
            className={`absolute bottom-1 left-1 p-1.5 rounded-full transition-all ${
              isFavorited
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            title={status === 'authenticated' 
              ? (isFavorited ? 'Remove from favorites' : 'Add to favorites')
              : 'Sign in to add to favorites'
            }
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-3.5 w-3.5 ${isFavorited ? 'fill-current' : ''}`}
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={isFavorited ? 0 : 2}
              fill={isFavorited ? 'currentColor' : 'none'}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          {/* Auth message tooltip */}
          {showAuthMessage && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute top-8 left-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap"
            >
              Sign in to add favorites
            </motion.div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          <h3 className="text-sm font-semibold mb-1 line-clamp-2 text-gray-900 dark:text-gray-100">
            {game.name || 'Unknown Game'}
          </h3>
          
          {formatDate(game.first_release_date) && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              {formatDate(game.first_release_date)}
            </p>
          )}

          {game.platforms && game.platforms.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {game.platforms.slice(0, 2).map(platform => (
                <span
                  key={platform.id}
                  className="text-xs bg-blue-100 dark:bg-blue-700 px-1.5 py-0.5 rounded"
                >
                  {platform.name}
                </span>
              ))}
              {game.platforms.length > 2 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{game.platforms.length - 2}
                </span>
              )}
            </div>
          )}
          
          {game.summary && (
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2 flex-1">
              {game.summary}
            </p>
          )}
          
          <a 
            href={game.url || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-auto"
          >
            Learn More
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </motion.div>
  )
}
