/**
 * Shared input validation — single source of truth for API and auth behavior.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email) {
  if (email == null || typeof email !== 'string') return false
  const trimmed = email.trim()
  if (!trimmed) return false
  return EMAIL_PATTERN.test(trimmed)
}

export function normalizeEmail(email) {
  if (typeof email !== 'string') {
    throw new TypeError('email must be a string')
  }
  return email.trim().toLowerCase()
}

export const MIN_PASSWORD_LENGTH = 6

export function isValidPassword(password) {
  return typeof password === 'string' && password.length >= MIN_PASSWORD_LENGTH
}
