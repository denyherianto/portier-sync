import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { catalogKeys } from '@/lib/queryKeys'
import type { IntegrationCatalog } from '@/types'

export function useIntegrationCatalogQuery() {
  return useQuery({
    queryKey: catalogKeys.lists(),
    queryFn: () => apiClient.get<IntegrationCatalog[]>('/api/integration-catalog'),
  })
}
