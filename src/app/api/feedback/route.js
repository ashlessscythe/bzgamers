import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/request-limiter'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-config'
import { isValidEmail, normalizeEmail } from '@/lib/validation'


/**
 * POST /api/feedback
 * Submit user feedback
 * Protected with Turnstile
 */
export async function POST(request) {
  try {
    const limited = rateLimit(request, 'feedback', { limit: 5, windowMs: 3600000 })
    if (limited) return limited

    let body
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected JSON.' },
        { status: 400 }
      )
    }
    
    const { name, email, message, turnstileToken } = body

    if (typeof name !== 'string' || typeof message !== 'string' || name.length > 100 || message.length > 5000) {
      return NextResponse.json({ error: 'Invalid name or message' }, { status: 400 })
    }

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    const normalizedEmail = normalizeEmail(email)

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Feedback message is required' },
        { status: 400 }
      )
    }

    // Verify Turnstile token
    if (!turnstileToken) {
      return NextResponse.json(
        { error: 'Captcha verification is required' },
        { status: 400 }
      )
    }

    const secretKey = process.env.NEXT_TURNSTILE_SECRET_KEY
    if (!secretKey) {
      console.error('NEXT_TURNSTILE_SECRET_KEY is not set')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Verify token with Cloudflare
    const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: secretKey,
        response: turnstileToken,
      }),
    })

    const verifyData = await verifyResponse.json()

    if (!verifyData.success) {
      return NextResponse.json(
        { error: 'Captcha verification failed. Please try again.' },
        { status: 400 }
      )
    }

    // Get session to link feedback to user if logged in
    const session = await auth()
    const userId = session?.user?.id ? parseInt(session.user.id) : null

    // Save feedback to database
    await prisma.feedback.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        message: message.trim(),
        userId: userId,
      },
    })

    return NextResponse.json(
      { success: true, message: 'Feedback submitted successfully!' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error submitting feedback:', error)
    return NextResponse.json(
      { error: 'Failed to submit feedback. Please try again.' },
      { status: 500 }
    )
  }
}
