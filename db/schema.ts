// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const records = sqliteTable('records', {
 id: text('id').primaryKey(), kind: text('kind').notNull(), status: text('status').notNull(),
 data: text('data').notNull(), position: integer('position').notNull().default(0),
}, t => [index('records_status_kind').on(t.status,t.kind)]);
export const messages = sqliteTable('messages', {
 id: text('id').primaryKey(), name:text('name').notNull(), email:text('email').notNull(), message:text('message').notNull(), created:text('created').notNull(),
});
