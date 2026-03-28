import type { IntegrationStatus, SyncHistory, SyncHistoryChange, SyncStatus } from '@/types'
import { isSimilarEnoughToConflict } from '@/lib/similarity'
import { SYNC_STATUS_TO_INTEGRATION_STATUS } from '@/constants'

export function isConflictChange(change: SyncHistoryChange) {
  return change.changeType === 'UPDATE' && isSimilarEnoughToConflict(change.currentValue, change.newValue)
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
  return SYNC_STATUS_TO_INTEGRATION_STATUS[status]
}
