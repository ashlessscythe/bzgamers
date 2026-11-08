import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PreferencesPanel from './PreferencesPanel'

describe('PreferencesPanel', () => {
  let fetchMock
  beforeEach(() => {
    fetchMock = vi.fn(async (url, options) => {
      if (options?.method === 'PUT') return { ok: true, json: async () => ({ success: true }) }
      return { ok: true, json: async () => ({ preferences: { platforms: [{ id: 6, name: 'PC (Windows)' }] } }) }
    })
    vi.stubGlobal('fetch', fetchMock)
  })
  afterEach(() => vi.unstubAllGlobals())

  it('shows saved platforms as pressed', async () => {
    render(<PreferencesPanel />)
    const pc = await screen.findByRole('button', { name: 'PC (Windows)' })
    expect(pc).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Nintendo Switch' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('saves the toggled selection', async () => {
    render(<PreferencesPanel />)
    fireEvent.click(await screen.findByRole('button', { name: 'Nintendo Switch' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save preferences' }))
    await waitFor(() => expect(screen.getByText('Preferences saved.')).toBeInTheDocument())
    const put = fetchMock.mock.calls.find(([, o]) => o?.method === 'PUT')
    expect(JSON.parse(put[1].body)).toEqual({ preferences: { platforms: [6, 130] } })
  })

  it('shows an error when saving fails', async () => {
    fetchMock.mockImplementation(async (url, options) =>
      options?.method === 'PUT'
        ? { ok: false, json: async () => ({}) }
        : { ok: true, json: async () => ({ preferences: { platforms: [] } }) }
    )
    render(<PreferencesPanel />)
    fireEvent.click(await screen.findByRole('button', { name: 'Save preferences' }))
    await waitFor(() => expect(screen.getByText(/Could not save/)).toBeInTheDocument())
  })
})
