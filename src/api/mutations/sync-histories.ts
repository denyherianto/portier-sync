import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { integrationKeys, syncHistoryKeys } from '@/lib/queryKeys'
import type { ResolveSyncHistoryPayload, SyncHistory } from '@/types'

export function useResolveSyncHistoryMutation(integrationId: string, historyId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ResolveSyncHistoryPayload) =>
      apiClient.post<SyncHistory>(`/api/sync-histories/${historyId}/resolve`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: syncHistoryKeys.byIntegration(integrationId) })
      queryClient.invalidateQueries({ queryKey: integrationKeys.detail(integrationId) })
      queryClient.invalidateQueries({ queryKey: integrationKeys.lists() })
    },
  })
}
