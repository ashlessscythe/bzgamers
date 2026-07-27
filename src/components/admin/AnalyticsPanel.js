"use client"

import { motion } from 'framer-motion'

const EVENT_LABELS = {
  mood_search: 'Mood search',
  game_search: 'Typed search',
  similar_search: 'Games like this',
  favorite_add: 'Favorite',
}

function formatEventSummary(event) {
  switch (event.eventType) {
    case 'mood_search':
      return [event.moodLabel || event.mood, event.timeLabel || event.timeAvailable, event.genreLabel || event.genre]
        .filter(Boolean)
        .join(' · ') || 'Mood search'
    case 'game_search':
      return event.searchQuery ? `"${event.searchQuery}"` : 'Empty query'
    case 'similar_search':
      return event.gameName || (event.gameId ? `Game #${event.gameId}` : 'Similar games')
    case 'favorite_add':
      return event.gameName || (event.gameId ? `Game #${event.gameId}` : 'Favorite')
    default:
      return event.eventType
  }
}

function RankTable({ title, rows, emptyLabel }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      </div>
      {rows.length === 0 ? (
        <p className="p-4 text-sm text-gray-500 dark:text-gray-400">{emptyLabel}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Value
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Count
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {rows.map((row) => (
                <tr key={row.label} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-2 text-gray-900 dark:text-gray-100 truncate max-w-xs" title={row.label}>
                    {row.label}
                  </td>
                  <td className="px-4 py-2 text-right font-medium text-gray-700 dark:text-gray-300">
                    {row.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function AnalyticsPanel({
  stats,
  tables,
  events,
  days,
  onDaysChange,
  onRefresh,
  isLoading,
}) {
  const statCards = [
    { label: 'Events', value: stats.totalEvents, color: 'text-primary' },
    { label: 'Unique visitors', value: stats.uniqueVisitors, color: 'text-blue-600' },
    { label: 'Mood searches', value: stats.moodSearches, color: 'text-green-600' },
    { label: 'Typed searches', value: stats.gameSearches, color: 'text-orange-600' },
    { label: 'Games like this', value: stats.similarSearches, color: 'text-purple-600' },
    { label: 'Anonymous events', value: stats.anonymousEvents, color: 'text-gray-600' },
  ]

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Range
          <select
            value={days}
            onChange={(e) => onDaysChange(Number(e.target.value))}
            className="ml-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </label>
        <button onClick={onRefresh} className="btn-secondary px-6 py-2" disabled={isLoading}>
          {isLoading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4"
          >
            <h3 className="text-xs text-gray-600 dark:text-gray-400 mb-1">{card.label}</h3>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value ?? 0}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        <RankTable
          title="Top moods selected"
          rows={tables.topMoods || []}
          emptyLabel="No mood searches yet"
        />
        <RankTable
          title="What people type to search"
          rows={tables.topSearches || []}
          emptyLabel="No typed searches yet"
        />
        <RankTable
          title='"Games like this" seeds'
          rows={tables.topSimilarSeeds || []}
          emptyLabel="No similar-game searches yet"
        />
        <RankTable
          title="Time budgets"
          rows={tables.topTimes || []}
          emptyLabel="No time selections yet"
        />
        <RankTable
          title="Genres chosen"
          rows={tables.topGenres || []}
          emptyLabel="No genre selections yet"
        />
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent activity</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Includes signed-out visitors. Visitor IDs are anonymous fingerprints.
        </p>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3 mb-6">
        {events.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            No visitor activity recorded yet
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  {EVENT_LABELS[event.eventType] || event.eventType}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(event.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-900 dark:text-gray-100 mb-2">
                {formatEventSummary(event)}
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-2">
                <span className="font-mono truncate max-w-[10rem]" title={event.visitorId}>
                  {event.visitorId.slice(0, 8)}…
                </span>
                {event.user ? (
                  <span className="text-blue-600 dark:text-blue-400">
                    {event.user.name || event.user.email}
                  </span>
                ) : (
                  <span>Anonymous</span>
                )}
                {event.resultCount != null && <span>{event.resultCount} results</span>}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  When
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Detail
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Visitor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  User
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Results
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {new Date(event.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      {EVENT_LABELS[event.eventType] || event.eventType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 max-w-md truncate" title={formatEventSummary(event)}>
                    {formatEventSummary(event)}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-500 dark:text-gray-400" title={event.visitorId}>
                    {event.visitorId.slice(0, 10)}…
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {event.user ? (event.user.name || event.user.email) : 'Anonymous'}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                    {event.resultCount ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {events.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No visitor activity recorded yet
            </div>
          )}
        </div>
      </div>
    </>
  )
}
