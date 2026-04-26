import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // email or phone as ID
  email: text('email'),
  phone: text('phone'),
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

export const orders = sqliteTable(
  'orders',
  {
    id: text('id').primaryKey(),                       // 'ord_' + nanoid(16)
    reference: text('reference').notNull().unique(),   // 'FLT-XXXXXX'
    siteId: text('site_id').notNull(),
    ownerEmail: text('owner_email').notNull(),
    vertical: text('vertical').notNull(),              // hotel | restaurant | store | travel
    status: text('status').notNull().default('confirmed'),

    // customer (snapshot)
    customerName: text('customer_name').notNull(),
    customerEmail: text('customer_email').notNull(),
    customerPhone: text('customer_phone').notNull(),

    // money (snapshot, integer in lowest currency unit)
    subtotal: integer('subtotal').notNull(),
    total: integer('total').notNull(),
    currency: text('currency').notNull().default('Le'),

    // payment
    paymentMethod: text('payment_method'),             // null when status='pending'
    paymentRef: text('payment_ref'),

    // vertical-specific JSON blob
    details: text('details', { mode: 'json' }).notNull().default('{}'),

    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => ({
    byOwner:    index('idx_orders_owner').on(t.ownerEmail, t.createdAt),
    bySite:     index('idx_orders_site').on(t.siteId, t.createdAt),
    byCustomer: index('idx_orders_customer').on(t.customerEmail),
  }),
);

export const orderItems = sqliteTable(
  'order_items',
  {
    id: text('id').primaryKey(),                       // 'oi_' + nanoid(16)
    orderId: text('order_id').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    quantity: integer('quantity').notNull().default(1),
    unitPrice: integer('unit_price').notNull(),
    imageUrl: text('image_url'),
    variant: text('variant'),
  },
  (t) => ({
    byOrder: index('idx_order_items_order').on(t.orderId),
  }),
);
