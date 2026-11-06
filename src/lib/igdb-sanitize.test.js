import { describe, it, expect } from 'vitest'
import { escapeIgdbString, toIgdbId, toIgdbIdList, safeSort, clampInt } from './igdb-sanitize'

describe('igdb-sanitize', () => {
  it('escapes quotes and backslashes', () => {
    expect(escapeIgdbString('a"; where id = 1; "b\\')).toBe('a\\"; where id = 1; \\"b\\\\')
  })
  it('rejects non-integer ids', () => {
    expect(toIgdbId('42')).toBe(42)
    expect(() => toIgdbId('1) | (id > 0')).toThrow()
    expect(() => toIgdbId(-1)).toThrow()
    expect(toIgdbIdList([1, { id: 2 }, 1])).toEqual([1, 2])
    expect(() => toIgdbIdList(['1,2; drop'])).toThrow()
  })
  it('allow-lists sort and clamps ints', () => {
    expect(safeSort('name; limit 500', 'sideways')).toEqual({ sortBy: 'total_rating', sortOrder: 'desc' })
    expect(clampInt('999', 1, 50, 20)).toBe(50)
    expect(clampInt('x', 1, 50, 20)).toBe(20)
  })
})
