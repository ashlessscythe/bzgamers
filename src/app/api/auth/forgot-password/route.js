import { NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import { getPasswordResetEmail } from '@/lib/email-templates'
import { getResend } from '@/lib/resend'
import crypto from 'crypto'
import { isValidEmail, normalizeEmail } from '@/lib/validation'

const prisma = new PrismaClient()

/**
 * POST /api/auth/forgot-password
 * Request a password reset email
 * Protected with Turnstile
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
    
    const { email, turnstileToken } = body

    // Validation
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
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

    // Check if user exists (don't reveal if they don't for security)
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user) {
      // Generate secure random token
      const token = crypto.randomBytes(32).toString('hex')
      
      // Set expiration to 1 hour from now
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 1)

      // Invalidate any existing unused tokens for this user
      await prisma.passwordResetToken.updateMany({
        where: {
          userId: user.id,
          used: false,
          expiresAt: { gt: new Date() }
        },
        data: {
          used: true
        }
      })

      // Create new reset token
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt
        }
      })

      // Generate reset URL
      let baseUrl = process.env.NEXTAUTH_URL
      if (!baseUrl) {
        if (process.env.VERCEL_URL) {
          baseUrl = `https://${process.env.VERCEL_URL}`
        } else {
          baseUrl = 'http://localhost:3000'
        }
      }
      const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`

      // Send email
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'BZGamers <onboarding@resend.dev>'
      const emailHtml = getPasswordResetEmail(user.email, resetUrl, user.name)

      const { error: emailError } = await getResend().emails.send({
        from: fromEmail,
        to: user.email,
        subject: 'Reset Your Password - BZGamers',
        html: emailHtml
      })

      if (emailError) {
        console.error('Error sending password reset email:', emailError)
        // Don't reveal email error to user for security
      }
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    })
  } catch (error) {
    console.error('Error processing password reset request:', error)
    return NextResponse.json(
      { error: 'Failed to process request. Please try again.' },
      { status: 500 }
    )
  }
}

