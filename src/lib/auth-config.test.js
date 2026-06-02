import { describe, it, expect, vi } from 'vitest'

vi.mock('next-auth', () => ({
  default: vi.fn(() => ({
    handlers: {},
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  })),
}))

vi.mock('next-auth/providers/credentials', () => ({
  default: (options) => ({ id: 'credentials', ...options }),
}))

vi.mock('./auth', () => ({
  verifyCredentials: vi.fn(),
}))

import { authOptions } from './auth-config'
import { verifyCredentials } from './auth'

describe('authOptions callbacks', () => {
  it('jwt callback copies role and id from user', async () => {
    const token = {}
    const user = { id: '42', role: 'ADMIN', email: 'admin@example.com' }
    const result = await authOptions.callbacks.jwt({ token, user })
    expect(result.role).toBe('ADMIN')
    expect(result.id).toBe('42')
  })

  it('session callback exposes role and id on session.user', async () => {
    const session = { user: { email: 'u@example.com' } }
    const token = { role: 'GUEST', id: '99' }
    const result = await authOptions.callbacks.session({ session, token })
    expect(result.user.role).toBe('GUEST')
    expect(result.user.id).toBe('99')
  })
})

describe('credentials authorize', () => {
  it('returns null when credentials are missing', async () => {
    const provider = authOptions.providers[0]
    expect(await provider.authorize({})).toBe(null)
  })

  it('returns user when verifyCredentials succeeds', async () => {
    verifyCredentials.mockResolvedValue({
      id: 1,
      email: 'user@example.com',
      name: 'User',
      role: 'GUEST',
    })
    const provider = authOptions.providers[0]
    const result = await provider.authorize({
      email: 'user@example.com',
      password: 'secret',
    })
    expect(result).toMatchObject({
      id: '1',
      email: 'user@example.com',
      role: 'GUEST',
    })
  })
})
