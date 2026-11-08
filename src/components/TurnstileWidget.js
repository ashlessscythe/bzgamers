'use client'

import { useEffect, useRef } from 'react'
import { loadTurnstile } from '../lib/turnstile-loader'

/**
 * Cloudflare Turnstile widget.
 * - onToken(token) is called with the token when solved, and with '' when it
 *   errors, expires or times out.
 * - Change `resetKey` to force a fresh challenge (e.g. after a failed submit).
 */
export default function TurnstileWidget({ onToken, resetKey = 0, className = '' }) {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)
  const onTokenRef = useRef(onToken)

  useEffect(() => {
    onTokenRef.current = onToken
  }, [onToken])

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    if (!siteKey) {
      console.error('NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set')
      return undefined
    }

    let cancelled = false
    loadTurnstile()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: 'auto',
          callback: (token) => onTokenRef.current?.(token || ''),
          'error-callback': () => onTokenRef.current?.(''),
          'expired-callback': () => onTokenRef.current?.(''),
          'timeout-callback': () => onTokenRef.current?.(''),
        })
      })
      .catch((error) => console.error('Failed to load Turnstile:', error))

    return () => {
      cancelled = true
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {
          // widget already gone
        }
      }
      widgetIdRef.current = null
    }
  }, [])

  useEffect(() => {
    if (resetKey > 0 && widgetIdRef.current !== null && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current)
      } catch {
        // ignore
      }
      onTokenRef.current?.('')
    }
  }, [resetKey])

  return <div ref={containerRef} className={className} />
}
