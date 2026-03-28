import { describe, it, expect } from 'vitest'
import { humanizeFieldName } from '@/utils/field'

describe('humanizeFieldName', () => {
  it('converts snake_case', () => {
    expect(humanizeFieldName('battery_level')).toBe('Battery Level')
  })

  it('converts dot-notation', () => {
    expect(humanizeFieldName('user.battery_level')).toBe('User Battery Level')
  })

  it('capitalizes single word', () => {
    expect(humanizeFieldName('status')).toBe('Status')
  })

  it('handles multiple dots', () => {
    expect(humanizeFieldName('user.profile.email')).toBe('User Profile Email')
  })

  it('handles mixed dots and underscores', () => {
    expect(humanizeFieldName('user.last_name')).toBe('User Last Name')
  })
})
