"use client"

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
      <motion.div
        className="max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-3xl md:text-4xl font-bold">About BZGamers</h1>
            <a 
              href="https://buymeacoffee.com/tonyagua" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 mt-4 md:mt-0"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2a5 5 0 0 0 4 4.9V15a3 3 0 0 0 6 0v-2.1A5 5 0 0 0 18 8zm-2 0a3 3 0 0 1-6 0V6h6zm-3 11a1 1 0 0 1-1-1h2a1 1 0 0 1-1 1zm7-7a1 1 0 0 1 0 2h-1v2a7 7 0 0 1-14 0v-2H3a1 1 0 0 1 0-2h16z"/>
              </svg>
              Buy me a coffee
            </a>
          </div>
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
            We believe that gaming is more than just a hobby—it&apos;s a way to express yourself, connect with others, and experience new worlds. 
            Our mood-based game finder helps you discover games that match your current state of mind, available time, and preferences.
          </p>
          
          <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            We&apos;re building a community where gamers can find not only the perfect game to play but also the perfect people to play with. 
            Our upcoming features will include matchmaking based on mood, taste, and availability, making it easier than ever to connect with fellow gamers.
          </p>
          
          <h2 className="text-2xl font-bold mb-4">Mental Health Matters</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            At BZGamers, we believe that mental health is a priority. Gaming should be a source of joy, relaxation, and connection—not stress or pressure. 
            We&apos;re committed to creating a positive, supportive community where everyone can find games that genuinely help them unwind, recharge, and feel good.
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
              Find games that match exactly how you&apos;re feeling right now
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
                <span className="text-xl font-bold">TA</span>
              </div>
              <div>
                <h3 className="font-bold">Tony A</h3>
                <p className="text-gray-600 dark:text-gray-400">Lead Developer & Designer</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
} 