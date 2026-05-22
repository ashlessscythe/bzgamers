import { useState, useEffect, useCallback } from 'react'
import { allowsPreferenceStorage, readStoredConsent } from '../lib/cookie-consent'

function getSystemTheme() {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getInitialTheme() {
  const consent = readStoredConsent()
  if (allowsPreferenceStorage(consent)) {
    const storedTheme = localStorage.getItem('theme')
    if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme
  }
  return getSystemTheme()
}

/**
 * Custom hook for managing theme (dark/light mode)
 * @returns {Object} Theme state and toggle function
 */
export default function useTheme() {
  const isBrowser = typeof window !== 'undefined'
  const [theme, setTheme] = useState(() => (isBrowser ? getInitialTheme() : 'light'))

  const applyThemeClass = useCallback((nextTheme) => {
    if (!isBrowser) return
    const root = window.document.documentElement
    if (nextTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [isBrowser])

  useEffect(() => {
    if (!isBrowser) return

    applyThemeClass(theme)

    if (allowsPreferenceStorage(readStoredConsent())) {
      localStorage.setItem('theme', theme)
    }
  }, [theme, isBrowser, applyThemeClass])

  useEffect(() => {
    if (!isBrowser) return

    const onConsentChange = () => {
      if (allowsPreferenceStorage(readStoredConsent())) {
        localStorage.setItem('theme', theme)
      } else {
        localStorage.removeItem('theme')
        setTheme(getSystemTheme())
      }
    }

    window.addEventListener('bzgamers-cookie-consent', onConsentChange)
    return () => window.removeEventListener('bzgamers-cookie-consent', onConsentChange)
  }, [theme, isBrowser])

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'))
  }

  return { theme, toggleTheme }
}
