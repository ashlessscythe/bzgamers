'use client'

import { MAX_FOCUS_TAGS } from '../lib/similar-focus'

/** Build the picker's tag list from a game's genres and themes. */
export function getFocusOptions(game) {
  const toTags = (items, kind) =>
    (Array.isArray(items) ? items : [])
      .filter((i) => i && typeof i === 'object' && i.id && i.name)
      .map((i) => ({ kind, id: i.id, name: i.name }))
  return [...toTags(game?.genres, 'genre'), ...toTags(game?.themes, 'theme')]
}

/** Shape sent to /api/similar-games. */
export function toFocusPayload(tags) {
  if (!tags?.length) return undefined
  return {
    genres: tags.filter((t) => t.kind === 'genre').map((t) => t.id),
    themes: tags.filter((t) => t.kind === 'theme').map((t) => t.id),
  }
}

/**
 * Lets the user narrow "games like X" to up to MAX_FOCUS_TAGS of X's own
 * genres/themes. Selecting nothing keeps the default similarity ranking.
 */
export default function SimilarFocusPicker({ game, selected, onChange, max = MAX_FOCUS_TAGS }) {
  const options = getFocusOptions(game)
  if (options.length === 0) return null

  const isSelected = (tag) => selected.some((t) => t.kind === tag.kind && t.id === tag.id)
  const atLimit = selected.length >= max

  const toggle = (tag) => {
    if (isSelected(tag)) {
      onChange(selected.filter((t) => !(t.kind === tag.kind && t.id === tag.id)))
    } else if (!atLimit) {
      onChange([...selected, tag])
    }
  }

  return (
    <section
      aria-label={`Narrow down games like ${game.name}`}
      className="mb-6 rounded-lg border border-gray-200 dark:border-gray-600 p-4 bg-gray-50 dark:bg-gray-700/50"
    >
      <div className="flex items-baseline justify-between gap-4 mb-1">
        <h3 className="font-semibold">What do you like about {game.name}?</h3>
        <span className="text-sm text-gray-600 dark:text-gray-400" aria-live="polite">
          {selected.length}/{max} selected
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        Optional: pick up to {max} tags to focus on, or skip to match the game overall.
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((tag) => {
          const active = isSelected(tag)
          const disabled = !active && atLimit
          return (
            <button
              key={`${tag.kind}-${tag.id}`}
              type="button"
              aria-pressed={active}
              disabled={disabled}
              onClick={() => toggle(tag)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                active
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-500 hover:border-primary'
              } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <span className="sr-only">{tag.kind === 'genre' ? 'Genre: ' : 'Theme: '}</span>
              {tag.name}
            </button>
          )
        })}
      </div>
      {selected.length > 0 && (
        <button
          type="button"
          onClick={() => onChange([])}
          className="mt-3 text-sm text-primary hover:underline"
        >
          Clear selection
        </button>
      )}
    </section>
  )
}
