export type SyncStatus = 'SUCCESS' | 'FAILED' | 'CONFLICT'

export type ChangeType = 'CREATE' | 'ADD' | 'UPDATE' | 'DELETE'

export type SyncHistoryChange = {
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

export type SyncHistory = {
  id: string
  integrationId: string
  syncedAt: string
  status: SyncStatus
  createdAt: string
  changes?: SyncHistoryChange[]
}

export type CreateSyncHistoryPayload = {
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

export type ResolveSyncHistoryPayload = {
  resolutions: Array<{
    changeId: string
    chosenValue: string
  }>
}
