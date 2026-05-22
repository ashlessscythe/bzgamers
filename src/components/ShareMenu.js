"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getGameShareUrl } from '@/lib/site-url'

const MENU_WIDTH = 288
const MENU_ESTIMATED_HEIGHT = 280

const SHARE_NETWORKS = [
  {
    id: 'twitter',
    label: 'X',
    color: 'hover:bg-gray-900 hover:text-white dark:hover:bg-gray-100 dark:hover:text-gray-900',
    getUrl: (url, text) =>
      `https://twitter.com/intent/tweet?${new URLSearchParams({ url, text }).toString()}`,
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    id: 'facebook',
    label: 'Facebook',
    color: 'hover:bg-[#1877F2] hover:text-white',
    getUrl: (url) =>
      `https://www.facebook.com/sharer/sharer.php?${new URLSearchParams({ u: url }).toString()}`,
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    id: 'reddit',
    label: 'Reddit',
    color: 'hover:bg-[#FF4500] hover:text-white',
    getUrl: (url, text) =>
      `https://www.reddit.com/submit?${new URLSearchParams({ url, title: text }).toString()}`,
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
      </svg>
    ),
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    color: 'hover:bg-[#25D366] hover:text-white',
    getUrl: (url, text) =>
      `https://wa.me/?${new URLSearchParams({ text: `${text} ${url}` }).toString()}`,
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    id: 'email',
    label: 'Email',
    color: 'hover:bg-gray-600 hover:text-white',
    getUrl: (url, text) =>
      `mailto:?${new URLSearchParams({ subject: text, body: `${text}\n\n${url}` }).toString()}`,
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
]

function getShareText(gameName) {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'BZGamers'
  return `Check out ${gameName} on ${siteName}`
}

function computeMenuPosition(anchorEl) {
  const rect = anchorEl.getBoundingClientRect()
  const gap = 8
  const padding = 8

  let left = rect.left
  let top = rect.bottom + gap

  if (left + MENU_WIDTH > window.innerWidth - padding) {
    left = Math.max(padding, window.innerWidth - MENU_WIDTH - padding)
  }

  if (top + MENU_ESTIMATED_HEIGHT > window.innerHeight - padding) {
    top = Math.max(padding, rect.top - MENU_ESTIMATED_HEIGHT - gap)
  }

  return { top, left }
}

/**
 * Share popover portaled to document.body so it is not clipped by card overflow.
 */
export default function ShareMenu({ gameId, gameName, isOpen, onClose, anchorRef }) {
  const menuRef = useRef(null)
  const [copied, setCopied] = useState(false)
  const [canNativeShare, setCanNativeShare] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [mounted, setMounted] = useState(false)

  const shareUrl = gameId ? getGameShareUrl(gameId) : ''
  const shareText = getShareText(gameName || 'this game')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && !!navigator.share)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      setCopied(false)
      return
    }

    const updatePosition = () => {
      if (anchorRef?.current) {
        setPosition(computeMenuPosition(anchorRef.current))
      }
    }

    updatePosition()

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    const handlePointerDown = (e) => {
      const target = e.target
      if (
        menuRef.current?.contains(target) ||
        anchorRef?.current?.contains(target)
      ) {
        return
      }
      onClose()
    }

    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handlePointerDown)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [isOpen, onClose, anchorRef])

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const input = document.createElement('input')
      input.value = shareUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [shareUrl])

  const openShareWindow = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500')
    onClose()
  }

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title: gameName, text: shareText, url: shareUrl })
      onClose()
    } catch (err) {
      if (err?.name !== 'AbortError') console.error('Native share failed:', err)
    }
  }

  if (!mounted) return null

  const menu = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="share-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-black/10"
            aria-hidden
            onClick={onClose}
          />
          <motion.div
            key="share-menu"
            ref={menuRef}
            role="dialog"
            aria-label="Share game"
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            style={{ top: position.top, left: position.left }}
            className="fixed z-[9999] w-72 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-2xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Share</h4>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-md text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                aria-label="Close share menu"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 text-xs px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 truncate"
                aria-label="Share link"
              />
              <button
                type="button"
                onClick={copyLink}
                className="shrink-0 text-xs font-medium px-3 py-2 rounded-lg bg-primary text-white hover:opacity-90"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {canNativeShare && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[3.5rem]"
                  title="Share"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span className="text-[10px]">More</span>
                </button>
              )}
              {SHARE_NETWORKS.map((network) => (
                <button
                  key={network.id}
                  type="button"
                  onClick={() =>
                    openShareWindow(network.getUrl(shareUrl, shareText))
                  }
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg text-gray-600 dark:text-gray-300 transition-colors min-w-[3.5rem] ${network.color}`}
                  title={`Share on ${network.label}`}
                >
                  {network.icon}
                  <span className="text-[10px]">{network.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return createPortal(menu, document.body)
}
