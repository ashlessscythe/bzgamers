// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createHash } from 'crypto'

const { mockCreate, mockAuth } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockAuth: vi.fn(),
}))

vi.mock('@/generated/prisma', () => ({
  PrismaClient: class MockPrismaClient {
    constructor() {
      this.visitorEvent = { create: mockCreate }
    }
  },
}))

vi.mock('@/lib/auth-config', () => ({
  auth: mockAuth,
}))

import { resolveVisitorId, trackVisitorEvent } from './analytics'

function makeRequest(headers = {}) {
  return {
    headers: {
      get(name) {
        const key = name.toLowerCase()
        const map = Object.fromEntries(
          Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v])
        )
        return map[key] ?? null
      },
    },
  }
}

describe('analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue(null)
  })

  it('prefers a valid x-visitor-id header', () => {
    const id = resolveVisitorId(
      makeRequest({ 'x-visitor-id': 'abc12345visitor99', 'user-agent': 'test' })
    )
    expect(id).toBe('abc12345visitor99')
  })

  it('falls back to a hashed fingerprint without storing raw IP', () => {
    const id = resolveVisitorId(
      makeRequest({
        'x-forwarded-for': '203.0.113.10',
        'user-agent': 'Mozilla/5.0',
      })
    )
    const expected = createHash('sha256')
      .update('203.0.113.10|Mozilla/5.0')
      .digest('hex')
      .slice(0, 32)
    expect(id).toBe(expected)
    expect(id).not.toContain('203.0.113')
  })

  it('stores mood search events for anonymous visitors', async () => {
    mockCreate.mockResolvedValue({ id: 1 })

    await trackVisitorEvent(makeRequest({ 'user-agent': 'vitest' }), {
      eventType: 'mood_search',
      mood: 'excited',
      moodLabel: 'Energetic',
      timeAvailable: 'short',
      timeLabel: '< 30 min',
      resultCount: 12,
    })

    expect(mockCreate).toHaveBeenCalledTimes(1)
    const payload = mockCreate.mock.calls[0][0].data
    expect(payload.eventType).toBe('mood_search')
    expect(payload.moodLabel).toBe('Energetic')
    expect(payload.userId).toBeNull()
    expect(payload.visitorId).toBeTruthy()
  })

  it('attaches signed-in user id when session exists', async () => {
    mockAuth.mockResolvedValue({ user: { id: '42', role: 'GUEST' } })
    mockCreate.mockResolvedValue({ id: 2 })

    await trackVisitorEvent(makeRequest({ 'x-visitor-id': 'sessionvisitor12345' }), {
      eventType: 'game_search',
      searchQuery: 'elden ring',
    })

    const payload = mockCreate.mock.calls[0][0].data
    expect(payload.userId).toBe(42)
    expect(payload.searchQuery).toBe('elden ring')
    expect(payload.visitorId).toBe('sessionvisitor12345')
  })

  it('does not throw when persistence fails', async () => {
    mockCreate.mockRejectedValue(new Error('db down'))
    await expect(
      trackVisitorEvent(makeRequest({}), { eventType: 'similar_search', gameId: 1 })
    ).resolves.toBeNull()
  })
})
