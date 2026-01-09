import { NextResponse } from 'next/server'
import { PrismaClient } from '../../../../generated/prisma'
import { auth } from '../../../../lib/auth-config'

const prisma = new PrismaClient()

/**
 * POST /api/favorites/check
 * Check if multiple games are favorited by the user
 * Accepts an array of game IDs and returns which ones are favorited
 */
export async function POST(request) {
  try {
    const session = await auth()
    
    if (!session || !session.user?.id) {
      // Return empty array for non-authenticated users
      return NextResponse.json({
        success: true,
        favoritedGameIds: []
      })
    }

    const { gameIds } = await request.json()

    if (!Array.isArray(gameIds) || gameIds.length === 0) {
      return NextResponse.json({
        success: true,
        favoritedGameIds: []
      })
    }

    // Get all favorites for this user that match the provided game IDs
    const favorites = await prisma.favorite.findMany({
      where: {
        userId: parseInt(session.user.id),
        gameId: {
          in: gameIds.map(id => parseInt(id))
        }
      },
      select: {
        gameId: true
      }
    })

    const favoritedGameIds = favorites.map(f => f.gameId)

    return NextResponse.json({
      success: true,
      favoritedGameIds
    })
  } catch (error) {
    console.error('Error checking favorites:', error)
    return NextResponse.json(
      { error: 'Failed to check favorites', details: error.message },
      { status: 500 }
    )
  }
}

