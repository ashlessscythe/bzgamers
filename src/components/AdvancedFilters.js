"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdvancedFilters({ 
  onFiltersChange, 
  initialFilters = {},
  isVisible = false,
  isLoading = false,
  availablePlatforms = [],
  availableYears = []
}) {
  const [filters, setFilters] = useState({
    platforms: [],
    releaseYearStart: '',
    releaseYearEnd: '',
    minRating: '',
    maxRating: '',
    sortBy: 'total_rating',
    sortOrder: 'desc',
    ...initialFilters
  })
  
  // Use available platforms from props instead of fetching all
  const platforms = availablePlatforms.length > 0 ? availablePlatforms : []
  const isLoadingPlatforms = false // No longer loading from API

  // Generate year options from available years in results
  const yearOptions = availableYears.length > 0 
    ? availableYears.sort((a, b) => b - a) // Sort descending (newest first)
    : []

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  // Handle platform selection
  const handlePlatformToggle = (platform) => {
    const isSelected = filters.platforms.some(p => p.id === platform.id)
    const newPlatforms = isSelected 
      ? filters.platforms.filter(p => p.id !== platform.id)
      : [...filters.platforms, platform]
    
    handleFilterChange('platforms', newPlatforms)
  }

  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters = {
      platforms: [],
      releaseYearStart: '',
      releaseYearEnd: '',
      minRating: '',
      maxRating: '',
      sortBy: 'total_rating',
      sortOrder: 'desc'
    }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  // Check if any filters are active
  const hasActiveFilters = filters.platforms.length > 0 || 
    filters.releaseYearStart || 
    filters.releaseYearEnd || 
    filters.minRating || 
    filters.maxRating ||
    filters.sortBy !== 'total_rating' ||
    filters.sortOrder !== 'desc'

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Advanced Filters</h3>
            <div className="flex items-center gap-2">
              {isLoading && (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              )}
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-primary hover:text-primary-dark transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Platforms</label>
              <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md p-2">
                {isLoadingPlatforms ? (
                  <div className="text-sm text-gray-500">Loading platforms...</div>
                ) : platforms.length > 0 ? (
                  <div className="space-y-1">
                    {platforms.map((platform) => (
                      <label key={platform.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.platforms.some(p => p.id === platform.id)}
                          onChange={() => handlePlatformToggle(platform)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm">{platform.name}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No platforms available in current results</div>
                )}
              </div>
            </div>

            {/* Release Year Range */}
            <div>
              <label className="block text-sm font-medium mb-2">Release Year</label>
              {yearOptions.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={filters.releaseYearStart}
                    onChange={(e) => handleFilterChange('releaseYearStart', e.target.value)}
                    className="text-sm border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 bg-white dark:bg-gray-700"
                  >
                    <option value="">From</option>
                    {yearOptions.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <select
                    value={filters.releaseYearEnd}
                    onChange={(e) => handleFilterChange('releaseYearEnd', e.target.value)}
                    className="text-sm border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 bg-white dark:bg-gray-700"
                  >
                    <option value="">To</option>
                    {yearOptions.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="text-sm text-gray-500">No release years available in current results</div>
              )}
            </div>

            {/* Rating Range */}
            <div>
              <label className="block text-sm font-medium mb-2">Rating Range</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Min"
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', e.target.value)}
                  className="text-sm border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 bg-white dark:bg-gray-700"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Max"
                  value={filters.maxRating}
                  onChange={(e) => handleFilterChange('maxRating', e.target.value)}
                  className="text-sm border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 bg-white dark:bg-gray-700"
                />
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium mb-2">Sort By</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="text-sm border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 bg-white dark:bg-gray-700"
                >
                  <option value="total_rating">Rating</option>
                  <option value="first_release_date">Release Date</option>
                  <option value="name">Name</option>
                </select>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  className="text-sm border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 bg-white dark:bg-gray-700"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2">
                {filters.platforms.map(platform => (
                  <span key={platform.id} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {platform.name}
                  </span>
                ))}
                {filters.releaseYearStart && (
                  <span className="text-xs bg-blue-100 dark:bg-blue-700 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                    From {filters.releaseYearStart}
                  </span>
                )}
                {filters.releaseYearEnd && (
                  <span className="text-xs bg-blue-100 dark:bg-blue-700 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                    To {filters.releaseYearEnd}
                  </span>
                )}
                {filters.minRating && (
                  <span className="text-xs bg-green-100 dark:bg-green-700 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                    Rating ≥ {filters.minRating}
                  </span>
                )}
                {filters.maxRating && (
                  <span className="text-xs bg-green-100 dark:bg-green-700 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                    Rating ≤ {filters.maxRating}
                  </span>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
} 