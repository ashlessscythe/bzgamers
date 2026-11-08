/**
 * Canonical site URL for share links and Open Graph metadata.
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://bzgamers.com).
 */
export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  if (configured) return configured
  if (typeof window !== 'undefined') return window.location.origin
  return 'http://localhost:3000'
}

export function getGameShareUrl(gameId) {
  return `${getSiteUrl()}/games/${gameId}`
}

/**
 * Base URL used for links in transactional email (e.g. password reset).
 * In production NEXTAUTH_URL must be set; we never guess from VERCEL_URL or
 * fall back to localhost there, since a wrong host would leak reset tokens.
 */
export function getAuthBaseUrl() {
  const configured = process.env.NEXTAUTH_URL?.replace(/\/$/, '')
  if (configured) return configured
  if (process.env.NODE_ENV === 'production') {
    throw new Error('NEXTAUTH_URL must be set in production')
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}
