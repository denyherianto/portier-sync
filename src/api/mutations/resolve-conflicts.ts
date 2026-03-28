import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { syncHistoryKeys, integrationKeys } from '@/lib/queryKeys'
import type { SyncHistoryChange } from '@/types'

export function useResolveChangeMutation(integrationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ changeId, chosenValue }: { changeId: string; chosenValue: string }) =>
      apiClient.patch<SyncHistoryChange>(`/api/sync-history-changes/${changeId}`, { chosenValue }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: syncHistoryKeys.byIntegration(integrationId) })
      queryClient.invalidateQueries({ queryKey: integrationKeys.detail(integrationId) })
      queryClient.invalidateQueries({ queryKey: integrationKeys.lists() })
    },
  })
}
