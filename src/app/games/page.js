"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import GameResults from '../../components/GameResults'
import GoToTopButton from '../../components/GoToTopButton'
import { getUserFriendlyMessage } from '../../lib/error-handler'

// Available mood options - common ones first
const COMMON_MOOD_OPTIONS = [
  'Energetic', 'Relaxed', 'Focused', 'Creative', 
  'Social', 'Competitive', 'Adventurous', 'Nostalgic'
]

// Extended mood options for "See All"
const ALL_MOOD_OPTIONS = [
  // Common moods (first 8)
  'Energetic', 'Relaxed', 'Focused', 'Creative', 
  'Social', 'Competitive', 'Adventurous', 'Nostalgic',
  // Additional moods for esoteric tastes
  'Mysterious', 'Romantic', 'Horror', 'Comedy', 
  'Educational', 'Meditative', 'Chaotic', 'Organized',
  'Explorative', 'Destructive', 'Building', 'Collecting',
  'Story-driven', 'Mindless', 'Challenging', 'Casual'
]

// Available time options
const TIME_OPTIONS = ['< 30 min', '30-60 min', '1-2 hours', '2+ hours']

// Common genres (most popular/well-known) - only the most recognizable genres
const COMMON_GENRES = [
  'Shooter', 'Role-playing (RPG)', 'Strategy', 'Adventure', 'Indie', 
  'Simulator', 'Sport', 'Puzzle', 'Racing', 'Fighting', 'Platform',
  'Arcade', 'Music'
]

// Mapping from UI selections to API parameters
const MOOD_MAP = {
  'Energetic': 'excited',
  'Relaxed': 'relaxed',
  'Focused': 'focused',
  'Creative': 'creative',
  'Social': 'social',
  'Competitive': 'excited',
  'Adventurous': 'excited',
  'Nostalgic': 'nostalgic',
  'Mysterious': 'focused',
  'Romantic': 'relaxed',
  'Horror': 'excited',
  'Comedy': 'relaxed',
  'Educational': 'focused',
  'Meditative': 'relaxed',
  'Chaotic': 'excited',
  'Organized': 'focused',
  'Explorative': 'excited',
  'Destructive': 'excited',
  'Building': 'creative',
  'Collecting': 'focused',
  'Story-driven': 'focused',
  'Mindless': 'relaxed',
  'Challenging': 'focused',
  'Casual': 'relaxed'
}

const TIME_MAP = {
  '< 30 min': 'short',
  '30-60 min': 'short',
  '1-2 hours': 'medium',
  '2+ hours': 'long'
}

