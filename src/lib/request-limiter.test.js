import { describe, it, expect, beforeEach } from 'vitest'
import { hitLimit, rateLimit, resetRateLimits, getClientIp } from './request-limiter'

describe('request-limiter', () => {
  beforeEach(() => resetRateLimits())

  it('blocks after the limit and recovers after the window', () => {
    const opts = { limit: 2, windowMs: 1000 }
    expect(hitLimit('k', opts, 0).limited).toBe(false)
    expect(hitLimit('k', opts, 1).limited).toBe(false)
    expect(hitLimit('k', opts, 2).limited).toBe(true)
    expect(hitLimit('k', opts, 1001).limited).toBe(false)
  })

  it('tracks keys independently', () => {
    const opts = { limit: 1, windowMs: 1000 }
    hitLimit('a', opts, 0)
    expect(hitLimit('b', opts, 0).limited).toBe(false)
  })

  it('returns a 429 response with Retry-After', async () => {
    const req = new Request('http://x', { headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' } })
    expect(getClientIp(req)).toBe('1.2.3.4')
    const cfg = { limit: 1, windowMs: 60000, force: true }
    expect(rateLimit(req, 't', cfg)).toBeNull()
    const res = rateLimit(req, 't', cfg)
    expect(res.status).toBe(429)
    expect(res.headers.get('Retry-After')).toBeTruthy()
  })
})
