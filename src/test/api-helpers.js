import { vi } from 'vitest'

/**
 * Helpers for testing Next.js App Router route handlers.
 */
export function jsonRequest(body, method = 'POST') {
  return new Request('http://localhost/api/test', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export async function parseRouteResponse(response) {
  const data = await response.json()
  return { status: response.status, data }
}

/** Mock Cloudflare Turnstile siteverify success. */
export function mockTurnstileSuccess() {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ success: true }),
  })
}
