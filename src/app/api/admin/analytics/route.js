import { NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import { auth } from '@/lib/auth-config'

const prisma = new PrismaClient()

function groupCount(rows, keyFn, limit = 20) {
  const counts = new Map()
  for (const row of rows) {
    const key = keyFn(row)
    if (!key) continue
    counts.set(key, (counts.get(key) || 0) + 1)
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

/**
 * GET /api/admin/analytics
 * Visitor search & interactivity stats (admin only)
 */
export async function GET(request) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const daysParam = parseInt(searchParams.get('days') || '30', 10)
    const days = Number.isFinite(daysParam) && daysParam > 0 ? Math.min(daysParam, 365) : 30
    const limitParam = parseInt(searchParams.get('limit') || '100', 10)
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 500) : 100
    const eventType = searchParams.get('eventType')

    const since = new Date()
    since.setDate(since.getDate() - days)

    const where = {
      createdAt: { gte: since },
      ...(eventType ? { eventType } : {}),
    }

    const [events, totals] = await Promise.all([
      prisma.visitorEvent.findMany({
        where,
        include: {
          user: {
            select: { id: true, email: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.visitorEvent.groupBy({
        by: ['eventType'],
        where: { createdAt: { gte: since } },
        _count: { _all: true },
      }),
    ])

    // Aggregate tables from a wider sample for top lists
    const sample = await prisma.visitorEvent.findMany({
      where: { createdAt: { gte: since } },
      select: {
        visitorId: true,
        userId: true,
        eventType: true,
        searchQuery: true,
        mood: true,
        moodLabel: true,
        timeAvailable: true,
        timeLabel: true,
        genre: true,
        genreLabel: true,
        gameId: true,
        gameName: true,
      },
      take: 5000,
      orderBy: { createdAt: 'desc' },
    })

    const uniqueVisitors = new Set(sample.map((e) => e.visitorId)).size
    const signedInEvents = sample.filter((e) => e.userId != null).length
    const anonymousEvents = sample.length - signedInEvents

    const byType = Object.fromEntries(
      totals.map((row) => [row.eventType, row._count._all])
    )

    const topMoods = groupCount(
      sample.filter((e) => e.eventType === 'mood_search' || e.moodLabel || e.mood),
      (e) => e.moodLabel || e.mood
    )
    const topSearches = groupCount(
      sample.filter((e) => e.eventType === 'game_search' && e.searchQuery),
      (e) => e.searchQuery.toLowerCase()
    )
    const topSimilarSeeds = groupCount(
      sample.filter((e) => e.eventType === 'similar_search' && (e.gameName || e.gameId)),
      (e) => e.gameName || `Game #${e.gameId}`
    )
    const topTimes = groupCount(
      sample.filter((e) => e.timeLabel || e.timeAvailable),
      (e) => e.timeLabel || e.timeAvailable
    )
    const topGenres = groupCount(
      sample.filter((e) => e.genreLabel || e.genre),
      (e) => e.genreLabel || String(e.genre)
    )

    const totalEvents = totals.reduce((sum, row) => sum + row._count._all, 0)

    return NextResponse.json({
      success: true,
      data: events,
      stats: {
        days,
        totalEvents,
        uniqueVisitors,
        signedInEvents,
        anonymousEvents,
        moodSearches: byType.mood_search || 0,
        gameSearches: byType.game_search || 0,
        similarSearches: byType.similar_search || 0,
        favorites: byType.favorite_add || 0,
        byType,
      },
      tables: {
        topMoods,
        topSearches,
        topSimilarSeeds,
        topTimes,
        topGenres,
      },
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
