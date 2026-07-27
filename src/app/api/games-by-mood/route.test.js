// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { jsonRequest, parseRouteResponse } from '@/test/api-helpers'

const { mockFindGamesByMood, mockGetCachedSearch, mockCacheSearch, mockTrack } = vi.hoisted(() => ({
  mockFindGamesByMood: vi.fn(),
  mockGetCachedSearch: vi.fn(),
  mockCacheSearch: vi.fn(),
  mockTrack: vi.fn(),
}))

vi.mock('@/lib/api', () => ({
  findGamesByMood: mockFindGamesByMood,
}))

vi.mock('@/lib/db-cache', () => ({
  getCachedSearch: mockGetCachedSearch,
  cacheSearch: mockCacheSearch,
}))

vi.mock('@/lib/analytics', () => ({
  trackVisitorEventAsync: mockTrack,
}))

import { POST } from './route'

describe('POST /api/games-by-mood', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetCachedSearch.mockResolvedValue(null)
    mockCacheSearch.mockResolvedValue(undefined)
  })

  it('returns 400 for invalid JSON', async () => {
    const req = new Request('http://localhost/api/games-by-mood', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{bad',
    })
    const res = await POST(req)
    const { status } = await parseRouteResponse(res)
    expect(status).toBe(400)
  })

  it('fetches, caches, and tracks mood searches', async () => {
    const games = [{ id: 1, name: 'Celeste' }]
    mockFindGamesByMood.mockResolvedValue(games)

    const res = await POST(
      jsonRequest({
        mood: 'excited',
        moodLabel: 'Energetic',
        timeAvailable: 'short',
        timeLabel: '< 30 min',
        genre: 32,
        genreLabel: 'Indie',
      })
    )
    const { status, data } = await parseRouteResponse(res)

    expect(status).toBe(200)
    expect(data).toEqual(games)
    expect(mockCacheSearch).toHaveBeenCalled()
    expect(mockTrack).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        eventType: 'mood_search',
        moodLabel: 'Energetic',
        resultCount: 1,
        metadata: expect.objectContaining({ cached: false }),
      })
    )
  })

  it('serves cache hits and still tracks the search', async () => {
    const cached = [{ id: 9, name: 'Cached' }]
    mockGetCachedSearch.mockResolvedValue(cached)

    const res = await POST(jsonRequest({ mood: 'relaxed', timeAvailable: 'long' }))
    const { status, data } = await parseRouteResponse(res)

    expect(status).toBe(200)
    expect(data).toEqual(cached)
    expect(mockFindGamesByMood).not.toHaveBeenCalled()
    expect(mockTrack).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        eventType: 'mood_search',
        metadata: expect.objectContaining({ cached: true }),
      })
    )
  })
})
