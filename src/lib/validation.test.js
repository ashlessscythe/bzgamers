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
    expect(isValidPassword('12345')).toBe(false)
    expect(isValidPassword('123456')).toBe(true)
  })
})
