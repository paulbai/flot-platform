import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // email as ID
  email: text('email').notNull().unique(),
  name: text('name').notNull().default(''),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const sites = sqliteTable('sites', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull(),
  ownerEmail: text('owner_email').notNull(),
  vertical: text('vertical').notNull(), // 'hotel' | 'restaurant' | 'store' | 'travel'
  templateId: text('template_id').notNull().default(''),
  status: text('status').notNull().default('draft'), // 'draft' | 'published'
  config: text('config', { mode: 'json' }).notNull(), // Full SiteConfig JSON
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const otpCodes = sqliteTable('otp_codes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull(),
  code: text('code').notNull(),
  attempts: integer('attempts').notNull().default(0),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const rateLimits = sqliteTable('rate_limits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull(), // 'ip:<ip>' or 'email:<email>'
  count: integer('count').notNull().default(1),
  resetAt: integer('reset_at', { mode: 'timestamp' }).notNull(),
});
