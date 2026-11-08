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

export const MIN_PASSWORD_LENGTH = 8
export const MAX_PASSWORD_LENGTH = 200

// Small blocklist of the most commonly used passwords (all lowercase).
const COMMON_PASSWORDS = new Set([
  'password', 'password1', 'password12', 'password123', 'passw0rd', 'p@ssw0rd',
  '12345678', '123456789', '1234567890', '123123123', '11111111', '00000000',
  'qwertyui', 'qwerty123', 'qwertyuiop', 'qwerty12', '1q2w3e4r', '1q2w3e4r5t',
  'iloveyou', 'letmein1', 'welcome1', 'welcome123', 'admin123', 'administrator',
  'abc12345', 'abcd1234', 'monkey123', 'dragon123', 'football', 'baseball',
  'trustno1', 'sunshine', 'princess', 'superman', 'master123', 'changeme',
  'gamer123', 'gaming123', 'bzgamers', 'minecraft', 'fortnite1', 'pokemon1',
])

/**
 * Check a password against the signup/reset policy.
 * @param {unknown} password
 * @param {{ email?: string }} [options]
 * @returns {string|null} a user-facing error message, or null if acceptable
 */
export function getPasswordError(password, { email } = {}) {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return `Password must be at most ${MAX_PASSWORD_LENGTH} characters`
  }
  const lower = password.toLowerCase()
  if (COMMON_PASSWORDS.has(lower) || /^(.)\1+$/.test(password)) {
    return 'That password is too common. Please choose a less guessable one'
  }
  if (typeof email === 'string' && email.includes('@')) {
    const local = email.split('@')[0].toLowerCase()
    if (local.length >= 4 && lower.includes(local)) {
      return 'Password must not contain your email address'
    }
  }
  return null
}

export function isValidPassword(password, options) {
  return getPasswordError(password, options) === null
}
