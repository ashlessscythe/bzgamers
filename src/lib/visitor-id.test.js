// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import { getVisitorId, visitorHeaders } from './visitor-id'

describe('visitor-id', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('creates and reuses a session-scoped visitor id', () => {
    const first = getVisitorId()
    const second = getVisitorId()
    expect(first).toMatch(/^[a-zA-Z0-9_-]{8,64}$/)
    expect(second).toBe(first)
  })

  it('replaces an invalid stored id', () => {
    sessionStorage.setItem('bzgamers-visitor-id', 'bad')
    const id = getVisitorId()
    expect(id).toMatch(/^[a-zA-Z0-9_-]{8,64}$/)
    expect(id).not.toBe('bad')
  })

  it('returns visitor header map when id exists', () => {
    const id = getVisitorId()
    expect(visitorHeaders()).toEqual({ 'x-visitor-id': id })
  })
})
