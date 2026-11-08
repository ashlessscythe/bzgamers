import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-config'
import { rateLimit } from '@/lib/request-limiter'
import { sanitizePreferences, DEFAULT_PREFERENCES } from '@/lib/preferences'

async function getUserId() {
  const session = await auth()
  const id = parseInt(session?.user?.id, 10)
  return Number.isInteger(id) ? id : null
}

/**
 * GET /api/preferences
 * Preferences for the signed-in user (defaults if none saved yet)
 */
export async function GET() {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const row = await prisma.userPreference.findUnique({ where: { userId } })
    return NextResponse.json({
      success: true,
      preferences: row ? sanitizePreferences(row.data) : DEFAULT_PREFERENCES,
    })
  } catch (error) {
    console.error('Error fetching preferences:', error)
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
  }
}

/**
 * PUT /api/preferences
 * Replace the signed-in user's preferences. Body: { preferences: {...} }
 */
export async function PUT(request) {
  try {
    const limited = rateLimit(request, 'preferences', { limit: 30, windowMs: 60_000 })
    if (limited) return limited

    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body. Expected JSON.' }, { status: 400 })
    }

    const preferences = sanitizePreferences(body?.preferences)
    await prisma.userPreference.upsert({
      where: { userId },
      update: { data: preferences },
      create: { userId, data: preferences },
    })

    return NextResponse.json({ success: true, preferences })
  } catch (error) {
    console.error('Error saving preferences:', error)
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 })
  }
}
