import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { syncHistoryKeys, integrationKeys } from '@/lib/queryKeys'
import type { SyncHistory } from '@/types'

export function useSyncMutation(integrationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => apiClient.post<SyncHistory>(`/api/integrations/${integrationId}/sync`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: syncHistoryKeys.byIntegration(integrationId) })
      queryClient.invalidateQueries({ queryKey: integrationKeys.detail(integrationId) })
      queryClient.invalidateQueries({ queryKey: integrationKeys.lists() })
    },
  })
}
