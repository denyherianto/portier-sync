import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import path from 'node:path'

export async function runMigrations(): Promise<void> {
  const client = postgres(process.env.DATABASE_URL!, { max: 1 })
  const db = drizzle(client)
  await migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle') })
  await client.end()
}
