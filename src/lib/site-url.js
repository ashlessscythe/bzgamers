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
