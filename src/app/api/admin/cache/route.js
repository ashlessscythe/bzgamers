import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/require-admin'
import { rateLimit } from '@/lib/request-limiter'

import { getCacheOverview, cleanupExpiredCache, clearSearchCache } from '@/lib/db-cache'
import { fetchGenres, fetchPlatforms, fetchThemes } from '@/lib/api-enhanced'

/**
 * GET /api/admin/cache
 * Cache statistics and freshness (admin only).
 */
export async function GET() {
  try {
    const session = await requireAdmin()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json(await getCacheOverview())
  } catch (error) {
    console.error('Error fetching cache overview:', error)
    return NextResponse.json({ error: 'Failed to fetch cache overview' }, { status: 500 })
  }
}

const ACTIONS = {
  'cleanup-expired': async () => {
    const before = (await getCacheOverview()).searches.expired
    await cleanupExpiredCache()
    return { message: `Removed ${before} expired search ${before === 1 ? 'entry' : 'entries'}` }
  },
  'clear-searches': async () => {
    const count = await clearSearchCache()
    return { message: `Cleared ${count} cached search ${count === 1 ? 'result' : 'results'}` }
  },
  // Pre-load the reference data every search needs so the first visitor
  // after a deploy or TTL expiry doesn't pay for the IGDB round trips.
  warm: async () => {
    const results = await Promise.allSettled([
      fetchGenres(),
      fetchPlatforms(),
      fetchThemes(),
    ])
    const names = ['genres', 'platforms', 'themes']
    const failed = names.filter((_, i) => results[i].status === 'rejected')
    return {
      message: failed.length
        ? `Warmed ${names.length - failed.length}/${names.length}; failed: ${failed.join(', ')}`
        : 'Warmed genres, platforms and themes',
      ok: failed.length === 0,
    }
  },
}

/**
 * POST /api/admin/cache  { action: 'cleanup-expired' | 'clear-searches' | 'warm' }
 */
export async function POST(request) {
  try {
    const session = await requireAdmin()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const limited = await rateLimit(request, 'admin-cache', { limit: 20, windowMs: 60_000 })
    if (limited) return limited

    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    const handler = Object.hasOwn(ACTIONS, body?.action) ? ACTIONS[body.action] : null
    if (!handler) return NextResponse.json({ error: 'Unknown action' }, { status: 400 })

    const result = await handler()
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error('Error running cache action:', error)
    return NextResponse.json({ error: 'Cache action failed' }, { status: 500 })
  }
}
