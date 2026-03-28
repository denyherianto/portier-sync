import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { integrationKeys } from '@/lib/queryKeys'
import type { Integration, IntegrationStatus } from '@/types'

export function useIntegrationsQuery(status?: IntegrationStatus) {
  const params = status ? `?status=${status}` : ''
  return useQuery({
    queryKey: integrationKeys.lists(),
    queryFn: () => apiClient.get<Integration[]>(`/api/integrations${params}`),
  })
}

export function useIntegrationQuery(id: string) {
  return useQuery({
    queryKey: integrationKeys.detail(id),
    queryFn: () => apiClient.get<Integration>(`/api/integrations/${id}`),
    enabled: Boolean(id),
  })
}
