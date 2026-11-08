import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/require-admin'
import { getTokenStatus } from '@/lib/twitch-status'

/**
 * GET /api/admin/twitch-status
 * Twitch/IGDB token + config health (admin only). Never returns the token or secrets.
 */
export async function GET() {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(await getTokenStatus())
  } catch (error) {
    console.error('Error fetching Twitch status:', error)
    return NextResponse.json({ error: 'Failed to fetch Twitch status' }, { status: 500 })
  }
}
