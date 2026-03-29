import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import path from 'node:path'

export async function runMigrations(): Promise<void> {
  const client = postgres({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    database: process.env.POSTGRES_DB,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    max: 1,
  })
  try {
    const db = drizzle(client)
    await migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle') })
  } finally {
    await client.end()
  }
}
