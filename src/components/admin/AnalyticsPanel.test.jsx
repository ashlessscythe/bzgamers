import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AnalyticsPanel from './AnalyticsPanel'

const emptyTables = {
  topMoods: [],
  topSearches: [],
  topSimilarSeeds: [],
  topTimes: [],
  topGenres: [],
}

const baseStats = {
  totalEvents: 3,
  uniqueVisitors: 2,
  moodSearches: 1,
  gameSearches: 1,
  similarSearches: 1,
  anonymousEvents: 2,
}

describe('AnalyticsPanel', () => {
  it('renders stats and empty table placeholders', () => {
    render(
      <AnalyticsPanel
        stats={baseStats}
        tables={emptyTables}
        events={[]}
        days={30}
        onDaysChange={vi.fn()}
        onRefresh={vi.fn()}
        isLoading={false}
      />
    )

    expect(screen.getByText('Unique visitors')).toBeInTheDocument()
    expect(screen.getByText('Mood searches')).toBeInTheDocument()
    expect(screen.getByText('No mood searches yet')).toBeInTheDocument()
    expect(screen.getAllByText('No visitor activity recorded yet').length).toBeGreaterThan(0)
  })

  it('renders ranked rows and recent event summaries', () => {
    render(
      <AnalyticsPanel
        stats={baseStats}
        tables={{
          ...emptyTables,
          topMoods: [{ label: 'Energetic', count: 4 }],
          topSearches: [{ label: 'hades', count: 2 }],
        }}
        events={[
          {
            id: 1,
            eventType: 'mood_search',
            moodLabel: 'Energetic',
            timeLabel: '< 30 min',
            visitorId: 'abcdefghijklmnop',
            user: null,
            resultCount: 12,
            createdAt: '2026-07-27T12:00:00.000Z',
          },
          {
            id: 2,
            eventType: 'game_search',
            searchQuery: 'hades',
            visitorId: 'qrstuvwxyzabcdef',
            user: { name: 'Alex', email: 'a@b.com' },
            resultCount: 5,
            createdAt: '2026-07-27T12:05:00.000Z',
          },
        ]}
        days={7}
        onDaysChange={vi.fn()}
        onRefresh={vi.fn()}
        isLoading={false}
      />
    )

    expect(screen.getAllByText('Energetic').length).toBeGreaterThan(0)
    expect(screen.getAllByText('hades').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Energetic · < 30 min/).length).toBeGreaterThan(0)
    expect(screen.getAllByText('"hades"').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Alex').length).toBeGreaterThan(0)
  })

  it('calls refresh and days change handlers', () => {
    const onRefresh = vi.fn()
    const onDaysChange = vi.fn()

    render(
      <AnalyticsPanel
        stats={baseStats}
        tables={emptyTables}
        events={[]}
        days={30}
        onDaysChange={onDaysChange}
        onRefresh={onRefresh}
        isLoading={false}
      />
    )

    fireEvent.click(screen.getByTestId('analytics-refresh'))
    expect(onRefresh).toHaveBeenCalledTimes(1)

    fireEvent.change(screen.getByTestId('analytics-days'), { target: { value: '7' } })
    expect(onDaysChange).toHaveBeenCalledWith(7)
  })
})
