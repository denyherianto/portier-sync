import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { syncHistoryKeys } from '@/lib/queryKeys'
import type { SyncHistory } from '@/types'

export function useSyncHistoriesQuery(integrationId: string) {
  return useQuery({
    queryKey: syncHistoryKeys.byIntegration(integrationId),
    queryFn: () => apiClient.get<SyncHistory[]>(`/api/sync-histories?integrationId=${integrationId}`),
    enabled: Boolean(integrationId),
  })
}
