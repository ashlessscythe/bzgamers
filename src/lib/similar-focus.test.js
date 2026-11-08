import { describe, it, expect } from 'vitest'
import { parseFocus, applyFocus, focusKey, MAX_FOCUS_TAGS } from './similar-focus'

const base = {
  id: 1,
  genres: [{ id: 5 }, { id: 12 }, { id: 31 }],
  themes: [{ id: 1 }, { id: 17 }, { id: 18 }],
}

describe('parseFocus', () => {
  it('returns null for missing/empty/invalid focus', () => {
    expect(parseFocus(undefined, base)).toBeNull()
    expect(parseFocus('x', base)).toBeNull()
    expect(parseFocus({ genres: [], themes: [] }, base)).toBeNull()
  })

  it('keeps only tags that belong to the seed game and dedupes', () => {
    expect(parseFocus({ genres: [5, 5, 999, '12'], themes: [17, 2] }, base)).toEqual({
      genres: [5, 12],
      themes: [17],
    })
  })

  it('ignores junk values', () => {
    expect(parseFocus({ genres: ['abc', null, -1, {}], themes: [] }, base)).toBeNull()
  })

  it(`caps the total at ${MAX_FOCUS_TAGS}`, () => {
    const focus = parseFocus({ genres: [5, 12, 31], themes: [1, 17, 18] }, base)
    expect(focus.genres.length + focus.themes.length).toBe(MAX_FOCUS_TAGS)
    expect(focus.genres).toEqual([5, 12, 31])
    expect(focus.themes).toEqual([1])
  })
})

describe('applyFocus / focusKey', () => {
  it('replaces genres and themes with the focus', () => {
    const out = applyFocus(base, { genres: [5], themes: [] })
    expect(out.genres).toEqual([5])
    expect(out.themes).toEqual([])
    expect(out.id).toBe(1)
  })

  it('returns the base game when there is no focus', () => {
    expect(applyFocus(base, null)).toBe(base)
  })

  it('builds an order-independent cache key', () => {
    expect(focusKey({ genres: [12, 5], themes: [3] })).toBe(focusKey({ genres: [5, 12], themes: [3] }))
    expect(focusKey(null)).toBe('')
  })
})
