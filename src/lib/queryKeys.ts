export const catalogKeys = {
  all: ['integration-catalog'] as const,
  lists: () => [...catalogKeys.all, 'list'] as const,
}

export const integrationKeys = {
  all: ['integrations'] as const,
  lists: () => [...integrationKeys.all, 'list'] as const,
  detail: (id: string) => [...integrationKeys.all, 'detail', id] as const,
}
