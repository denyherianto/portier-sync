import type { IntegrationStatus, SyncStatus } from '@/types'

export const SYNC_STATUS_TO_INTEGRATION_STATUS: Record<SyncStatus, IntegrationStatus> = {
  SUCCESS: 'SYNCED',
  CONFLICT: 'CONFLICT',
  FAILED: 'ERROR',
}
