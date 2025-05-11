import Head from 'next/head'
import { motion } from 'framer-motion'

export default function About() {
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
        <title>About - BZGamers</title>
        <meta name="description" content="Learn about BZGamers - where the bz go to chill and play" />
      </Head>

      <motion.div
        className="max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl md:text-4xl font-bold mb-6">About BZGamers</h1>
        </motion.div>

        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            BZGamers was created with a simple mission: to help gamers find the perfect game for their current mood and connect with like-minded players.
          </p>
          
          <h2 className="text-2xl font-bold mb-4">What We Do</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            We believe that gaming is more than just a hobby—it's a way to express yourself, connect with others, and experience new worlds. 
            Our mood-based game finder helps you discover games that match your current state of mind, available time, and preferences.
          </p>
          
          <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            We're building a community where gamers can find not only the perfect game to play but also the perfect people to play with. 
            Our upcoming features will include matchmaking based on mood, taste, and availability, making it easier than ever to connect with fellow gamers.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8"
          variants={itemVariants}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
            <div className="bg-primary/10 dark:bg-primary/20 p-4 rounded-full mx-auto w-16 h-16 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Mood-Based</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Find games that match exactly how you're feeling right now
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
            <div className="bg-primary/10 dark:bg-primary/20 p-4 rounded-full mx-auto w-16 h-16 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Time-Aware</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get recommendations based on how much time you have available
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
            <div className="bg-primary/10 dark:bg-primary/20 p-4 rounded-full mx-auto w-16 h-16 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Community</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Connect with gamers who share your interests and schedule
            </p>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-bold mb-4">Meet the Team</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            BZGamers is being developed by a small team of passionate gamers who understand the importance of finding the right game for the right moment.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold">JD</span>
              </div>
              <div>
                <h3 className="font-bold">Jane Doe</h3>
                <p className="text-gray-600 dark:text-gray-400">Founder & Lead Developer</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold">JS</span>
              </div>
              <div>
                <h3 className="font-bold">John Smith</h3>
                <p className="text-gray-600 dark:text-gray-400">UX Designer & Gamer Relations</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
