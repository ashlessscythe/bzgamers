// @vitest-environment node
import { describe, it, expect, afterEach } from 'vitest'
import { getSiteUrl, getGameShareUrl } from './site-url'

describe('site-url', () => {
  const original = process.env.NEXT_PUBLIC_SITE_URL

  afterEach(() => {
    if (original === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL
    } else {
      process.env.NEXT_PUBLIC_SITE_URL = original
    }
  })

  it('uses NEXT_PUBLIC_SITE_URL when set, stripping trailing slash', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://bzgamers.com/'
    expect(getSiteUrl()).toBe('https://bzgamers.com')
  })

  it('falls back to localhost in node without env', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL
    expect(getSiteUrl()).toBe('http://localhost:3000')
  })

  it('builds game share URLs from the site origin', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com'
    expect(getGameShareUrl(1942)).toBe('https://example.com/games/1942')
  })
})
