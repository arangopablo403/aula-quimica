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
export const students = sqliteTable('students', {
 id:text('id').primaryKey(), email:text('email').notNull(), name:text('name').notNull(), institution:text('institution').notNull(), requested:text('requested').notNull(), approved:text('approved').notNull().default('[]'), status:text('status').notNull().default('pending'), created:text('created').notNull(), updated:text('updated').notNull(),
},t=>[index('students_status_created').on(t.status,t.created)]);
export const studentAudit = sqliteTable('student_audit', {
 id:text('id').primaryKey(), student:text('student').notNull(), actor:text('actor').notNull(), action:text('action').notNull(), courses:text('courses').notNull(), created:text('created').notNull(),
});
export const loginSessions = sqliteTable('login_sessions', {
 hash:text('hash').primaryKey(), user:text('user').notNull(), expires:integer('expires').notNull(),
},t=>[index('login_sessions_expires').on(t.expires)]);
export const authAttempts = sqliteTable('auth_attempts', {
 key:text('key').primaryKey(), count:integer('count').notNull(), expires:integer('expires').notNull(),
},t=>[index('auth_attempts_expires').on(t.expires)]);
