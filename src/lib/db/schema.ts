import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import type { IntegrationStatus, SyncStatus, ChangeType } from '@/types'

// ---------------------------------------------------------------------------
// Integration Catalog
// ---------------------------------------------------------------------------

export const integrationCatalog = pgTable('integration_catalog', {
  id: text('id').primaryKey(), // human-readable slug, e.g. "salesforce"
  name: text('name').notNull(), // display name, e.g. "Salesforce"
  color: text('color').notNull().default('#6b7280'),
  // false for the 6 built-in entries; true for user-created custom ones
  isCustom: boolean('is_custom').notNull().default(false),
})

export type DbIntegrationCatalog = typeof integrationCatalog.$inferSelect
export type NewIntegrationCatalog = typeof integrationCatalog.$inferInsert

// ---------------------------------------------------------------------------
// Integrations
// ---------------------------------------------------------------------------

export const integrations = pgTable('integrations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  color: text('color').notNull().default('#6b7280'),
  status: text('status').$type<IntegrationStatus>().notNull().default('NOT_SYNCED'),
  lastSynced: timestamp('last_synced', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
})

export type DbIntegration = typeof integrations.$inferSelect
export type NewIntegration = typeof integrations.$inferInsert

// ---------------------------------------------------------------------------
// Sync Histories
// ---------------------------------------------------------------------------

export const syncHistories = pgTable('sync_histories', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  integrationId: text('integration_id')
    .notNull()
    .references(() => integrations.id, { onDelete: 'cascade' }),
  syncedAt: timestamp('synced_at', { withTimezone: true }).notNull(),
  status: text('status').$type<SyncStatus>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
})

export type DbSyncHistory = typeof syncHistories.$inferSelect
export type NewSyncHistory = typeof syncHistories.$inferInsert

// ---------------------------------------------------------------------------
// Sync History Changes
// ---------------------------------------------------------------------------

export const syncHistoryChanges = pgTable('sync_history_changes', {
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
