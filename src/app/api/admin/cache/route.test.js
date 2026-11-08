// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseRouteResponse, jsonRequest } from '@/test/api-helpers'

const m = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  getCacheOverview: vi.fn(),
  cleanupExpiredCache: vi.fn(),
  clearSearchCache: vi.fn(),
  fetchGenres: vi.fn(),
  fetchPlatforms: vi.fn(),
  fetchThemes: vi.fn(),
}))

vi.mock('@/lib/require-admin', () => ({ requireAdmin: m.requireAdmin }))
vi.mock('@/lib/db-cache', () => ({
  getCacheOverview: m.getCacheOverview,
  cleanupExpiredCache: m.cleanupExpiredCache,
  clearSearchCache: m.clearSearchCache,
}))
vi.mock('@/lib/api-enhanced', () => ({
  fetchGenres: m.fetchGenres,
  fetchPlatforms: m.fetchPlatforms,
  fetchThemes: m.fetchThemes,
}))

import { GET, POST } from './route'

describe('/api/admin/cache', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    m.requireAdmin.mockResolvedValue({ user: { id: '1' } })
  })

  it('rejects non-admins on GET and POST', async () => {
    m.requireAdmin.mockResolvedValue(null)
    expect((await parseRouteResponse(await GET())).status).toBe(401)
    expect((await parseRouteResponse(await POST(jsonRequest({ action: 'warm' })))).status).toBe(401)
    expect(m.clearSearchCache).not.toHaveBeenCalled()
  })

  it('returns the overview', async () => {
    m.getCacheOverview.mockResolvedValue({ stats: { games: 3 } })
    const { status, data } = await parseRouteResponse(await GET())
    expect(status).toBe(200)
    expect(data.stats.games).toBe(3)
  })

  it('rejects unknown actions, including prototype keys', async () => {
    for (const action of ['nope', 'constructor', '__proto__']) {
      const { status } = await parseRouteResponse(await POST(jsonRequest({ action })))
      expect(status).toBe(400)
    }
  })

  it('clears searches', async () => {
    m.clearSearchCache.mockResolvedValue(4)
    const { status, data } = await parseRouteResponse(await POST(jsonRequest({ action: 'clear-searches' })))
    expect(status).toBe(200)
    expect(data.message).toContain('4')
  })

  it('reports partial warm failures', async () => {
    m.fetchGenres.mockResolvedValue([])
    m.fetchPlatforms.mockRejectedValue(new Error('x'))
    m.fetchThemes.mockResolvedValue([])
    const { data } = await parseRouteResponse(await POST(jsonRequest({ action: 'warm' })))
    expect(data.ok).toBe(false)
    expect(data.message).toContain('failed: platforms')
  })
})
