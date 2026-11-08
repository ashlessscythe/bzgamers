import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/request-limiter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { isValidEmail, getPasswordError, normalizeEmail } from '@/lib/validation'
import { isPasswordBreached, BREACHED_PASSWORD_ERROR } from '@/lib/pwned-password'


/**
 * POST /api/auth/signup
 * Create a new user account with GUEST role
 */
export async function POST(request) {
  try {
    const limited = await rateLimit(request, 'signup', { limit: 5, windowMs: 3600000 })
    if (limited) return limited

    const { email, password, name, turnstileToken } = await request.json()

    if (typeof password === 'string' && password.length > 200) {
      return NextResponse.json({ error: 'Password is too long' }, { status: 400 })
    }
    if (name != null && (typeof name !== 'string' || name.length > 100)) {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
    }

    // Validation
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    const passwordError = getPasswordError(password, { email })
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 })
    }
    if (await isPasswordBreached(password)) {
      return NextResponse.json({ error: BREACHED_PASSWORD_ERROR }, { status: 400 })
    }

    const normalizedEmail = normalizeEmail(email)

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
      where: { email: normalizedEmail }
    })

    if (existing) {
      // Respond identically to a fresh signup so callers cannot enumerate
      // registered emails. The client's auto sign-in will fail for the
      // existing account unless the password happens to match.
      return NextResponse.json({
        success: true,
        message: 'Account created successfully'
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user with GUEST role
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
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
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}

