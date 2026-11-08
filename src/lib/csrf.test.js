import { describe, it, expect } from 'vitest'
import { isCrossSiteWrite } from './csrf'

function req(method, headers = {}) {
  return new Request('https://bzgamers.com/api/favorites', { method, headers })
}

describe('isCrossSiteWrite', () => {
  it('never blocks safe methods', () => {
    expect(isCrossSiteWrite(req('GET', { origin: 'https://evil.com', host: 'bzgamers.com' }))).toBe(false)
  })

  it('allows same-origin POST', () => {
    expect(isCrossSiteWrite(req('POST', { origin: 'https://bzgamers.com', host: 'bzgamers.com' }))).toBe(false)
  })

  it('blocks cross-origin POST', () => {
    expect(isCrossSiteWrite(req('POST', { origin: 'https://evil.com', host: 'bzgamers.com' }))).toBe(true)
    expect(isCrossSiteWrite(req('DELETE', { origin: 'null', host: 'bzgamers.com' }))).toBe(true)
  })

  it('falls back to Referer when Origin is absent', () => {
    expect(isCrossSiteWrite(req('POST', { referer: 'https://evil.com/x', host: 'bzgamers.com' }))).toBe(true)
    expect(isCrossSiteWrite(req('POST', { referer: 'https://bzgamers.com/x', host: 'bzgamers.com' }))).toBe(false)
  })

  it('allows requests with no Origin or Referer (non-browser clients)', () => {
    expect(isCrossSiteWrite(req('POST', { host: 'bzgamers.com' }))).toBe(false)
  })

  it('honours extra trusted hosts and x-forwarded-host', () => {
    expect(isCrossSiteWrite(req('POST', { origin: 'https://www.bzgamers.com', host: 'internal:3000' }), ['www.bzgamers.com'])).toBe(false)
    expect(isCrossSiteWrite(req('POST', { origin: 'https://bzgamers.com', host: 'internal:3000', 'x-forwarded-host': 'bzgamers.com' }))).toBe(false)
  })

  it('trusts Sec-Fetch-Site over host comparison', () => {
    // proxy rewrote Host, but the browser says it is same-origin
    expect(isCrossSiteWrite(req('POST', { 'sec-fetch-site': 'same-origin', origin: 'https://bzgamers.com', host: 'internal:3000' }))).toBe(false)
    expect(isCrossSiteWrite(req('POST', { 'sec-fetch-site': 'cross-site', origin: 'https://bzgamers.com', host: 'bzgamers.com' }))).toBe(true)
    expect(isCrossSiteWrite(req('POST', { 'sec-fetch-site': 'same-site', host: 'bzgamers.com' }))).toBe(true)
  })

  it('rejects a malformed Origin', () => {
    expect(isCrossSiteWrite(req('POST', { origin: 'not a url', host: 'bzgamers.com' }))).toBe(true)
  })
})
