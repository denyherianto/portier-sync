import { NextRequest } from 'next/server'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { integrations, syncHistories, syncHistoryChanges } from '@/lib/db/schema'
import { isConflictChange, mapSyncStatusToIntegrationStatus } from '@/lib/syncHistory'
import type { ResolveSyncHistoryPayload } from '@/types'

export const runtime = 'nodejs'

type Params = { params: Promise<{ historyId: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { historyId } = await params
    const body: unknown = await request.json()
    const parsedBody = body as Partial<ResolveSyncHistoryPayload>

    if (typeof body !== 'object' || body === null || !Array.isArray(parsedBody.resolutions)) {
      return Response.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const normalizedResolutions = parsedBody.resolutions
      .map((resolution) => ({
        changeId: resolution.changeId?.trim(),
        chosenValue: resolution.chosenValue,
      }))
      .filter((resolution) => typeof resolution.changeId === 'string' && resolution.changeId.length > 0 && typeof resolution.chosenValue === 'string')

    if (normalizedResolutions.length === 0) {
      return Response.json({ error: 'At least one resolution is required' }, { status: 400 })
    }

    const history = db
      .select()
      .from(syncHistories)
      .where(eq(syncHistories.id, historyId))
      .get()

    if (!history) {
      return Response.json({ error: 'Sync history not found' }, { status: 404 })
    }

    const changes = db
      .select()
      .from(syncHistoryChanges)
      .where(eq(syncHistoryChanges.syncHistoryId, historyId))
      .all()

    const conflictChanges = changes.filter(isConflictChange)
    if (history.status !== 'CONFLICT' || conflictChanges.length === 0) {
      return Response.json({ error: 'This Sync History has no active conflicts.' }, { status: 400 })
    }

    const chosenValueByChangeId = new Map(normalizedResolutions.map((resolution) => [resolution.changeId, resolution.chosenValue]))
    const hasMissingResolution = conflictChanges.some((change) => !chosenValueByChangeId.has(change.id))

    if (hasMissingResolution) {
      return Response.json({ error: 'All conflict must be resolved.' }, { status: 400 })
    }

    db.transaction((tx) => {
      // Persist chosen value for every change that has a resolution (conflicts required, clean updates optional)
      for (const [changeId, chosenValue] of chosenValueByChangeId.entries()) {
        tx.update(syncHistoryChanges)
          .set({ chosenValue })
          .where(eq(syncHistoryChanges.id, changeId))
          .run()
      }

      tx.update(syncHistories)
        .set({ status: 'SUCCESS' })
        .where(eq(syncHistories.id, historyId))
        .run()

      const latestHistory = tx
        .select()
        .from(syncHistories)
        .where(eq(syncHistories.integrationId, history.integrationId))
        .orderBy(desc(syncHistories.syncedAt))
        .get()

      tx.update(integrations)
        .set({
          status: latestHistory ? mapSyncStatusToIntegrationStatus(latestHistory.status) : 'NOT_SYNCED',
          updatedAt: new Date(),
        })
        .where(eq(integrations.id, history.integrationId))
        .run()
    })

    const updatedHistory = db
      .select()
      .from(syncHistories)
      .where(eq(syncHistories.id, historyId))
      .get()

    if (!updatedHistory) {
      return Response.json({ error: 'Sync History not found!' }, { status: 404 })
    }

    const updatedChanges = db
      .select()
      .from(syncHistoryChanges)
      .where(eq(syncHistoryChanges.syncHistoryId, historyId))
      .all()

    return Response.json({ ...updatedHistory, changes: updatedChanges })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return Response.json({ error: message }, { status: 500 })
  }
}
