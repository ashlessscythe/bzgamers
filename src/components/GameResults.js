"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import GameCard from './GameCard'
import AdvancedFilters from './AdvancedFilters'

/**
 * GameResults component for displaying game search results with advanced filtering
 */
export default function GameResults({ 
  results, 
  isLoading, 
  onBack, 
  onFiltersChange, 
  initialFilters = {},
  onLoadMore = null,
  hasMore = false,
  availablePlatforms = [],
  availableYears = [],
  totalResults = 0
}) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  
  // Safety check for undefined or null results
  if (!results || !Array.isArray(results)) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">No Results Available</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          No game data is currently available. Please try your search again.
        </p>
        {onBack && (
          <motion.button
            className="btn-primary text-lg py-3 px-8"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
          >
            Go Back
          </motion.button>
        )}
      </div>
    )
  }
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
      }
    },
    exit: { opacity: 0 }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg">Finding the perfect games for you...</p>
      </div>
    )
  }

  // Function to get the heading text based on result count
  const getHeadingText = (count) => {
    if (count === 0) {
      return "No Games Match Your Filters"
    } else if (count === 1) {
      return "Wow! Only 1 Game - Must Be Special! 🎯"
    } else if (count < 5) {
      return `Found ${count} Games For You ✨`
    } else if (count < 10) {
      return `Found ${count} Great Games For You 🎮`
    } else if (count < 20) {
      return `Found ${count} Awesome Games For You 🚀`
    } else {
      return `Found ${count} Amazing Games For You 🎉`
    }
  }

  // Check if filters are active
  const hasActiveFilters = initialFilters.platforms?.length > 0 || 
    initialFilters.releaseYearStart || 
    initialFilters.releaseYearEnd || 
    initialFilters.minRating || 
    initialFilters.maxRating ||
    initialFilters.sortBy !== 'first_release_date' ||
    initialFilters.sortOrder !== 'desc'

  // Get subtitle text
  const getSubtitleText = () => {
    if (!hasActiveFilters) return null
    
    if (results.length === 0) {
      return `Showing 0 of ${totalResults} total games`
    } else if (results.length === totalResults) {
      return `Showing all ${totalResults} games`
    } else {
      return `Showing ${results.length} of ${totalResults} games`
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{getHeadingText(results.length)}</h2>
          {getSubtitleText() && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {getSubtitleText()}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-shrink-0 w-full sm:w-auto">
          <motion.button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`
              relative px-4 py-2.5 sm:py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 min-h-[44px] sm:min-h-0
              ${showAdvancedFilters || hasActiveFilters
                ? 'bg-primary text-white hover:bg-primary-dark dark:bg-blue-600 dark:hover:bg-blue-500 shadow-md'
                : 'bg-white dark:bg-gray-700 text-primary dark:text-blue-400 border-2 border-primary dark:border-blue-400 hover:bg-primary/10 dark:hover:bg-blue-400/20 shadow-sm'
              }
            `}
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
            <span className="text-sm sm:text-base">{showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}</span>
            {hasActiveFilters && !showAdvancedFilters && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 dark:bg-red-400 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">!</span>
              </span>
            )}
          </motion.button>
          {onBack && (
            <motion.button
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors flex items-center justify-center gap-1.5 text-sm min-h-[44px] sm:min-h-0 px-3 sm:px-0"
              whileHover={{ x: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              <span>Back to Search</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      <AdvancedFilters
        isVisible={showAdvancedFilters}
        onFiltersChange={onFiltersChange}
        initialFilters={initialFilters}
        isLoading={isLoading}
        availablePlatforms={availablePlatforms}
        availableYears={availableYears}
      />
      
      {/* Results Section */}
      {results.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try adjusting your filters to see more results. You can modify platforms, release years, or rating ranges.
          </p>
          <motion.button
            onClick={() => setShowAdvancedFilters(true)}
            className="btn-primary text-lg py-3 px-8"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Adjust Filters
          </motion.button>
        </div>
      ) : (
        <>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {results.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </motion.div>
          
          {/* Load More Button */}
          {hasMore && onLoadMore && (
            <div className="flex justify-center mt-8">
              <motion.button
                onClick={onLoadMore}
                disabled={isLoading}
                className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLoading ? 'Loading...' : 'Load More Games'}
              </motion.button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
