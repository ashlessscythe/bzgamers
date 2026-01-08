"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import { SITE_NAME, GH_URL } from '../lib/config'

const MotionLink = motion(Link)

export default function Home() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null) // 'success' or 'error'
  const [errorMessage, setErrorMessage] = useState('')

  const handleWaitlistSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)
    setErrorMessage('')

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (data.success) {
        setSubmitStatus('success')
        setEmail('')
        setErrorMessage('')
        // Reset success message after 3 seconds
        setTimeout(() => setSubmitStatus(null), 3000)
      } else {
        setSubmitStatus('error')
        setErrorMessage(data.error || 'Something went wrong. Please try again.')
        setEmail('')
        setTimeout(() => {
          setSubmitStatus(null)
          setErrorMessage('')
        }, 5000)
      }
    } catch (err) {
      console.error('Error submitting waitlist:', err)
      setSubmitStatus('error')
      setErrorMessage('Something went wrong. Please try again.')
      setEmail('')
      setTimeout(() => {
        setSubmitStatus(null)
        setErrorMessage('')
      }, 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

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
              {SITE_NAME}
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
          <motion.p 
            className="text-base text-gray-500 dark:text-gray-500 max-w-2xl mx-auto mt-2 italic"
            variants={itemVariants}
          >
            Only have 20 minutes and want to relax? We&apos;ll recommend cozy puzzle games.
          </motion.p>
          <motion.p className="mt-4 text-sm text-gray-500 dark:text-gray-400" variants={itemVariants}>
            <a href={GH_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">GitHub</a>
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
            <MotionLink
              href="/games"
              className="btn-primary text-lg py-3 px-8 w-full"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Let&apos;s Match You a Game
            </MotionLink>
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
            <form onSubmit={handleWaitlistSubmit} className="w-full">
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                />
                <motion.button 
                  type="submit"
                  className="btn-secondary text-lg py-3 px-8 w-full"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Joining...' : submitStatus === 'success' ? '✓ Joined!' : 'Join Waitlist'}
                </motion.button>
                <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-1">
                  We promise not to spam you—we&apos;re gamers, not email ninjas. Your inbox is safe with us! 🛡️
                </p>
                {submitStatus === 'success' && (
                  <p className="text-sm text-green-600 dark:text-green-400 text-center">
                    Thanks! We&apos;ll notify you when this feature launches.
                  </p>
                )}
                {submitStatus === 'error' && errorMessage && (
                  <p className="text-sm text-red-600 dark:text-red-400 text-center">
                    {errorMessage}
                  </p>
                )}
              </div>
            </form>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="mt-16 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl w-full max-w-3xl"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center">
              <div className="bg-primary/10 dark:bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                <span className="font-bold text-primary">1</span>
              </div>
              <h3 className="font-medium mb-1">Select Your Mood</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">Tell us how you&apos;re feeling and what kind of experience you want</p>
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