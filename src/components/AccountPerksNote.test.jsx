import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AccountPerksNote from './AccountPerksNote'

describe('AccountPerksNote', () => {
  it('invites signed-out users to sign in', () => {
    render(<AccountPerksNote isSignedIn={false} />)
    expect(screen.getByText(/Free account perks/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Sign in or create an account/ })).toHaveAttribute('href', '/profile')
  })

  it('points signed-in users to their profile', () => {
    render(<AccountPerksNote isSignedIn />)
    expect(screen.getByText(/Your account:/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'profile' })).toHaveAttribute('href', '/profile')
  })

  it('renders nothing while the session is loading', () => {
    const { container } = render(<AccountPerksNote isSignedIn={false} isLoading />)
    expect(container).toBeEmptyDOMElement()
  })
})
