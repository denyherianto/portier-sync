import { NextRequest } from 'next/server'
import { eq, and, isNotNull, isNull } from 'drizzle-orm'
import { db } from '@/lib/db'
import { syncHistoryChanges, syncHistories, integrations } from '@/lib/db/schema'

export const runtime = 'nodejs'

type Params = { params: Promise<{ changeId: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { changeId } = await params
    const { chosenValue }: { chosenValue: string } = await request.json()

    const updated = db
      .update(syncHistoryChanges)
      .set({ chosenValue })
      .where(eq(syncHistoryChanges.id, changeId))
      .returning()
      .get()

    if (!updated) {
      return Response.json({ error: 'Sync History Changes not found!' }, { status: 404 })
    }

    // Check if all conflict changes in this history are now resolved
    const unresolvedConflicts = db
      .select()
      .from(syncHistoryChanges)
      .where(
        and(
          eq(syncHistoryChanges.syncHistoryId, updated.syncHistoryId),
          isNotNull(syncHistoryChanges.newValue),
          isNull(syncHistoryChanges.chosenValue)
        )
      )
      .all()

    if (unresolvedConflicts.length === 0) {
      // All conflicts resolved — mark history as SUCCESS and integration as SYNCED
      const history = db
        .update(syncHistories)
        .set({ status: 'SUCCESS' })
        .where(eq(syncHistories.id, updated.syncHistoryId))
        .returning()
        .get()

      if (history) {
        db.update(integrations)
          .set({ status: 'SYNCED', lastSynced: history.syncedAt, updatedAt: new Date() })
          .where(eq(integrations.id, history.integrationId))
          .run()
      }
    }

    return Response.json(updated)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return Response.json({ error: message }, { status: 500 })
  }
}
