// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { jsonRequest, parseRouteResponse } from '@/test/api-helpers'

const {
  mockFindUnique,
  mockUpdateMany,
  mockCreate,
  mockEmailsSend,
} = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
  mockUpdateMany: vi.fn(),
  mockCreate: vi.fn(),
  mockEmailsSend: vi.fn(),
}))

vi.mock('@/generated/prisma', () => ({
  PrismaClient: class MockPrismaClient {
    constructor() {
      this.user = { findUnique: mockFindUnique }
      this.passwordResetToken = {
        updateMany: mockUpdateMany,
        create: mockCreate,
      }
    }
  },
}))

vi.mock('resend', () => ({
  Resend: class MockResend {
    constructor() {
      this.emails = { send: mockEmailsSend }
    }
  },
}))

vi.mock('@/lib/email-templates', () => ({
  getPasswordResetEmail: vi.fn(() => '<p>Reset</p>'),
}))

import { POST } from './route'

describe('POST /api/auth/forgot-password', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_TURNSTILE_SECRET_KEY = 'test-secret'
    process.env.NEXTAUTH_URL = 'http://localhost:3000'
    process.env.RESEND_API_KEY = 're_test_key'
    mockEmailsSend.mockResolvedValue({ error: null })
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })
  })

  afterEach(() => {
    global.fetch = originalFetch
    delete process.env.NEXT_TURNSTILE_SECRET_KEY
    delete process.env.RESEND_API_KEY
  })

  it.each(['', '@', 'a@b'])('rejects malformed email: %s', async (email) => {
    const res = await POST(jsonRequest({ email, turnstileToken: 'tok' }))
    const { status } = await parseRouteResponse(res)
    expect(status).toBe(400)
    expect(mockEmailsSend).not.toHaveBeenCalled()
  })

  it('returns 400 when captcha token is missing', async () => {
    const res = await POST(jsonRequest({ email: 'user@example.com' }))
    const { status, data } = await parseRouteResponse(res)
    expect(status).toBe(400)
    expect(data.error).toMatch(/captcha/i)
  })

  it('returns success without revealing whether user exists', async () => {
    mockFindUnique.mockResolvedValue(null)
    const res = await POST(
      jsonRequest({ email: 'unknown@example.com', turnstileToken: 'valid' })
    )
    const { status, data } = await parseRouteResponse(res)
    expect(status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockEmailsSend).not.toHaveBeenCalled()
  })

  it('creates reset token and sends email when user exists', async () => {
    mockFindUnique.mockResolvedValue({
      id: 5,
      email: 'user@example.com',
      name: 'User',
    })
    mockUpdateMany.mockResolvedValue({ count: 0 })
    mockCreate.mockResolvedValue({})

    const res = await POST(
      jsonRequest({ email: 'user@example.com', turnstileToken: 'valid' })
    )
    const { status, data } = await parseRouteResponse(res)

    expect(status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 5,
          token: expect.any(String),
        }),
      })
    )
    expect(mockEmailsSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: expect.stringMatching(/reset/i),
      })
    )
  })
})
