import { motion } from 'framer-motion'
import GameCard from './GameCard'

/**
 * GameResults component for displaying game search results
 */
export default function GameResults({ results, isLoading, onBack }) {
  console.log('GameResults component received:', { results, isLoading })
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

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">No Games Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We couldn't find any games matching your criteria. Try adjusting your preferences.
        </p>
        <motion.button
          className="btn-primary text-lg py-3 px-8"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
        >
          Go Back
        </motion.button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Games For You</h2>
        <motion.button
          className="text-primary hover:text-primary-dark transition-colors flex items-center"
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Search
        </motion.button>
      </div>
      
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
    </div>
  )
}
