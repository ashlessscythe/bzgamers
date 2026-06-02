import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { authMocks } from '@/test/auth-mocks'
import Layout from './Layout'

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('./ThemeToggle', () => ({ default: () => null }))
vi.mock('./MobileMenu', () => ({ default: () => null }))
vi.mock('./FeedbackModal', () => ({ default: () => null }))
vi.mock('./CookieConsentProvider', () => ({
  default: ({ children }) => children,
  useCookieConsent: () => ({ resetConsent: vi.fn() }),
}))
vi.mock('./AuthModal', () => ({ default: () => null }))
vi.mock('./GoToTopButton', () => ({ default: () => null }))

describe('Layout auth UI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('shows sign in when unauthenticated', () => {
    authMocks.useSession.mockReturnValue({ data: null, status: 'unauthenticated' })
    render(
      <Layout>
        <div>child</div>
      </Layout>
    )
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument()
  })

  it('shows email and sign out when authenticated', async () => {
    authMocks.useSession.mockReturnValue({
      data: { user: { email: 'user@example.com' } },
      status: 'authenticated',
    })
    const user = userEvent.setup()
    render(
      <Layout>
        <div>child</div>
      </Layout>
    )

    expect(screen.getByText('user@example.com')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /sign out/i }))
    expect(authMocks.signOut).toHaveBeenCalledWith({ callbackUrl: '/' })
  })
})