export default function Games() {
  // State for selected options
  const [searchMode, setSearchMode] = useState(null) // 'mood' or 'similar'
  const [selectedMood, setSelectedMood] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [selectedGenre, setSelectedGenre] = useState(null)
  const [genres, setGenres] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState([])
  const [originalResults, setOriginalResults] = useState([]) // Store original results for filtering
  const [error, setError] = useState(null)
  const [showResults, setShowResults] = useState(false)
  const [searchStep, setSearchStep] = useState(1) // 1: Mood, 2: Time, 3: Genre (for mood mode) or 1: Search, 2: Select (for similar mode)
  const [isRestoring, setIsRestoring] = useState(false)
  
  // State for similar game search
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedGame, setSelectedGame] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  
  // State for expanded options
  const [showAllMoods, setShowAllMoods] = useState(false)
  const [showAdvancedGenres, setShowAdvancedGenres] = useState(false)
  
  // State for loading more results and scroll position
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  
  // Advanced filter state
  const [advancedFilters, setAdvancedFilters] = useState({
    platforms: [],
    releaseYearStart: '',
    releaseYearEnd: '',
    minRating: '',
    maxRating: '',
    sortBy: 'first_release_date',
    sortOrder: 'desc'
  })

  // Load genres on component mount
  useEffect(() => {
    async function loadGenres() {
      try {
        const response = await fetch('/api/genres')
        if (response.ok) {
          const genresData = await response.json()
          setGenres(genresData)
        }
      } catch (err) {
        console.error('Error loading genres:', err)
        // Fallback to hardcoded genres if API fails
      }
    }
    loadGenres()
  }, [])

  // Load saved state from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem('bzgamers-search-state')
    if (savedState) {
      setIsRestoring(true)
      try {
        const parsedState = JSON.parse(savedState)
        const {
          selectedMood: savedMood,
          selectedTime: savedTime,
          selectedGenre: savedGenre,
          results: savedResults,
          originalResults: savedOriginalResults,
          showResults: savedShowResults,
          advancedFilters: savedFilters,
          showAllMoods: savedShowAllMoods,
          showAdvancedGenres: savedShowAdvancedGenres,
          searchMode: savedSearchMode,
          selectedGame: savedSelectedGame
        } = parsedState

        // Only restore if we have results to show
        if (savedShowResults && savedOriginalResults && savedOriginalResults.length > 0) {
          setSelectedMood(savedMood)
          setSelectedTime(savedTime)
          setSelectedGenre(savedGenre)
          setResults(savedResults || savedOriginalResults)
          setOriginalResults(savedOriginalResults)
          setShowResults(true)
          setShowAllMoods(savedShowAllMoods || false)
          setShowAdvancedGenres(savedShowAdvancedGenres || false)
          setAdvancedFilters(savedFilters || {
            platforms: [],
            releaseYearStart: '',
            releaseYearEnd: '',
            minRating: '',
            maxRating: '',
            sortBy: 'first_release_date',
            sortOrder: 'desc'
          })
          setSearchMode(savedSearchMode || null)
          setSelectedGame(savedSelectedGame || null)
        }
      } catch (err) {
        console.error('Error restoring saved state:', err)
        // Clear corrupted localStorage
        localStorage.removeItem('bzgamers-search-state')
      } finally {
        setIsRestoring(false)
      }
    }
  }, [])

  // Save state to localStorage whenever relevant state changes
  useEffect(() => {
    if (showResults && originalResults.length > 0) {
      const stateToSave = {
        selectedMood,
        selectedTime,
        selectedGenre,
        results,
        originalResults,
        showResults,
        advancedFilters,
        showAllMoods,
        showAdvancedGenres,
        searchMode,
        selectedGame
      }
      localStorage.setItem('bzgamers-search-state', JSON.stringify(stateToSave))
    } else {
      // Clear saved state if no results to show
      localStorage.removeItem('bzgamers-search-state')
    }
  }, [selectedMood, selectedTime, selectedGenre, results, originalResults, showResults, advancedFilters, showAllMoods, showAdvancedGenres, searchMode, selectedGame])

  // Restore scroll position after loading more results
  useEffect(() => {
    if (!isLoadingMore && scrollPosition > 0) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        // Smooth scroll to the position with a subtle animation
        window.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        })
        
        // Reset after restoring
        setTimeout(() => {
          setScrollPosition(0)
        }, 500) // Wait for scroll animation to complete
      })
    }
  }, [isLoadingMore, scrollPosition])

  // Function to handle mood selection and move to next step
  const handleMoodSelect = (mood) => {
    setSelectedMood(mood)
    setSearchStep(2) // Move to time selection
  }

  // Function to handle time selection and move to next step
  const handleTimeSelect = (time) => {
    setSelectedTime(time)
    setSearchStep(3) // Move to genre selection
  }

  // Function to handle advanced filter changes
  const handleFiltersChange = async (newFilters) => {
    setAdvancedFilters(newFilters)
    
    // If we have original results, filter them client-side
    if (originalResults.length > 0) {
      // Clear any existing timeout
      if (window.filterTimeout) {
        clearTimeout(window.filterTimeout)
      }
      
      // Set a new timeout to debounce the filter application
      window.filterTimeout = setTimeout(() => {
        applyClientSideFilters(newFilters)
      }, 300) // 300ms delay
    }
  }

  // Function to apply filters client-side
  const applyClientSideFilters = (filters) => {
    setIsLoading(true)
    
    // Use the original results for filtering
    const resultsToFilter = originalResults.length > 0 ? originalResults : results
    
    // Apply filters to the results
    let filteredResults = resultsToFilter.filter(game => {
      // Platform filter
      if (filters.platforms.length > 0) {
        const gamePlatforms = game.platforms || []
        const hasMatchingPlatform = filters.platforms.some(filterPlatform => 
          gamePlatforms.some(gamePlatform => 
            gamePlatform.id === (filterPlatform.id || filterPlatform)
          )
        )
        if (!hasMatchingPlatform) return false
      }
      
      // Release year filter
      if (filters.releaseYearStart || filters.releaseYearEnd) {
        const gameYear = game.first_release_date ? new Date(game.first_release_date * 1000).getFullYear() : null
        if (gameYear) {
          if (filters.releaseYearStart && gameYear < parseInt(filters.releaseYearStart)) return false
          if (filters.releaseYearEnd && gameYear > parseInt(filters.releaseYearEnd)) return false
        }
      }
      
      // Rating filter
      if (filters.minRating || filters.maxRating) {
        const gameRating = game.total_rating
        if (gameRating) {
          if (filters.minRating && gameRating < parseFloat(filters.minRating)) return false
          if (filters.maxRating && gameRating > parseFloat(filters.maxRating)) return false
        }
      }
      
      return true
    })
    
    // Apply sorting
    if (filters.sortBy && filters.sortOrder) {
      filteredResults.sort((a, b) => {
        let aValue, bValue
        
        switch (filters.sortBy) {
          case 'total_rating':
            aValue = a.total_rating || 0
            bValue = b.total_rating || 0
            break
          case 'first_release_date':
            aValue = a.first_release_date || 0
            bValue = b.first_release_date || 0
            break
          case 'name':
            aValue = a.name || ''
            bValue = b.name || ''
            break
          default:
            aValue = a.total_rating || 0
            bValue = b.total_rating || 0
        }
        
        if (filters.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
    }
    
    setResults(filteredResults)
    setIsLoading(false)
  }

  // Function to handle search
  const handleSearch = async () => {
    if (!selectedMood && !selectedTime && !selectedGenre) {
      setError('Please select at least one option to find games')
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      // If selectedGenre is a string (from the fallback list), map it to the appropriate genre ID or name
      // Otherwise, it's already a genre ID from the API
      let genreParam = selectedGenre;
      
      // Map hardcoded genre names to appropriate IGDB genre IDs
      if (typeof selectedGenre === 'string') {
        const genreMapping = {
          'Action': 25, // Map "Action" to "Hack and slash/Beat 'em up" (ID: 25)
          'Adventure': 31,
          'RPG': 12, // Role-playing game
          'Strategy': 15,
          'Simulation': 13,
          'Sports': 14,
          'Puzzle': 9,
          'Indie': 32,
          'Shooter': 5
        };
        
        genreParam = genreMapping[selectedGenre] || selectedGenre;
      }
      
      // Use simple search first - no advanced filters
      const params = {
        mood: selectedMood ? MOOD_MAP[selectedMood] : null,
        timeAvailable: selectedTime ? TIME_MAP[selectedTime] : null,
        genre: genreParam
      }
      
      const response = await fetch('/api/games-by-mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
      })
      
      if (!response.ok) {
        throw new Error('Failed to find games')
      }
      
      const gameResults = await response.json()
      console.log('Game results:', gameResults)
      
      // Apply default sorting (by release date descending)
      const sortedResults = [...gameResults].sort((a, b) => {
        const aValue = a.first_release_date || 0
        const bValue = b.first_release_date || 0
        return aValue < bValue ? 1 : -1 // Descending order (newest first)
      })
      
      setResults(sortedResults)
      setOriginalResults(sortedResults)
      setShowResults(true)
    } catch (err) {
      console.error('Error finding games:', err)
      setError(getUserFriendlyMessage(err) || 'Failed to find games. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle game search for similar games
  const handleGameSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a game name to search')
      return
    }
    
    setIsSearching(true)
    setError(null)
    
    try {
      const response = await fetch('/api/search-games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery, limit: 20 })
      })
      
      if (!response.ok) {
        throw new Error('Failed to search games')
      }
      
      const games = await response.json()
      setSearchResults(games)
      setSearchStep(2) // Move to game selection step
    } catch (err) {
      console.error('Error searching games:', err)
      setError(getUserFriendlyMessage(err) || 'Failed to search games. Please try again later.')
    } finally {
      setIsSearching(false)
    }
  }

  // Handle finding similar games
  const handleFindSimilar = async () => {
    if (!selectedGame) {
      setError('Please select a game first')
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/similar-games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameId: selectedGame.id })
      })
      
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = 'Failed to find similar games'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch (e) {
          // If we can't parse the error, use the status text
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }
      
      const similarGames = await response.json()
      console.log('Similar games:', similarGames)
      
      // Check if we got any results
      if (!similarGames || similarGames.length === 0) {
        setError('No similar games found. Try selecting a different game.')
        setIsLoading(false)
        return
      }
      
      // Apply default sorting (by release date descending)
      const sortedResults = [...similarGames].sort((a, b) => {
        const aValue = a.first_release_date || 0
        const bValue = b.first_release_date || 0
        return aValue < bValue ? 1 : -1 // Descending order (newest first)
      })
      
      setResults(sortedResults)
      setOriginalResults(sortedResults)
      setShowResults(true)
    } catch (err) {
      console.error('Error finding similar games:', err)
      setError(getUserFriendlyMessage(err) || 'Failed to find similar games. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  // Reset selections and results
  const handleReset = () => {
    setSearchMode(null)
    setSelectedMood(null)
    setSelectedTime(null)
    setSelectedGenre(null)
    setResults([])
    setOriginalResults([])
    setShowResults(false)
    setError(null)
    setSearchStep(1) // Reset to first step
    setShowAllMoods(false) // Reset expanded mood options
    setShowAdvancedGenres(false) // Reset expanded genre options
    setAdvancedFilters({
      platforms: [],
      releaseYearStart: '',
      releaseYearEnd: '',
      minRating: '',
      maxRating: '',
      sortBy: 'first_release_date',
      sortOrder: 'desc'
    })
    // Reset similar game search state
    setSearchQuery('')
    setSearchResults([])
    setSelectedGame(null)
    // Clear saved state from localStorage
    localStorage.removeItem('bzgamers-search-state')
  }

  // Function to load more results
  const handleLoadMore = async () => {
    // For mood mode, check if we have mood/time/genre
    if (searchMode === 'mood' && !selectedMood && !selectedTime && !selectedGenre) {
      return
    }
    
    // For similar mode, check if we have a selected game
    if (searchMode === 'similar' && !selectedGame) {
      return
    }
    
    // Store current scroll position
    setScrollPosition(window.scrollY)
    setIsLoadingMore(true)
    setIsLoading(true)
    
    try {
      let response;
      
      if (searchMode === 'similar') {
        // Load more similar games
        response = await fetch('/api/similar-games', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            gameId: selectedGame.id,
            offset: originalResults.length 
          })
        })
      } else {
        // Load more mood-based games
        // If selectedGenre is a string (from the fallback list), map it to the appropriate genre ID or name
        let genreParam = selectedGenre;
        
        // Map hardcoded genre names to appropriate IGDB genre IDs
        if (typeof selectedGenre === 'string') {
          const genreMapping = {
            'Action': 25,
            'Adventure': 31,
            'RPG': 12,
            'Strategy': 15,
            'Simulation': 13,
            'Sports': 14,
            'Puzzle': 9,
            'Indie': 32,
            'Shooter': 5
          };
          
          genreParam = genreMapping[selectedGenre] || selectedGenre;
        }
        
        const params = {
          mood: selectedMood ? MOOD_MAP[selectedMood] : null,
          timeAvailable: selectedTime ? TIME_MAP[selectedTime] : null,
          genre: genreParam,
          offset: originalResults.length // Start from where we left off
        }
        
        response = await fetch('/api/games-by-mood', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params)
        })
      }
      
      if (!response.ok) {
        throw new Error('Failed to load more games')
      }
      
      const additionalResults = await response.json()
      console.log('Additional results:', additionalResults)
      
      // Add new results to both arrays
      const newOriginalResults = [...originalResults, ...additionalResults]
      setOriginalResults(newOriginalResults)
      
      // Update the displayed results by applying current filters to the new combined results
      const resultsToFilter = newOriginalResults
      
      // Apply filters to the results
      let filteredResults = resultsToFilter.filter(game => {
        // Platform filter
        if (advancedFilters.platforms.length > 0) {
          const gamePlatforms = game.platforms || []
          const hasMatchingPlatform = advancedFilters.platforms.some(filterPlatform => 
            gamePlatforms.some(gamePlatform => 
              gamePlatform.id === (filterPlatform.id || filterPlatform)
            )
          )
          if (!hasMatchingPlatform) return false
        }
        
        // Release year filter
        if (advancedFilters.releaseYearStart || advancedFilters.releaseYearEnd) {
          const gameYear = game.first_release_date ? new Date(game.first_release_date * 1000).getFullYear() : null
          if (gameYear) {
            if (advancedFilters.releaseYearStart && gameYear < parseInt(advancedFilters.releaseYearStart)) return false
            if (advancedFilters.releaseYearEnd && gameYear > parseInt(advancedFilters.releaseYearEnd)) return false
          }
        }
        
        // Rating filter
        if (advancedFilters.minRating || advancedFilters.maxRating) {
          const gameRating = game.total_rating
          if (gameRating) {
            if (advancedFilters.minRating && gameRating < parseFloat(advancedFilters.minRating)) return false
            if (advancedFilters.maxRating && gameRating > parseFloat(advancedFilters.maxRating)) return false
          }
        }
        
        return true
      })
      
      // Apply sorting
      if (advancedFilters.sortBy && advancedFilters.sortOrder) {
        filteredResults.sort((a, b) => {
          let aValue, bValue
          
          switch (advancedFilters.sortBy) {
            case 'total_rating':
              aValue = a.total_rating || 0
              bValue = b.total_rating || 0
              break
            case 'first_release_date':
              aValue = a.first_release_date || 0
              bValue = b.first_release_date || 0
              break
            case 'name':
              aValue = a.name || ''
              bValue = b.name || ''
              break
            default:
              aValue = a.total_rating || 0
              bValue = b.total_rating || 0
          }
          
          if (advancedFilters.sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1
          } else {
            return aValue < bValue ? 1 : -1
          }
        })
      }
      
      setResults(filteredResults)
      
    } catch (err) {
      console.error('Error loading more games:', err)
      setError(getUserFriendlyMessage(err) || 'Failed to load more games. Please try again later.')
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  // Animation variants for the page container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 100 
      }
    }
  }

  // Function to extract available platforms from results
  const getAvailablePlatforms = (gameResults) => {
    console.log('Extracting platforms from results:', gameResults.length, 'games')
    
    const platformMap = new Map()
    
    gameResults.forEach((game, index) => {
      console.log(`Game ${index + 1}: ${game.name} - platforms:`, game.platforms)
      
      if (game.platforms && Array.isArray(game.platforms)) {
        game.platforms.forEach(platform => {
          if (platform.id && platform.name) {
            platformMap.set(platform.id, platform)
            console.log(`Found platform: ${platform.name} (ID: ${platform.id})`)
          }
        })
      }
    })
    
    const platforms = Array.from(platformMap.values()).sort((a, b) => a.name.localeCompare(b.name))
    console.log('Final available platforms:', platforms)
    
    return platforms
  }

  // Function to extract available years from results
  const getAvailableYears = (gameResults) => {
    console.log('Extracting years from results:', gameResults.length, 'games')
    
    const yearSet = new Set()
    
    gameResults.forEach((game, index) => {
      console.log(`Game ${index + 1}: ${game.name} - release date:`, game.first_release_date)
      
      if (game.first_release_date) {
        const year = new Date(game.first_release_date * 1000).getFullYear()
        yearSet.add(year)
        console.log(`Found year: ${year}`)
      }
    })
    
    const years = Array.from(yearSet).sort((a, b) => b - a) // Sort descending (newest first)
    console.log('Final available years:', years)
    
    return years
  }

  // Function to generate personalized summary
  const generatePersonalizedSummary = () => {
    const parts = []
    
    // Add mood
    if (selectedMood) {
      parts.push(`Since you're feeling <span class="font-semibold text-primary dark:text-primary">${selectedMood.toLowerCase()}</span>`)
    }
    
    // Add time
    if (selectedTime) {
      parts.push(`and you have <span class="font-semibold text-primary dark:text-primary">${selectedTime}</span> to play`)
    }
    
    // Add genre
    if (selectedGenre) {
      let genreName = selectedGenre
      if (genres.length > 0) {
        const genreObj = genres.find(g => g.id === selectedGenre)
        if (genreObj) {
          genreName = genreObj.name
        }
      }
      parts.push(`and you enjoy <span class="font-semibold text-primary dark:text-primary">${genreName}</span> games`)
    }
    
    if (parts.length === 0) {
      return '<span class="text-gray-700 dark:text-gray-300">Here are some great games for you to discover! 🎮</span>'
    }
    
    // Check for special combinations first
    if (selectedMood && selectedTime && selectedGenre) {
      const specialCombinations = {
        'Energetic-< 30 min-Shooter': '<span class="text-gray-700 dark:text-gray-300">Perfect! A quick adrenaline rush is exactly what you need right now! 💥</span>',
        'Relaxed-2+ hours-Adventure': '<span class="text-gray-700 dark:text-gray-300">Ah, the perfect setup for an immersive escape! Time to get lost in another world! 🌍</span>',
        'Focused-1-2 hours-Strategy': '<span class="text-gray-700 dark:text-gray-300">Your brain is ready for some serious tactical thinking! 🧠⚡</span>',
        'Social-30-60 min-Sport': '<span class="text-gray-700 dark:text-gray-300">Time for some friendly competition! Perfect for a quick gaming session with friends! ⚽</span>',
        'Creative-2+ hours-Indie': '<span class="text-gray-700 dark:text-gray-300">Your imagination is calling! These creative gems will inspire you for hours! ✨</span>',
        'Competitive-< 30 min-Fighting': '<span class="text-gray-700 dark:text-gray-300">Quick matches, intense action - your competitive spirit will love this! 👊</span>',
        'Adventurous-1-2 hours-Role-playing (RPG)': '<span class="text-gray-700 dark:text-gray-300">Epic quests await! Time to embark on an unforgettable journey! 🗡️</span>',
        'Nostalgic-30-60 min-Platform': '<span class="text-gray-700 dark:text-gray-300">Classic vibes for a classic mood! These games will bring back the good memories! 📼</span>'
      }
      
      const combinationKey = `${selectedMood}-${selectedTime}-${selectedGenre}`
      if (specialCombinations[combinationKey]) {
        return specialCombinations[combinationKey]
      }
    }
    
    // Generate different closing messages based on mood
    let closingMessage = '<span class="text-gray-700 dark:text-gray-300">here are some perfect games for your current vibe! 🎮</span>'
    
    if (selectedMood) {
      const moodClosings = {
        'Energetic': '<span class="text-gray-700 dark:text-gray-300">here are some exciting games to match your energy! ⚡</span>',
        'Relaxed': '<span class="text-gray-700 dark:text-gray-300">here are some chill games to keep you in that peaceful state! 😌</span>',
        'Focused': '<span class="text-gray-700 dark:text-gray-300">here are some engaging games to keep your mind sharp! 🧠</span>',
        'Creative': '<span class="text-gray-700 dark:text-gray-300">here are some inspiring games to spark your imagination! ✨</span>',
        'Social': '<span class="text-gray-700 dark:text-gray-300">here are some fun games to share with friends! 👥</span>',
        'Competitive': '<span class="text-gray-700 dark:text-gray-300">here are some intense games to satisfy your competitive spirit! 🏆</span>',
        'Adventurous': '<span class="text-gray-700 dark:text-gray-300">here are some epic games for your next adventure! 🗺️</span>',
        'Nostalgic': '<span class="text-gray-700 dark:text-gray-300">here are some games that\'ll take you back to the good old days! 📼</span>'
      }
      closingMessage = moodClosings[selectedMood] || closingMessage
    }
    
    return `${parts.join(' ')}, ${closingMessage}`
  }

  return (
    <div className="py-8">
      <motion.div
        className="max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Find Your Perfect Game</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Choose how you&apos;d like to discover your next game.
          </p>
        </motion.div>

        {/* Loading state for restoring saved results */}
        {isRestoring && (
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8"
            variants={itemVariants}
          >
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-lg">Restoring your previous search...</p>
            </div>
          </motion.div>
        )}

        {!isRestoring && (
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8"
            variants={itemVariants}
          >
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {!showResults ? (
              <div>
                {/* Mode Selection */}
                {!searchMode && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-bold mb-6">How would you like to find games?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <button
                        onClick={() => {
                          setSearchMode('mood')
                          setSearchStep(1)
                        }}
                        className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-lg hover:bg-primary/20 dark:hover:bg-primary/30 hover:border-primary transition-all border-2 border-transparent text-left"
                      >
                        <h3 className="text-xl font-bold mb-2">By Mood</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Tell us how you&apos;re feeling, how much time you have, and what you&apos;re in the mood for.
                          We&apos;ll recommend games that match your current state of mind.
                        </p>
                      </button>
                      <button
                        onClick={() => {
                          setSearchMode('similar')
                          setSearchStep(1)
                        }}
                        className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-lg hover:bg-primary/20 dark:hover:bg-primary/30 hover:border-primary transition-all border-2 border-transparent text-left"
                      >
                        <h3 className="text-xl font-bold mb-2">Similar Game (Beta)</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Search for a game you like, and we&apos;ll find similar games available on the same platforms.
                        </p>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Mood-based search flow */}
                {searchMode === 'mood' && (
                  <>
                    {/* Step 1: Mood Selection */}
                    {searchStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-bold mb-6">How are you feeling today?</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {(showAllMoods ? ALL_MOOD_OPTIONS : COMMON_MOOD_OPTIONS).map((mood) => (
                        <button
                          key={mood}
                          onClick={() => handleMoodSelect(mood)}
                          className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary transition-all border-2 border-transparent"
                        >
                          <span className="font-medium">{mood}</span>
                        </button>
                      ))}
                    </div>
                    
                    {/* See All / Show Less button for moods */}
                    <div className="flex justify-center mt-4">
                      <button
                        onClick={() => setShowAllMoods(!showAllMoods)}
                        className="text-primary hover:text-primary-dark transition-colors text-sm font-medium"
                      >
                        {showAllMoods ? 'Show Less' : 'See All Moods'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Time Selection */}
                {searchStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-bold mb-6">How much time do you have?</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {TIME_OPTIONS.map((time) => (
                        <button
                          key={time}
                          onClick={() => handleTimeSelect(time)}
                          className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary transition-all border-2 border-transparent"
                        >
                          <span className="font-medium">{time}</span>
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setSearchStep(1)}
                      className="mt-4 text-primary hover:text-primary-dark transition-colors"
                    >
                      ← Back to mood selection
                    </button>
                  </motion.div>
                )}

                {/* Step 3: Genre Selection */}
                {searchStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-bold mb-6">What genre interests you? (Optional)</h2>
                    
                    {/* Common genres section */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
                        Popular Genres 
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                          ({genres.length > 0 ? genres.filter(genre => COMMON_GENRES.includes(genre.name)).length : COMMON_GENRES.length})
                        </span>
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-4">
                        {genres.length > 0 ? (
                          // Filter genres to show common ones first
                          genres
                            .filter(genre => COMMON_GENRES.includes(genre.name))
                            .map((genre) => (
                              <button
                                key={genre.id}
                                onClick={() => setSelectedGenre(genre.id)}
                                className={`p-3 rounded-lg transition-all border-2 text-sm ${
                                  selectedGenre === genre.id
                                    ? 'bg-primary/20 border-primary'
                                    : 'bg-gray-50 dark:bg-gray-700 border-transparent hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary'
                                }`}
                              >
                                <span className="font-medium">{genre.name}</span>
                              </button>
                            ))
                        ) : (
                          // Fallback genre list if API fails
                          COMMON_GENRES.map((genre) => (
                            <button
                              key={genre}
                              onClick={() => setSelectedGenre(genre)}
                              className={`p-3 rounded-lg transition-all border-2 text-sm ${
                                selectedGenre === genre
                                  ? 'bg-primary/20 border-primary'
                                  : 'bg-gray-50 dark:bg-gray-700 border-transparent hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary'
                              }`}
                            >
                              <span className="font-medium">{genre}</span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                    
                    {/* Advanced genres section */}
                    {genres.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                            More Genres
                            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                              ({genres.filter(genre => !COMMON_GENRES.includes(genre.name)).length})
                            </span>
                          </h3>
                          <button
                            onClick={() => setShowAdvancedGenres(!showAdvancedGenres)}
                            className="text-primary hover:text-primary-dark transition-colors text-sm font-medium"
                          >
                            {showAdvancedGenres ? 'Show Less' : 'Advanced'}
                          </button>
                        </div>
                        
                        {showAdvancedGenres && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                              {genres
                                .filter(genre => !COMMON_GENRES.includes(genre.name))
                                .map((genre) => (
                                  <button
                                    key={genre.id}
                                    onClick={() => setSelectedGenre(genre.id)}
                                    className={`p-3 rounded-lg transition-all border-2 text-sm ${
                                      selectedGenre === genre.id
                                        ? 'bg-primary/20 border-primary'
                                        : 'bg-gray-50 dark:bg-gray-700 border-transparent hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary'
                                    }`}
                                  >
                                    <span className="font-medium">{genre.name}</span>
                                  </button>
                                ))}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={() => setSearchStep(2)}
                        className="text-primary hover:text-primary-dark transition-colors"
                      >
                        ← Back to time selection
                      </button>
                      <button
                        onClick={handleSearch}
                        disabled={isLoading}
                        className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Finding games...' : 'Find Games'}
                      </button>
                    </div>
                  </motion.div>
                )}
                  </>
                )}

                {/* Similar game search flow */}
                {searchMode === 'similar' && (
                  <>
                    {/* Step 1: Game Search */}
                    {searchStep === 1 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h2 className="text-2xl font-bold mb-6">Search for a game you like</h2>
                        <div className="mb-6">
                          <div className="flex gap-4">
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleGameSearch()
                                }
                              }}
                              placeholder="Enter game name..."
                              className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary dark:bg-gray-700 dark:text-white"
                            />
                            <button
                              onClick={handleGameSearch}
                              disabled={isSearching || !searchQuery.trim()}
                              className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isSearching ? 'Searching...' : 'Search'}
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSearchMode(null)
                            setSearchQuery('')
                            setSearchResults([])
                          }}
                          className="text-primary hover:text-primary-dark transition-colors"
                        >
                          ← Back to mode selection
                        </button>
                      </motion.div>
                    )}

                    {/* Step 2: Game Selection */}
                    {searchStep === 2 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h2 className="text-2xl font-bold mb-6">Select a game</h2>
                        {searchResults.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-gray-600 dark:text-gray-400 mb-4">No games found. Try a different search.</p>
                            <button
                              onClick={() => {
                                setSearchStep(1)
                                setSearchQuery('')
                                setSearchResults([])
                              }}
                              className="text-primary hover:text-primary-dark transition-colors"
                            >
                              ← Back to search
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                              {searchResults.map((game) => (
                                <button
                                  key={game.id}
                                  onClick={() => setSelectedGame(game)}
                                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                                    selectedGame?.id === game.id
                                      ? 'bg-primary/20 border-primary'
                                      : 'bg-gray-50 dark:bg-gray-700 border-transparent hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary'
                                  }`}
                                >
                                  <div className="flex items-start gap-4">
                                    {game.cover && (
                                      <img
                                        src={game.cover.url?.replace('t_thumb', 't_cover_small') || 'https://via.placeholder.com/90x128?text=No+Image'}
                                        alt={game.name}
                                        className="w-20 h-28 object-cover rounded"
                                      />
                                    )}
                                    <div className="flex-1">
                                      <h3 className="font-bold mb-1">{game.name}</h3>
                                      {game.first_release_date && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                          {new Date(game.first_release_date * 1000).getFullYear()}
                                        </p>
                                      )}
                                      {game.platforms && game.platforms.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
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
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                            <div className="flex gap-4">
                              <button
                                onClick={() => {
                                  setSearchStep(1)
                                  setSearchQuery('')
                                  setSearchResults([])
                                  setSelectedGame(null)
                                }}
                                className="text-primary hover:text-primary-dark transition-colors"
                              >
                                ← Back to search
                              </button>
                              <button
                                onClick={handleFindSimilar}
                                disabled={!selectedGame || isLoading}
                                className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isLoading ? 'Finding similar games...' : 'Give me a game like this'}
                              </button>
                            </div>
                          </>
                        )}
                      </motion.div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Your Game Recommendations</h2>
                  <motion.button
                    onClick={handleReset}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 transition-transform group-hover:rotate-180" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                      />
                    </svg>
                    Start Over
                  </motion.button>
                </div>
                
                {/* Personalized Summary */}
                <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-lg border border-primary/20">
                  {selectedGame ? (
                    <>
                      <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                        Games similar to <span className="font-semibold text-primary">{selectedGame.name}</span>
                        {selectedGame.platforms && selectedGame.platforms.length > 0 && (
                          <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                            (filtered to {selectedGame.platforms.map(p => p.name).join(', ')})
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Found <span className="font-semibold text-primary">{originalResults.length}</span> similar games!
                      </p>
                    </>
                  ) : (
                    <>
                      <p 
                        className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: generatePersonalizedSummary() }}
                      />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Found <span className="font-semibold text-primary">{originalResults.length}</span> perfect games for you!
                      </p>
                    </>
                  )}
                </div>
                
                <GameResults 
                  results={results} 
                  isLoading={isLoading} 
                  onBack={handleReset}
                  onFiltersChange={handleFiltersChange}
                  initialFilters={advancedFilters}
                  onLoadMore={handleLoadMore}
                  hasMore={originalResults.length >= 12} // Show load more if we have at least 12 results
                  availablePlatforms={getAvailablePlatforms(originalResults)}
                  availableYears={getAvailableYears(originalResults)}
                  totalResults={originalResults.length}
                />
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
      
      {/* Floating Go to Top Button */}
      <GoToTopButton />
    </div>
  )
} 