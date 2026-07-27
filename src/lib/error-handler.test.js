// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  ERROR_TYPES,
  createError,
  handleApiError,
  getUserFriendlyMessage,
  logError,
} from './error-handler'

describe('error-handler', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates a standardized error with defaults', () => {
    const err = createError()
    expect(err.type).toBe(ERROR_TYPES.UNKNOWN)
    expect(err.userMessage).toMatch(/unexpected/i)
    expect(err.timestamp).toBeTruthy()
  })

  it('maps network and status codes to error types', () => {
    expect(handleApiError({ message: 'network down' }).type).toBe(ERROR_TYPES.NETWORK)
    expect(handleApiError({ status: 401, message: 'nope' }).type).toBe(ERROR_TYPES.AUTH)
    expect(handleApiError({ status: 404, message: 'missing' }).type).toBe(ERROR_TYPES.NOT_FOUND)
    expect(handleApiError({ status: 400, message: 'bad' }).type).toBe(ERROR_TYPES.VALIDATION)
    expect(handleApiError({ status: 500, message: 'boom' }).type).toBe(ERROR_TYPES.API)
  })

  it('returns user-friendly messages from typed errors', () => {
    expect(getUserFriendlyMessage({ userMessage: 'Custom' })).toBe('Custom')
    expect(getUserFriendlyMessage({ type: ERROR_TYPES.NOT_FOUND })).toMatch(/not found/i)
    expect(getUserFriendlyMessage({})).toMatch(/unexpected/i)
  })

  it('logs errors without throwing', () => {
    expect(() => logError({ type: ERROR_TYPES.API }, 'tests')).not.toThrow()
    expect(console.error).toHaveBeenCalled()
  })
})
