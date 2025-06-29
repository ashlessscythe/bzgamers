"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import GameResults from '../../components/GameResults'
import { getUserFriendlyMessage } from '../../lib/error-handler'

// Available mood options
const MOOD_OPTIONS = [
  'Energetic', 'Relaxed', 'Focused', 'Creative', 
  'Social', 'Competitive', 'Adventurous', 'Nostalgic'
]

// Available time options
const TIME_OPTIONS = ['< 30 min', '30-60 min', '1-2 hours', '2+ hours']

// Mapping from UI selections to API parameters
const MOOD_MAP = {
  'Energetic': 'excited',
  'Relaxed': 'relaxed',
  'Focused': 'focused',
  'Creative': 'creative',
  'Social': 'social',
  'Competitive': 'excited',
  'Adventurous': 'excited',
  'Nostalgic': 'nostalgic'
}

const TIME_MAP = {
  '< 30 min': 'short',
  '30-60 min': 'short',
  '1-2 hours': 'medium',
  '2+ hours': 'long'
}

export default function Games() {
  // State for selected options
  const [selectedMood, setSelectedMood] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [selectedGenre, setSelectedGenre] = useState(null)
  const [genres, setGenres] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState([])
  const [error, setError] = useState(null)
  const [showResults, setShowResults] = useState(false)
  const [searchStep, setSearchStep] = useState(1) // 1: Mood, 2: Time, 3: Genre

  // Fetch genres on component mount
  useEffect(() => {
    async function loadGenres() {
      try {
        const response = await fetch('/api/genres')
        if (!response.ok) {
          throw new Error('Failed to fetch genres')
        }
        const genreData = await response.json()
        setGenres(genreData)
      } catch (err) {
        console.error('Failed to load genres:', err)
        setError(getUserFriendlyMessage(err) || 'Failed to load genre data. Please try again later.')
      }
    }
    
    loadGenres()
  }, [])

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
      setResults(gameResults)
      setShowResults(true)
    } catch (err) {
      console.error('Error finding games:', err)
      setError(getUserFriendlyMessage(err) || 'Failed to find games. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  // Reset selections and results
  const handleReset = () => {
    setSelectedMood(null)
    setSelectedTime(null)
    setSelectedGenre(null)
    setResults([])
    setShowResults(false)
    setError(null)
    setSearchStep(1) // Reset to first step
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
            Tell us how you&apos;re feeling, how much time you have, and what you&apos;re in the mood for.
            We&apos;ll recommend games that match your current state of mind.
          </p>
        </motion.div>

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
              {/* Step 1: Mood Selection */}
              {searchStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-bold mb-6">How are you feeling today?</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {MOOD_OPTIONS.map((mood) => (
                      <button
                        key={mood}
                        onClick={() => handleMoodSelect(mood)}
                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary transition-all border-2 border-transparent"
                      >
                        <span className="font-medium">{mood}</span>
                      </button>
                    ))}
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
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {genres.length > 0 ? (
                      genres.map((genre) => (
                        <button
                          key={genre.id}
                          onClick={() => setSelectedGenre(genre.id)}
                          className={`p-4 rounded-lg transition-all border-2 ${
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
                      ['Action', 'Adventure', 'RPG', 'Strategy', 'Simulation', 'Sports', 'Puzzle', 'Indie', 'Shooter'].map((genre) => (
                        <button
                          key={genre}
                          onClick={() => setSelectedGenre(genre)}
                          className={`p-4 rounded-lg transition-all border-2 ${
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
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Your Game Recommendations</h2>
                <button
                  onClick={handleReset}
                  className="text-primary hover:text-primary-dark transition-colors"
                >
                  Start Over
                </button>
              </div>
              
              {results.length > 0 ? (
                <GameResults results={results} isLoading={isLoading} onBack={handleReset} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">
                    No games found matching your criteria. Try adjusting your preferences.
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
} 