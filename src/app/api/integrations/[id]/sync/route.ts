import { NextRequest } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { integrations, syncHistories, syncHistoryChanges } from '@/lib/db/schema'
import type { SyncStatus, ChangeType, CommonResponse } from '@/types'
import { isSimilarEnoughToConflict } from '@/lib/similarity'

export const runtime = 'nodejs'

type Params = { params: Promise<{ id: string }> }

interface ExternalChange {
  id?: string
  field_name: string
  change_type: string
  current_value?: string | null
  new_value?: string | null
  chosen_value?: string | null
}

interface ExternalSyncResponse {
  application_name?: string
  synced_at?: string
  sync_approval?: {
    changes?: ExternalChange[]
  }
}

export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params

    const [integration] = await db.select().from(integrations).where(eq(integrations.id, id))
    if (!integration) {
      return Response.json({ error: 'Integration not found' }, { status: 404 })
    }

    // Call external sync API using the integration slug as the application_id
    const externalUrl = `https://portier-takehometest.onrender.com/api/v1/data/sync?application_id=${integration.slug}`
    let status: SyncStatus = 'SUCCESS'
    let externalChanges: ExternalChange[] = []
    let syncedAt = new Date()

    try {
      const res = await fetch(externalUrl, { cache: 'no-store' })
      if (!res.ok) {
        status = 'FAILED'
      } else {
        const response: CommonResponse<ExternalSyncResponse, unknown> = await res.json()
        const data = response.data
        externalChanges = data?.sync_approval?.changes ?? []
        if (data?.synced_at) syncedAt = new Date(data.synced_at)

        const hasConflict = externalChanges.some(
          (change) => change.change_type === 'UPDATE' && isSimilarEnoughToConflict(change.current_value, change.new_value)
        )
        if (hasConflict) status = 'CONFLICT'
      }
    } catch {
      status = 'FAILED'
    }

    // Persist sync history
    const [history] = await db
      .insert(syncHistories)
      .values({ integrationId: id, syncedAt, status })
      .returning()

    if (externalChanges.length > 0) {
      await db.insert(syncHistoryChanges)
        .values(
          externalChanges.map(c => ({
            syncHistoryId: history.id,
            fieldName: c.field_name,
            changeType: (c.change_type as ChangeType) ?? 'UPDATE',
            currentValue: c.current_value ?? null,
            newValue: c.new_value ?? null,
            chosenValue: c.chosen_value ?? null,
          }))
        )
    }

    // Update integration status and lastSynced
    const newIntegrationStatus =
      status === 'SUCCESS' ? 'SYNCED' :
        status === 'CONFLICT' ? 'CONFLICT' :
          'ERROR'

    await db.update(integrations)
      .set({
        status: newIntegrationStatus,
        lastSynced: syncedAt,
        updatedAt: new Date(),
      })
      .where(eq(integrations.id, id))

    const changes = await db
      .select()
      .from(syncHistoryChanges)
      .where(eq(syncHistoryChanges.syncHistoryId, history.id))

    return Response.json({ ...history, changes })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return Response.json({ error: message }, { status: 500 })
  }
}
