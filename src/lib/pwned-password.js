import { createHash } from 'node:crypto'

const RANGE_URL = 'https://api.pwnedpasswords.com/range/'
const TIMEOUT_MS = 3000

export const BREACHED_PASSWORD_ERROR =
  'That password has appeared in a known data breach. Please choose a different one'

/**
 * Online breach check using the HaveIBeenPwned k-anonymity range API: only the
 * first 5 hex chars of the SHA-1 hash ever leave the server.
 *
 * Fails open (returns false) on any network/parse error or timeout so an
 * outage never blocks signup. Set `PWNED_PASSWORD_CHECK=off` to disable.
 * @param {string} password
 * @returns {Promise<boolean>} true if the password is known to be breached
 */
export async function isPasswordBreached(password) {
  if (process.env.PWNED_PASSWORD_CHECK === 'off') return false
  if (typeof password !== 'string' || !password) return false
  try {
    const hash = createHash('sha1').update(password).digest('hex').toUpperCase()
    const prefix = hash.slice(0, 5)
    const suffix = hash.slice(5)
    const res = await fetch(`${RANGE_URL}${prefix}`, {
      headers: { 'Add-Padding': 'true' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!res?.ok || typeof res.text !== 'function') return false
    const body = await res.text()
    return body.split(/\r?\n/).some((line) => {
      const [s, count] = line.split(':')
      // Padded entries have a count of 0 and are not real matches.
      return s?.trim() === suffix && Number.parseInt(count, 10) > 0
    })
  } catch {
    return false
  }
}
