"use client"

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { loadTurnstile, isTurnstileLoaded } from '../lib/turnstile-loader'

export default function FeedbackModal({ isOpen, onClose }) {
  const { data: session } = useSession()
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const turnstileWidgetId = useRef(null)
  const turnstileScriptLoaded = useRef(false)
  const turnstileInitTimeout = useRef(null)
  
  // Pre-fill email and name if user is logged in
  useEffect(() => {
    if (session?.user) {
      setEmail(session.user.email || '')
      setName(session.user.name || '')
    } else {
      setEmail('')
      setName('')
    }
  }, [session])
  
  // Load Turnstile script once on mount
  useEffect(() => {
    if (isTurnstileLoaded()) {
      turnstileScriptLoaded.current = true
    } else {
      loadTurnstile()
        .then(() => {
          turnstileScriptLoaded.current = true
        })
        .catch((error) => {
          console.error('Failed to load Turnstile:', error)
        })
    }
  }, [])

  // Initialize/reset Turnstile widget when modal opens
  useEffect(() => {
    // Clear any pending timeout
    if (turnstileInitTimeout.current) {
      clearTimeout(turnstileInitTimeout.current)
      turnstileInitTimeout.current = null
    }

    // Cleanup function
    const cleanup = () => {
      if (turnstileWidgetId.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(turnstileWidgetId.current)
        } catch (e) {
          // Ignore errors during cleanup
        }
        turnstileWidgetId.current = null
      }
      setTurnstileToken('')
    }

    // If modal closed, cleanup
    if (!isOpen) {
      cleanup()
      return cleanup
    }

    // Wait for script to load and DOM to be ready
    const initWidget = () => {
      const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
      const widgetContainer = document.getElementById('turnstile-widget-feedback')
      
      if (!siteKey) {
        console.error('NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set')
        setError('Captcha configuration error. Please contact support.')
        return false
      }
      
      if (!widgetContainer) {
        console.warn('Turnstile widget container not found')
        return false
      }
      
      if (!window.turnstile) {
        console.warn('Turnstile API not available yet')
        return false
      }

      // Don't re-render if widget already exists
      if (turnstileWidgetId.current !== null) {
        return true
      }
      
      try {
        turnstileWidgetId.current = window.turnstile.render('#turnstile-widget-feedback', {
          sitekey: siteKey,
          callback: (token) => {
            setTurnstileToken(token)
          },
          'error-callback': () => {
            setTurnstileToken('')
          },
          'expired-callback': () => {
            setTurnstileToken('')
          },
        })
        return true
      } catch (error) {
        console.error('Error rendering Turnstile widget:', error)
        return false
      }
    }

    // Try to initialize with retries
    const tryInit = () => {
      if (!isOpen) return
      
      if (turnstileScriptLoaded.current && initWidget()) {
        // Success
        return
      }
      
      // Retry after a short delay
      turnstileInitTimeout.current = setTimeout(() => {
        if (isOpen) {
          tryInit()
        }
      }, 200)
    }

    // Start initialization after a small delay to ensure DOM is ready
    turnstileInitTimeout.current = setTimeout(tryInit, 100)

    return cleanup
  }, [isOpen])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setError('')
      setSuccess(false)
      setFeedback('')
      if (!session?.user) {
        setName('')
        setEmail('')
      }
    }
  }, [isOpen, session])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Validation
    if (!name || name.trim().length === 0) {
      setError('Please enter your name')
      return
    }

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    if (!feedback || feedback.trim().length === 0) {
      setError('Please enter your feedback')
      return
    }

    if (!turnstileToken) {
      setError('Please complete the captcha verification')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          message: feedback.trim(),
          turnstileToken,
        }),
      })

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('Non-JSON response:', text)
        setError('Server returned an invalid response. Please try again.')
        setIsLoading(false)
        // Reset Turnstile on error
        if (turnstileWidgetId.current !== null && window.turnstile) {
          window.turnstile.reset(turnstileWidgetId.current)
          setTurnstileToken('')
        }
        return
      }

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to submit feedback. Please try again.')
        setIsLoading(false)
        // Reset Turnstile on error
        if (turnstileWidgetId.current !== null && window.turnstile) {
          window.turnstile.reset(turnstileWidgetId.current)
          setTurnstileToken('')
        }
      } else {
        setSuccess(true)
        setFeedback('')
        setIsLoading(false)
        // Reset Turnstile on success
        if (turnstileWidgetId.current !== null && window.turnstile) {
          window.turnstile.remove(turnstileWidgetId.current)
          turnstileWidgetId.current = null
          setTurnstileToken('')
        }
        // Close modal after 2 seconds
        setTimeout(() => {
          onClose()
        }, 2000)
      }
    } catch (err) {
      console.error('Error submitting feedback:', err)
      setError('An error occurred. Please try again.')
      setIsLoading(false)
      // Reset Turnstile on error
      if (turnstileWidgetId.current !== null && window.turnstile) {
        window.turnstile.reset(turnstileWidgetId.current)
        setTurnstileToken('')
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Tell the devs what you think!!!!
                  </h2>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    aria-label="Close"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {success ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
                  >
                    <p className="text-green-800 dark:text-green-200 text-center">
                      Thanks for your feedback! We really appreciate it! 🎉
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
                      >
                        <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                      </motion.div>
                    )}

                    <div>
                      <label htmlFor="feedback-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Name
                      </label>
                      <input
                        id="feedback-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={isLoading || !!session?.user}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Your name"
                      />
                    </div>

                    <div>
                      <label htmlFor="feedback-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        id="feedback-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading || !!session?.user}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="feedback-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Feedback
                      </label>
                      <textarea
                        id="feedback-message"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        required
                        disabled={isLoading}
                        rows={5}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                        placeholder="Share your thoughts, suggestions, or anything else you'd like us to know!"
                      />
                    </div>

                    <div className="min-h-[65px] flex items-center justify-center">
                      <div id="turnstile-widget-feedback" className="flex justify-center w-full"></div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !turnstileToken}
                      className="w-full btn-primary py-3 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </span>
                      ) : (
                        'Submit Feedback'
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
