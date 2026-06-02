import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { authMocks } from '@/test/auth-mocks'
import AuthModal from './AuthModal'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('../lib/turnstile-loader', () => ({
  loadTurnstile: vi.fn().mockResolvedValue(undefined),
  isTurnstileLoaded: vi.fn(() => true),
}))

function fillField(id, value) {
  fireEvent.change(document.getElementById(id), { target: { value } })
}

function submitForm() {
  fireEvent.submit(document.getElementById('auth-modal-email').closest('form'))
}

describe('AuthModal', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    authMocks.signIn.mockResolvedValue({ error: null })
    authMocks.useSession.mockReturnValue({ data: null, status: 'unauthenticated' })
    vi.stubGlobal('location', { ...window.location, reload: vi.fn() })
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = 'test-site-key'
  })

  afterEach(() => {
    cleanup()
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  })

  it('does not render when closed', () => {
    render(<AuthModal isOpen={false} onClose={mockOnClose} />)
    expect(screen.queryByRole('heading', { name: /sign in/i })).not.toBeInTheDocument()
  })

  it('sign in trims email before calling next-auth', async () => {
    render(<AuthModal isOpen onClose={mockOnClose} initialMode="signin" />)

    fillField('auth-modal-email', '  user@example.com  ')
    fillField('auth-modal-password', 'secret12')
    submitForm()

    await waitFor(() => {
      expect(authMocks.signIn).toHaveBeenCalledWith('credentials', {
        email: 'user@example.com',
        password: 'secret12',
        redirect: false,
      })
    })
  })

  it('shows error when sign in fails', async () => {
    authMocks.signIn.mockResolvedValue({ error: 'CredentialsSignin' })
    render(<AuthModal isOpen onClose={mockOnClose} initialMode="signin" />)

    fillField('auth-modal-email', 'user@example.com')
    fillField('auth-modal-password', 'wrong')
    submitForm()

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument()
    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('signup validates password length before submitting', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    render(<AuthModal isOpen onClose={mockOnClose} initialMode="signup" />)

    fillField('auth-modal-email', 'new@example.com')
    fillField('auth-modal-password', '12345')
    submitForm()

    expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('signup requires captcha token', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    render(<AuthModal isOpen onClose={mockOnClose} initialMode="signup" />)

    fillField('auth-modal-email', 'new@example.com')
    fillField('auth-modal-password', 'secret12')
    submitForm()

    expect(await screen.findByText(/complete the captcha/i)).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('switches between sign in and sign up modes', async () => {
    const user = userEvent.setup()
    render(<AuthModal isOpen onClose={mockOnClose} initialMode="signin" />)

    expect(screen.getByRole('heading', { name: /^sign in$/i })).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: /don't have an account\? sign up/i })
    )
    expect(screen.getByRole('heading', { name: /^sign up$/i })).toBeInTheDocument()
  })
})
