import Head from 'next/head'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { findGamesByMood, fetchGenres } from '../lib/api'
import MoodSelector from '../components/MoodSelector'
import GameResults from '../components/GameResults'
import { getUserFriendlyMessage } from '../lib/error-handler'

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
        const genreData = await fetchGenres()
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
      
      const gameResults = await findGamesByMood(params)
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
      <Head>
        <title>Find Games - BZGamers</title>
        <meta name="description" content="Find games that match your mood and preferences" />
      </Head>

      <motion.div
        className="max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Find Your Perfect Game</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Tell us how you're feeling, how much time you have, and what you're in the mood for.
            We'll recommend games that match your current state of mind.
          </p>
        </motion.div>

        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8"
          variants={itemVariants}
        >
          {!showResults ? (
            <>
              {searchStep === 1 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">How are you feeling today?</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {MOOD_OPTIONS.map((mood) => (
                      <motion.button
                        key={mood}
                        className={`p-4 rounded-lg border-2 ${
                          selectedMood === mood 
                            ? 'border-primary dark:border-primary bg-primary/10 dark:bg-primary/20' 
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary'
                        } transition-colors`}
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleMoodSelect(mood)}
                      >
                        {mood}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
              
              {searchStep === 2 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">How much time do you have?</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {TIME_OPTIONS.map((time) => (
                      <motion.button
                        key={time}
                        className={`p-4 rounded-lg border-2 ${
                          selectedTime === time 
                            ? 'border-primary dark:border-primary bg-primary/10 dark:bg-primary/20' 
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary'
                        } transition-colors`}
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleTimeSelect(time)}
                      >
                        {time}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
              
              {searchStep === 3 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">What genres do you enjoy?</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    {genres.length > 0 ? (
                      genres.slice(0, 9).map((genre) => (
                        <motion.button
                          key={genre.id}
                          className={`p-4 rounded-lg border-2 ${
                            selectedGenre === genre.id 
                              ? 'border-primary dark:border-primary bg-primary/10 dark:bg-primary/20' 
                              : 'border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary'
                          } transition-colors`}
                          whileHover={{ y: -5 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedGenre(genre.id)}
                        >
                          {genre.name}
                        </motion.button>
                      ))
                    ) : (
                      ['Action', 'Adventure', 'RPG', 'Strategy', 'Simulation', 'Sports', 'Puzzle', 'Indie', 'Shooter'].map((genre) => (
                        <motion.button
                          key={genre}
                          className={`p-4 rounded-lg border-2 ${
                            selectedGenre === genre
                              ? 'border-primary dark:border-primary bg-primary/10 dark:bg-primary/20' 
                              : 'border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary'
                          } transition-colors`}
                          whileHover={{ y: -5 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedGenre(genre)}
                        >
                          {genre}
                        </motion.button>
                      ))
                    )}
                  </div>
                  
                  {error && (
                    <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
                      {error}
                    </div>
                  )}
                  
                  <div className="flex justify-center gap-4 mt-8">
                    <motion.button
                      className="btn-primary text-lg py-3 px-8"
                      whileHover={{ y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSearch}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Searching...' : 'Find Games'}
                    </motion.button>
                    
                    <motion.button
                      className="btn-secondary text-lg py-3 px-8"
                      whileHover={{ y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleReset}
                    >
                      Reset
                    </motion.button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <GameResults 
              results={results} 
              isLoading={isLoading} 
              onBack={() => setShowResults(false)} 
            />
          )}
        </motion.div>
        
        {!showResults && (
          <motion.div variants={itemVariants} className="text-center mt-8">
            <Link href="/" className="text-primary hover:text-primary-dark transition-colors">
              &larr; Back to Home
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
