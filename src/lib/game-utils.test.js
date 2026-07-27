import { describe, it, expect } from 'vitest'
import {
  getGameId,
  hasResolvableCover,
  normalizeGame,
  getIgdbFallbackUrl,
  getLearnMoreUrl,
  getCoverImageUrl,
  isStaleGameData,
} from './game-utils'

describe('getGameId', () => {
  it('returns game.id when present', () => {
    expect(getGameId({ id: 42 })).toBe(42)
  })

  it('falls back to igdbId', () => {
    expect(getGameId({ igdbId: 99 })).toBe(99)
  })

  it('uses fallbackId when game has no id fields', () => {
    expect(getGameId({}, 7)).toBe(7)
  })

  it('returns null for missing game without fallback', () => {
    expect(getGameId(null)).toBe(null)
  })
})

describe('hasResolvableCover', () => {
  it('returns false for null or numeric cover', () => {
    expect(hasResolvableCover(null)).toBe(false)
    expect(hasResolvableCover(12345)).toBe(false)
  })

  it('returns true when image_id or url is set', () => {
    expect(hasResolvableCover({ image_id: 'co1abc' })).toBe(true)
    expect(hasResolvableCover({ url: '//images.igdb.com/igdb/image/upload/t_thumb/co1abc.jpg' })).toBe(true)
  })
})

describe('normalizeGame', () => {
  it('adds IGDB fallback url when url is missing', () => {
    const result = normalizeGame({ id: 123, name: 'Test Game' }, 123)
    expect(result.url).toBe(getIgdbFallbackUrl(123))
    expect(result.id).toBe(123)
    expect(result.name).toBe('Test Game')
  })

  it('preserves existing url', () => {
    const result = normalizeGame(
      { id: 1, name: 'Foo', url: 'https://www.igdb.com/games/foo' },
      1
    )
    expect(result.url).toBe('https://www.igdb.com/games/foo')
  })
})

describe('getLearnMoreUrl', () => {
  it('returns normalized url or IGDB fallback', () => {
    expect(getLearnMoreUrl({ id: 5, name: 'Bar' }, 5)).toBe(getIgdbFallbackUrl(5))
  })

  it('returns # when no id can be resolved', () => {
    expect(getLearnMoreUrl({}, null)).toBe('#')
  })
})

describe('getCoverImageUrl', () => {
  it('builds URL from image_id', () => {
    const url = getCoverImageUrl({ image_id: 'co1abc' }, 'small')
    expect(url).toBe(
      'https://images.igdb.com/igdb/image/upload/t_cover_small/co1abc.jpg'
    )
  })

  it('rewrites IGDB url size token', () => {
    const url = getCoverImageUrl(
      {
        url: 'https://images.igdb.com/igdb/image/upload/t_thumb/co1abc.jpg',
      },
      'big'
    )
    expect(url).toBe(
      'https://images.igdb.com/igdb/image/upload/t_cover_big/co1abc.jpg'
    )
  })

  it('returns null when cover is not resolvable', () => {
    expect(getCoverImageUrl(null)).toBe(null)
  })
})

describe('isStaleGameData', () => {
  it('treats missing or incomplete snapshots as stale', () => {
    expect(isStaleGameData(null, 1)).toBe(true)
    expect(isStaleGameData({ id: 1, url: 'https://x' }, 1)).toBe(true)
    expect(
      isStaleGameData({ id: 2, url: 'https://x', cover: { image_id: 'a' } }, 1)
    ).toBe(true)
  })

  it('accepts complete snapshots', () => {
    expect(
      isStaleGameData(
        { id: 1, url: 'https://www.igdb.com/games/1', cover: { image_id: 'co1' } },
        1
      )
    ).toBe(false)
  })
})
