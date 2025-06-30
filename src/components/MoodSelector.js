import { motion } from 'framer-motion'
import { useState } from 'react'

/**
 * MoodSelector component for selecting mood, time, and genre preferences
 */
export default function MoodSelector({
  moods,
  timeOptions,
  genres,
  selectedMood,
  selectedTime,
  selectedGenre,
  onMoodSelect,
  onTimeSelect,
  onGenreSelect,
  onSearch,
  onReset,
  isLoading,
  error
}) {
  // State for expanded options
  const [showAllMoods, setShowAllMoods] = useState(false)
  const [showAdvancedGenres, setShowAdvancedGenres] = useState(false)

  // Common moods (first 8)
  const commonMoods = moods.slice(0, 8)
  
  // Common genres (most popular/well-known) - only the most recognizable genres
  const commonGenres = [
    'Shooter', 'Role-playing (RPG)', 'Strategy', 'Adventure', 'Indie', 
    'Simulator', 'Sport', 'Puzzle', 'Racing', 'Fighting', 'Platform',
    'Arcade', 'Music'
  ]

  // Animation variants for buttons
  const buttonVariants = {
    hover: { y: -5 },
    tap: { scale: 0.95 }
  }

  return (
    <div className="mood-selector">
      <h2 className="text-2xl font-bold mb-6">How are you feeling today?</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {(showAllMoods ? moods : commonMoods).map((mood) => (
          <motion.button
            key={mood}
            className={`p-4 rounded-lg border-2 ${
              selectedMood === mood 
                ? 'border-primary dark:border-primary bg-primary/10 dark:bg-primary/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary'
            } transition-colors`}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => onMoodSelect(mood)}
          >
            {mood}
          </motion.button>
        ))}
      </div>
      
      {/* See All / Show Less button for moods */}
      {moods.length > 8 && (
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowAllMoods(!showAllMoods)}
            className="text-primary hover:text-primary-dark transition-colors text-sm font-medium"
          >
            {showAllMoods ? 'Show Less' : 'See All Moods'}
          </button>
        </div>
      )}
      
      <h2 className="text-2xl font-bold mb-6">How much time do you have?</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {timeOptions.map((time) => (
          <motion.button
            key={time}
            className={`p-4 rounded-lg border-2 ${
              selectedTime === time 
                ? 'border-primary dark:border-primary bg-primary/10 dark:bg-primary/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary'
            } transition-colors`}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => onTimeSelect(time)}
          >
            {time}
          </motion.button>
        ))}
      </div>
      
      <h2 className="text-2xl font-bold mb-6">What genres do you enjoy?</h2>
      
      {/* Common genres section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
          Popular Genres
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
            ({genres.length > 0 ? genres.filter(genre => commonGenres.includes(genre.name)).length : commonGenres.length})
          </span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-4">
          {genres.length > 0 ? (
            // Filter genres to show common ones first
            genres
              .filter(genre => commonGenres.includes(genre.name))
              .map((genre) => (
                <motion.button
                  key={genre.id}
                  className={`p-3 rounded-lg border-2 text-sm ${
                    selectedGenre === genre.id 
                      ? 'border-primary dark:border-primary bg-primary/10 dark:bg-primary/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary'
                  } transition-colors`}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => onGenreSelect(genre.id)}
                >
                  {genre.name}
                </motion.button>
              ))
          ) : (
            commonGenres.map((genre) => (
              <motion.button
                key={genre}
                className={`p-3 rounded-lg border-2 text-sm ${
                  selectedGenre === genre
                    ? 'border-primary dark:border-primary bg-primary/10 dark:bg-primary/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary'
                } transition-colors`}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => onGenreSelect(genre)}
              >
                {genre}
              </motion.button>
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
                ({genres.filter(genre => !commonGenres.includes(genre.name)).length})
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
                  .filter(genre => !commonGenres.includes(genre.name))
                  .map((genre) => (
                    <motion.button
                      key={genre.id}
                      className={`p-3 rounded-lg border-2 text-sm ${
                        selectedGenre === genre.id 
                          ? 'border-primary dark:border-primary bg-primary/10 dark:bg-primary/20' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary'
                      } transition-colors`}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      onClick={() => onGenreSelect(genre.id)}
                    >
                      {genre.name}
                    </motion.button>
                  ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="flex justify-center gap-4 mt-8">
        <motion.button
          className="btn-primary text-lg py-3 px-8"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={onSearch}
          disabled={isLoading}
        >
          {isLoading ? 'Searching...' : 'Find Games'}
        </motion.button>
        
        {(selectedMood || selectedTime || selectedGenre) && (
          <motion.button
            className="btn-secondary text-lg py-3 px-8"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={onReset}
          >
            Reset
          </motion.button>
        )}
      </div>
    </div>
  )
}
