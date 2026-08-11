import { Resend } from 'resend'

let resendClient = null

/**
 * Lazily create the Resend client so Next.js can collect route data at build
 * time without requiring RESEND_API_KEY to be present during module evaluation.
 */
export function getResend() {
  if (resendClient) {
    return resendClient
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error(
      'Missing RESEND_API_KEY. Set it in the environment before sending email.'
    )
  }

  resendClient = new Resend(apiKey)
  return resendClient
}
