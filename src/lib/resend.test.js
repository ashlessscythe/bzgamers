import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('getResend', () => {
  const originalKey = process.env.RESEND_API_KEY

  beforeEach(() => {
    vi.resetModules()
    delete process.env.RESEND_API_KEY
  })

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.RESEND_API_KEY
    } else {
      process.env.RESEND_API_KEY = originalKey
    }
  })

  it('throws a clear error when RESEND_API_KEY is missing', async () => {
    const { getResend } = await import('./resend.js')
    expect(() => getResend()).toThrow(/Missing RESEND_API_KEY/)
  })

  it('creates a client when RESEND_API_KEY is set', async () => {
    process.env.RESEND_API_KEY = 're_test_key'
    const { getResend } = await import('./resend.js')
    const client = getResend()
    expect(client).toBeTruthy()
    expect(getResend()).toBe(client)
  })
})
