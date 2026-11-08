import { describe, it, expect } from 'vitest'
import {
  getWaitlistWelcomeEmail,
  getWaitlistAutoWelcomeEmail,
  getPasswordResetEmail,
  escapeHtml,
  sanitizeEmailHtml,
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

  it('escapes user-supplied name and email in templates', () => {
    const html = getWaitlistAutoWelcomeEmail('a"><img src=x>@x.com', '<script>alert(1)</script>')
    expect(html).not.toContain('<script>alert(1)</script>')
    expect(html).not.toContain('<img src=x>')
    expect(html).toContain('&lt;script&gt;')
    const reset = getPasswordResetEmail('<b>x</b>@x.com', 'https://x.com/?a="b"', '<i>n</i>')
    expect(reset).not.toContain('<b>x</b>')
    expect(reset).not.toContain('<i>n</i>')
  })

  it('escapeHtml escapes the five special characters', () => {
    expect(escapeHtml(`<>&"'`)).toBe('&lt;&gt;&amp;&quot;&#39;')
  })

  it('sanitizeEmailHtml strips scripts, handlers and unsafe URLs but keeps formatting', () => {
    const out = sanitizeEmailHtml(
      '<p onclick="x()">Hi <b>there</b></p><script>bad()</script><a href="javascript:evil()">l</a><a href="https://ok.com">ok</a>'
    )
    expect(out).toContain('<b>there</b>')
    expect(out).toContain('href="https://ok.com"')
    expect(out).not.toMatch(/script|onclick|javascript:/i)
  })
})
