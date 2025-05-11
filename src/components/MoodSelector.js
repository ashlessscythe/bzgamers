import { motion } from 'framer-motion'

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
  // Animation variants for buttons
  const buttonVariants = {
    hover: { y: -5 },
    tap: { scale: 0.95 }
  }

  return (
    <div className="mood-selector">
      <h2 className="text-2xl font-bold mb-6">How are you feeling today?</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {moods.map((mood) => (
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
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => onGenreSelect(genre.id)}
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
