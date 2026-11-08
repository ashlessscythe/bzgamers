// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./db-cache', () => ({ default: {}, getCachedSearch: vi.fn(), cacheSearch: vi.fn() }))

import { createTwitchStatus } from './twitch-status'

function setup(env = {}) {
  const store = new Map()
  const key = (q) => q.type
  const dbCache = {
    getCachedSearch: vi.fn(async (q) => store.get(key(q)) ?? null),
    cacheSearch: vi.fn(async (q, v) => { store.set(key(q), v) }),
  }
  let t = 1_000_000
  const sendAlert = vi.fn().mockResolvedValue(undefined)
  const svc = createTwitchStatus({ dbCache, sendAlert, now: () => t, env })
  return { svc, store, sendAlert, advance: (ms) => { t += ms }, dbCache }
}

describe('twitch-status', () => {
  beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}))

  it('counts consecutive failures and resets on success', async () => {
    const { svc } = setup()
    await svc.recordTokenFailure({ status: 403, message: 'forbidden' })
    await svc.recordTokenFailure({ status: 403, message: 'forbidden' })
    expect((await svc.getTokenStatus()).health.consecutiveFailures).toBe(2)
    await svc.recordTokenSuccess()
    const { health } = await svc.getTokenStatus()
    expect(health.consecutiveFailures).toBe(0)
    expect(health.lastSuccessAt).not.toBeNull()
    expect(health.lastFailure.status).toBe(403)
  })

  it('redacts client credentials from recorded messages', async () => {
    const { svc } = setup({ NEXT_API_CLIENT_ID: 'myid', NEXT_API_CLIENT_SECRET: 'mysecret' })
    await svc.recordTokenFailure({ message: 'bad url ?client_secret=mysecret&client_id=myid' })
    const { health } = await svc.getTokenStatus()
    expect(health.lastFailure.message).not.toMatch(/mysecret|myid/)
  })

  it('throttles alert emails to one per hour and only when configured', async () => {
    const off = setup()
    await off.svc.recordTokenFailure({ message: 'x' })
    expect(off.sendAlert).not.toHaveBeenCalled()

    const { svc, sendAlert, advance } = setup({ ADMIN_ALERT_EMAIL: 'a@b.com' })
    await svc.recordTokenFailure({ message: 'x' })
    await svc.recordTokenFailure({ message: 'x' })
    expect(sendAlert).toHaveBeenCalledTimes(1)
    advance(61 * 60 * 1000)
    await svc.recordTokenFailure({ message: 'x' })
    expect(sendAlert).toHaveBeenCalledTimes(2)
  })

  it('reports token expiry without exposing the token value', async () => {
    const { svc, store } = setup({ NEXT_API_CLIENT_ID: 'id', NEXT_API_CLIENT_SECRET: 's' })
    store.set('auth_token', { token: 'SECRET-TOKEN', createdAt: 1_000_000 - 1000, expiresIn: 100 })
    const status = await svc.getTokenStatus()
    expect(status.token).toMatchObject({ present: true, secondsRemaining: 99 })
    expect(JSON.stringify(status)).not.toContain('SECRET-TOKEN')
    expect(status.config).toMatchObject({ clientIdSet: true, clientSecretSet: true })
  })
})
