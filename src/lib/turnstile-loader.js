/**
 * Shared utility to load Cloudflare Turnstile script only once globally
 * Prevents multiple script loads across different components
 */

let turnstileLoadPromise = null
let turnstileLoaded = false

/**
 * Load Turnstile script if not already loaded
 * Returns a promise that resolves when Turnstile is ready
 */
export function loadTurnstile() {
  // If already loaded, return resolved promise
  if (typeof window !== 'undefined' && window.turnstile) {
    turnstileLoaded = true
    return Promise.resolve()
  }

  // If already loading, return existing promise
  if (turnstileLoadPromise) {
    return turnstileLoadPromise
  }

  // Check if script tag already exists
  if (typeof window !== 'undefined') {
    const existingScript = document.querySelector('script[src*="turnstile/v0/api.js"]')
    if (existingScript) {
      // Script exists, wait for it to load
      turnstileLoadPromise = new Promise((resolve) => {
        if (window.turnstile) {
          turnstileLoaded = true
          resolve()
        } else {
          existingScript.addEventListener('load', () => {
            turnstileLoaded = true
            resolve()
          })
        }
      })
      return turnstileLoadPromise
    }
  }

  // Create new script load promise
  turnstileLoadPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window is not available'))
      return
    }

    // Double check after async check
    if (window.turnstile) {
      turnstileLoaded = true
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    script.async = true
    script.defer = true
    script.id = 'turnstile-script'

    script.onload = () => {
      // Wait a bit for Turnstile to fully initialize
      setTimeout(() => {
        if (window.turnstile) {
          turnstileLoaded = true
          resolve()
        } else {
          reject(new Error('Turnstile failed to initialize'))
        }
      }, 100)
    }

    script.onerror = () => {
      turnstileLoadPromise = null
      reject(new Error('Failed to load Turnstile script'))
    }

    document.body.appendChild(script)
  })

  return turnstileLoadPromise
}

/**
 * Check if Turnstile is already loaded
 */
export function isTurnstileLoaded() {
  return turnstileLoaded && typeof window !== 'undefined' && window.turnstile !== undefined
}

