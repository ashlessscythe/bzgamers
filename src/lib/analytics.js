import { createHash } from 'crypto'
import { PrismaClient } from '@/generated/prisma'
import { auth } from '@/lib/auth-config'

const prisma = new PrismaClient()

const VISITOR_HEADER = 'x-visitor-id'

/**
 * Stable anonymous visitor key from request (works without sign-in).
 * Prefers client-supplied session id; otherwise hashes IP + UA (no raw IP stored).
 */
export function resolveVisitorId(request) {
  const headerId = request.headers.get(VISITOR_HEADER)?.trim()
  if (headerId && /^[a-zA-Z0-9_-]{8,64}$/.test(headerId)) {
    return headerId
  }

  const forwarded = request.headers.get('x-forwarded-for')
  const ip = (forwarded?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown').trim()
  const ua = request.headers.get('user-agent') || 'unknown'
  return createHash('sha256').update(`${ip}|${ua}`).digest('hex').slice(0, 32)
}

function toOptionalString(value, max = 500) {
  if (value == null) return null
  const str = String(value).trim()
  if (!str) return null
  return str.slice(0, max)
}

function toOptionalInt(value) {
  if (value == null || value === '') return null
  const n = parseInt(value, 10)
  return Number.isFinite(n) ? n : null
}

/**
 * Persist a visitor activity event. Never throws to callers — analytics must not break UX.
 *
 * @param {Request} request
 * @param {object} event
 * @param {string} event.eventType
 * @param {string} [event.searchQuery]
 * @param {string} [event.mood]
 * @param {string} [event.moodLabel]
 * @param {string} [event.timeAvailable]
 * @param {string} [event.timeLabel]
 * @param {string|number} [event.genre]
 * @param {string} [event.genreLabel]
 * @param {number|string} [event.gameId]
 * @param {string} [event.gameName]
 * @param {number} [event.resultCount]
 * @param {object} [event.metadata]
 */
export async function trackVisitorEvent(request, event) {
  try {
    if (!event?.eventType) return null

    let userId = null
    try {
      const session = await auth()
      if (session?.user?.id) {
        const parsed = parseInt(session.user.id, 10)
        if (Number.isFinite(parsed)) userId = parsed
      }
    } catch {
      // Auth lookup is best-effort for anonymous tracking
    }

    const visitorId = resolveVisitorId(request)
    const userAgent = toOptionalString(request.headers.get('user-agent'), 500)

    return await prisma.visitorEvent.create({
      data: {
        visitorId,
        userId,
        eventType: toOptionalString(event.eventType, 64) || 'unknown',
        searchQuery: toOptionalString(event.searchQuery, 300),
        mood: toOptionalString(event.mood, 64),
        moodLabel: toOptionalString(event.moodLabel, 64),
        timeAvailable: toOptionalString(event.timeAvailable, 64),
        timeLabel: toOptionalString(event.timeLabel, 64),
        genre: event.genre != null ? toOptionalString(event.genre, 64) : null,
        genreLabel: toOptionalString(event.genreLabel, 64),
        gameId: toOptionalInt(event.gameId),
        gameName: toOptionalString(event.gameName, 200),
        resultCount:
          typeof event.resultCount === 'number' && Number.isFinite(event.resultCount)
            ? event.resultCount
            : null,
        metadata: event.metadata ?? undefined,
        userAgent,
      },
    })
  } catch (error) {
    console.error('Failed to track visitor event:', error)
    return null
  }
}

/**
 * Fire-and-forget wrapper so API handlers do not await DB write latency.
 */
export function trackVisitorEventAsync(request, event) {
  void trackVisitorEvent(request, event)
}

export { VISITOR_HEADER }
