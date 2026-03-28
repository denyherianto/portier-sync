import type { IntegrationStatus, SyncHistory, SyncHistoryChange, SyncStatus } from '@/types'
import { isSimilarEnoughToConflict } from '@/lib/similarity'
import { INTEGRATION_STATUS } from '@/constants'
import { isDateValue } from '@/utils/date'

export function isConflictChange(change: SyncHistoryChange) {
  if (change.changeType !== 'UPDATE') return false
  if (isDateValue(change.currentValue) || isDateValue(change.newValue)) return false
  return isSimilarEnoughToConflict(change.currentValue, change.newValue)
}

export function isUnresolvedConflictChange(change: SyncHistoryChange) {
  return isConflictChange(change) && (change.chosenValue === null || change.chosenValue === undefined)
}

export function getConflictChanges(history?: SyncHistory | null) {
  return (history?.changes ?? []).filter(isConflictChange)
}

export function getUnresolvedConflictChanges(history?: SyncHistory | null) {
  return (history?.changes ?? []).filter(isUnresolvedConflictChange)
}

export function hasBlockingConflict(history?: SyncHistory | null) {
  return history?.status === 'CONFLICT' && getUnresolvedConflictChanges(history).length > 0
}

export function hasPendingApproval(history?: SyncHistory | null) {
  if (!history || (history.status !== 'SUCCESS' && history.status !== 'CONFLICT_RESOLVED')) return false
  return (history.changes ?? []).some(
    c => c.changeType === 'UPDATE' && !isConflictChange(c) && (c.chosenValue === null || c.chosenValue === undefined)
  )
}

/** Parse entity prefix from field_name (e.g. "user.status" → "user") */
export function entityFromFieldName(fieldName: string): string {
  const dot = fieldName.indexOf('.')
  return dot === -1 ? fieldName : fieldName.slice(0, dot)
}

/** Readable label for an entity prefix */
export function entityLabel(entity: string): string {
  return entity.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export function mapSyncStatusToIntegrationStatus(status: SyncStatus): IntegrationStatus {
  return INTEGRATION_STATUS[status]
}
