import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import path from 'node:path'
import fs from 'node:fs'

export function runMigrations(): void {
  const dbPath =
    process.env.DATABASE_PATH ?? path.join(process.cwd(), 'data', 'portier-sync.db')
  const dir = path.dirname(dbPath)

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  const sqlite = new Database(dbPath)
  const db = drizzle(sqlite)
  migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle') })
  sqlite.close()
}
