import { NextRequest } from 'next/server'
import { eq, desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { syncHistories, syncHistoryChanges } from '@/lib/db/schema'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const integrationId = searchParams.get('integrationId')

    if (!integrationId) {
      return Response.json({ error: 'integrationId is required' }, { status: 400 })
    }

    const histories = await db
      .select()
      .from(syncHistories)
      .where(eq(syncHistories.integrationId, integrationId))
      .orderBy(desc(syncHistories.syncedAt))

    const historiesWithChanges = await Promise.all(
      histories.map(async (h) => ({
        ...h,
        changes: await db
          .select()
          .from(syncHistoryChanges)
          .where(eq(syncHistoryChanges.syncHistoryId, h.id)),
      }))
    )

    return Response.json(historiesWithChanges)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return Response.json({ error: message }, { status: 500 })
  }
}
