import { describe, it, expect } from 'vitest'
import { sanitizePreferences, PREFERENCE_PLATFORMS, DEFAULT_PREFERENCES } from './preferences'

describe('sanitizePreferences', () => {
  it('returns defaults for junk input', () => {
    for (const bad of [null, undefined, 'x', 5, [], {}]) {
      expect(sanitizePreferences(bad)).toEqual(DEFAULT_PREFERENCES)
    }
  })

  it('accepts ids or objects and uses server-side names', () => {
    expect(sanitizePreferences({ platforms: [6, { id: 167, name: '<script>' }, '130'] })).toEqual({
      platforms: [
        { id: 6, name: 'PC (Windows)' },
        { id: 167, name: 'PlayStation 5' },
        { id: 130, name: 'Nintendo Switch' },
      ],
    })
  })

  it('drops unknown ids, duplicates and extra keys', () => {
    const out = sanitizePreferences({ platforms: [6, 6, 99999, 'abc', null], admin: true })
    expect(out).toEqual({ platforms: [{ id: 6, name: 'PC (Windows)' }] })
  })

  it('never returns more than the curated list', () => {
    const all = PREFERENCE_PLATFORMS.map((p) => p.id)
    expect(sanitizePreferences({ platforms: [...all, ...all] }).platforms).toHaveLength(all.length)
  })
})
