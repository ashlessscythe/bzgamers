"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import ShareButton from './ShareButton'
import { getCoverImageUrl } from '@/lib/game-utils'

export default function GameDetailView({ game }) {
  const { status } = useSession()
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showAuthMessage, setShowAuthMessage] = useState(false)

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown Release Date'
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const coverUrl =
    getCoverImageUrl(game?.cover, 'big') ||
    'https://via.placeholder.com/264x374?text=No+Image'

  useEffect(() => {
    if (status === 'authenticated' && game?.id) {
      checkFavoriteStatus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- check when auth/game changes only
  }, [status, game?.id])

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch('/api/favorites/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameIds: [game.id] }),
      })
      const data = await response.json()
      if (data.success) {
        setIsFavorited(data.favoritedGameIds.includes(game.id))
      }
    } catch (error) {
      console.error('Error checking favorite status:', error)
    }
  }

  const handleFavoriteToggle = async () => {
    if (status !== 'authenticated') {
      setShowAuthMessage(true)
      setTimeout(() => setShowAuthMessage(false), 3000)
      return
    }
    if (!game?.id || isLoading) return

    setIsLoading(true)
    try {
      if (isFavorited) {
        const response = await fetch(`/api/favorites?gameId=${game.id}`, {
          method: 'DELETE',
        })
        const data = await response.json()
        if (data.success) setIsFavorited(false)
      } else {
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId: game.id,
            gameName: game.name,
            gameData: game,
          }),
        })
        const data = await response.json()
        if (data.success) setIsFavorited(true)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/games"
        className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Find more games
      </Link>

      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
      >
        <div className="md:flex">
          <div className="relative md:w-72 shrink-0 aspect-[3/4] bg-gray-200 dark:bg-gray-700">
            <img
              src={coverUrl}
              alt={game.name || 'Game cover'}
              className="w-full h-full object-cover"
            />
            {game.total_rating != null && (
              <div className="absolute top-3 right-3 bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center font-bold">
                {Math.round(game.total_rating)}
              </div>
            )}
          </div>

          <div className="p-6 flex-1 flex flex-col">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {game.name || 'Unknown Game'}
              </h1>
              <div className="flex items-center gap-2 shrink-0">
                <ShareButton
                  gameId={game.id}
                  gameName={game.name}
                  className=""
                  iconClassName="h-5 w-5"
                />
                <button
                  type="button"
                  onClick={handleFavoriteToggle}
                  disabled={isLoading}
                  className={`p-2 rounded-full transition-all ${
                    isFavorited
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={
                    status === 'authenticated'
                      ? isFavorited
                        ? 'Remove from favorites'
                        : 'Add to favorites'
                      : 'Sign in to add to favorites'
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={isFavorited ? 0 : 2}
                    fill={isFavorited ? 'currentColor' : 'none'}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {showAuthMessage && (
              <p className="text-xs text-primary mb-2">Sign in to add favorites</p>
            )}

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {formatDate(game.first_release_date)}
            </p>

            {game.platforms?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {game.platforms.map((platform) => (
                  <span
                    key={platform.id}
                    className="text-xs bg-blue-100 dark:bg-blue-700 px-2 py-1 rounded-full"
                  >
                    {platform.name}
                  </span>
                ))}
              </div>
            )}

            {game.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {game.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            <p className="text-gray-600 dark:text-gray-400 mb-6 flex-1">
              {game.summary || 'No description available.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
              <a
                href={game.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-sm py-2 px-6 inline-flex items-center justify-center"
              >
                Learn More on IGDB
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>

            <span className="text-xs text-gray-500 dark:text-gray-400 mt-4 block">
              Powered by IGDB
            </span>
          </div>
        </div>
      </motion.article>

      <section className="mt-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Discover more games
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Use this title as a starting point, or browse by how you feel right now.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/games?mode=similar&gameId=${game.id}`}
            className="btn-primary text-sm py-3 px-6 inline-flex items-center justify-center text-center"
          >
            Give me games like this
          </Link>
          <Link
            href="/games?mode=mood"
            className="btn-secondary text-sm py-3 px-6 inline-flex items-center justify-center text-center"
          >
            Find games by mood
          </Link>
        </div>
      </section>
    </div>
  )
}
