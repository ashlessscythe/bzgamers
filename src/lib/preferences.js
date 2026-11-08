/**
 * User preferences: the shape stored in UserPreference.data. Everything coming
 * from the client is rebuilt through sanitizePreferences, so only whitelisted
 * values are ever persisted.
 */

// Curated platform list (IGDB platform ids) offered in the preferences UI.
export const PREFERENCE_PLATFORMS = [
  { id: 6, name: 'PC (Windows)' },
  { id: 14, name: 'Mac' },
  { id: 3, name: 'Linux' },
  { id: 167, name: 'PlayStation 5' },
  { id: 48, name: 'PlayStation 4' },
  { id: 169, name: 'Xbox Series X|S' },
  { id: 49, name: 'Xbox One' },
  { id: 130, name: 'Nintendo Switch' },
  { id: 34, name: 'Android' },
  { id: 39, name: 'iOS' },
]

const PLATFORM_BY_ID = new Map(PREFERENCE_PLATFORMS.map((p) => [p.id, p]))

export const DEFAULT_PREFERENCES = Object.freeze({ platforms: [] })

/**
 * @param {unknown} input - untrusted preferences object
 * @returns {{ platforms: {id: number, name: string}[] }}
 */
export function sanitizePreferences(input) {
  const raw = input && typeof input === 'object' ? input : {}
  const platforms = []
  const rawPlatforms = Array.isArray(raw.platforms) ? raw.platforms : []
  for (const item of rawPlatforms) {
    const id = Number(typeof item === 'object' && item !== null ? item.id : item)
    const known = PLATFORM_BY_ID.get(id)
    if (known && !platforms.some((p) => p.id === id)) {
      platforms.push({ id: known.id, name: known.name })
    }
  }
  return { platforms }
}
