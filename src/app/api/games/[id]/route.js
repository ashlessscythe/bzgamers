import { fetchGameById } from '@/lib/api'
import { rateLimit } from '@/lib/request-limiter'

/**
 * GET /api/games/[id]
 * Fetch a single game by IGDB id (public).
 */
export async function GET(request, { params }) {
  try {
    const limited = await rateLimit(request, 'game-detail', { limit: 60, windowMs: 60_000 })
    if (limited) return limited

    const { id } = await params
    const gameId = parseInt(id, 10)

    if (!Number.isFinite(gameId) || gameId <= 0) {
      return Response.json({ error: 'Invalid game ID' }, { status: 400 })
    }

    const game = await fetchGameById(gameId)
    return Response.json({ success: true, game })
  } catch (error) {
    console.error('Error fetching game:', error)
    const message = error.message || 'Unknown error'
    const isNotFound =
      message.includes('not found') || message.includes('NOT_FOUND')

    return Response.json(
      { error: isNotFound ? 'Game not found' : 'Failed to fetch game' },
      { status: isNotFound ? 404 : 500 }
    )
  }
}
