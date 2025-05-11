import Head from 'next/head'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Games() {
  // Animation variants
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
          <h2 className="text-2xl font-bold mb-6">How are you feeling today?</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {['Energetic', 'Relaxed', 'Focused', 'Creative', 'Social', 'Competitive', 'Adventurous', 'Nostalgic'].map((mood) => (
              <motion.button
                key={mood}
                className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition-colors"
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                {mood}
              </motion.button>
            ))}
          </div>
          
          <h2 className="text-2xl font-bold mb-6">How much time do you have?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {['< 30 min', '30-60 min', '1-2 hours', '2+ hours'].map((time) => (
              <motion.button
                key={time}
                className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition-colors"
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                {time}
              </motion.button>
            ))}
          </div>
          
          <h2 className="text-2xl font-bold mb-6">What genres do you enjoy?</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {['Action', 'Adventure', 'RPG', 'Strategy', 'Simulation', 'Sports', 'Puzzle', 'Indie', 'Shooter'].map((genre) => (
              <motion.button
                key={genre}
                className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition-colors"
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                {genre}
              </motion.button>
            ))}
          </div>
          
          <div className="flex justify-center mt-8">
            <motion.button
              className="btn-primary text-lg py-3 px-8"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Find Games
            </motion.button>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This feature will be fully implemented in Milestone 3.
          </p>
          <Link href="/" className="text-primary hover:text-primary-dark transition-colors">
            &larr; Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
