import { useState, useEffect } from 'react'

/**
 * Custom hook for managing theme (dark/light mode)
 * @returns {Object} Theme state and toggle function
 */
export default function useTheme() {
  // Check if we're in the browser environment
  const isBrowser = typeof window !== 'undefined'
  
  // Initialize theme state from localStorage or system preference
  const [theme, setTheme] = useState(() => {
    if (!isBrowser) return 'light' // Default for SSR
    
    // Check localStorage first
    const storedTheme = localStorage.getItem('theme')
    if (storedTheme) return storedTheme
    
    // Otherwise check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  
  // Effect to update document class when theme changes
  useEffect(() => {
    if (!isBrowser) return
    
    // Update localStorage
    localStorage.setItem('theme', theme)
    
    // Update document class for Tailwind
    const root = window.document.documentElement
    
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme, isBrowser])
  
  // Toggle theme function
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }
  
  return { theme, toggleTheme }
}
