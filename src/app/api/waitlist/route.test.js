// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { jsonRequest, parseRouteResponse } from '@/test/api-helpers'

const {
  mockFindUnique,
  mockCreate,
  mockUpdate,
  mockEmailsSend,
} = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
  mockEmailsSend: vi.fn(),
}))

vi.mock('../../../generated/prisma', () => ({
  PrismaClient: class MockPrismaClient {
    constructor() {
      this.waitlistEmail = {
        findUnique: mockFindUnique,
        create: mockCreate,
        update: mockUpdate,
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

vi.mock('../../../lib/email-templates', () => ({
  getWaitlistAutoWelcomeEmail: vi.fn(() => '<p>Welcome</p>'),
}))

import { POST } from './route'

describe('POST /api/waitlist', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.RESEND_API_KEY = 're_test_key'
    mockEmailsSend.mockResolvedValue({ data: { id: 'email-1' }, error: null })
  })

  it.each(['', '@', 'a@b', 'a@', 'not-an-email'])(
    'rejects malformed email: %s',
    async (email) => {
      const res = await POST(jsonRequest({ email }))
      const { status, data } = await parseRouteResponse(res)
      expect(status).toBe(400)
      expect(data.error).toMatch(/valid email/i)
      expect(mockCreate).not.toHaveBeenCalled()
    }
  )

  it('returns 409 when email is already on waitlist', async () => {
    mockFindUnique.mockResolvedValue({ id: 1, email: 'dup@example.com' })
    const res = await POST(jsonRequest({ email: 'dup@example.com' }))
    const { status, data } = await parseRouteResponse(res)
    expect(status).toBe(409)
    expect(data.success).toBe(false)
  })

  it('normalizes email before persist and send', async () => {
    mockFindUnique.mockResolvedValue(null)
    mockCreate.mockResolvedValue({ id: 10, email: 'new@example.com' })
    mockUpdate.mockResolvedValue({})

    const res = await POST(jsonRequest({ email: '  New@Example.com  ' }))
    const { status, data } = await parseRouteResponse(res)

    expect(status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { email: 'new@example.com' },
    })
    expect(mockCreate).toHaveBeenCalledWith({
      data: { email: 'new@example.com', notified: false },
    })
    expect(mockEmailsSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'new@example.com',
        subject: expect.stringContaining('Waitlist'),
      })
    )
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 10 },
        data: expect.objectContaining({ notified: true }),
      })
    )
  })

  it('still succeeds when welcome email fails', async () => {
    mockFindUnique.mockResolvedValue(null)
    mockCreate.mockResolvedValue({ id: 11, email: 'ok@example.com' })
    mockEmailsSend.mockResolvedValue({ data: null, error: { message: 'send failed' } })

    const res = await POST(jsonRequest({ email: 'ok@example.com' }))
    const { status, data } = await parseRouteResponse(res)

    expect(status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockUpdate).not.toHaveBeenCalled()
  })
})
