import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SimilarFocusPicker, { getFocusOptions, toFocusPayload } from './SimilarFocusPicker'

const game = {
  id: 1,
  name: 'Seed',
  genres: [{ id: 5, name: 'Shooter' }, { id: 12, name: 'RPG' }],
  themes: [{ id: 1, name: 'Action' }, { id: 17, name: 'Fantasy' }, { id: 18, name: 'Sci-fi' }],
}

describe('SimilarFocusPicker', () => {
  it('renders nothing when the game has no genres or themes', () => {
    const { container } = render(<SimilarFocusPicker game={{ id: 1, name: 'x' }} selected={[]} onChange={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('toggles a tag on click', () => {
    const onChange = vi.fn()
    render(<SimilarFocusPicker game={game} selected={[]} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: /Shooter/ }))
    expect(onChange).toHaveBeenCalledWith([{ kind: 'genre', id: 5, name: 'Shooter' }])
  })

  it('removes a selected tag when clicked again', () => {
    const onChange = vi.fn()
    const selected = [{ kind: 'genre', id: 5, name: 'Shooter' }]
    render(<SimilarFocusPicker game={game} selected={selected} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: /Shooter/ }))
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('limits selection to 4 and disables the remaining tags', () => {
    const selected = getFocusOptions(game).slice(0, 4)
    const onChange = vi.fn()
    render(<SimilarFocusPicker game={game} selected={selected} onChange={onChange} />)
    expect(screen.getByText('4/4 selected')).toBeInTheDocument()
    const fifth = screen.getByRole('button', { name: /Sci-fi/ })
    expect(fifth).toBeDisabled()
    fireEvent.click(fifth)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('clears the selection', () => {
    const onChange = vi.fn()
    render(<SimilarFocusPicker game={game} selected={[{ kind: 'theme', id: 1, name: 'Action' }]} onChange={onChange} />)
    fireEvent.click(screen.getByText('Clear selection'))
    expect(onChange).toHaveBeenCalledWith([])
  })
})

describe('toFocusPayload', () => {
  it('is undefined when nothing is selected', () => {
    expect(toFocusPayload([])).toBeUndefined()
  })
  it('splits genres and themes', () => {
    expect(
      toFocusPayload([
        { kind: 'genre', id: 5, name: 'a' },
        { kind: 'theme', id: 1, name: 'b' },
      ])
    ).toEqual({ genres: [5], themes: [1] })
  })
})
