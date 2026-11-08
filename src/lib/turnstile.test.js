// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { verifyTurnstile } from './turnstile'

describe('verifyTurnstile', () => {
  beforeEach(() => {
    process.env.NEXT_TURNSTILE_SECRET_KEY = 'secret'
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    delete process.env.NEXT_TURNSTILE_SECRET_KEY
  })

  it('requires a token', async () => {
    expect(await verifyTurnstile('')).toMatchObject({ ok: false, status: 400 })
    expect(await verifyTurnstile(undefined)).toMatchObject({ ok: false, status: 400 })
  })

  it('fails with 500 when the secret is not configured', async () => {
    delete process.env.NEXT_TURNSTILE_SECRET_KEY
    expect(await verifyTurnstile('tok')).toMatchObject({ ok: false, status: 500 })
  })

  it('succeeds when Cloudflare says success', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ json: async () => ({ success: true }) })
    vi.stubGlobal('fetch', fetchMock)
    expect(await verifyTurnstile('tok', '1.2.3.4')).toEqual({ ok: true })
    const sent = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(sent).toMatchObject({ secret: 'secret', response: 'tok', remoteip: '1.2.3.4' })
  })

  it('fails with 400 when Cloudflare rejects the token', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => ({ success: false }) }))
    expect(await verifyTurnstile('tok')).toMatchObject({ ok: false, status: 400 })
  })

  it('fails closed when the verify call throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')))
    expect(await verifyTurnstile('tok')).toMatchObject({ ok: false, status: 502 })
  })
})
