import { NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import { auth } from '@/lib/auth-config'
import { enrichFavorites } from '@/lib/favorite-enrichment'

const prisma = new PrismaClient()

/**
 * GET /api/favorites
 * Get all favorites for the authenticated user
 */
export async function GET(request) {
  try {
    const session = await auth()
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: parseInt(session.user.id)
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const enrichedFavorites = await enrichFavorites(favorites)

    return NextResponse.json({
      success: true,
      favorites: enrichedFavorites
    })
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json(
      { error: 'Failed to fetch favorites', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/favorites
 * Add a game to favorites
 */
export async function POST(request) {
  try {
    const session = await auth()
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { gameId, gameName, gameData } = await request.json()

    if (!gameId) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      )
    }

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_gameId: {
          userId: parseInt(session.user.id),
          gameId: parseInt(gameId)
        }
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Game already in favorites', success: false },
        { status: 409 }
      )
    }

    // Add to favorites
    const favorite = await prisma.favorite.create({
      data: {
        userId: parseInt(session.user.id),
        gameId: parseInt(gameId),
        gameName: gameName || null,
        gameData: gameData || null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Game added to favorites',
      favorite
    })
  } catch (error) {
    console.error('Error adding favorite:', error)
    return NextResponse.json(
      { error: 'Failed to add favorite', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/favorites
 * Remove a game from favorites
 */
export async function DELETE(request) {
  try {
    const session = await auth()
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get('gameId')

    if (!gameId) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      )
    }

    // Check if favorite exists
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_gameId: {
          userId: parseInt(session.user.id),
          gameId: parseInt(gameId)
        }
      }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Favorite not found', success: false },
        { status: 404 }
      )
    }

    // Remove from favorites
    await prisma.favorite.delete({
      where: {
        id: existing.id
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Game removed from favorites'
    })
  } catch (error) {
    console.error('Error removing favorite:', error)
    return NextResponse.json(
      { error: 'Failed to remove favorite', details: error.message },
      { status: 500 }
    )
  }
}

