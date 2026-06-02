import { NextResponse } from 'next/server'
import { PrismaClient } from '../../../generated/prisma'
import { Resend } from 'resend'
import { getWaitlistAutoWelcomeEmail } from '../../../lib/email-templates'
import { isValidEmail, normalizeEmail } from '../../../lib/validation'

const prisma = new PrismaClient()
const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * POST /api/waitlist
 * Add an email to the waitlist
 */
export async function POST(request) {
  try {
    const { email } = await request.json()

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    const normalizedEmail = normalizeEmail(email)

    // Check if email already exists
    const existing = await prisma.waitlistEmail.findUnique({
      where: { email: normalizedEmail }
    })

    if (existing) {
      return NextResponse.json(
        { 
          error: 'This email is already on the waitlist. We\'ll notify you when the feature launches!', 
          success: false 
        },
        { status: 409 }
      )
    }

    // Add to waitlist
    const waitlistEmail = await prisma.waitlistEmail.create({
      data: {
        email: normalizedEmail,
        notified: false
      }
    })

    // Automatically send welcome email
    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'BZGamers <onboarding@resend.dev>'
      const emailHtml = getWaitlistAutoWelcomeEmail(normalizedEmail)
      
      const { error: sendError } = await resend.emails.send({
        from: fromEmail,
        to: normalizedEmail,
        subject: 'Thanks for Joining BZGamers Waitlist! 🎮',
        html: emailHtml
      })

      if (sendError) {
        console.error('Error sending welcome email:', sendError)
        // Don't fail the request if email fails, just log it
      } else {
        // Mark as notified since we sent the welcome email
        await prisma.waitlistEmail.update({
          where: { id: waitlistEmail.id },
          data: {
            notified: true,
            notifiedAt: new Date()
          }
        })
        console.log('Welcome email sent successfully to:', normalizedEmail)
      }
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError)
      // Don't fail the request if email fails, just log it
    }

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

