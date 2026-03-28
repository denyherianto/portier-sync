import { NextRequest } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { integrations } from '@/lib/db/schema'
import type { CreateIntegrationPayload } from '@/types'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const result = status
      ? db.select().from(integrations).where(eq(integrations.status, status as 'NOT_SYNCED' | 'SYNCED' | 'CONFLICT' | 'SYNCING' | 'ERROR')).all()
      : db.select().from(integrations).all()

    return Response.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return Response.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json()

    if (typeof body !== 'object' || body === null) {
      return Response.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { name, slug, color, status, lastSynced, version } = body as CreateIntegrationPayload

    if (!name || !slug || !version) {
      return Response.json({ error: 'name, slug, and version are required' }, { status: 400 })
    }

    const created = db
      .insert(integrations)
      .values({
        name,
        slug,
        color,
        status,
        lastSynced: lastSynced ? new Date(lastSynced) : null,
        version,
      })
      .returning()
      .get()

    return Response.json(created, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return Response.json({ error: message }, { status: 500 })
  }
}
