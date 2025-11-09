import { NextResponse } from 'next/server'
import { auth } from '../../../../lib/auth-config'
import { Resend } from 'resend'
import { PrismaClient } from '../../../../generated/prisma'
import { getWaitlistWelcomeEmail } from '../../../../lib/email-templates'

const prisma = new PrismaClient()
const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * POST /api/admin/send-email
 * Send email to waitlist users (admin only)
 */
export async function POST(request) {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { emailIds, subject, message, sendToAll, useTemplate } = await request.json()

    // Use default template if useTemplate is true and no custom message provided
    let emailSubject = subject
    let emailMessage = message
    
    if (useTemplate && !message) {
      emailSubject = emailSubject || 'Welcome to BZGamers Waitlist! 🎮'
      // Will be set per email below
    } else if (!emailSubject || !emailMessage) {
      return NextResponse.json(
        { error: 'Subject and message are required' },
        { status: 400 }
      )
    }

    // Get emails to send to
    let emails = []
    if (sendToAll) {
      emails = await prisma.waitlistEmail.findMany({
        where: { notified: false }
      })
    } else if (emailIds && emailIds.length > 0) {
      emails = await prisma.waitlistEmail.findMany({
        where: { id: { in: emailIds } }
      })
    } else {
      return NextResponse.json(
        { error: 'No emails selected' },
        { status: 400 }
      )
    }

    if (emails.length === 0) {
      return NextResponse.json(
        { error: 'No emails to send to' },
        { status: 400 }
      )
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'BZGamers <onboarding@resend.dev>'
    const results = []
    const errors = []
    
    // Rate limiting: Resend allows ~3 emails/second on free tier, higher on paid
    // Add delay between sends to respect rate limits (200ms = ~5 emails/second)
    const DELAY_BETWEEN_EMAILS = parseInt(process.env.RESEND_EMAIL_DELAY_MS) || 500

    // Send emails with rate limiting
    for (let i = 0; i < emails.length; i++) {
      const emailData = emails[i]
      
      try {
        // Use template if requested, otherwise use custom message
        const finalMessage = useTemplate && !message
          ? getWaitlistWelcomeEmail(emailData.email)
          : emailMessage.replace(/\n/g, '<br>')
        
        const { data, error } = await resend.emails.send({
          from: fromEmail,
          to: emailData.email,
          subject: emailSubject,
          html: finalMessage
        })

        if (error) {
          errors.push({ email: emailData.email, error: error.message })
        } else {
          // Mark as notified
          await prisma.waitlistEmail.update({
            where: { id: emailData.id },
            data: {
              notified: true,
              notifiedAt: new Date()
            }
          })
          results.push({ email: emailData.email, success: true, id: data?.id })
        }
        
        // Add delay between emails (except for the last one)
        if (i < emails.length - 1) {
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_EMAILS))
        }
      } catch (err) {
        errors.push({ email: emailData.email, error: err.message })
        
        // Still add delay even on error to maintain rate limit
        if (i < emails.length - 1) {
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_EMAILS))
        }
      }
    }

    return NextResponse.json({
      success: true,
      sent: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Error sending emails:', error)
    return NextResponse.json(
      { error: 'Failed to send emails', details: error.message },
      { status: 500 }
    )
  }
}

