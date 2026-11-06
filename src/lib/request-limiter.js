/**
 * Small in-memory per-client rate limiter for public API routes.
 *
 * NOTE: state is per server instance. On multi-instance/serverless deployments
 * this is best-effort; back it with a shared store (e.g. Redis) or an edge
 * rate-limit rule for hard guarantees.
 */

const buckets = new Map()
const MAX_BUCKETS = 10000

export function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip')?.trim()
  return ip || 'unknown'
}

function prune(now) {
  if (buckets.size < MAX_BUCKETS) return
  for (const [k, v] of buckets) {
    if (v.resetAt <= now) buckets.delete(k)
  }
  // Still full of live entries: drop oldest to bound memory
  while (buckets.size >= MAX_BUCKETS) {
    buckets.delete(buckets.keys().next().value)
  }
}

/**
 * @returns {{ limited: boolean, retryAfter: number }}
 */
export function hitLimit(key, { limit, windowMs }, now = Date.now()) {
  prune(now)
  const entry = buckets.get(key)
  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { limited: false, retryAfter: 0 }
  }
  entry.count++
  if (entry.count > limit) {
    return { limited: true, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
  }
  return { limited: false, retryAfter: 0 }
}

/**
 * Route helper: returns a 429 Response when the client is over the limit,
 * otherwise null. Disabled under test unless `force` is set.
 */
export function rateLimit(request, name, { limit, windowMs, force = false }) {
  if (process.env.NODE_ENV === 'test' && !force) return null
  const { limited, retryAfter } = hitLimit(`${name}:${getClientIp(request)}`, { limit, windowMs })
  if (!limited) return null
  return Response.json(
    { error: 'Too many requests. Please try again later.' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  )
}

export function resetRateLimits() {
  buckets.clear()
}
