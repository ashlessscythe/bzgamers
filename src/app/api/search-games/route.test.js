// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { jsonRequest, parseRouteResponse } from '@/test/api-helpers'

const { mockSearchGames, mockGetCachedSearch, mockCacheSearch, mockTrack } = vi.hoisted(() => ({
  mockSearchGames: vi.fn(),
  mockGetCachedSearch: vi.fn(),
  mockCacheSearch: vi.fn(),
  mockTrack: vi.fn(),
}))

vi.mock('@/lib/api', () => ({
  searchGames: mockSearchGames,
}))

vi.mock('@/lib/db-cache', () => ({
  getCachedSearch: mockGetCachedSearch,
  cacheSearch: mockCacheSearch,
}))

vi.mock('@/lib/analytics', () => ({
  trackVisitorEventAsync: mockTrack,
}))

import { POST } from './route'

describe('POST /api/search-games', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetCachedSearch.mockResolvedValue(null)
    mockCacheSearch.mockResolvedValue(undefined)
  })

  it('requires a non-empty query', async () => {
    const res = await POST(jsonRequest({ query: '   ' }))
    const { status, data } = await parseRouteResponse(res)
    expect(status).toBe(400)
    expect(data.error).toMatch(/required/i)
    expect(mockTrack).not.toHaveBeenCalled()
  })

  it('searches, caches, and tracks typed queries', async () => {
    const games = [{ id: 1, name: 'Hades' }]
    mockSearchGames.mockResolvedValue(games)

    const res = await POST(jsonRequest({ query: ' hades ', limit: 10 }))
    const { status, data } = await parseRouteResponse(res)

    expect(status).toBe(200)
    expect(data).toEqual(games)
    expect(mockSearchGames).toHaveBeenCalledWith('hades', expect.any(Object))
    expect(mockTrack).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        eventType: 'game_search',
        searchQuery: 'hades',
        resultCount: 1,
      })
    )
  })
})
