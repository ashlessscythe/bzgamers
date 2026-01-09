"use client"

import { useState, useEffect, useRef } from 'react'
import { signIn } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Script from 'next/script'

export default function AuthModal({ isOpen, onClose, initialMode = 'signin' }) {
  const [mode, setMode] = useState(initialMode) // 'signin' or 'signup'
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const turnstileWidgetId = useRef(null)
  const turnstileScriptLoaded = useRef(false)
  const turnstileInitTimeout = useRef(null)
  const turnstileInitAttempts = useRef(0)
  
  // Track when Turnstile script is loaded
  const handleTurnstileLoad = () => {
    turnstileScriptLoaded.current = true
  }

  // Initialize/reset Turnstile widget when modal opens or mode changes
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

    // If not signup mode or modal closed, cleanup
    if (!isOpen || mode !== 'signup') {
      cleanup()
      turnstileInitAttempts.current = 0
      return cleanup
    }

    // Wait for script to load and DOM to be ready
    const initWidget = () => {
      const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
      const widgetContainer = document.getElementById('turnstile-widget')
      
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
      
      // Check if container is in the DOM and potentially visible
      // Note: We don't check dimensions here as the widget will size itself
      // The container just needs to exist in the DOM
      const rect = widgetContainer.getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) {
        // Container might be hidden by animation, wait a bit
        console.warn('Turnstile widget container appears hidden, will retry')
        return false
      }

      try {
        turnstileWidgetId.current = window.turnstile.render('#turnstile-widget', {
          sitekey: siteKey,
          theme: 'auto', // Automatically match light/dark theme
          size: 'normal',
          callback: (token) => {
            console.log('Turnstile callback received, token length:', token?.length)
            if (token) {
              setTurnstileToken(token)
              setError('') // Clear any previous errors
            }
          },
          'error-callback': (error) => {
            console.error('Turnstile error callback:', error)
            setTurnstileToken('')
            // Don't set error here - let user try again
            // The widget will show its own error state
          },
          'expired-callback': () => {
            console.warn('Turnstile token expired')
            setTurnstileToken('')
          },
          'timeout-callback': () => {
            console.warn('Turnstile verification timed out')
            setTurnstileToken('')
            setError('Captcha verification timed out. Please try again.')
          },
        })
        console.log('Turnstile widget rendered successfully with site key:', siteKey ? `${siteKey.substring(0, 8)}...` : 'missing')
        return true
      } catch (e) {
        console.error('Turnstile render error:', e)
        setError('Failed to load captcha. Please refresh the page.')
        return false
      }
    }

    // Try to initialize with retry logic
    const tryInit = () => {
      // Reset attempts if widget successfully initialized
      if (initWidget()) {
        turnstileInitAttempts.current = 0
        return
      }
      
      // Limit retry attempts to prevent infinite loops
      if (turnstileInitAttempts.current >= 10) {
        console.warn('Turnstile widget initialization failed after multiple attempts')
        turnstileInitAttempts.current = 0
        return
      }
      
      turnstileInitAttempts.current++
      
      // Retry if script not loaded or container not ready
      if (window.turnstile && turnstileScriptLoaded.current) {
        turnstileInitTimeout.current = setTimeout(() => {
          tryInit()
        }, 500) // Increased delay to avoid rapid retries
      } else {
        // Wait for script to load
        let checkCount = 0
        const maxChecks = 50 // 5 seconds max (50 * 100ms)
        const checkScript = setInterval(() => {
          checkCount++
          if ((window.turnstile && turnstileScriptLoaded.current) || checkCount >= maxChecks) {
            clearInterval(checkScript)
            if (checkCount < maxChecks) {
              tryInit()
            } else {
              console.error('Turnstile script failed to load after timeout')
            }
          }
        }, 100)
      }
    }

    // Small delay to ensure DOM is ready and modal animation completes
    turnstileInitAttempts.current = 0
    turnstileInitTimeout.current = setTimeout(() => {
      tryInit()
    }, 300) // Increased delay to allow modal animation to complete

    return cleanup
  }, [isOpen, mode])

  // Update mode when initialMode changes (e.g., when switching between signin/signup buttons)
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
      // Reset form when mode changes
      setEmail('')
      setPassword('')
      setName('')
      setError('')
      setSuccess(false)
      setTurnstileToken('')
    }
  }, [initialMode, isOpen])

  const handleSignIn = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
        setIsLoading(false)
      } else {
        setSuccess(true)
        setTimeout(() => {
          onClose()
          window.location.reload()
        }, 500)
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (!turnstileToken) {
      setError('Please complete the captcha verification')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: name || null, turnstileToken })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        // Auto sign in after signup
        setTimeout(async () => {
          const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
          })
          if (!result?.error) {
            onClose()
            window.location.reload()
          }
        }, 1000)
      } else {
        setError(data.error || 'Failed to create account')
        setIsLoading(false)
        // Reset Turnstile on error
        if (turnstileWidgetId.current !== null && window.turnstile) {
          window.turnstile.reset(turnstileWidgetId.current)
          setTurnstileToken('')
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      setIsLoading(false)
      // Reset Turnstile on error
      if (turnstileWidgetId.current !== null && window.turnstile) {
        window.turnstile.reset(turnstileWidgetId.current)
        setTurnstileToken('')
      }
    }
  }

  const handleClose = () => {
    setEmail('')
    setPassword('')
    setName('')
    setError('')
    setSuccess(false)
    setTurnstileToken('')
    setMode('signin')
    // Clear timeout
    if (turnstileInitTimeout.current) {
      clearTimeout(turnstileInitTimeout.current)
      turnstileInitTimeout.current = null
    }
    // Remove Turnstile widget
    if (turnstileWidgetId.current !== null && window.turnstile) {
      try {
        window.turnstile.remove(turnstileWidgetId.current)
      } catch (e) {
        // Ignore errors during cleanup
      }
      turnstileWidgetId.current = null
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="lazyOnload"
        onLoad={handleTurnstileLoad}
      />
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 z-10"
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 className="text-3xl font-bold mb-2 text-center text-gray-900 dark:text-gray-100">
            {mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            {mode === 'signin' 
              ? 'Sign in to access your account' 
              : 'Create an account to get started'}
          </p>

          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-600 dark:text-green-400 font-medium">
                {mode === 'signup' ? 'Account created successfully!' : 'Signed in successfully!'}
              </p>
            </div>
          ) : (
            <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label htmlFor="auth-modal-name" className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                    Name (optional)
                  </label>
                  <input
                    id="auth-modal-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>
              )}

              <div>
                <label htmlFor="auth-modal-email" className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                  Email
                </label>
                <input
                  id="auth-modal-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="auth-modal-password" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                    Password
                  </label>
                  {mode === 'signin' && (
                    <Link 
                      href="/auth/forgot-password"
                      onClick={handleClose}
                      className="text-sm text-primary dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  )}
                </div>
                <input
                  id="auth-modal-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="••••••••"
                  minLength={mode === 'signup' ? 6 : undefined}
                />
                {mode === 'signup' && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Must be at least 6 characters
                  </p>
                )}
              </div>

              {mode === 'signup' && (
                <div className="min-h-[65px] flex items-center justify-center">
                  <div id="turnstile-widget" className="flex justify-center w-full"></div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading 
                  ? (mode === 'signin' ? 'Signing in...' : 'Creating account...')
                  : (mode === 'signin' ? 'Sign In' : 'Sign Up')
                }
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin')
                setError('')
                setPassword('')
                setTurnstileToken('')
              }}
              className="text-sm text-primary dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
            >
              {mode === 'signin' 
                ? "Don't have an account? Sign up" 
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
    </>
  )
}

