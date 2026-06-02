import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import CompactGameCard from './CompactGameCard'

vi.mock('./ShareButton', () => ({
  default: () => <span data-testid="share-button-stub" />,
}))

describe('CompactGameCard', () => {
  it('shows placeholder message when game is null', () => {
    render(<CompactGameCard game={null} />)
    expect(screen.getByText('Game data not available')).toBeInTheDocument()
  })

  it('renders game name and learn more link for minimal game data', () => {
    const game = {
      id: 1942,
      name: 'The Witcher 3',
      cover: { image_id: 'co1l7z' },
    }

    render(<CompactGameCard game={game} />)

    expect(screen.getByRole('heading', { name: /The Witcher 3/i })).toBeInTheDocument()

    const learnMore = screen.getByRole('link', { name: /learn more/i })
    expect(learnMore).toHaveAttribute('href', 'https://www.igdb.com/games/1942')
  })
})
