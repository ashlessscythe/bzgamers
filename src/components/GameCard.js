"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'

/**
 * GameCard component for displaying individual game information
 */
export default function GameCard({ game, onFavoriteChange }) {
  const { data: session, status } = useSession()
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showAuthMessage, setShowAuthMessage] = useState(false)
  // Safety check for undefined game
  if (!game) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
        <p className="text-gray-600 dark:text-gray-400">Game data not available</p>
      </div>
    )
  }

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 100 
      }
    },
    hover: { 
      y: -10,
      transition: { 
        type: "spring", 
        stiffness: 300,
        damping: 10
      }
    }
  }

  // Format release date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown Release Date'
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  // Get cover image URL or placeholder
  const getCoverUrl = (cover) => {
    if (cover && cover.url) {
      // Replace t_thumb with t_cover_big for larger images
      return cover.url.replace('t_thumb', 't_cover_big')
    }
    return 'https://via.placeholder.com/264x374?text=No+Image'
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
        // Remove from favorites
        const response = await fetch(`/api/favorites?gameId=${game.id}`, {
          method: 'DELETE'
        })
        const data = await response.json()
        if (data.success) {
          setIsFavorited(false)
          if (onFavoriteChange) onFavoriteChange(game.id, false)
        }
      } else {
        // Add to favorites
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
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
      variants={cardVariants}
      whileHover="hover"
    >
      <div className="relative aspect-[3/4] bg-gray-200 dark:bg-gray-700">
        <img 
          src={getCoverUrl(game.cover)} 
          alt={game.name || 'Game'}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {game.total_rating && (
          <div className="absolute top-2 right-2 bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
            {Math.round(game.total_rating)}
          </div>
        )}
        {/* Favorite button */}
        <button
          onClick={handleFavoriteToggle}
          disabled={isLoading}
          className={`absolute top-2 left-2 p-2 rounded-full transition-all ${
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
            className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`}
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
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-12 left-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-3 py-2 rounded-lg shadow-lg z-10 whitespace-nowrap"
          >
            Sign in to add favorites
          </motion.div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-bold mb-1 line-clamp-1 text-gray-900 dark:text-gray-100">{game.name || 'Unknown Game'}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {formatDate(game.first_release_date)}
        </p>
        {game.platforms && game.platforms.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {game.platforms.slice(0, 3).map(platform => (
              <span
                key={platform.id}
                className="text-xs bg-blue-100 dark:bg-blue-700 px-2 py-1 rounded-full"
              >
                {platform.name}
              </span>
            ))}
          </div>
        )}
        
        {game.genres && game.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {game.genres.slice(0, 3).map(genre => (
              <span 
                key={genre.id} 
                className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full"
              >
                {genre.name}
              </span>
            ))}
          </div>
        )}
        
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
          {game.summary || 'No description available.'}
        </p>
        
        <div className="flex flex-col items-center mt-4 gap-2">
          <a 
            href={game.url || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-primary text-sm py-2 px-4 inline-flex items-center justify-center w-full"
          >
            <span>Learn More</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          {status !== 'authenticated' && (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              <span className="text-primary">Sign in</span> or <span className="text-primary">create an account</span> to save favorites
            </p>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400 text-center block">Powered by IGDB</span>
        </div>
      </div>
    </motion.div>
  )
}
