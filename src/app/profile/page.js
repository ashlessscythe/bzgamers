"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import GameCard from '../../components/GameCard'
import AuthModal from '../../components/AuthModal'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [favorites, setFavorites] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      setAuthModalOpen(true)
    } else if (status === 'authenticated') {
      fetchFavorites()
    }
  }, [status])

  const fetchFavorites = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/favorites')
      const data = await response.json()
      if (data.success) {
        // Extract game data from favorites
        const games = data.favorites.map(fav => {
          if (fav.gameData) {
            return fav.gameData
          }
          // Fallback if gameData is not stored
          return {
            id: fav.gameId,
            name: fav.gameName || 'Unknown Game'
          }
        })
        setFavorites(games)
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFavoriteChange = (gameId, isFavorited) => {
    if (!isFavorited) {
      // Remove from local state
      setFavorites(prev => prev.filter(game => game.id !== gameId))
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg">Loading your favorites...</p>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <>
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">My Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please sign in to view your favorites and profile.
          </p>
        </div>
        <AuthModal 
          isOpen={authModalOpen} 
          onClose={() => {
            setAuthModalOpen(false)
            router.push('/')
          }}
          initialMode="signin"
        />
      </>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back, {session?.user?.name || session?.user?.email}!
        </p>
      </div>

      {/* Profile sections - extensible for future features */}
      <div className="space-y-8">
        {/* Favorites Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">My Favorites</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {favorites.length} {favorites.length === 1 ? 'game' : 'games'}
            </span>
          </div>

          {favorites.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <p className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                No favorites yet
              </p>
              <p className="text-gray-500 dark:text-gray-500 mb-4">
                Start exploring games and add them to your favorites!
              </p>
              <motion.a
                href="/games"
                className="btn-primary inline-block"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Find Games
              </motion.a>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              {favorites.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onFavoriteChange={handleFavoriteChange}
                />
              ))}
            </motion.div>
          )}
        </section>

        {/* Placeholder for future profile sections */}
        {/* 
        <section>
          <h2 className="text-2xl font-semibold mb-6">My Reviews</h2>
          <p className="text-gray-500">Coming soon...</p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-6">My Playlists</h2>
          <p className="text-gray-500">Coming soon...</p>
        </section>
        */}
      </div>
    </div>
  )
}

