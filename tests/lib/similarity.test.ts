import { describe, it, expect } from 'vitest'
import { isSimilarEnoughToConflict } from '@/lib/similarity'

describe('isSimilarEnoughToConflict', () => {
  it('returns false when values are identical', () => {
    expect(isSimilarEnoughToConflict('active', 'active')).toBe(false)
  })

  it('returns false when either value is null', () => {
    expect(isSimilarEnoughToConflict(null, 'active')).toBe(false)
    expect(isSimilarEnoughToConflict('active', null)).toBe(false)
  })

  it('returns false when either value is undefined', () => {
    expect(isSimilarEnoughToConflict(undefined, 'active')).toBe(false)
    expect(isSimilarEnoughToConflict('active', undefined)).toBe(false)
  })

  it('returns false when either value is empty string', () => {
    expect(isSimilarEnoughToConflict('', 'active')).toBe(false)
    expect(isSimilarEnoughToConflict('active', '')).toBe(false)
  })

})
