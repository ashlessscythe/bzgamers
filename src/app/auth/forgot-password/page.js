"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const turnstileWidgetId = useRef(null)

  // Load Turnstile script and initialize widget
  useEffect(() => {
    if (typeof window === 'undefined') return

    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    if (!siteKey) return

    // Prevent double initialization
    if (turnstileWidgetId.current !== null) return

    let isMounted = true

    const initTurnstile = () => {
      // Double check after timeout
      if (!isMounted || turnstileWidgetId.current !== null) return

      const widgetElement = document.getElementById('turnstile-widget-forgot')
      if (!widgetElement) return

      if (window.turnstile) {
        // Turnstile is already loaded, render immediately
        if (turnstileWidgetId.current === null && isMounted) {
          try {
            turnstileWidgetId.current = window.turnstile.render('#turnstile-widget-forgot', {
              sitekey: siteKey,
              callback: (token) => {
                if (isMounted) {
                  setTurnstileToken(token)
                }
              },
              'error-callback': () => {
                if (isMounted) {
                  setTurnstileToken('')
                }
              },
              'expired-callback': () => {
                if (isMounted) {
                  setTurnstileToken('')
                }
              },
            })
          } catch (error) {
            console.error('Error rendering Turnstile widget:', error)
          }
        }
      } else {
        // Check if script is already being loaded
        const existingScript = document.querySelector('script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]')
        if (existingScript) {
          // Script is loading, wait for it
          existingScript.addEventListener('load', () => {
            setTimeout(() => {
              if (isMounted && turnstileWidgetId.current === null && window.turnstile) {
                const widgetElement = document.getElementById('turnstile-widget-forgot')
                if (widgetElement) {
                  try {
                    turnstileWidgetId.current = window.turnstile.render('#turnstile-widget-forgot', {
                      sitekey: siteKey,
                      callback: (token) => {
                        if (isMounted) {
                          setTurnstileToken(token)
                        }
                      },
                      'error-callback': () => {
                        if (isMounted) {
                          setTurnstileToken('')
                        }
                      },
                      'expired-callback': () => {
                        if (isMounted) {
                          setTurnstileToken('')
                        }
                      },
                    })
                  } catch (error) {
                    console.error('Error rendering Turnstile widget:', error)
                  }
                }
              }
            }, 100)
          })
        } else {
          // Load Turnstile script first
          const script = document.createElement('script')
          script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
          script.async = true
          script.defer = true
          
          script.onload = () => {
            // Wait a bit for Turnstile to be fully ready
            setTimeout(() => {
              if (isMounted && turnstileWidgetId.current === null && window.turnstile) {
                const widgetElement = document.getElementById('turnstile-widget-forgot')
                if (widgetElement) {
                  try {
                    turnstileWidgetId.current = window.turnstile.render('#turnstile-widget-forgot', {
                      sitekey: siteKey,
                      callback: (token) => {
                        if (isMounted) {
                          setTurnstileToken(token)
                        }
                      },
                      'error-callback': () => {
                        if (isMounted) {
                          setTurnstileToken('')
                        }
                      },
                      'expired-callback': () => {
                        if (isMounted) {
                          setTurnstileToken('')
                        }
                      },
                    })
                  } catch (error) {
                    console.error('Error rendering Turnstile widget:', error)
                  }
                }
              }
            }, 100)
          }
          
          document.body.appendChild(script)
        }
      }
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initTurnstile, 100)

    return () => {
      isMounted = false
      clearTimeout(timer)
      if (turnstileWidgetId.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(turnstileWidgetId.current)
        } catch (error) {
          console.error('Error removing Turnstile widget:', error)
        }
        turnstileWidgetId.current = null
      }
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    if (!turnstileToken) {
      setError('Please complete the captcha verification')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          turnstileToken,
        }),
      })

      // Check if response is JSON before parsing
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
        setError(data.error || 'Failed to send reset email. Please try again.')
        setIsLoading(false)
        // Reset Turnstile on error
        if (turnstileWidgetId.current !== null && window.turnstile) {
          window.turnstile.reset(turnstileWidgetId.current)
          setTurnstileToken('')
        }
      } else {
        setSuccess(true)
        setEmail('')
        setIsLoading(false)
        // Reset Turnstile on success
        if (turnstileWidgetId.current !== null && window.turnstile) {
          window.turnstile.remove(turnstileWidgetId.current)
          turnstileWidgetId.current = null
          setTurnstileToken('')
        }
      }
    } catch (err) {
      console.error('Error requesting password reset:', err)
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
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2 text-center">Reset Password</h1>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4"
            >
              <p className="text-green-800 dark:text-green-200 text-sm">
                If an account with that email exists, a password reset link has been sent. Please check your email.
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
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="your@email.com"
                  disabled={isLoading}
                />
              </div>

              <div>
                <div id="turnstile-widget-forgot" className="flex justify-center"></div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !turnstileToken}
                className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center space-y-2">
            <Link href="/auth/signin" className="text-primary hover:underline text-sm">
              ← Back to Sign In
            </Link>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link href="/" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

