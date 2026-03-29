import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import path from 'node:path'
import { getDatabaseUrl } from './url'

export async function runMigrations(): Promise<void> {
  const client = postgres(getDatabaseUrl(), { max: 1 })
  try {
    const db = drizzle(client)
    await migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle') })
  } finally {
    await client.end()
  }
}
