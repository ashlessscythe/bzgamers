import { describe, it, expect, vi, beforeEach } from 'vitest'
import bcrypt from 'bcryptjs'

const { mockFindUnique, mockCreate } = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
  mockCreate: vi.fn(),
}))

vi.mock('../generated/prisma', () => ({
  PrismaClient: class MockPrismaClient {
    constructor() {
      this.user = {
        findUnique: mockFindUnique,
        create: mockCreate,
      }
    }
  },
}))

import { verifyCredentials, isAdmin, getUserByEmail } from './auth'

describe('isAdmin', () => {
  it('returns true only for ADMIN role', () => {
    expect(isAdmin({ role: 'ADMIN' })).toBe(true)
    expect(isAdmin({ role: 'GUEST' })).toBe(false)
    expect(isAdmin(null)).toBe(false)
  })
})

describe('verifyCredentials', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns user without password when credentials are valid', async () => {
    const hash = await bcrypt.hash('secret123', 10)
    mockFindUnique.mockResolvedValue({
      id: 1,
      email: 'user@example.com',
      password: hash,
      name: 'User',
      role: 'GUEST',
    })

    const user = await verifyCredentials('User@Example.com', 'secret123')

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
    })
    expect(user).toMatchObject({
      id: 1,
      email: 'user@example.com',
      role: 'GUEST',
    })
    expect(user).not.toHaveProperty('password')
  })

  it('returns null when user is not found', async () => {
    mockFindUnique.mockResolvedValue(null)
    expect(await verifyCredentials('missing@example.com', 'pass')).toBe(null)
  })

  it('returns null when password does not match', async () => {
    const hash = await bcrypt.hash('correct', 10)
    mockFindUnique.mockResolvedValue({
      id: 2,
      email: 'user@example.com',
      password: hash,
      role: 'GUEST',
    })
    expect(await verifyCredentials('user@example.com', 'wrong')).toBe(null)
  })
})

describe('getUserByEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns user without password field', async () => {
    mockFindUnique.mockResolvedValue({
      id: 3,
      email: 'guest@example.com',
      password: 'hashed',
      role: 'GUEST',
    })
    const user = await getUserByEmail('guest@example.com')
    expect(user).toEqual({ id: 3, email: 'guest@example.com', role: 'GUEST' })
    expect(user).not.toHaveProperty('password')
  })

  it('normalizes whitespace when looking up by email', async () => {
    mockFindUnique.mockResolvedValue({
      id: 4,
      email: 'user@example.com',
      password: 'hashed',
      role: 'GUEST',
    })
    await getUserByEmail('  User@Example.com  ')
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
    })
  })
})
