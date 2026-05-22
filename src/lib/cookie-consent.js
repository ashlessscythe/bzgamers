export const CONSENT_STORAGE_KEY = 'bzgamers-cookie-consent'

/** @typedef {'necessary' | 'all'} CookieConsentLevel */

/** @returns {CookieConsentLevel | null} */
export function readStoredConsent() {
  if (typeof window === 'undefined') return null
  const value = localStorage.getItem(CONSENT_STORAGE_KEY)
  if (value === 'necessary' || value === 'all') return value
  return null
}

/** @param {CookieConsentLevel} level */
export function writeStoredConsent(level) {
  localStorage.setItem(CONSENT_STORAGE_KEY, level)
}

/** Remove optional preference storage when user declines non-essential cookies. */
export function clearOptionalStorage() {
  localStorage.removeItem('theme')
  localStorage.removeItem('bzgamers-search-state')
}

/** @param {CookieConsentLevel | null} consent */
export function allowsPreferenceStorage(consent) {
  return consent === 'all'
}
