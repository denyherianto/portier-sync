import { db } from '@/lib/db'
import { integrationCatalog } from '@/lib/db/schema'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const result = db.select().from(integrationCatalog).all()
    return Response.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return Response.json({ error: message }, { status: 500 })
  }
}
