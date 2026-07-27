// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockUpdate, mockFetchGameById } = vi.hoisted(() => ({
  mockUpdate: vi.fn(),
  mockFetchGameById: vi.fn(),
}))

vi.mock('@/generated/prisma', () => ({
  PrismaClient: class MockPrismaClient {
    constructor() {
      this.favorite = { update: mockUpdate }
    }
  },
}))

vi.mock('@/lib/api', () => ({
  fetchGameById: mockFetchGameById,
}))

import { enrichFavorites } from './favorite-enrichment'

describe('enrichFavorites', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns normalized data when snapshot is fresh', async () => {
    const fav = {
      id: 1,
      gameId: 10,
      gameName: 'Hades',
      gameData: {
        id: 10,
        name: 'Hades',
        url: 'https://www.igdb.com/games/hades',
        cover: { image_id: 'co1' },
      },
    }

    const [result] = await enrichFavorites([fav])
    expect(result.gameData.id).toBe(10)
    expect(mockFetchGameById).not.toHaveBeenCalled()
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('refreshes stale favorites from IGDB and persists', async () => {
    const fav = { id: 2, gameId: 99, gameName: 'Old', gameData: null }
    const fresh = {
      id: 99,
      name: 'Fresh Game',
      url: 'https://www.igdb.com/games/fresh',
      cover: { image_id: 'co2' },
    }
    mockFetchGameById.mockResolvedValue(fresh)
    mockUpdate.mockResolvedValue({})

    const [result] = await enrichFavorites([fav])
    expect(result.gameData).toEqual(fresh)
    expect(result.gameName).toBe('Fresh Game')
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 2 },
        data: expect.objectContaining({ gameName: 'Fresh Game' }),
      })
    )
  })

  it('falls back to normalize when refresh fails', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const fav = { id: 3, gameId: 7, gameName: 'Legacy', gameData: { name: 'Legacy' } }
    mockFetchGameById.mockRejectedValue(new Error('IGDB down'))

    const [result] = await enrichFavorites([fav])
    expect(result.gameData.id).toBe(7)
    expect(result.gameData.url).toContain('/games/7')
    expect(mockUpdate).not.toHaveBeenCalled()
  })
})
