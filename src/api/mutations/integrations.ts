import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { integrationKeys } from '@/lib/queryKeys'
import type { Integration, CreateIntegrationPayload, UpdateIntegrationPayload } from '@/types'

export function useCreateIntegrationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateIntegrationPayload) =>
      apiClient.post<Integration>('/api/integrations', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.lists() })
    },
  })
}

export function useUpdateIntegrationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateIntegrationPayload }) =>
      apiClient.patch<Integration>(`/api/integrations/${id}`, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: integrationKeys.detail(id) })
      await queryClient.cancelQueries({ queryKey: integrationKeys.lists() })

      const previousIntegration = queryClient.getQueryData<Integration>(integrationKeys.detail(id))
      const previousIntegrations = queryClient.getQueryData<Integration[]>(integrationKeys.lists())

      if (previousIntegration) {
        queryClient.setQueryData<Integration>(integrationKeys.detail(id), {
          ...previousIntegration,
          ...payload,
        })
      }
      if (previousIntegrations) {
        queryClient.setQueryData<Integration[]>(
          integrationKeys.lists(),
          previousIntegrations.map(i => (i.id === id ? { ...i, ...payload } : i))
        )
      }

      return { previousIntegration, previousIntegrations }
    },
    onError: (_err, { id }, context) => {
      if (context?.previousIntegration) {
        queryClient.setQueryData(integrationKeys.detail(id), context.previousIntegration)
      }
      if (context?.previousIntegrations) {
        queryClient.setQueryData(integrationKeys.lists(), context.previousIntegrations)
      }
    },
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: integrationKeys.lists() })
    },
  })
}

export function useDeleteIntegrationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.delete<undefined>(`/api/integrations/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: integrationKeys.lists() })

      const previousIntegrations = queryClient.getQueryData<Integration[]>(integrationKeys.lists())
      if (previousIntegrations) {
        queryClient.setQueryData<Integration[]>(
          integrationKeys.lists(),
          previousIntegrations.filter(i => i.id !== id)
        )
      }

      return { previousIntegrations }
    },
    onError: (_err, _id, context) => {
      if (context?.previousIntegrations) {
        queryClient.setQueryData(integrationKeys.lists(), context.previousIntegrations)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.lists() })
    },
  })
}
