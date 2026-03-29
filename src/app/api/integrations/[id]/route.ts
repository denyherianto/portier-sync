import { NextRequest } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { integrations } from '@/lib/db/schema'
import type { UpdateIntegrationPayload } from '@/types'

export const runtime = 'nodejs'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const [integration] = await db.select().from(integrations).where(eq(integrations.id, id))

    if (!integration) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    return Response.json(integration)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return Response.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body: unknown = await request.json()

    if (typeof body !== 'object' || body === null) {
      return Response.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { lastSynced, ...rest } = body as UpdateIntegrationPayload
    const dbPayload: Omit<UpdateIntegrationPayload, 'lastSynced'> & { lastSynced?: Date | null; updatedAt: Date } = {
      ...rest,
      updatedAt: new Date(),
      ...(lastSynced !== undefined && { lastSynced: lastSynced ? new Date(lastSynced) : null }),
    }

    const [updated] = await db
      .update(integrations)
      .set(dbPayload)
      .where(eq(integrations.id, id))
      .returning()

    if (!updated) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    return Response.json(updated)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return Response.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const [deleted] = await db.delete(integrations).where(eq(integrations.id, id)).returning()

    if (!deleted) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    return new Response(null, { status: 204 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return Response.json({ error: message }, { status: 500 })
  }
}
