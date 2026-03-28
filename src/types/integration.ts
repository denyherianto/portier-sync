export type IntegrationStatus = 'NOT_SYNCED' | 'SYNCED' | 'CONFLICT' | 'SYNCING' | 'ERROR'

export type Integration = {
  id: string
  name: string
  slug: string
  color: string
  status: IntegrationStatus
  lastSynced: string | null
  version: string
  createdAt: string
  updatedAt: string
}

export type CreateIntegrationPayload = {
  name: string
  slug: string
  color?: string
  status?: IntegrationStatus
  lastSynced?: string | null
  version: string
}

export type UpdateIntegrationPayload = {
  name?: string
  color?: string
  status?: IntegrationStatus
  lastSynced?: string | null
  version?: string
}
