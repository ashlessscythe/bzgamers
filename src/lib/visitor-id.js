const STORAGE_KEY = 'bzgamers-visitor-id'

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 32)
  }
  return `v${Date.now().toString(36)}${Math.random().toString(36).slice(2, 14)}`
}

/**
 * Session-scoped anonymous visitor id (no cookie). Survives reloads in the same tab session.
 */
export function getVisitorId() {
  if (typeof window === 'undefined') return null
  try {
    let id = sessionStorage.getItem(STORAGE_KEY)
    if (!id || !/^[a-zA-Z0-9_-]{8,64}$/.test(id)) {
      id = createId()
      sessionStorage.setItem(STORAGE_KEY, id)
    }
    return id
  } catch {
    return null
  }
}

/** Headers to attach on search/API fetches for visitor correlation. */
export function visitorHeaders() {
  const id = getVisitorId()
  return id ? { 'x-visitor-id': id } : {}
}
