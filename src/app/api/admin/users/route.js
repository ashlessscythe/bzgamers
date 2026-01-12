import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

/**
 * GET /api/admin/users
 * Get all users (admin only)
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
    const role = searchParams.get('role')
    
    const where = {}
    if (role && (role === 'ADMIN' || role === 'GUEST')) {
      where.role = role
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            favorites: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const total = await prisma.user.count()
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' }
    })
    const guestCount = await prisma.user.count({
      where: { role: 'GUEST' }
    })

    return NextResponse.json({
      success: true,
      data: users,
      stats: {
        total,
        admins: adminCount,
        guests: guestCount
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
