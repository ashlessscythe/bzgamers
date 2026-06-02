// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { jsonRequest, parseRouteResponse } from '@/test/api-helpers'

const { mockFindUnique, mockCreate } = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
  mockCreate: vi.fn(),
}))

vi.mock('@/generated/prisma', () => ({
  PrismaClient: class MockPrismaClient {
    constructor() {
      this.user = {
        findUnique: mockFindUnique,
        create: mockCreate,
      }
    }
  },
}))

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(async (password) => `hashed:${password}`),
  },
}))

import { POST } from './route'

describe('POST /api/auth/signup', () => {
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

  it.each(['', '@', 'a@b'])('rejects malformed email: %s', async (email) => {
    const res = await POST(
      jsonRequest({ email, password: 'secret12', turnstileToken: 't' })
    )
    const { status } = await parseRouteResponse(res)
    expect(status).toBe(400)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('returns 400 when password is too short', async () => {
    const res = await POST(
      jsonRequest({
        email: 'user@example.com',
        password: '12345',
        turnstileToken: 't',
      })
    )
    const { status, data } = await parseRouteResponse(res)
    expect(status).toBe(400)
    expect(data.error).toMatch(/6 characters/)
  })

  it('returns 400 when captcha fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: false }),
    })
    const res = await POST(
      jsonRequest({
        email: 'user@example.com',
        password: 'secret12',
        turnstileToken: 'bad',
      })
    )
    const { status, data } = await parseRouteResponse(res)
    expect(status).toBe(400)
    expect(data.error).toMatch(/captcha/i)
  })

  it('returns 409 when email is already registered', async () => {
    mockFindUnique.mockResolvedValue({ id: 1, email: 'user@example.com' })
    const res = await POST(
      jsonRequest({
        email: 'user@example.com',
        password: 'secret12',
        turnstileToken: 'ok',
      })
    )
    const { status, data } = await parseRouteResponse(res)
    expect(status).toBe(409)
    expect(data.error).toMatch(/already registered/i)
  })

  it('creates guest user on success', async () => {
    mockFindUnique.mockResolvedValue(null)
    mockCreate.mockResolvedValue({
      id: 2,
      email: 'new@example.com',
      password: 'hashed:secret12',
      name: 'New',
      role: 'GUEST',
    })

    const res = await POST(
      jsonRequest({
        email: '  New@Example.com  ',
        password: 'secret12',
        name: 'New',
        turnstileToken: 'ok',
      })
    )
    const { status, data } = await parseRouteResponse(res)

    expect(status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.user).toMatchObject({
      email: 'new@example.com',
      role: 'GUEST',
    })
    expect(data.user).not.toHaveProperty('password')
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'new@example.com',
          role: 'GUEST',
        }),
      })
    )
  })
})
