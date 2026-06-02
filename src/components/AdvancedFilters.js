"use client"

import { useState } from 'react'
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
    sortBy: 'first_release_date',
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
      sortBy: 'first_release_date',
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
    filters.sortBy !== 'first_release_date' ||
    filters.sortOrder !== 'desc'

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Advanced Filters</h3>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {isLoading && (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              )}
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="px-3 py-2 sm:py-1.5 text-sm font-medium bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-md transition-colors shadow-sm hover:shadow min-h-[44px] sm:min-h-0"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Platforms</label>
              <div className="max-h-40 sm:max-h-32 overflow-y-auto border-2 border-gray-200 dark:border-gray-600 rounded-lg p-2 sm:p-3 bg-white dark:bg-gray-700 shadow-inner custom-scrollbar">
                {isLoadingPlatforms ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400">Loading platforms...</div>
                ) : platforms.length > 0 ? (
                  <div className="space-y-2">
                    {platforms.map((platform) => {
                      const isChecked = filters.platforms.some(p => p.id === platform.id)
                      return (
                        <label key={platform.id} className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-600 p-2 sm:p-1.5 rounded-md transition-colors min-h-[44px] sm:min-h-0">
                          <div className="relative flex items-center flex-shrink-0">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handlePlatformToggle(platform)}
                              className="sr-only"
                            />
                            <div className={`
                              w-5 h-5 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center transition-all
                              ${isChecked 
                                ? 'bg-primary border-primary dark:bg-blue-500 dark:border-blue-500' 
                                : 'border-gray-300 dark:border-gray-500 group-hover:border-primary dark:group-hover:border-blue-400'
                              }
                            `}>
                              {isChecked && (
                                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{platform.name}</span>
                        </label>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400">No platforms available in current results</div>
                )}
              </div>
            </div>

            {/* Release Year Range */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Release Year</label>
              {yearOptions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="relative">
                    <select
                      value={filters.releaseYearStart}
                      onChange={(e) => handleFilterChange('releaseYearStart', e.target.value)}
                      className="w-full text-sm border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 sm:py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 appearance-none cursor-pointer hover:border-primary dark:hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-colors shadow-sm min-h-[44px] sm:min-h-0"
                    >
                      <option value="">From</option>
                      {yearOptions.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <div className="relative">
                    <select
                      value={filters.releaseYearEnd}
                      onChange={(e) => handleFilterChange('releaseYearEnd', e.target.value)}
                      className="w-full text-sm border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 sm:py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 appearance-none cursor-pointer hover:border-primary dark:hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-colors shadow-sm min-h-[44px] sm:min-h-0"
                    >
                      <option value="">To</option>
                      {yearOptions.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400">No release years available in current results</div>
              )}
            </div>

            {/* Rating Range */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Rating Range</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Min"
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', e.target.value)}
                  className="w-full text-sm border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 sm:py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 hover:border-primary dark:hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-colors shadow-sm min-h-[44px] sm:min-h-0"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Max"
                  value={filters.maxRating}
                  onChange={(e) => handleFilterChange('maxRating', e.target.value)}
                  className="w-full text-sm border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 sm:py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 hover:border-primary dark:hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-colors shadow-sm min-h-[44px] sm:min-h-0"
                />
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Sort By</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="relative">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full text-sm border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 sm:py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 appearance-none cursor-pointer hover:border-primary dark:hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-colors shadow-sm min-h-[44px] sm:min-h-0"
                  >
                    <option value="total_rating">Rating</option>
                    <option value="first_release_date">Release Date</option>
                    <option value="name">Name</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                    className="w-full text-sm border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 sm:py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 appearance-none cursor-pointer hover:border-primary dark:hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-colors shadow-sm min-h-[44px] sm:min-h-0"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="mt-4 sm:mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
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