"use client"

import { useCallback, useEffect, useState } from 'react'

function formatTime(ms) {
  return ms ? new Date(ms).toLocaleString() : '—'
}

function formatRemaining(seconds) {
  if (seconds == null) return '—'
  if (seconds <= 0) return 'expired'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function Row({ label, children }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0 text-sm">
      <dt className="text-gray-600 dark:text-gray-400">{label}</dt>
      <dd className="font-medium text-gray-900 dark:text-gray-100 text-right">{children}</dd>
    </div>
  )
}

function Flag({ ok, yes = 'Set', no = 'Missing' }) {
  return (
    <span className={ok ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
      {ok ? yes : no}
    </span>
  )
}

export default function TwitchStatusPanel() {
  const [status, setStatus] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/twitch-status')
      if (!res.ok) throw new Error(`Request failed (${res.status})`)
      setStatus(await res.json())
    } catch (err) {
      setError(err.message || 'Failed to load status')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const failing = status?.health?.consecutiveFailures > 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Twitch / IGDB token</h2>
        <button onClick={load} disabled={isLoading} className="btn-secondary text-sm py-1 px-3">
          {isLoading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>}

      {status && (
        <>
          {failing && (
            <p role="alert" className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-3 py-2 text-sm">
              Token requests are failing ({status.health.consecutiveFailures} in a row). Game search will
              stop working once the cached token expires.
            </p>
          )}
          <dl>
            <Row label="Client ID"><Flag ok={status.config.clientIdSet} /></Row>
            <Row label="Client secret"><Flag ok={status.config.clientSecretSet} /></Row>
            <Row label="Failure alert email">
              <Flag ok={status.config.alertEmailSet} yes="ADMIN_ALERT_EMAIL set" no="Not configured" />
            </Row>
            <Row label="Cached token">
              <Flag ok={status.token.present} yes="Present" no="None cached" />
            </Row>
            <Row label="Token expires in">{formatRemaining(status.token.secondsRemaining)}</Row>
            <Row label="Token obtained">{formatTime(status.token.createdAt)}</Row>
            <Row label="Last successful fetch">{formatTime(status.health.lastSuccessAt)}</Row>
            <Row label="Consecutive failures">{status.health.consecutiveFailures}</Row>
            {status.health.lastFailure && (
              <Row label="Last failure">
                {formatTime(status.health.lastFailure.at)}
                {status.health.lastFailure.status ? ` · HTTP ${status.health.lastFailure.status}` : ''}
                <span className="block text-xs font-normal text-gray-500 dark:text-gray-400 break-all">
                  {status.health.lastFailure.message}
                </span>
              </Row>
            )}
            <Row label="Last alert sent">{formatTime(status.health.lastAlertAt)}</Row>
          </dl>
        </>
      )}
    </div>
  )
}
