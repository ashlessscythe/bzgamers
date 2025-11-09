"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

/**
 * Mobile menu component for navigation on smaller screens
 */
export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  
  // Close the menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])
  
  // Close menu when escape key is pressed
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) setIsOpen(false)
    }
    
    if (isOpen) {
      window.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])
  
  const isActive = (path) => pathname === path
  
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/games', label: 'Find Games' },
    { path: '/about', label: 'About' },
    // Add Admin link if user is admin
    ...(session?.user?.role === 'ADMIN' ? [{ path: '/admin', label: 'Admin' }] : [])
  ]

  return (
    <>
      {/* Hamburger Button */}
      <button 
        className="md:hidden flex items-center justify-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors relative z-[10001]" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
      
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998] md:hidden"
          style={{ top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Menu Panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[280px] bg-white dark:bg-gray-900 shadow-2xl z-[9999] md:hidden transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ 
          height: '100vh',
          height: '100dvh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary/5 to-transparent">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Menu</h2>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6" style={{ flex: 1 }}>
          <ul className="space-y-3">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link 
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block py-4 px-5 text-lg font-medium rounded-xl transition-all duration-200 ${
                    isActive(item.path) 
                      ? 'bg-primary text-white shadow-lg' 
                      : 'text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Footer */}
        <div className="px-6 py-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            BZGamers &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </>
  )
}
