// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseRouteResponse } from '@/test/api-helpers'

const {
  mockFindMany,
  mockGroupBy,
  mockAuth,
} = vi.hoisted(() => ({
  mockFindMany: vi.fn(),
  mockGroupBy: vi.fn(),
  mockAuth: vi.fn(),
}))

vi.mock('@/generated/prisma', () => ({
  PrismaClient: class MockPrismaClient {
    constructor() {
      this.visitorEvent = {
        findMany: mockFindMany,
        groupBy: mockGroupBy,
      }
    }
  },
}))

vi.mock('@/lib/auth-config', () => ({
  auth: mockAuth,
}))

import { GET } from './route'

function getRequest(url = 'http://localhost/api/admin/analytics') {
  return new Request(url, { method: 'GET' })
}

describe('GET /api/admin/analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 for non-admins', async () => {
    mockAuth.mockResolvedValue({ user: { role: 'GUEST' } })
    const res = await GET(getRequest())
    const { status } = await parseRouteResponse(res)
    expect(status).toBe(401)
  })

  it('returns tabulated visitor activity for admins', async () => {
    mockAuth.mockResolvedValue({ user: { role: 'ADMIN', id: '1' } })
    mockFindMany
      .mockResolvedValueOnce([
        {
          id: 1,
          visitorId: 'v1',
          eventType: 'mood_search',
          moodLabel: 'Energetic',
          searchQuery: null,
          createdAt: new Date().toISOString(),
          user: null,
          resultCount: 10,
        },
      ])
      .mockResolvedValueOnce([
        {
          visitorId: 'v1',
          userId: null,
          eventType: 'mood_search',
          searchQuery: null,
          mood: 'excited',
          moodLabel: 'Energetic',
          timeAvailable: 'short',
          timeLabel: '< 30 min',
          genre: null,
          genreLabel: null,
          gameId: null,
          gameName: null,
        },
        {
          visitorId: 'v2',
          userId: 5,
          eventType: 'game_search',
          searchQuery: 'Hades',
          mood: null,
          moodLabel: null,
          timeAvailable: null,
          timeLabel: null,
          genre: null,
          genreLabel: null,
          gameId: null,
          gameName: null,
        },
      ])
    mockGroupBy.mockResolvedValue([
      { eventType: 'mood_search', _count: { _all: 1 } },
      { eventType: 'game_search', _count: { _all: 1 } },
    ])

    const res = await GET(getRequest('http://localhost/api/admin/analytics?days=30'))
    const { status, data } = await parseRouteResponse(res)

    expect(status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.stats.totalEvents).toBe(2)
    expect(data.stats.uniqueVisitors).toBe(2)
    expect(data.stats.moodSearches).toBe(1)
    expect(data.tables.topMoods[0]).toEqual({ label: 'Energetic', count: 1 })
    expect(data.tables.topSearches[0]).toEqual({ label: 'hades', count: 1 })
  })
})
