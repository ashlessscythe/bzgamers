const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

/**
 * Verify a Cloudflare Turnstile token server-side.
 * @param {unknown} token - token from the client widget
 * @param {string} [remoteIp]
 * @returns {Promise<{ ok: true } | { ok: false, status: number, error: string }>}
 */
export async function verifyTurnstile(token, remoteIp) {
  if (typeof token !== 'string' || !token) {
    return { ok: false, status: 400, error: 'Captcha verification is required' }
  }

  const secret = process.env.NEXT_TURNSTILE_SECRET_KEY
  if (!secret) {
    console.error('NEXT_TURNSTILE_SECRET_KEY is not set')
    return { ok: false, status: 500, error: 'Server configuration error' }
  }

  try {
    const body = { secret, response: token }
    if (remoteIp) body.remoteip = remoteIp
    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!data.success) {
      return { ok: false, status: 400, error: 'Captcha verification failed. Please try again.' }
    }
    return { ok: true }
  } catch (error) {
    console.error('Turnstile verification error:', error)
    return { ok: false, status: 502, error: 'Captcha verification unavailable. Please try again.' }
  }
}
