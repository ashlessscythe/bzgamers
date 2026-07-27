// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import {
  CONSENT_STORAGE_KEY,
  readStoredConsent,
  writeStoredConsent,
  clearOptionalStorage,
  allowsPreferenceStorage,
} from './cookie-consent'

describe('cookie-consent', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns null when no consent is stored', () => {
    expect(readStoredConsent()).toBeNull()
  })

  it('reads and writes valid consent levels', () => {
    writeStoredConsent('necessary')
    expect(readStoredConsent()).toBe('necessary')
    writeStoredConsent('all')
    expect(readStoredConsent()).toBe('all')
    expect(localStorage.getItem(CONSENT_STORAGE_KEY)).toBe('all')
  })

  it('ignores invalid stored consent values', () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, 'maybe')
    expect(readStoredConsent()).toBeNull()
  })

  it('allows preference storage only for "all"', () => {
    expect(allowsPreferenceStorage(null)).toBe(false)
    expect(allowsPreferenceStorage('necessary')).toBe(false)
    expect(allowsPreferenceStorage('all')).toBe(true)
  })

  it('clears optional preference keys', () => {
    localStorage.setItem('theme', 'dark')
    localStorage.setItem('bzgamers-search-state', '{}')
    localStorage.setItem('keep-me', '1')
    clearOptionalStorage()
    expect(localStorage.getItem('theme')).toBeNull()
    expect(localStorage.getItem('bzgamers-search-state')).toBeNull()
    expect(localStorage.getItem('keep-me')).toBe('1')
  })
})
