/**
 * Small in-memory per-client rate limiter for public API routes.
 *
 * By default state is per server instance (best-effort on multi-instance or
 * serverless deployments). Set `UPSTASH_REDIS_REST_URL` and
 * `UPSTASH_REDIS_REST_TOKEN` to share counters across instances via Upstash
 * Redis (REST). If Redis is unreachable we fall back to the in-memory limiter.
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

const REDIS_TIMEOUT_MS = 1500

function redisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, '')
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  return url && token ? { url, token } : null
}

/**
 * Fixed-window counter in Redis: INCR, and set the expiry on first hit.
 * @returns {Promise<{ limited: boolean, retryAfter: number }>}
 */
export async function hitRedisLimit(key, { limit, windowMs }, config = redisConfig()) {
  const res = await fetch(`${config.url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([
      ['INCR', `rl:${key}`],
      ['PEXPIRE', `rl:${key}`, String(windowMs), 'NX'],
      ['PTTL', `rl:${key}`],
    ]),
    signal: AbortSignal.timeout(REDIS_TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`Redis responded ${res.status}`)
  const results = await res.json()
  const count = Number(results?.[0]?.result)
  const ttl = Number(results?.[2]?.result)
  if (!Number.isFinite(count)) throw new Error('Unexpected Redis response')
  if (count <= limit) return { limited: false, retryAfter: 0 }
  return { limited: true, retryAfter: Math.max(1, Math.ceil((ttl > 0 ? ttl : windowMs) / 1000)) }
}

async function checkLimit(key, opts) {
  const config = redisConfig()
  if (config) {
    try {
      return await hitRedisLimit(key, opts, config)
    } catch (error) {
      console.error('[RATE_LIMIT] Redis unavailable, using in-memory limiter:', error.message)
    }
  }
  return hitLimit(key, opts)
}

/**
 * Route helper: resolves to a 429 Response when the client is over the limit,
 * otherwise null. Disabled under test unless `force` is set.
 * Always `await` it.
 */
export async function rateLimit(request, name, { limit, windowMs, force = false }) {
  if (process.env.NODE_ENV === 'test' && !force) return null
  const { limited, retryAfter } = await checkLimit(`${name}:${getClientIp(request)}`, { limit, windowMs })
  if (!limited) return null
  return Response.json(
    { error: 'Too many requests. Please try again later.' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  )
}

export function resetRateLimits() {
  buckets.clear()
}
