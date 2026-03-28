import { describe, it, expect } from 'vitest'
import {
  isConflictChange,
  isUnresolvedConflictChange,
  hasBlockingConflict,
  hasPendingApproval,
  getUnresolvedConflictChanges,
} from '@/lib/syncHistory'
import type { SyncHistory, SyncHistoryChange } from '@/types'

function makeChange(overrides: Partial<SyncHistoryChange> = {}): SyncHistoryChange {
  return {
    id: 'c1',
    syncHistoryId: 'h1',
    fieldName: 'user.name',
    changeType: 'UPDATE',
    currentValue: 'Sam T.',
    newValue: 'Samuel Turner',
    chosenValue: null,
    ...overrides,
  }
}

function makeHistory(overrides: Partial<SyncHistory> = {}): SyncHistory {
  return {
    id: 'h1',
    integrationId: 'i1',
    syncedAt: new Date().toISOString(),
    status: 'CONFLICT',
    createdAt: new Date().toISOString(),
    changes: [],
    ...overrides,
  }
}

describe('isConflictChange', () => {
  it('returns false for non-UPDATE changes', () => {
    expect(isConflictChange(makeChange({ changeType: 'CREATE' }))).toBe(false)
    expect(isConflictChange(makeChange({ changeType: 'DELETE' }))).toBe(false)
  })

  it('returns false when values look like ISO dates', () => {
    expect(isConflictChange(makeChange({
      currentValue: '2026-04-01T00:00:00Z',
      newValue: '2026-07-01T00:00:00Z',
    }))).toBe(false)
  })

  it('returns false when values are null', () => {
    expect(isConflictChange(makeChange({ currentValue: null, newValue: null }))).toBe(false)
  })
})

describe('isUnresolvedConflictChange', () => {
  it('returns false when chosenValue is set', () => {
    const change = makeChange({ chosenValue: 'Samuel Turner' })
    expect(isUnresolvedConflictChange(change)).toBe(false)
  })
})

describe('hasBlockingConflict', () => {
  it('returns false for null/undefined history', () => {
    expect(hasBlockingConflict(null)).toBe(false)
    expect(hasBlockingConflict(undefined)).toBe(false)
  })

  it('returns false when status is not CONFLICT', () => {
    expect(hasBlockingConflict(makeHistory({ status: 'SUCCESS', changes: [] }))).toBe(false)
  })

  it('returns false when CONFLICT status but no unresolved changes', () => {
    const history = makeHistory({
      status: 'CONFLICT',
      changes: [makeChange({ chosenValue: 'resolved' })],
    })
    expect(hasBlockingConflict(history)).toBe(false)
  })
})

describe('hasPendingApproval', () => {
  it('returns false for null/undefined history', () => {
    expect(hasPendingApproval(null)).toBe(false)
    expect(hasPendingApproval(undefined)).toBe(false)
  })

  it('returns false when status is CONFLICT', () => {
    expect(hasPendingApproval(makeHistory({ status: 'CONFLICT' }))).toBe(false)
  })

  it('returns false when no UPDATE changes without chosenValue', () => {
    const history = makeHistory({
      status: 'SUCCESS',
      changes: [makeChange({ changeType: 'CREATE', chosenValue: null })],
    })
    expect(hasPendingApproval(history)).toBe(false)
  })

  it('returns false when all changes already have chosenValue', () => {
    const history = makeHistory({
      status: 'SUCCESS',
      changes: [makeChange({ chosenValue: 'approved' })],
    })
    expect(hasPendingApproval(history)).toBe(false)
  })
})

describe('getUnresolvedConflictChanges', () => {
  it('returns empty array for null history', () => {
    expect(getUnresolvedConflictChanges(null)).toEqual([])
  })

  it('returns empty array when no changes', () => {
    expect(getUnresolvedConflictChanges(makeHistory({ changes: [] }))).toEqual([])
  })
})
