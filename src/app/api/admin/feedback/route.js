import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

/**
 * GET /api/admin/feedback
 * Get all feedback submissions (admin only)
 */
export async function GET(request) {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    const where = {}
    if (userId) {
      where.userId = parseInt(userId)
    }

    const feedbacks = await prisma.feedback.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const total = await prisma.feedback.count()
    const withUser = await prisma.feedback.count({
      where: { userId: { not: null } }
    })
    const anonymous = await prisma.feedback.count({
      where: { userId: null }
    })

    return NextResponse.json({
      success: true,
      data: feedbacks,
      stats: {
        total,
        withUser,
        anonymous
      }
    })
  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/feedback
 * Delete feedback by ID (admin only)
 */
export async function DELETE(request) {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Feedback ID is required' },
        { status: 400 }
      )
    }

    await prisma.feedback.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({
      success: true,
      message: 'Feedback deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting feedback:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to delete feedback' },
      { status: 500 }
    )
  }
}
