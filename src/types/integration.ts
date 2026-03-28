export type IntegrationStatus = 'NOT_SYNCED' | 'SYNCED' | 'CONFLICT' | 'SYNCING' | 'ERROR'

export interface Integration {
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

export interface CreateIntegrationPayload {
  name: string
  slug: string
  color?: string
  status?: IntegrationStatus
  lastSynced?: string | null
  version: string
}

export interface UpdateIntegrationPayload {
  name?: string
  color?: string
  status?: IntegrationStatus
  lastSynced?: string | null
  version?: string
}
