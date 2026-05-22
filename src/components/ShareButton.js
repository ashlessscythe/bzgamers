"use client"

import { useState, useRef } from 'react'
import ShareMenu from './ShareMenu'

/**
 * Share icon trigger with popover menu (used on game cards).
 */
export default function ShareButton({
  gameId,
  gameName,
  className = '',
  iconClassName = 'h-5 w-5',
  title = 'Share game',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef(null)

  if (!gameId) return null

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsOpen((open) => !open)
        }}
        className="p-2 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-all cursor-pointer"
        title={title}
        aria-label={title}
        aria-expanded={isOpen}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={iconClassName}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
      </button>
      <ShareMenu
        gameId={gameId}
        gameName={gameName}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        anchorRef={buttonRef}
      />
    </div>
  )
}
