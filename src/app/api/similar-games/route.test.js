// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { jsonRequest, parseRouteResponse } from '@/test/api-helpers'

const { mockFetchGames, mockGetCached, mockCacheSearch } = vi.hoisted(() => ({
  mockFetchGames: vi.fn(),
  mockGetCached: vi.fn(),
  mockCacheSearch: vi.fn(),
}))

vi.mock('../../../lib/api', () => ({ fetchGames: mockFetchGames }))
vi.mock('../../../lib/db-cache', () => ({
  getCachedSearch: mockGetCached,
  cacheSearch: mockCacheSearch,
}))
vi.mock('@/lib/analytics', () => ({ trackVisitorEventAsync: vi.fn() }))
vi.mock('@/lib/request-limiter', () => ({ rateLimit: vi.fn(() => null) }))

import { POST } from './route'

const baseGame = {
  id: 100,
  name: 'Seed',
  similar_games: [],
  genres: [{ id: 5 }, { id: 12 }],
  themes: [{ id: 1 }, { id: 17 }],
  platforms: [{ id: 6 }],
  game_modes: [],
  player_perspectives: [],
}

function candidate(id, genres, themes) {
  return {
    id,
    name: `G${id}`,
    genres: genres.map((g) => ({ id: g })),
    themes: themes.map((t) => ({ id: t })),
    total_rating: 80,
  }
}

describe('POST /api/similar-games focus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetCached.mockResolvedValue(null)
    mockFetchGames.mockImplementation(async ({ where }) => {
      if (where === 'id = 100') return [baseGame]
      return [
        candidate(1, [5], [17]),
        candidate(2, [12], [1]),
        candidate(3, [5], [1]),
      ]
    })
  })

  it('uses the v3 cache key and base genres without a focus', async () => {
    await POST(jsonRequest({ gameId: 100 }))
    expect(mockGetCached).toHaveBeenCalledWith({ type: 'similar_games_v3', gameId: 100, offset: 0 })
    const poolQuery = mockFetchGames.mock.calls.map((c) => c[0].where).find((w) => w.includes('platforms'))
    expect(poolQuery).toContain('genres = (5,12)')
  })

  it('narrows the query and cache key to the focus tags', async () => {
    const res = await POST(jsonRequest({ gameId: 100, focus: { genres: [12], themes: [] } }))
    const { status } = await parseRouteResponse(res)
    expect(status).toBe(200)
    const poolQuery = mockFetchGames.mock.calls.map((c) => c[0].where).find((w) => w.includes('platforms'))
    expect(poolQuery).toContain('genres = (12)')
    expect(poolQuery).not.toContain('5')
    expect(mockGetCached).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'similar_games_v4', focus: 'g:12|t:' })
    )
    expect(mockCacheSearch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'similar_games_v4' }),
      expect.any(Array)
    )
  })

  it('ignores focus tags the seed game does not have (no cache pollution)', async () => {
    await POST(jsonRequest({ gameId: 100, focus: { genres: [999], themes: [888] } }))
    expect(mockGetCached).toHaveBeenCalledWith({ type: 'similar_games_v3', gameId: 100, offset: 0 })
    expect(mockGetCached).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'similar_games_v4' }))
  })

  it('theme-only focus queries by theme', async () => {
    await POST(jsonRequest({ gameId: 100, focus: { genres: [], themes: [17] } }))
    const poolQuery = mockFetchGames.mock.calls.map((c) => c[0].where).find((w) => w.includes('platforms'))
    expect(poolQuery).toContain('themes = (17)')
    expect(poolQuery).not.toContain('genres')
  })
})
