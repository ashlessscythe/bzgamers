import Head from 'next/head'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Home() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        delayChildren: 0.3
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

  const buttonVariants = {
    hover: { 
      scale: 1.05,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 10 
      }
    },
    tap: { scale: 0.95 }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center p-4">
      <Head>
        <title>BZGamers - Where the bz go to chill and play</title>
        <meta name="description" content="Find games that match your mood and connect with like-minded gamers" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <motion.main 
        className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <motion.div
            className="inline-block"
            animate={{ 
              rotate: [0, -2, 0, 2, 0],
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 5,
              ease: "easeInOut"
            }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              BZGamers
            </h1>
          </motion.div>
          
          <motion.p 
            className="text-xl md:text-2xl mb-2 text-gray-700 dark:text-gray-300"
            variants={itemVariants}
          >
            Where the bz go to chill and play
          </motion.p>
          
          <motion.p 
            className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Find the perfect game for your current mood, available time, and preferences. 
            Connect with like-minded gamers and discover new experiences.
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 w-full max-w-3xl"
          variants={itemVariants}
        >
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl transition-shadow"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="bg-primary/10 dark:bg-primary/20 p-4 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Find Your Perfect Game</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Discover games that match your current mood, available time, and preferences.</p>
            <Link href="/games" legacyBehavior>
              <motion.a 
                className="btn-primary text-lg py-3 px-8 w-full"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Find a Game
              </motion.a>
            </Link>
          </motion.div>
          
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl transition-shadow"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="bg-secondary/10 dark:bg-secondary/20 p-4 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Connect with Gamers</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Find and connect with like-minded gamers who share your interests and schedule.</p>
            <motion.button 
              className="btn-secondary text-lg py-3 px-8 w-full opacity-70 cursor-not-allowed"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              disabled
            >
              Coming Soon
            </motion.button>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="mt-16 p-6 bg-gray-100 dark:bg-gray-800/50 rounded-xl w-full max-w-3xl"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center">
              <div className="bg-primary/10 dark:bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                <span className="font-bold text-primary">1</span>
              </div>
              <h3 className="font-medium mb-1">Select Your Mood</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">Tell us how you're feeling and what kind of experience you want</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-primary/10 dark:bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                <span className="font-bold text-primary">2</span>
              </div>
              <h3 className="font-medium mb-1">Set Your Time</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">Let us know how much time you have available to play</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-primary/10 dark:bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                <span className="font-bold text-primary">3</span>
              </div>
              <h3 className="font-medium mb-1">Get Recommendations</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">Receive personalized game suggestions that match your criteria</p>
            </div>
          </div>
        </motion.div>
      </motion.main>
    </div>
  )
}
