import { describe, it, expect } from 'vitest'
import {
  getWaitlistWelcomeEmail,
  getWaitlistAutoWelcomeEmail,
  getPasswordResetEmail,
} from './email-templates'

describe('email templates', () => {
  it('waitlist welcome email includes branding', () => {
    const html = getWaitlistWelcomeEmail('user@example.com')
    expect(html).toContain('Welcome to BZGamers')
    expect(html).toContain('waitlist')
  })

  it('auto welcome email uses personalized greeting when name provided', () => {
    const html = getWaitlistAutoWelcomeEmail('user@example.com', 'Alex')
    expect(html).toContain('Hi Alex!')
    expect(html).toContain('Thanks for Joining')
  })

  it('auto welcome email uses generic greeting without name', () => {
    const html = getWaitlistAutoWelcomeEmail('user@example.com')
    expect(html).toContain('Hi there!')
  })

  it('password reset email includes reset URL and account email', () => {
    const resetUrl = 'https://bzgamers.com/auth/reset-password?token=abc123'
    const html = getPasswordResetEmail('user@example.com', resetUrl, 'Sam')
    expect(html).toContain(resetUrl)
    expect(html).toContain('user@example.com')
    expect(html).toContain('Hi Sam,')
    expect(html).toContain('Reset Password')
  })
})
