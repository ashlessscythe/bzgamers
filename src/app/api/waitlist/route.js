import { NextResponse } from 'next/server'
import { PrismaClient } from '../../../generated/prisma'

const prisma = new PrismaClient()

/**
 * POST /api/waitlist
 * Add an email to the waitlist
 */
export async function POST(request) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existing = await prisma.waitlistEmail.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Email already on waitlist', success: false },
        { status: 409 }
      )
    }

    // Add to waitlist
    const waitlistEmail = await prisma.waitlistEmail.create({
      data: {
        email: email.toLowerCase(),
        notified: false
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Successfully added to waitlist',
      data: { id: waitlistEmail.id, email: waitlistEmail.email }
    })
  } catch (error) {
    console.error('Error adding to waitlist:', error)
    return NextResponse.json(
      { error: 'Failed to add email to waitlist', success: false },
      { status: 500 }
    )
  }
}

