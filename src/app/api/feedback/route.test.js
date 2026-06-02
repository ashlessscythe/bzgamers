// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { jsonRequest, parseRouteResponse } from '@/test/api-helpers'

const { mockCreate } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
}))

vi.mock('@/generated/prisma', () => ({
  PrismaClient: class MockPrismaClient {
    constructor() {
      this.feedback = { create: mockCreate }
    }
  },
}))

vi.mock('@/lib/auth-config', () => ({
  auth: vi.fn(async () => null),
}))

import { POST } from './route'

describe('POST /api/feedback', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_TURNSTILE_SECRET_KEY = 'test-secret'
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })
  })

  afterEach(() => {
    global.fetch = originalFetch
    delete process.env.NEXT_TURNSTILE_SECRET_KEY
  })

  it.each(['@', 'a@b'])('rejects malformed email: %s', async (email) => {
    const res = await POST(
      jsonRequest({
        name: 'Alex',
        email,
        message: 'Hi',
        turnstileToken: 't',
      })
    )
    const { status } = await parseRouteResponse(res)
    expect(status).toBe(400)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('returns 400 when required fields are missing', async () => {
    const res = await POST(
      jsonRequest({ email: 'a@b.com', turnstileToken: 't' })
    )
    const { status, data } = await parseRouteResponse(res)
    expect(status).toBe(400)
    expect(data.error).toMatch(/name/i)
  })

  it('returns 400 when captcha token is missing', async () => {
    const res = await POST(
      jsonRequest({
        name: 'Alex',
        email: 'alex@example.com',
        message: 'Great site!',
      })
    )
    const { status, data } = await parseRouteResponse(res)
    expect(status).toBe(400)
    expect(data.error).toMatch(/captcha/i)
  })

  it('stores feedback when validation passes', async () => {
    mockCreate.mockResolvedValue({ id: 1 })

    const res = await POST(
      jsonRequest({
        name: 'Alex',
        email: 'alex@example.com',
        message: 'Great site!',
        turnstileToken: 'valid',
      })
    )
    const { status, data } = await parseRouteResponse(res)

    expect(status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'Alex',
          email: 'alex@example.com',
          message: 'Great site!',
        }),
      })
    )
  })
})
