"use client"

import { useCallback, useEffect, useState } from 'react'

const ACTIONS = [
  { id: 'warm', label: 'Warm cache', hint: 'Pre-load genres, platforms and themes from IGDB' },
  { id: 'cleanup-expired', label: 'Remove expired searches', hint: 'Delete search results past their TTL' },
  { id: 'clear-searches', label: 'Clear all searches', hint: 'Delete every cached search result', confirm: true },
]

function formatTime(value) {
  return value ? new Date(value).toLocaleString() : '—'
}

function Row({ label, children }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0 text-sm">
      <dt className="text-gray-600 dark:text-gray-400">{label}</dt>
      <dd className="font-medium text-gray-900 dark:text-gray-100 text-right">{children}</dd>
    </div>
  )
}

export default function CachePanel() {
  const [overview, setOverview] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [busyAction, setBusyAction] = useState(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/cache')
      if (!res.ok) throw new Error(`Request failed (${res.status})`)
      setOverview(await res.json())
    } catch (err) {
      setError(err.message || 'Failed to load cache stats')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const run = async (action) => {
    if (action.confirm && !window.confirm(`${action.label}? ${action.hint}.`)) return
    setBusyAction(action.id)
    setError('')
    setNotice('')
    try {
      const res = await fetch('/api/admin/cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: action.id }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
      setNotice(data.message || 'Done')
      await load()
    } catch (err) {
      setError(err.message || 'Action failed')
    } finally {
      setBusyAction(null)
    }
  }

  const stats = overview?.stats

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-2xl mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Database cache</h2>
        <button onClick={load} disabled={isLoading} className="btn-secondary text-sm py-1 px-3">
          {isLoading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>}
      {notice && <p role="status" className="text-sm text-green-600 dark:text-green-400 mb-3">{notice}</p>}

      {overview && (
        <dl className="mb-5">
          <Row label="Games">{stats.games ?? 0}</Row>
          <Row label="Genres / platforms / themes">
            {stats.genres ?? 0} / {stats.platforms ?? 0} / {stats.themes ?? 0}
          </Row>
          <Row label="Images">{stats.images ?? 0}</Row>
          <Row label="Cached searches">
            {overview.searches.total} ({overview.searches.expired} expired)
          </Row>
          <Row label="Newest search cached">{formatTime(overview.searches.newestAt)}</Row>
          <Row label="Game data last refreshed">
            {formatTime(overview.games.newestUpdatedAt)}
            <span className="block text-xs font-normal text-gray-500 dark:text-gray-400">
              oldest: {formatTime(overview.games.oldestUpdatedAt)}
            </span>
          </Row>
        </dl>
      )}

      <div className="flex flex-wrap gap-2">
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={() => run(action)}
            disabled={busyAction !== null}
            title={action.hint}
            className="btn-secondary text-sm py-1 px-3"
          >
            {busyAction === action.id ? 'Working…' : action.label}
          </button>
        ))}
      </div>
    </div>
  )
}
