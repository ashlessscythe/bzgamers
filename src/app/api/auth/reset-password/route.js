import { NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

/**
 * POST /api/auth/reset-password
 * Reset password using a valid reset token
 */
export async function POST(request) {
  try {
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected JSON.' },
        { status: 400 }
      )
    }
    
    const { token, password } = body

    // Validation
    if (!token) {
      return NextResponse.json(
        { error: 'Reset token is required' },
        { status: 400 }
      )
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Find the reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Check if token has been used
    if (resetToken.used) {
      return NextResponse.json(
        { error: 'This reset token has already been used' },
        { status: 400 }
      )
    }

    // Check if token has expired
    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json(
        { error: 'This reset token has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update user password and mark token as used (in a transaction)
    await prisma.$transaction([
      // Update password
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword }
      }),
      // Mark token as used
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true }
      })
    ])

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now sign in with your new password.'
    })
  } catch (error) {
    console.error('Error resetting password:', error)
    return NextResponse.json(
      { error: 'Failed to reset password. Please try again.' },
      { status: 500 }
    )
  }
}

