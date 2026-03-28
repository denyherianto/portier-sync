import { int, text, sqliteTable } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import type { UserStatus, DoorStatus, KeyStatus } from '@/types'

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone').notNull(),
  role: text('role').notNull(),
  status: text('status').$type<UserStatus>().notNull().default('active'),
  createdAt: int('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: int('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export type DbUser = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

// ---------------------------------------------------------------------------
// Doors
// ---------------------------------------------------------------------------

export const doors = sqliteTable('doors', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  location: text('location').notNull(),
  deviceId: text('device_id').notNull().unique(),
  status: text('status').$type<DoorStatus>().notNull().default('offline'),
  batteryLevel: int('battery_level').notNull().default(100),
  lastSeen: int('last_seen', { mode: 'timestamp' }),
  createdAt: int('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export type DbDoor = typeof doors.$inferSelect
export type NewDoor = typeof doors.$inferInsert

// ---------------------------------------------------------------------------
// Keys
// ---------------------------------------------------------------------------

export const keys = sqliteTable('keys', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  doorId: text('door_id')
    .notNull()
    .references(() => doors.id),
  keyType: text('key_type').notNull(),
  accessStart: int('access_start', { mode: 'timestamp' }).notNull(),
  accessEnd: int('access_end', { mode: 'timestamp' }).notNull(),
  status: text('status').$type<KeyStatus>().notNull().default('active'),
  createdAt: int('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export type DbKey = typeof keys.$inferSelect
export type NewKey = typeof keys.$inferInsert
