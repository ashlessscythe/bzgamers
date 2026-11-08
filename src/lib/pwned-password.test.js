// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createHash } from 'node:crypto'
import { isPasswordBreached } from './pwned-password'

const sha1 = (s) => createHash('sha1').update(s).digest('hex').toUpperCase()

describe('isPasswordBreached', () => {
  const originalFetch = global.fetch
  beforeEach(() => {
    delete process.env.PWNED_PASSWORD_CHECK
  })
  afterEach(() => {
    global.fetch = originalFetch
  })

  it('sends only the 5-char hash prefix and detects a match', async () => {
    const hash = sha1('hunter2-example')
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => `AAAAA:3\r\n${hash.slice(5)}:42\r\n`,
    })
    expect(await isPasswordBreached('hunter2-example')).toBe(true)
    expect(global.fetch.mock.calls[0][0]).toBe(
      `https://api.pwnedpasswords.com/range/${hash.slice(0, 5)}`
    )
  })

  it('ignores padding entries with zero count', async () => {
    const hash = sha1('padded-example')
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => `${hash.slice(5)}:0`,
    })
    expect(await isPasswordBreached('padded-example')).toBe(false)
  })

  it('returns false when not listed', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, text: async () => 'AAAAA:1' })
    expect(await isPasswordBreached('unlisted-example')).toBe(false)
  })

  it('fails open on network errors and bad responses', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('down'))
    expect(await isPasswordBreached('x-example-1')).toBe(false)
    global.fetch = vi.fn().mockResolvedValue({ ok: false })
    expect(await isPasswordBreached('x-example-1')).toBe(false)
  })

  it('can be disabled via env', async () => {
    process.env.PWNED_PASSWORD_CHECK = 'off'
    global.fetch = vi.fn()
    expect(await isPasswordBreached('anything-1')).toBe(false)
    expect(global.fetch).not.toHaveBeenCalled()
  })
})
