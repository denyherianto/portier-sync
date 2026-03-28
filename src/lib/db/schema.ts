import { int, text, sqliteTable } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import type { IntegrationStatus, SyncStatus, ChangeType } from '@/types'

// ---------------------------------------------------------------------------
// Integration Catalog
// ---------------------------------------------------------------------------

export const integrationCatalog = sqliteTable('integration_catalog', {
  id: text('id').primaryKey(), // human-readable slug, e.g. "salesforce"
  name: text('name').notNull(), // display name, e.g. "Salesforce"
  color: text('color').notNull().default('#6b7280'),
  // false for the 6 built-in entries; true for user-created custom ones
  isCustom: int('is_custom', { mode: 'boolean' }).notNull().default(false),
})

export type DbIntegrationCatalog = typeof integrationCatalog.$inferSelect
export type NewIntegrationCatalog = typeof integrationCatalog.$inferInsert

// ---------------------------------------------------------------------------
// Integrations
// ---------------------------------------------------------------------------

export const integrations = sqliteTable('integrations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  color: text('color').notNull().default('#6b7280'),
  status: text('status').$type<IntegrationStatus>().notNull().default('synced'),
  lastSynced: int('last_synced', { mode: 'timestamp' }),
  version: text('version').notNull(),
  createdAt: int('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: int('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export type DbIntegration = typeof integrations.$inferSelect
export type NewIntegration = typeof integrations.$inferInsert

// ---------------------------------------------------------------------------
// Sync Histories
// ---------------------------------------------------------------------------

export const syncHistories = sqliteTable('sync_histories', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  integrationId: text('integration_id')
    .notNull()
    .references(() => integrations.id, { onDelete: 'cascade' }),
  syncedAt: int('synced_at', { mode: 'timestamp' }).notNull(),
  status: text('status').$type<SyncStatus>().notNull(),
  createdAt: int('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export type DbSyncHistory = typeof syncHistories.$inferSelect
export type NewSyncHistory = typeof syncHistories.$inferInsert

// ---------------------------------------------------------------------------
// Sync History Changes
// ---------------------------------------------------------------------------

export const syncHistoryChanges = sqliteTable('sync_history_changes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  syncHistoryId: text('sync_history_id')
    .notNull()
    .references(() => syncHistories.id, { onDelete: 'cascade' }),
  fieldName: text('field_name').notNull(),
  changeType: text('change_type').$type<ChangeType>().notNull(),
  // the value before this change (current state at time of sync)
  currentValue: text('current_value'),
  // the incoming value being applied (UPDATE only)
  newValue: text('new_value'),
  // the value a user selected during conflict resolution (non-null = CONFLICT status)
  chosenValue: text('chosen_value'),
})

export type DbSyncHistoryChange = typeof syncHistoryChanges.$inferSelect
export type NewSyncHistoryChange = typeof syncHistoryChanges.$inferInsert
