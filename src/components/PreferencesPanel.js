'use client'

import { useEffect, useState } from 'react'
import { PREFERENCE_PLATFORMS } from '../lib/preferences'

/** Profile section for editing saved preferences (currently: preferred platforms). */
export default function PreferencesPanel() {
  const [platformIds, setPlatformIds] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState(null) // { type: 'success' | 'error', text }

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/preferences')
        if (!res.ok) throw new Error('load failed')
        const data = await res.json()
        if (!cancelled) setPlatformIds((data.preferences?.platforms || []).map((p) => p.id))
      } catch {
        if (!cancelled) setMessage({ type: 'error', text: 'Could not load your preferences.' })
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const toggle = (id) => {
    setMessage(null)
    setPlatformIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  const save = async () => {
    setIsSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: { platforms: platformIds } }),
      })
      if (!res.ok) throw new Error('save failed')
      setMessage({ type: 'success', text: 'Preferences saved.' })
    } catch {
      setMessage({ type: 'error', text: 'Could not save your preferences. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="mb-12" aria-labelledby="preferences-heading">
      <h2 id="preferences-heading" className="text-2xl font-semibold mb-2">My Preferences</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Pick the platforms you play on. We&apos;ll use them as the default platform filter when you search for games.
      </p>

      {isLoading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading preferences…</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Preferred platforms">
            {PREFERENCE_PLATFORMS.map((platform) => {
              const active = platformIds.includes(platform.id)
              return (
                <button
                  key={platform.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle(platform.id)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    active
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-500 hover:border-primary'
                  }`}
                >
                  {platform.name}
                </button>
              )
            })}
          </div>
          <div className="flex items-center gap-4">
            <button type="button" onClick={save} disabled={isSaving} className="btn-primary px-6 py-2 disabled:opacity-50">
              {isSaving ? 'Saving…' : 'Save preferences'}
            </button>
            {message && (
              <p
                role="status"
                className={`text-sm ${message.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
              >
                {message.text}
              </p>
            )}
          </div>
        </>
      )}
    </section>
  )
}
