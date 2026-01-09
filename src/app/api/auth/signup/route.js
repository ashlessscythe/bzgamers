import { NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

/**
 * POST /api/auth/signup
 * Create a new user account with GUEST role
 */
export async function POST(request) {
  try {
    const { email, password, name, turnstileToken } = await request.json()

    // Validation
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
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

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user with GUEST role
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name: name || null,
        role: 'GUEST' // Default role
      }
    })

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create account', details: error.message },
      { status: 500 }
    )
  }
}

