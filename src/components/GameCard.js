"use client"

import { motion } from 'framer-motion'

/**
 * GameCard component for displaying individual game information
 */
export default function GameCard({ game }) {
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
        
        <div className="flex flex-col items-center mt-4">
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
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center block">Powered by IGDB</span>
        </div>
      </div>
    </motion.div>
  )
}
