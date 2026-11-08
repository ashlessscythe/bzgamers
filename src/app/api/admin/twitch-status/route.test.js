// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseRouteResponse } from '@/test/api-helpers'

const { mockRequireAdmin, mockGetTokenStatus } = vi.hoisted(() => ({
  mockRequireAdmin: vi.fn(),
  mockGetTokenStatus: vi.fn(),
}))

vi.mock('@/lib/require-admin', () => ({ requireAdmin: mockRequireAdmin }))
vi.mock('@/lib/twitch-status', () => ({ getTokenStatus: mockGetTokenStatus }))

import { GET } from './route'

describe('GET /api/admin/twitch-status', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 for non-admins', async () => {
    mockRequireAdmin.mockResolvedValue(null)
    const { status } = await parseRouteResponse(await GET())
    expect(status).toBe(401)
    expect(mockGetTokenStatus).not.toHaveBeenCalled()
  })

  it('returns the status snapshot for admins', async () => {
    mockRequireAdmin.mockResolvedValue({ user: { id: '1' } })
    mockGetTokenStatus.mockResolvedValue({ token: { present: true }, health: {}, config: {} })
    const { status, data } = await parseRouteResponse(await GET())
    expect(status).toBe(200)
    expect(data.token.present).toBe(true)
  })
})
