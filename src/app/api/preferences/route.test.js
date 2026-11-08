// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { jsonRequest, parseRouteResponse } from '@/test/api-helpers'

const { mockAuth, mockFindUnique, mockUpsert } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockFindUnique: vi.fn(),
  mockUpsert: vi.fn(),
}))

vi.mock('@/lib/auth-config', () => ({ auth: mockAuth }))
vi.mock('@/lib/request-limiter', () => ({ rateLimit: vi.fn(() => null) }))
vi.mock('@/generated/prisma', () => ({
  PrismaClient: class MockPrismaClient {
    constructor() {
      this.userPreference = { findUnique: mockFindUnique, upsert: mockUpsert }
    }
  },
}))

import { GET, PUT } from './route'

describe('/api/preferences', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue({ user: { id: '7', role: 'GUEST' } })
  })

  it('requires authentication', async () => {
    mockAuth.mockResolvedValue(null)
    expect((await parseRouteResponse(await GET())).status).toBe(401)
    expect((await parseRouteResponse(await PUT(jsonRequest({ preferences: {} }, 'PUT')))).status).toBe(401)
    expect(mockUpsert).not.toHaveBeenCalled()
  })

  it('returns defaults when nothing is saved', async () => {
    mockFindUnique.mockResolvedValue(null)
    const { status, data } = await parseRouteResponse(await GET())
    expect(status).toBe(200)
    expect(data.preferences).toEqual({ platforms: [] })
  })

  it('returns saved preferences, re-sanitized', async () => {
    mockFindUnique.mockResolvedValue({ data: { platforms: [{ id: 6, name: 'x' }, { id: 424242 }], evil: 1 } })
    const { data } = await parseRouteResponse(await GET())
    expect(data.preferences).toEqual({ platforms: [{ id: 6, name: 'PC (Windows)' }] })
  })

  it('saves only sanitized preferences for the session user', async () => {
    mockUpsert.mockResolvedValue({})
    const { status, data } = await parseRouteResponse(
      await PUT(jsonRequest({ preferences: { platforms: [167, 999], role: 'ADMIN' } }, 'PUT'))
    )
    expect(status).toBe(200)
    expect(data.preferences).toEqual({ platforms: [{ id: 167, name: 'PlayStation 5' }] })
    expect(mockUpsert).toHaveBeenCalledWith({
      where: { userId: 7 },
      update: { data: data.preferences },
      create: { userId: 7, data: data.preferences },
    })
  })

  it('rejects a non-JSON body', async () => {
    const req = new Request('http://localhost/api/preferences', { method: 'PUT', body: 'nope' })
    expect((await parseRouteResponse(await PUT(req))).status).toBe(400)
  })
})
