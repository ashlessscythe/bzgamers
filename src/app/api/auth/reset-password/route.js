import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/request-limiter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { getPasswordError } from '@/lib/validation'
import { isPasswordBreached, BREACHED_PASSWORD_ERROR } from '@/lib/pwned-password'


/**
 * POST /api/auth/reset-password
 * Reset password using a valid reset token
 */
export async function POST(request) {
  try {
    const limited = rateLimit(request, 'reset-password', { limit: 10, windowMs: 3600000 })
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
    
    const { token, password } = body

    // Validation
    if (!token || typeof token !== 'string' || token.length > 128) {
      return NextResponse.json(
        { error: 'Reset token is required' },
        { status: 400 }
      )
    }

    const passwordError = getPasswordError(password)
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 })
    }
    if (await isPasswordBreached(password)) {
      return NextResponse.json({ error: BREACHED_PASSWORD_ERROR }, { status: 400 })
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

