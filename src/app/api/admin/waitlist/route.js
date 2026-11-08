import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/require-admin'
import { prisma } from '@/lib/prisma'


/**
 * GET /api/admin/waitlist
 * Get all waitlist emails (admin only)
 */
export async function GET(request) {
  try {
    const session = await requireAdmin()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const notified = searchParams.get('notified')
    
    const where = {}
    if (notified !== null) {
      where.notified = notified === 'true'
    }

    const emails = await prisma.waitlistEmail.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    const total = await prisma.waitlistEmail.count()
    const notifiedCount = await prisma.waitlistEmail.count({
      where: { notified: true }
    })
    const unnotifiedCount = await prisma.waitlistEmail.count({
      where: { notified: false }
    })

    return NextResponse.json({
      success: true,
      data: emails,
      stats: {
        total,
        notified: notifiedCount,
        unnotified: unnotifiedCount
      }
    })
  } catch (error) {
    console.error('Error fetching waitlist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch waitlist' },
      { status: 500 }
    )
  }
}

