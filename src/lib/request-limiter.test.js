import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { hitLimit, hitRedisLimit, rateLimit, resetRateLimits, getClientIp } from './request-limiter'

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
    expect(await rateLimit(req, 't', cfg)).toBeNull()
    const res = await rateLimit(req, 't', cfg)
    expect(res.status).toBe(429)
    expect(res.headers.get('Retry-After')).toBeTruthy()
  })

  describe('redis backend', () => {
    const originalFetch = global.fetch
    const cfg = { url: 'https://redis.example', token: 'tok' }
    afterEach(() => {
      global.fetch = originalFetch
      delete process.env.UPSTASH_REDIS_REST_URL
      delete process.env.UPSTASH_REDIS_REST_TOKEN
    })
    const reply = (count, ttl) => ({
      ok: true,
      json: async () => [{ result: count }, { result: 1 }, { result: ttl }],
    })

    it('allows under the limit and blocks over it with Retry-After from PTTL', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce(reply(1, 60000)).mockResolvedValueOnce(reply(3, 30500))
      const opts = { limit: 2, windowMs: 60000 }
      expect((await hitRedisLimit('k', opts, cfg)).limited).toBe(false)
      expect(await hitRedisLimit('k', opts, cfg)).toEqual({ limited: true, retryAfter: 31 })
      expect(global.fetch.mock.calls[0][0]).toBe('https://redis.example/pipeline')
    })

    it('falls back to the in-memory limiter when redis fails', async () => {
      process.env.UPSTASH_REDIS_REST_URL = cfg.url
      process.env.UPSTASH_REDIS_REST_TOKEN = cfg.token
      global.fetch = vi.fn().mockRejectedValue(new Error('down'))
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const req = new Request('http://x', { headers: { 'x-forwarded-for': '9.9.9.9' } })
      const opts = { limit: 1, windowMs: 60000, force: true }
      expect(await rateLimit(req, 'fb', opts)).toBeNull()
      expect((await rateLimit(req, 'fb', opts)).status).toBe(429)
    })
  })
})
