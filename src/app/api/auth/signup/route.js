import { NextResponse } from 'next/server'
import { PrismaClient } from '../../../../generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

/**
 * POST /api/auth/signup
 * Create a new user account with GUEST role
 */
export async function POST(request) {
  try {
    const { email, password, name } = await request.json()

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

