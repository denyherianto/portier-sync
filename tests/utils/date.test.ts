import { describe, it, expect } from 'vitest'
import { isDateValue, formatRelativeTime } from '@/utils/date'

describe('isDateValue', () => {
  it.each([
    '2026-04-01',
    '2026-04-01T00:00:00Z',
    '2026-04-01T00:00:00.000Z',
    '2026-04-01T00:00:00+07:00',
  ])('returns true for ISO date "%s"', (value) => {
    expect(isDateValue(value)).toBe(true)
  })

  it.each([
    'active',
    'admin',
    '+44 20 1234 5678',
    'john@example.com',
    '',
  ])('returns false for non-date "%s"', (value) => {
    expect(isDateValue(value)).toBe(false)
  })

  it('returns false for null', () => {
    expect(isDateValue(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isDateValue(undefined)).toBe(false)
  })
})

describe('formatRelativeTime', () => {
  it('returns "Never" for null', () => {
    expect(formatRelativeTime(null)).toBe('Never')
  })

  it('returns "Just now" for very recent dates', () => {
    const now = new Date().toISOString()
    expect(formatRelativeTime(now)).toBe('Just now')
  })

  it('returns minutes ago', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60_000).toISOString()
    expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago')
  })

  it('returns singular minute', () => {
    const oneMinuteAgo = new Date(Date.now() - 1 * 60_000).toISOString()
    expect(formatRelativeTime(oneMinuteAgo)).toBe('1 minute ago')
  })

  it('returns hours ago', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3_600_000).toISOString()
    expect(formatRelativeTime(threeHoursAgo)).toBe('3 hours ago')
  })

  it('returns singular hour', () => {
    const oneHourAgo = new Date(Date.now() - 1 * 3_600_000).toISOString()
    expect(formatRelativeTime(oneHourAgo)).toBe('1 hour ago')
  })

  it('returns days ago', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86_400_000).toISOString()
    expect(formatRelativeTime(twoDaysAgo)).toBe('2 days ago')
  })

  it('returns singular day', () => {
    const oneDayAgo = new Date(Date.now() - 1 * 86_400_000).toISOString()
    expect(formatRelativeTime(oneDayAgo)).toBe('1 day ago')
  })
})
