export type SyncStatus = 'SUCCESS' | 'FAILED' | 'CONFLICT'

export type ChangeType = 'CREATE' | 'UPDATE' | 'DELETE'

export interface SyncHistoryChange {
  id: string
  syncHistoryId: string
  fieldName: string
  changeType: ChangeType
  currentValue: string | null
  // present on UPDATE; absent on CREATE/DELETE
  newValue?: string | null
  // present when a conflict was resolved; absent on clean syncs
  chosenValue?: string | null
}

export interface SyncHistory {
  id: string
  integrationId: string
  syncedAt: string
  status: SyncStatus
  createdAt: string
  changes?: SyncHistoryChange[]
}

export interface CreateSyncHistoryPayload {
  integrationId: string
  syncedAt: string
  status: SyncStatus
  changes: Array<{
    fieldName: string
    changeType: ChangeType
    currentValue?: string | null
    newValue?: string | null
    chosenValue?: string | null
  }>
}
