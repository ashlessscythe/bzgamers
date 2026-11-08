import { describe, it, expect } from 'vitest'
import {
  isValidEmail,
  normalizeEmail,
  isValidPassword,
  MIN_PASSWORD_LENGTH,
} from './validation'

describe('isValidEmail', () => {
  it.each([
    '',
    '   ',
    '@',
    'not-an-email',
    'missing-at.com',
    'a@',
    'a@b',
    '@example.com',
    'user@',
    'user @example.com',
  ])('rejects invalid address: %s', (address) => {
    expect(isValidEmail(address)).toBe(false)
  })

  it.each([
    'user@example.com',
    'User@Example.COM',
    '  spaced@example.com  ',
  ])('accepts valid address: %s', (address) => {
    expect(isValidEmail(address)).toBe(true)
  })
})

describe('normalizeEmail', () => {
  it('trims and lowercases', () => {
    expect(normalizeEmail('  User@Example.COM  ')).toBe('user@example.com')
  })
})

describe('isValidPassword', () => {
  it(`requires at least ${MIN_PASSWORD_LENGTH} characters`, () => {
    expect(isValidPassword('1234567')).toBe(false)
    expect(isValidPassword('x7Kq2mPz')).toBe(true)
  })

  it('rejects common and repeated-character passwords', () => {
    expect(isValidPassword('password')).toBe(false)
    expect(isValidPassword('Password123')).toBe(false) // matched case-insensitively
    expect(isValidPassword('aaaaaaaaa')).toBe(false)
  })

  it('rejects passwords containing the email local part', () => {
    expect(isValidPassword('alexander99!', { email: 'alexander@example.com' })).toBe(false)
    expect(isValidPassword('alexander99!', { email: 'bob@example.com' })).toBe(true)
  })
})
