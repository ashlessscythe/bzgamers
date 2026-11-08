// @vitest-environment node
import { describe, it, expect, afterEach, vi } from 'vitest'
import { getSiteUrl, getGameShareUrl, getAuthBaseUrl } from './site-url'

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

describe('getAuthBaseUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('uses NEXTAUTH_URL when set', () => {
    vi.stubEnv('NEXTAUTH_URL', 'https://bzgamers.com/')
    vi.stubEnv('NODE_ENV', 'production')
    expect(getAuthBaseUrl()).toBe('https://bzgamers.com')
  })

  it('throws in production when NEXTAUTH_URL is unset, even with VERCEL_URL', () => {
    vi.stubEnv('NEXTAUTH_URL', '')
    vi.stubEnv('VERCEL_URL', 'preview.vercel.app')
    vi.stubEnv('NODE_ENV', 'production')
    expect(() => getAuthBaseUrl()).toThrow(/NEXTAUTH_URL/)
  })

  it('falls back to localhost outside production', () => {
    vi.stubEnv('NEXTAUTH_URL', '')
    vi.stubEnv('VERCEL_URL', '')
    vi.stubEnv('NODE_ENV', 'development')
    expect(getAuthBaseUrl()).toBe('http://localhost:3000')
  })
})
