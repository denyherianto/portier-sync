import type { IntegrationStatus, SyncStatus } from '@/types'

export const INTEGRATION_STATUS: Record<SyncStatus, IntegrationStatus> = {
  SUCCESS: 'SYNCED',
  CONFLICT_RESOLVED: 'SYNCED',
  CONFLICT: 'CONFLICT',
  FAILED: 'ERROR',
}
