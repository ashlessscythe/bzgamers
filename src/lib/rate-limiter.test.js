// @vitest-environment node
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import rateLimiter from './rate-limiter'

describe('rate-limiter', () => {
  beforeEach(() => {
    rateLimiter.reset()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    rateLimiter.reset()
    vi.restoreAllMocks()
  })

  it('tracks request slots and status', async () => {
    await rateLimiter.waitForSlot()
    const status = rateLimiter.getStatus()
    expect(status.requestsInWindow).toBe(1)
    expect(status.concurrentRequests).toBe(1)
    expect(status.isAtLimit).toBe(false)

    rateLimiter.releaseSlot()
    expect(rateLimiter.getStatus().concurrentRequests).toBe(0)
  })

  it('resets state', async () => {
    await rateLimiter.waitForSlot()
    rateLimiter.releaseSlot()
    rateLimiter.reset()
    expect(rateLimiter.getStatus()).toMatchObject({
      requestsInWindow: 0,
      concurrentRequests: 0,
      isAtLimit: false,
    })
  })

  it('waits when the per-second limit is reached', async () => {
    vi.useFakeTimers()
    try {
      // Fill the 4 req/s window without advancing time
      for (let i = 0; i < 4; i++) {
        await rateLimiter.waitForSlot()
        rateLimiter.releaseSlot()
      }

      const fifth = rateLimiter.waitForSlot()
      await vi.advanceTimersByTimeAsync(1000)
      await fifth
      rateLimiter.releaseSlot()

      expect(rateLimiter.getStatus().requestsInWindow).toBeGreaterThanOrEqual(1)
    } finally {
      vi.useRealTimers()
    }
  })
})
