# Orders & Merchant Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist every order and Hotel "Reserve Only" booking to the DB and give merchants a per-site dashboard at `/builder/[id]/orders` to view and update them.

**Architecture:** A unified `orders` table + `order_items` table (vertical-specific data lives in a JSON `details` column). Five new API endpoints handle write-on-checkout, merchant CRUD, and anonymous buyer lookup, all enforcing multi-tenant isolation via `ownerEmail`/`siteId`. The buyer-side `bookingStore.ts` (zustand+localStorage) is replaced by a server-backed lookup-by-email pattern. Four sequential phases each leave the system in a deployable state.

**Tech Stack:** Next.js 14 App Router · TypeScript · drizzle-orm + Turso (libsql) · NextAuth (existing) · Tailwind · framer-motion (existing) · vitest (added in Task 1) · nanoid (added in Task 2).

**Spec:** [`docs/superpowers/specs/2026-04-23-orders-and-merchant-dashboard-design.md`](../specs/2026-04-23-orders-and-merchant-dashboard-design.md)

**File map:**
- `lib/orders/reference.ts` — generates `FLT-XXXXXX` references (pure)
- `lib/orders/status.ts` — state-machine transition validator (pure)
- `lib/orders/types.ts` — shared TS types for the orders domain
- `lib/db/schema.ts` — extended with `orders` + `orderItems` tables
- `app/api/orders/route.ts` — `POST` (buyer create) + `GET` (merchant list)
- `app/api/orders/[id]/route.ts` — `GET` (detail) + `PATCH` (status)
- `app/api/orders/lookup/route.ts` — public anonymous lookup
- `components/checkout/FlotCheckout.tsx` — async `onSuccess` + reference display
- `components/site/SiteFloatingCart.tsx` — POSTs order on success
- `components/site/SiteShopHotel.tsx` — POSTs pending on Reserve Only; PATCHes on pay-later
- `components/booking/PendingBookingsDrawer.tsx` — server-backed via lookup endpoint
- `components/builder/BuilderTabs.tsx` — shared `Editor | Orders` nav
- `components/orders/StatusPill.tsx` — status badge
- `app/builder/[id]/orders/page.tsx` — list page
- `app/builder/[id]/orders/[orderId]/page.tsx` — detail page
- `store/bookingStore.ts` — **deleted** in Task 19

---

## Phase 1: Schema + API

This phase ships the foundation: a tested status validator and reference generator, the new tables, and all five endpoints. After this phase, you can `curl` the API end-to-end without any UI changes.

### Task 1: Set up vitest

The codebase has no test framework today. We'll add vitest for the pure-function tests in Tasks 2 and 3. (UI/API tasks in later phases use manual smoke tests via `curl` — the existing codebase pattern.)

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `lib/__tests__/sanity.test.ts`

- [ ] **Step 1: Install vitest**

Run from `flot-platform/`:
```bash
npm install -D vitest @vitest/ui
```

- [ ] **Step 2: Add `test` script to `package.json`**

Open `package.json`. Replace the `"scripts"` block with:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 3: Create `vitest.config.ts`**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts', 'lib/**/__tests__/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

- [ ] **Step 4: Write a sanity test**

Create `lib/__tests__/sanity.test.ts`:

```ts
import { describe, it, expect } from 'vitest';

describe('sanity', () => {
  it('vitest is wired up', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run the test**

Run:
```bash
npm test
```

Expected: 1 test passes.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts lib/__tests__/sanity.test.ts
git commit -m "chore: add vitest for pure-function unit tests"
```

---

### Task 2: Reference generator (`lib/orders/reference.ts`)

Generates `FLT-XXXXXX` strings. 6 chars from a base32 alphabet excluding visually-confusing characters (0/O/1/I/L). TDD.

**Files:**
- Create: `lib/orders/reference.ts`
- Create: `lib/orders/__tests__/reference.test.ts`
- Modify: `package.json` (add `nanoid` dep)

- [ ] **Step 1: Install nanoid**

Run:
```bash
npm install nanoid
```

- [ ] **Step 2: Write the failing test**

Create `lib/orders/__tests__/reference.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { generateReference, REFERENCE_ALPHABET } from '../reference';

describe('generateReference', () => {
  it('returns a string starting with FLT-', () => {
    const ref = generateReference();
    expect(ref.startsWith('FLT-')).toBe(true);
  });

  it('has exactly 10 chars total (FLT- plus 6)', () => {
    expect(generateReference()).toHaveLength(10);
  });

  it('uses only the safe alphabet after the prefix', () => {
    const ref = generateReference();
    const body = ref.slice(4);
    for (const ch of body) {
      expect(REFERENCE_ALPHABET).toContain(ch);
    }
  });

  it('does not include visually-confusing characters', () => {
    expect(REFERENCE_ALPHABET).not.toMatch(/[01OIL]/);
  });

  it('produces different refs over many calls (collision sanity)', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      seen.add(generateReference());
    }
    expect(seen.size).toBeGreaterThan(990);
  });
});
```

- [ ] **Step 3: Run the test (expect failure)**

Run:
```bash
npm test -- reference
```

Expected: FAIL — module not found.

- [ ] **Step 4: Implement `lib/orders/reference.ts`**

Create `lib/orders/reference.ts`:

```ts
import { customAlphabet } from 'nanoid';

/**
 * 30 chars: A–Z + 2–9, minus 0/O/1/I/L (visually confusing).
 * Yields ~30^6 = ~729M combinations — collision risk is negligible
 * at the volumes Flot will see in v1, but POST /api/orders retries
 * up to 3 times on the unique constraint just in case.
 */
export const REFERENCE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

const nanoid = customAlphabet(REFERENCE_ALPHABET, 6);

export function generateReference(): string {
  return `FLT-${nanoid()}`;
}
```

- [ ] **Step 5: Run the test (expect pass)**

Run:
```bash
npm test -- reference
```

Expected: 5 tests pass.

- [ ] **Step 6: Commit**

```bash
git add lib/orders/reference.ts lib/orders/__tests__/reference.test.ts package.json package-lock.json
git commit -m "feat(orders): reference generator (FLT-XXXXXX)"
```

---

### Task 3: Status state machine (`lib/orders/status.ts`)

Pure function `assertTransition(from, to)` throws on illegal moves. TDD.

**Files:**
- Create: `lib/orders/status.ts`
- Create: `lib/orders/types.ts`
- Create: `lib/orders/__tests__/status.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/orders/__tests__/status.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { isValidTransition, assertTransition } from '../status';

describe('order status state machine', () => {
  it('allows pending → confirmed', () => {
    expect(isValidTransition('pending', 'confirmed')).toBe(true);
  });

  it('allows pending → cancelled', () => {
    expect(isValidTransition('pending', 'cancelled')).toBe(true);
  });

  it('allows confirmed → fulfilled', () => {
    expect(isValidTransition('confirmed', 'fulfilled')).toBe(true);
  });

  it('allows confirmed → cancelled', () => {
    expect(isValidTransition('confirmed', 'cancelled')).toBe(true);
  });

  it('rejects pending → fulfilled (must confirm first)', () => {
    expect(isValidTransition('pending', 'fulfilled')).toBe(false);
  });

  it('rejects fulfilled → anything (terminal)', () => {
    expect(isValidTransition('fulfilled', 'cancelled')).toBe(false);
    expect(isValidTransition('fulfilled', 'confirmed')).toBe(false);
    expect(isValidTransition('fulfilled', 'pending')).toBe(false);
  });

  it('rejects cancelled → anything (terminal)', () => {
    expect(isValidTransition('cancelled', 'fulfilled')).toBe(false);
    expect(isValidTransition('cancelled', 'confirmed')).toBe(false);
  });

  it('rejects same-state transitions (noop)', () => {
    expect(isValidTransition('pending', 'pending')).toBe(false);
    expect(isValidTransition('confirmed', 'confirmed')).toBe(false);
  });

  it('assertTransition throws for illegal transitions', () => {
    expect(() => assertTransition('fulfilled', 'cancelled')).toThrow(/invalid/i);
  });

  it('assertTransition is silent for legal transitions', () => {
    expect(() => assertTransition('pending', 'confirmed')).not.toThrow();
  });
});
```

- [ ] **Step 2: Run the test (expect failure)**

Run:
```bash
npm test -- status
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create the shared types**

Create `lib/orders/types.ts`:

```ts
export type OrderStatus = 'pending' | 'confirmed' | 'fulfilled' | 'cancelled';

export const ORDER_STATUSES: readonly OrderStatus[] = [
  'pending',
  'confirmed',
  'fulfilled',
  'cancelled',
] as const;

export type OrderVertical = 'hotel' | 'restaurant' | 'store' | 'travel';

export interface OrderDetailsHotel {
  checkIn?: string;     // ISO date or '' (Reserve Only buyers may not pick a date)
  checkOut?: string;
  nights: number;
  guests: number;
  roomId: string;
}

export interface OrderDetailsAddressed {
  deliveryAddress: string;
}

export type OrderDetails =
  | OrderDetailsHotel
  | OrderDetailsAddressed
  | Record<string, unknown>;
```

- [ ] **Step 4: Implement `lib/orders/status.ts`**

Create `lib/orders/status.ts`:

```ts
import type { OrderStatus } from './types';

const ALLOWED_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pending:   ['confirmed', 'cancelled'],
  confirmed: ['fulfilled', 'cancelled'],
  fulfilled: [],  // terminal
  cancelled: [],  // terminal
};

export function isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return false;
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function assertTransition(from: OrderStatus, to: OrderStatus): void {
  if (!isValidTransition(from, to)) {
    throw new Error(`Invalid status transition: ${from} → ${to}`);
  }
}
```

- [ ] **Step 5: Run the test (expect pass)**

Run:
```bash
npm test -- status
```

Expected: 10 tests pass.

- [ ] **Step 6: Commit**

```bash
git add lib/orders/types.ts lib/orders/status.ts lib/orders/__tests__/status.test.ts
git commit -m "feat(orders): status state machine (pending→confirmed→fulfilled, cancelled)"
```

---

### Task 4: Schema additions + migration

Add the two new tables to drizzle schema. Generate and push the migration.

**Files:**
- Modify: `lib/db/schema.ts`

- [ ] **Step 1: Add tables to schema**

Open `lib/db/schema.ts`. Add `index` to the existing import from `'drizzle-orm/sqlite-core'`:

Replace:
```ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
```

with:
```ts
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
```

Then append at the end of the file:

```ts
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
```

- [ ] **Step 2: Generate migration SQL**

Run:
```bash
npx drizzle-kit generate
```

Expected: a new file appears under `drizzle/` (e.g. `drizzle/0001_xxx.sql`) containing `CREATE TABLE orders ...` and `CREATE TABLE order_items ...` plus the indexes.

- [ ] **Step 3: Push migration to Turso**

Run:
```bash
npx drizzle-kit push
```

Confirm any prompts. Expected: tables created on the production Turso DB. (If the env vars are missing locally, source `.env.local` first: `set -a; . .env.local; set +a; npx drizzle-kit push`.)

- [ ] **Step 4: Verify schema compiles**

Run:
```bash
npm run build
```

Expected: clean build, no type errors.

- [ ] **Step 5: Commit**

```bash
git add lib/db/schema.ts drizzle/
git commit -m "feat(orders): add orders + order_items tables with indexes"
```

---

### Task 5: `POST /api/orders` (buyer create)

Looks up the site by slug, snapshots customer + items, inserts in a transaction, retries on reference collision.

**Files:**
- Create: `app/api/orders/route.ts`

- [ ] **Step 1: Create the route file with the POST handler**

Create `app/api/orders/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { customAlphabet } from 'nanoid';
import { eq, and, desc, lt } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { sites, orders, orderItems } from '@/lib/db/schema';
import { generateReference } from '@/lib/orders/reference';
import { ORDER_STATUSES, type OrderStatus, type OrderVertical } from '@/lib/orders/types';

const idAlphabet = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 16);
const newOrderId = () => `ord_${idAlphabet()}`;
const newItemId  = () => `oi_${idAlphabet()}`;

interface IncomingItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string;
  variant?: string;
}

interface CreateOrderBody {
  siteSlug: string;
  status: 'pending' | 'confirmed';     // POST only creates these two
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: IncomingItem[];
  subtotal: number;
  total: number;
  currency?: string;
  paymentMethod?: 'flot' | 'mobile-money' | 'card';
  paymentRef?: string;
  details?: Record<string, unknown>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[1-9]\d{6,14}$/;

function validateBody(body: unknown): body is CreateOrderBody {
  if (!body || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  if (typeof b.siteSlug !== 'string' || !b.siteSlug.trim()) return false;
  if (b.status !== 'pending' && b.status !== 'confirmed') return false;
  if (!b.customer || typeof b.customer !== 'object') return false;
  const c = b.customer as Record<string, unknown>;
  if (typeof c.name !== 'string' || !c.name.trim()) return false;
  if (typeof c.email !== 'string' || !EMAIL_RE.test(c.email)) return false;
  if (typeof c.phone !== 'string' || !PHONE_RE.test(c.phone)) return false;
  if (!Array.isArray(b.items) || b.items.length === 0) return false;
  if (typeof b.subtotal !== 'number' || b.subtotal < 0) return false;
  if (typeof b.total !== 'number' || b.total < 0) return false;
  if (b.status === 'confirmed' && (typeof b.paymentMethod !== 'string' || !b.paymentMethod)) return false;
  return true;
}

async function insertOrderWithRetry(args: {
  body: CreateOrderBody;
  siteId: string;
  ownerEmail: string;
  vertical: OrderVertical;
}, attempt = 0): Promise<{ id: string; reference: string }> {
  const { body, siteId, ownerEmail, vertical } = args;
  const id = newOrderId();
  const reference = generateReference();

  try {
    await db().transaction(async (tx) => {
      await tx.insert(orders).values({
        id,
        reference,
        siteId,
        ownerEmail,
        vertical,
        status: body.status,
        customerName: body.customer.name.trim(),
        customerEmail: body.customer.email.toLowerCase().trim(),
        customerPhone: body.customer.phone.trim(),
        subtotal: Math.round(body.subtotal),
        total: Math.round(body.total),
        currency: body.currency || 'Le',
        paymentMethod: body.paymentMethod || null,
        paymentRef: body.paymentRef || null,
        details: (body.details ?? {}) as Record<string, unknown>,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const itemRows = body.items.map((it) => ({
        id: newItemId(),
        orderId: id,
        name: it.name,
        description: it.description ?? null,
        quantity: Math.max(1, Math.round(it.quantity)),
        unitPrice: Math.round(it.unitPrice),
        imageUrl: it.imageUrl ?? null,
        variant: it.variant ?? null,
      }));

      if (itemRows.length > 0) {
        await tx.insert(orderItems).values(itemRows);
      }
    });
    return { id, reference };
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (attempt < 3 && /unique/i.test(msg) && /reference/i.test(msg)) {
      return insertOrderWithRetry(args, attempt + 1);
    }
    throw err;
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    if (!validateBody(body)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const rows = await db().select().from(sites)
      .where(and(eq(sites.slug, body.siteSlug), eq(sites.status, 'published')));
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Site not found or not published' }, { status: 404 });
    }
    const site = rows[0];
    const vertical = site.vertical as OrderVertical;

    const created = await insertOrderWithRetry({
      body,
      siteId: site.id,
      ownerEmail: site.ownerEmail,
      vertical,
    });

    return NextResponse.json({
      id: created.id,
      reference: created.reference,
      status: body.status,
    }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/orders]', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

// GET handler for list view added in Task 6.
export const GET = auth(async (req) => {
  const userEmail = req.auth?.user?.email;
  const userName  = req.auth?.user?.name;
  const userId = userEmail || (userName?.startsWith('+') ? userName : null);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const siteId = url.searchParams.get('siteId');
  const status = url.searchParams.get('status') as OrderStatus | null;
  const cursor = url.searchParams.get('cursor');         // ISO timestamp
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit') || 50)));

  if (!siteId) {
    return NextResponse.json({ error: 'siteId is required' }, { status: 400 });
  }
  if (status && !ORDER_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  // Ownership check: site must belong to caller.
  const owned = await db().select().from(sites)
    .where(and(eq(sites.id, siteId), eq(sites.ownerEmail, userId)));
  if (owned.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const conditions = [eq(orders.siteId, siteId)];
  if (status) conditions.push(eq(orders.status, status));
  if (cursor) conditions.push(lt(orders.createdAt, new Date(cursor)));

  const rows = await db().select().from(orders)
    .where(and(...conditions))
    .orderBy(desc(orders.createdAt))
    .limit(limit);

  const nextCursor = rows.length === limit
    ? rows[rows.length - 1].createdAt.toISOString()
    : null;

  return NextResponse.json({
    orders: rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() })),
    nextCursor,
  });
}) as unknown as (req: Request) => Promise<Response>;
```

- [ ] **Step 2: Run build to confirm types**

Run:
```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Smoke-test POST with curl**

Find a published site's slug from the DB or from `.next/server` logs. With dev server running (`npm run dev`):

```bash
curl -X POST http://localhost:3000/api/orders \
  -H 'Content-Type: application/json' \
  -d '{
    "siteSlug": "<a-published-slug>",
    "status": "confirmed",
    "customer": { "name": "Test User", "email": "test@example.com", "phone": "+23276000000" },
    "items": [{ "name": "Test Item", "quantity": 1, "unitPrice": 1000 }],
    "subtotal": 1000,
    "total": 1000,
    "currency": "Le",
    "paymentMethod": "flot",
    "paymentRef": "tok_test"
  }'
```

Expected: `201` response with `{ "id": "ord_...", "reference": "FLT-XXXXXX", "status": "confirmed" }`.

If you don't have a published site to test against, run a second curl that should 404:

```bash
curl -X POST http://localhost:3000/api/orders \
  -H 'Content-Type: application/json' \
  -d '{"siteSlug":"definitely-does-not-exist","status":"confirmed","customer":{"name":"X","email":"x@y.z","phone":"+23276000000"},"items":[{"name":"X","quantity":1,"unitPrice":1}],"subtotal":1,"total":1,"paymentMethod":"flot"}'
```

Expected: `404 { "error": "Site not found or not published" }`.

- [ ] **Step 4: Commit**

```bash
git add app/api/orders/route.ts
git commit -m "feat(orders): POST + GET /api/orders endpoints with multi-tenant isolation"
```

---

### Task 6: GET /api/orders verification

The list endpoint was added in Task 5 alongside POST. This task is just a smoke test + commit cleanup if needed.

- [ ] **Step 1: Smoke-test GET**

With `npm run dev` running, sign in as a merchant in the browser to get a session cookie. Copy the cookie value. Then:

```bash
curl 'http://localhost:3000/api/orders?siteId=<your-site-id>' \
  -H 'Cookie: authjs.session-token=<your-cookie>; '
```

Expected: `{ "orders": [ ... ], "nextCursor": null }` showing the row from Task 5's smoke test.

- [ ] **Step 2: Smoke-test cross-tenant isolation**

Sign in as a *different* user (or use a fresh cookie) and try the same `siteId`:

```bash
curl 'http://localhost:3000/api/orders?siteId=<other-merchants-site-id>' \
  -H 'Cookie: authjs.session-token=<your-cookie>'
```

Expected: `404 { "error": "Not found" }` — the user does not own that site.

- [ ] **Step 3: Smoke-test status filter**

```bash
curl 'http://localhost:3000/api/orders?siteId=<your-site-id>&status=cancelled' \
  -H 'Cookie: authjs.session-token=<your-cookie>'
```

Expected: `{ "orders": [], "nextCursor": null }` (assuming no cancelled orders yet).

- [ ] **Step 4: Smoke-test invalid status**

```bash
curl 'http://localhost:3000/api/orders?siteId=<your-site-id>&status=garbage' \
  -H 'Cookie: authjs.session-token=<your-cookie>'
```

Expected: `400 { "error": "Invalid status" }`.

(No code changes — nothing to commit.)

---

### Task 7: `GET /api/orders/[id]` (detail)

Single-order detail with line items, ownership-checked.

**Files:**
- Create: `app/api/orders/[id]/route.ts`

- [ ] **Step 1: Create the detail route**

Create `app/api/orders/[id]/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { orders, orderItems } from '@/lib/db/schema';
import { ORDER_STATUSES, type OrderStatus } from '@/lib/orders/types';
import { isValidTransition } from '@/lib/orders/status';

function getUserId(reqAuth: { user?: { email?: string | null; name?: string | null } } | null | undefined): string | null {
  if (!reqAuth?.user) return null;
  if (reqAuth.user.email) return reqAuth.user.email;
  const name = reqAuth.user.name;
  if (name && name.startsWith('+')) return name;
  return null;
}

export const GET = auth(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const userId = getUserId(req.auth);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await ctx.params;
  const rows = await db().select().from(orders)
    .where(and(eq(orders.id, id), eq(orders.ownerEmail, userId)));
  if (rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const order = rows[0];

  const items = await db().select().from(orderItems)
    .where(eq(orderItems.orderId, id));

  return NextResponse.json({
    order: {
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    },
    items,
  });
}) as unknown as (req: Request, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;

export const PATCH = auth(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const userId = getUserId(req.auth);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = (await req.json()) as {
    status?: unknown;
    paymentMethod?: unknown;
    paymentRef?: unknown;
  };
  const nextStatus = body.status;

  if (typeof nextStatus !== 'string' || !ORDER_STATUSES.includes(nextStatus as OrderStatus)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const rows = await db().select().from(orders)
    .where(and(eq(orders.id, id), eq(orders.ownerEmail, userId)));
  if (rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const current = rows[0];

  if (!isValidTransition(current.status as OrderStatus, nextStatus as OrderStatus)) {
    return NextResponse.json(
      { error: `Invalid status transition: ${current.status} → ${nextStatus}` },
      { status: 400 },
    );
  }

  // PATCH may also fill in payment fields on the pending → confirmed transition
  // (the buyer who reserved without paying is now paying online). Both fields
  // are optional; if absent the existing values are preserved.
  const update: Partial<typeof orders.$inferInsert> = {
    status: nextStatus,
    updatedAt: new Date(),
  };
  if (typeof body.paymentMethod === 'string' && ['flot', 'mobile-money', 'card'].includes(body.paymentMethod)) {
    update.paymentMethod = body.paymentMethod;
  }
  if (typeof body.paymentRef === 'string' && body.paymentRef.length > 0) {
    update.paymentRef = body.paymentRef;
  }

  await db().update(orders).set(update).where(eq(orders.id, id));

  return NextResponse.json({ success: true, status: nextStatus });
}) as unknown as (req: Request, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;
```

- [ ] **Step 2: Run build to confirm types**

Run:
```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Smoke-test GET detail**

With dev running and a known `<order-id>` from Task 5:

```bash
curl 'http://localhost:3000/api/orders/<order-id>' \
  -H 'Cookie: authjs.session-token=<your-cookie>'
```

Expected: `{ "order": { ... full row ... }, "items": [ ... ] }`.

Now try with a fake id:

```bash
curl 'http://localhost:3000/api/orders/ord_does_not_exist' \
  -H 'Cookie: authjs.session-token=<your-cookie>'
```

Expected: `404 { "error": "Not found" }`.

- [ ] **Step 4: Commit**

```bash
git add app/api/orders/\[id\]/route.ts
git commit -m "feat(orders): GET + PATCH /api/orders/[id] (detail + status update)"
```

---

### Task 8: PATCH /api/orders/[id] verification

PATCH was added in Task 7. This task verifies its behavior.

- [ ] **Step 1: Smoke-test legal transition**

With a known confirmed order id:

```bash
curl -X PATCH 'http://localhost:3000/api/orders/<order-id>' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: authjs.session-token=<your-cookie>' \
  -d '{"status":"fulfilled"}'
```

Expected: `200 { "success": true, "status": "fulfilled" }`.

- [ ] **Step 2: Smoke-test illegal transition**

Same order (now `fulfilled`):

```bash
curl -X PATCH 'http://localhost:3000/api/orders/<order-id>' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: authjs.session-token=<your-cookie>' \
  -d '{"status":"cancelled"}'
```

Expected: `400 { "error": "Invalid status transition: fulfilled → cancelled" }`.

- [ ] **Step 3: Smoke-test cross-tenant**

Try patching an order belonging to a different merchant:

```bash
curl -X PATCH 'http://localhost:3000/api/orders/<other-merchants-order-id>' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: authjs.session-token=<your-cookie>' \
  -d '{"status":"fulfilled"}'
```

Expected: `404 { "error": "Not found" }`.

(No code changes — nothing to commit.)

---

### Task 9: `GET /api/orders/lookup` (anonymous, rate-limited)

Public buyer-side lookup. Returns orders matching both `siteSlug` and `customerEmail`.

**Files:**
- Create: `app/api/orders/lookup/route.ts`

- [ ] **Step 1: Create the lookup route**

Create `app/api/orders/lookup/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { sites, orders, orderItems } from '@/lib/db/schema';
import { isRateLimited } from '@/lib/otp';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const siteSlug = url.searchParams.get('siteSlug');
    const email = url.searchParams.get('email')?.toLowerCase().trim();

    if (!siteSlug || !email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'siteSlug and a valid email are required' }, { status: 400 });
    }

    // Per-email rate limit: prevents enumeration / spam.
    if (await isRateLimited(`lookup:${email}`)) {
      return NextResponse.json(
        { error: 'Too many lookup requests. Please wait a moment.' },
        { status: 429 },
      );
    }

    const siteRows = await db().select().from(sites)
      .where(and(eq(sites.slug, siteSlug), eq(sites.status, 'published')));
    if (siteRows.length === 0) {
      // Don't leak existence — return empty list.
      return NextResponse.json({ orders: [] });
    }
    const siteId = siteRows[0].id;

    const orderRows = await db().select().from(orders)
      .where(and(
        eq(orders.siteId, siteId),
        eq(orders.customerEmail, email),
      ))
      .orderBy(desc(orders.createdAt))
      .limit(50);

    if (orderRows.length === 0) {
      return NextResponse.json({ orders: [] });
    }

    // Pull items for all returned orders in one query.
    const orderIds = orderRows.map((o) => o.id);
    const allItems = await db().select().from(orderItems);
    const itemsByOrder = new Map<string, typeof allItems>();
    for (const item of allItems) {
      if (!orderIds.includes(item.orderId)) continue;
      const list = itemsByOrder.get(item.orderId) ?? [];
      list.push(item);
      itemsByOrder.set(item.orderId, list);
    }

    return NextResponse.json({
      orders: orderRows.map((o) => ({
        id: o.id,
        reference: o.reference,
        vertical: o.vertical,
        status: o.status,
        total: o.total,
        currency: o.currency,
        details: o.details,
        items: itemsByOrder.get(o.id) ?? [],
        createdAt: o.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error('[GET /api/orders/lookup]', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Run build**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Smoke-test lookup**

```bash
curl 'http://localhost:3000/api/orders/lookup?siteSlug=<your-published-slug>&email=test@example.com'
```

Expected: `{ "orders": [ ... the order from Task 5 ... ] }`.

Test wrong email:
```bash
curl 'http://localhost:3000/api/orders/lookup?siteSlug=<your-slug>&email=nobody@nowhere.com'
```

Expected: `{ "orders": [] }`.

Test malformed email:
```bash
curl 'http://localhost:3000/api/orders/lookup?siteSlug=x&email=not-an-email'
```

Expected: `400`.

- [ ] **Step 4: Commit**

```bash
git add app/api/orders/lookup/route.ts
git commit -m "feat(orders): GET /api/orders/lookup (anonymous buyer lookup, rate-limited)"
```

---

## Phase 2: Wire Checkout Writes

After this phase, real buyer flows on a published site write to the DB.

### Task 10: FlotCheckout async-onSuccess + reference display

Change `onSuccess` to be async-returning, surface the returned `reference` in the success step.

**Files:**
- Modify: `components/checkout/FlotCheckout.tsx`
- Modify: `lib/types.ts`

- [ ] **Step 1: Update the `FlotCheckoutProps` type**

Open `lib/types.ts`. Find the `FlotCheckoutProps` interface and replace the `onSuccess` line. Replace:

```ts
  onSuccess: (result: ChargeResult) => void;
```

with:

```ts
  onSuccess: (result: ChargeResult) => Promise<{ reference?: string } | void> | void;
```

- [ ] **Step 2: Wire the async call in FlotCheckout**

Open `components/checkout/FlotCheckout.tsx`.

Find the `useState` declarations near the top of the component (around lines 42-55) and add a new state for the reference:

```ts
const [orderReference, setOrderReference] = useState<string | null>(null);
```

Then find the success branch in the `handlePayment` callback (around lines 74-77 — `if (result.success) { ... setStep('success'); }`) and replace it with:

```ts
      if (result.success) {
        setChargeResult(result);
        setPendingResult(result);
        try {
          const out = await onSuccess(result);
          if (out && 'reference' in out && typeof out.reference === 'string') {
            setOrderReference(out.reference);
          }
        } catch (err) {
          console.error('[checkout] order persistence failed', err);
          setErrorMessage('We took payment but could not save your order. Please contact support.');
          setStep('error');
          onError('Order save failed');
          return;
        }
        setStep('success');
      } else {
```

Then find `handleDone` (around line 94) and remove the `onSuccess` call (the persistence already fired). Replace:

```ts
  const handleDone = () => {
    if (pendingResult) {
      onSuccess(pendingResult as Parameters<typeof onSuccess>[0]);
    }
    onClose();
  };
```

with:

```ts
  const handleDone = () => {
    onClose();
  };
```

- [ ] **Step 3: Render the reference in the success step**

Still in `components/checkout/FlotCheckout.tsx`, find the rendered success step (search for `step === 'success'` — there'll be a JSX block showing the success animation). Inside that block, immediately after the success heading/animation and before the "Done" button, add:

```tsx
{orderReference && (
  <div className="mt-4 mb-6 text-center">
    <p className="text-xs uppercase tracking-wider opacity-60">Order reference</p>
    <p className="font-mono text-lg font-semibold mt-1">{orderReference}</p>
    <p className="text-xs opacity-60 mt-2">Save this — you may need it to track your order.</p>
  </div>
)}
```

(If you can't find an obvious place, the safest spot is just inside the success-step container, right after any "Payment successful" heading.)

- [ ] **Step 4: Build and verify**

```bash
npm run build
```

Expected: clean build. (Existing call sites still pass — they returned `void` and the new return type accepts `void`.)

- [ ] **Step 5: Commit**

```bash
git add components/checkout/FlotCheckout.tsx lib/types.ts
git commit -m "feat(checkout): async onSuccess + display order reference on success"
```

---

### Task 11: SiteFloatingCart POSTs orders on success

Restaurant + store flows go through `SiteFloatingCart`. Wire its `FlotCheckout`'s `onSuccess` to POST.

**Files:**
- Modify: `components/site/SiteFloatingCart.tsx`

- [ ] **Step 1: Add the POST helper inside the component**

Open `components/site/SiteFloatingCart.tsx`. Above the `return (` statement, just inside the function body, add the helper:

```ts
async function persistOrder(result: { token?: string }): Promise<{ reference?: string }> {
  const items = siteItems.map((it) => ({
    name: it.name,
    description: it.description,
    quantity: it.quantity,
    unitPrice: it.unitPrice,
    imageUrl: it.image,
    variant: it.variant,
  }));

  const subtotal = siteTotal;
  const total = siteTotal;

  const details: Record<string, unknown> = {};
  if (customer?.address) details.deliveryAddress = customer.address;

  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      siteSlug: config.slug,
      status: 'confirmed',
      customer: {
        name: customer?.name ?? 'Guest',
        email: customer?.email ?? 'noreply@flot.local',
        phone: customer?.phone ?? '+00000000000',
      },
      items,
      subtotal,
      total,
      currency: 'Le',
      paymentMethod: 'flot',
      paymentRef: result.token ?? null,
      details,
    }),
  });

  if (!res.ok) {
    throw new Error(`POST /api/orders failed: ${res.status}`);
  }
  const data = (await res.json()) as { reference?: string };
  return { reference: data.reference };
}
```

- [ ] **Step 2: Pass it to FlotCheckout's onSuccess**

In the same file, find the `<FlotCheckout` JSX block. Replace:

```tsx
            onSuccess={() => {
              clearSite(config.slug);
              setCustomer(null);
            }}
```

with:

```tsx
            onSuccess={async (result) => {
              const out = await persistOrder(result as { token?: string });
              clearSite(config.slug);
              setCustomer(null);
              return out;
            }}
```

- [ ] **Step 3: Build**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 4: Smoke-test in dev**

Run `npm run dev`. Open a published store/restaurant site at `http://localhost:3000/<slug>`. Add items to cart, fill in delivery details, complete mock checkout. After success, verify via curl:

```bash
curl 'http://localhost:3000/api/orders?siteId=<the-site-id>' \
  -H 'Cookie: authjs.session-token=<merchant-cookie>'
```

Expected: a new row exists with `status: 'confirmed'`, the items from your cart, and the delivery address in `details`.

Confirm the success screen displayed `Order reference: FLT-XXXXXX`.

- [ ] **Step 5: Commit**

```bash
git add components/site/SiteFloatingCart.tsx
git commit -m "feat(checkout): SiteFloatingCart POSTs orders on payment success"
```

---

### Task 12: SiteShopHotel POSTs pending orders on Reserve Only

Hotel "Reserve Only" should write to DB instead of zustand.

**Files:**
- Modify: `components/site/SiteShopHotel.tsx`

- [ ] **Step 1: Replace `handleReserveOnly` to call the API**

Open `components/site/SiteShopHotel.tsx`. Find the `handleReserveOnly` function (currently calls `addBooking`):

```ts
  function handleReserveOnly(customer: CustomerDetails) {
    if (!activeRoom) return;
    const items = buildOrderItems(activeRoom, activeNights, activeGuests);
    addBooking({
      roomId: activeRoom.id,
      roomName: activeRoom.name,
      roomImage: activeRoom.images?.[0] ?? '',
      customer,
      checkIn: '',
      checkOut: '',
      nights: activeNights,
      guests: activeGuests,
      total: activeRoom.pricePerNight * activeNights,
      orderItems: items,
    });
    setReservedJustNow(activeRoom.name);
    setStep('idle');
    setActiveRoom(null);
    setTimeout(() => setReservedJustNow(null), 4000);
  }
```

Replace it with:

```ts
  async function handleReserveOnly(customer: CustomerDetails) {
    if (!activeRoom) return;
    const items = buildOrderItems(activeRoom, activeNights, activeGuests);
    const subtotal = activeRoom.pricePerNight * activeNights;

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteSlug: config.slug,
          status: 'pending',
          customer,
          items: items.map((it) => ({
            name: it.name,
            description: it.description,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            imageUrl: it.image,
            variant: it.variant,
          })),
          subtotal,
          total: subtotal,
          currency: 'Le',
          details: {
            checkIn: '',
            checkOut: '',
            nights: activeNights,
            guests: activeGuests,
            roomId: activeRoom.id,
          },
        }),
      });
      if (!res.ok) throw new Error(`reserve failed: ${res.status}`);
      const data = (await res.json()) as { reference?: string };
      setReservedJustNow(`${activeRoom.name}${data.reference ? ` (${data.reference})` : ''}`);
    } catch (err) {
      console.error('[hotel reserve only]', err);
      setReservedJustNow(`${activeRoom.name} — could not save, please try again.`);
    } finally {
      setStep('idle');
      setActiveRoom(null);
      setTimeout(() => setReservedJustNow(null), 6000);
    }
  }
```

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Smoke-test**

Open a published hotel site. Click a room → expand → "Book Now" → "Reserve Only" → fill details → submit. Verify via curl that a `pending` order was created:

```bash
curl 'http://localhost:3000/api/orders?siteId=<hotel-site-id>&status=pending' \
  -H 'Cookie: authjs.session-token=<merchant-cookie>'
```

Expected: a new pending order with `status: 'pending'`, `paymentMethod: null`, customer details intact, and `details.roomId` matching the room.

- [ ] **Step 4: Commit**

```bash
git add components/site/SiteShopHotel.tsx
git commit -m "feat(checkout): SiteShopHotel persists 'Reserve Only' as pending order"
```

---

### Task 13: SiteShopHotel pay-later PATCHes existing order

When a buyer clicks "Pay Now" on a pending order from the drawer, the success path should PATCH (not POST a duplicate).

**Files:**
- Modify: `components/site/SiteShopHotel.tsx`

- [ ] **Step 1: Find the FlotCheckout invocation**

Open `components/site/SiteShopHotel.tsx`. Find the `<FlotCheckout` JSX block near the bottom. Currently:

```tsx
        {checkoutItems && checkoutItems.length > 0 && (
          <FlotCheckout
            brandName={config.brand.businessName}
            accentColor={accent}
            orderSummary={checkoutItems}
            currency="Le"
            vertical="hotel"
            onSuccess={() => {
              if (payBookingId) removeBooking(payBookingId);
              setCheckoutItems(null);
              setPayBookingId(null);
              setActiveRoom(null);
              setNights(1);
              setGuests(1);
            }}
            onError={() => {}}
            onClose={() => {
              setCheckoutItems(null);
              setPayBookingId(null);
            }}
          />
        )}
```

(The variable `payBookingId` here is the LEGACY localStorage booking id — Task 18+19 replace this drawer's identity. For now, we add a new state for the *real* DB order id when paying-later.)

- [ ] **Step 2: Add state for DB order id, customer email, and active customer details**

Near the other `useState` hooks at the top of the function, add:

```ts
const [payDbOrderId, setPayDbOrderId] = useState<string | null>(null);
const [payDbOrderEmail, setPayDbOrderEmail] = useState<string | null>(null);
const [activeCustomer, setActiveCustomer] = useState<CustomerDetails | null>(null);
```

(`payDbOrderId` and `payDbOrderEmail` are set by `handlePayFromDrawer` once the drawer is rewired in Task 18. `activeCustomer` is set in step 3 below by `handlePayNow` when the buyer fills out `CustomerDetailsModal` for Reserve & Pay.)

- [ ] **Step 2b: Update `handlePayNow` to capture the customer**

Find the existing `handlePayNow`:

```ts
function handlePayNow(_customer: CustomerDetails) {
  if (!activeRoom) return;
  const items = buildOrderItems(activeRoom, activeNights, activeGuests);
  setCheckoutItems(items);
  setPayBookingId(null);
  setStep('idle');
}
```

Replace with:

```ts
function handlePayNow(customer: CustomerDetails) {
  if (!activeRoom) return;
  const items = buildOrderItems(activeRoom, activeNights, activeGuests);
  setCheckoutItems(items);
  setPayDbOrderId(null);
  setPayDbOrderEmail(null);
  setActiveCustomer(customer);
  setStep('idle');
}
```

- [ ] **Step 3: Replace the FlotCheckout's onSuccess to use POST-or-PATCH**

Replace the entire `<FlotCheckout` block from Step 1 with:

```tsx
        {checkoutItems && checkoutItems.length > 0 && (
          <FlotCheckout
            brandName={config.brand.businessName}
            accentColor={accent}
            orderSummary={checkoutItems}
            currency="Le"
            vertical="hotel"
            onSuccess={async (result) => {
              const token = (result as { token?: string }).token ?? null;

              // Path A: paying-later for an existing pending order — PATCH and include payment fields.
              if (payDbOrderId) {
                try {
                  const res = await fetch(`/api/orders/${payDbOrderId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      status: 'confirmed',
                      paymentMethod: 'flot',
                      paymentRef: token,
                    }),
                  });
                  if (!res.ok) throw new Error(`PATCH failed: ${res.status}`);
                  // Re-fetch the order so we can show its reference on the success screen.
                  const detailRes = await fetch(`/api/orders/lookup?siteSlug=${config.slug}&email=${encodeURIComponent(payDbOrderEmail ?? '')}`);
                  const detail = detailRes.ok ? await detailRes.json() : null;
                  const matched = detail?.orders?.find((o: { id: string }) => o.id === payDbOrderId);
                  setCheckoutItems(null);
                  setPayDbOrderId(null);
                  setPayDbOrderEmail(null);
                  return { reference: matched?.reference };
                } catch (err) {
                  console.error('[hotel pay-later]', err);
                  setCheckoutItems(null);
                  setPayDbOrderId(null);
                  setPayDbOrderEmail(null);
                  return;
                }
              }

              // Path B: Reserve & Pay (new buyer-pays flow) — POST with the customer details
              // captured from CustomerDetailsModal in handlePayNow.
              if (!activeRoom || !activeCustomer) {
                setCheckoutItems(null);
                return;
              }
              try {
                const res = await fetch('/api/orders', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    siteSlug: config.slug,
                    status: 'confirmed',
                    customer: activeCustomer,
                    items: checkoutItems.map((it) => ({
                      name: it.name,
                      description: it.description,
                      quantity: it.quantity,
                      unitPrice: it.unitPrice,
                      imageUrl: it.image,
                      variant: it.variant,
                    })),
                    subtotal: activeRoom.pricePerNight * activeNights,
                    total: activeRoom.pricePerNight * activeNights,
                    currency: 'Le',
                    paymentMethod: 'flot',
                    paymentRef: token,
                    details: {
                      checkIn: '',
                      checkOut: '',
                      nights: activeNights,
                      guests: activeGuests,
                      roomId: activeRoom.id,
                    },
                  }),
                });
                const data = res.ok ? ((await res.json()) as { reference?: string }) : {};
                setCheckoutItems(null);
                setActiveRoom(null);
                setActiveCustomer(null);
                setNights(1);
                setGuests(1);
                return { reference: data.reference };
              } catch (err) {
                console.error('[hotel reserve & pay]', err);
                setCheckoutItems(null);
                setActiveCustomer(null);
                return;
              }
            }}
            onError={() => {}}
            onClose={() => {
              setCheckoutItems(null);
              setPayDbOrderId(null);
              setPayDbOrderEmail(null);
            }}
          />
        )}
```

- [ ] **Step 4: Build**

```bash
npm run build
```

Expected: clean build. The `payDbOrderId` and `payDbOrderEmail` hooks declared in Step 2 stay `null` until Task 18's drawer wires them up; that's fine — Path A is dead code until then.

- [ ] **Step 5: Smoke-test the Reserve & Pay path**

Open a published hotel site. Click a room → "Book Now" → "Reserve & Pay Now" → fill the customer details modal → complete mock checkout. Verify via the API that a new `confirmed` order exists with the real customer name/email/phone you typed (not "Guest"):

```bash
curl 'http://localhost:3000/api/orders?siteId=<hotel-site-id>&status=confirmed' \
  -H 'Cookie: authjs.session-token=<merchant-cookie>'
```

- [ ] **Step 6: Commit**

```bash
git add components/site/SiteShopHotel.tsx
git commit -m "feat(checkout): SiteShopHotel POSTs new orders on Reserve & Pay; PATCHes existing on pay-later"
```

---

## Phase 3: Merchant Dashboard

After this phase, merchants see their orders.

### Task 14: BuilderTabs shared component

A two-link nav: `Editor | Orders`.

**Files:**
- Create: `components/builder/BuilderTabs.tsx`

- [ ] **Step 1: Create the component**

Create `components/builder/BuilderTabs.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BuilderTabsProps {
  siteId: string;
}

export default function BuilderTabs({ siteId }: BuilderTabsProps) {
  const pathname = usePathname();
  const editorHref = `/builder/${siteId}`;
  const ordersHref = `/builder/${siteId}/orders`;

  // The editor route is exactly /builder/[id]; the orders route is anything under /orders.
  const isEditor = pathname === editorHref;
  const isOrders = pathname.startsWith(ordersHref);

  const tab = (href: string, label: string, active: boolean) => (
    <Link
      href={href}
      className="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
      style={{
        borderColor: active ? 'currentColor' : 'transparent',
        opacity: active ? 1 : 0.5,
      }}
    >
      {label}
    </Link>
  );

  return (
    <div className="flex gap-2 border-b border-white/10 px-4 sm:px-6">
      {tab(editorHref, 'Editor', isEditor)}
      {tab(ordersHref, 'Orders', isOrders)}
    </div>
  );
}
```

- [ ] **Step 2: Mount it on the existing editor page**

Open `app/builder/[id]/page.tsx`. Find the top of the rendered JSX (likely the outermost wrapper element). Add `<BuilderTabs siteId={params.id} />` right inside it, above the existing content. Add this import at the top of the file:

```ts
import BuilderTabs from '@/components/builder/BuilderTabs';
```

(If `params.id` isn't directly available, use whatever the existing page uses to identify the site — search for `params` near the top.)

- [ ] **Step 3: Build**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 4: Smoke-test**

Run `npm run dev`. Sign in as a merchant. Visit `/builder/[your-site-id]`. Confirm the tab bar shows `Editor | Orders` with Editor highlighted.

- [ ] **Step 5: Commit**

```bash
git add components/builder/BuilderTabs.tsx app/builder/\[id\]/page.tsx
git commit -m "feat(builder): shared Editor | Orders tab navigation"
```

---

### Task 15: StatusPill shared component

**Files:**
- Create: `components/orders/StatusPill.tsx`

- [ ] **Step 1: Create the component**

Create `components/orders/StatusPill.tsx`:

```tsx
import type { OrderStatus } from '@/lib/orders/types';

const STATUS_STYLES: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  pending:   { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', label: 'Pending' },
  confirmed: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6', label: 'Confirmed' },
  fulfilled: { bg: 'rgba(34,197,94,0.15)',  text: '#22c55e', label: 'Fulfilled' },
  cancelled: { bg: 'rgba(239,68,68,0.15)',  text: '#ef4444', label: 'Cancelled' },
};

export default function StatusPill({ status }: { status: OrderStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {s.label}
    </span>
  );
}
```

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add components/orders/StatusPill.tsx
git commit -m "feat(orders): StatusPill shared component"
```

---

### Task 16: Orders list page

**Files:**
- Create: `app/builder/[id]/orders/page.tsx`

- [ ] **Step 1: Create the list page**

Create `app/builder/[id]/orders/page.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import BuilderTabs from '@/components/builder/BuilderTabs';
import StatusPill from '@/components/orders/StatusPill';
import { ORDER_STATUSES, type OrderStatus } from '@/lib/orders/types';

interface OrderRow {
  id: string;
  reference: string;
  customerName: string;
  total: number;
  currency: string;
  status: OrderStatus;
  createdAt: string;
}

export default function OrdersListPage() {
  const params = useParams<{ id: string }>();
  const siteId = params.id;
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [counts, setCounts] = useState<Record<OrderStatus | 'all', number>>({
    all: 0, pending: 0, confirmed: 0, fulfilled: 0, cancelled: 0,
  });
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const url = filter === 'all'
          ? `/api/orders?siteId=${encodeURIComponent(siteId)}`
          : `/api/orders?siteId=${encodeURIComponent(siteId)}&status=${filter}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = (await res.json()) as { orders: OrderRow[] };
        if (cancelled) return;
        setOrders(data.orders);

        // Count totals by hitting the API once per status (cheap; cached if needed later).
        const countsRes = await Promise.all(ORDER_STATUSES.map((s) =>
          fetch(`/api/orders?siteId=${encodeURIComponent(siteId)}&status=${s}&limit=1`).then((r) => r.ok ? r.json() : { orders: [] }),
        ));
        // The API doesn't return a total; we approximate using a separate "all" fetch.
        const allRes = await fetch(`/api/orders?siteId=${encodeURIComponent(siteId)}&limit=100`);
        const all = allRes.ok ? (await allRes.json()).orders as OrderRow[] : [];
        if (cancelled) return;
        const c = { all: all.length, pending: 0, confirmed: 0, fulfilled: 0, cancelled: 0 } as Record<OrderStatus | 'all', number>;
        for (const o of all) c[o.status as OrderStatus]++;
        // We loaded `countsRes` for completeness; not used directly. Kept as a side-effect-free probe of API health.
        void countsRes;
        setCounts(c);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [siteId, filter]);

  return (
    <main className="min-h-screen bg-black text-white">
      <BuilderTabs siteId={siteId} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-semibold mb-6">Orders</h1>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['all', ...ORDER_STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
              style={{
                backgroundColor: filter === s ? 'white' : 'transparent',
                color: filter === s ? 'black' : 'white',
                borderColor: 'rgba(255,255,255,0.2)',
              }}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              <span className="ml-2 opacity-60">{counts[s] ?? 0}</span>
            </button>
          ))}
        </div>

        {/* Body */}
        {loading && <p className="text-sm opacity-60">Loading…</p>}
        {error && <p className="text-sm text-red-400">Error: {error}</p>}

        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-16 opacity-60">
            <p className="text-sm">No orders yet.</p>
            <p className="text-xs mt-1">Once buyers complete checkout on your published site, they&apos;ll show up here.</p>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <ul className="divide-y divide-white/10 border border-white/10 rounded-lg overflow-hidden">
            {orders.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/builder/${siteId}/orders/${o.id}`}
                  className="grid grid-cols-1 sm:grid-cols-[100px_1fr_auto_auto_120px] items-center gap-4 px-4 py-3 hover:bg-white/5 transition-colors"
                >
                  <span className="font-mono text-xs">{o.reference}</span>
                  <span className="text-sm truncate">{o.customerName}</span>
                  <span className="text-sm font-semibold">{o.currency}{o.total.toLocaleString()}</span>
                  <StatusPill status={o.status} />
                  <span className="text-xs opacity-60 text-right">
                    {new Date(o.createdAt).toLocaleString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: clean build, including a new route in the routes table: `/builder/[id]/orders`.

- [ ] **Step 3: Smoke-test**

Sign in as the merchant from earlier tasks. Visit `/builder/[your-site-id]/orders`. Confirm the orders from Phase 2 smoke tests appear, the filter pills work, and clicking a row navigates to `/builder/[id]/orders/[orderId]` (which 404s for now — Task 17 builds it).

- [ ] **Step 4: Commit**

```bash
git add app/builder/\[id\]/orders/page.tsx
git commit -m "feat(builder): merchant orders list page with status filters"
```

---

### Task 17: Orders detail page

**Files:**
- Create: `app/builder/[id]/orders/[orderId]/page.tsx`

- [ ] **Step 1: Create the detail page**

Create `app/builder/[id]/orders/[orderId]/page.tsx`:

```tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import BuilderTabs from '@/components/builder/BuilderTabs';
import StatusPill from '@/components/orders/StatusPill';
import { isValidTransition } from '@/lib/orders/status';
import type { OrderStatus, OrderVertical, OrderDetailsHotel, OrderDetailsAddressed } from '@/lib/orders/types';

interface OrderItem {
  id: string;
  name: string;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  imageUrl?: string | null;
  variant?: string | null;
}

interface OrderDetail {
  id: string;
  reference: string;
  vertical: OrderVertical;
  status: OrderStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  subtotal: number;
  total: number;
  currency: string;
  paymentMethod: string | null;
  paymentRef: string | null;
  details: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string; orderId: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInFlight, setActionInFlight] = useState<OrderStatus | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${params.orderId}`);
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = (await res.json()) as { order: OrderDetail; items: OrderItem[] };
      setOrder(data.order);
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [params.orderId]);

  useEffect(() => { load(); }, [load]);

  async function transitionTo(next: OrderStatus) {
    if (!order || !isValidTransition(order.status, next)) return;
    setActionInFlight(next);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `status ${res.status}`);
      }
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setActionInFlight(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <BuilderTabs siteId={params.id} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-sm opacity-60">Loading…</p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-black text-white">
        <BuilderTabs siteId={params.id} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-sm text-red-400">Error: {error ?? 'Order not found'}</p>
          <Link href={`/builder/${params.id}/orders`} className="text-sm underline mt-4 inline-block">
            ← Back to orders
          </Link>
        </div>
      </main>
    );
  }

  const fulfillLabel = order.vertical === 'hotel' ? 'Mark Completed' : 'Mark Fulfilled';
  const confirmLabel = 'Confirm Payment Received';
  const cancelLabel  = 'Cancel';

  const canFulfill = isValidTransition(order.status, 'fulfilled');
  const canConfirm = isValidTransition(order.status, 'confirmed');
  const canCancel  = isValidTransition(order.status, 'cancelled');

  const hotelDetails = order.vertical === 'hotel'
    ? (order.details as OrderDetailsHotel)
    : null;
  const addressDetails = (order.vertical === 'restaurant' || order.vertical === 'store')
    ? (order.details as OrderDetailsAddressed)
    : null;

  return (
    <main className="min-h-screen bg-black text-white">
      <BuilderTabs siteId={params.id} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <Link href={`/builder/${params.id}/orders`} className="text-xs opacity-60 hover:opacity-100">
          ← All orders
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-sm opacity-60">{order.reference}</p>
            <h1 className="text-2xl font-semibold mt-1">Order detail</h1>
          </div>
          <StatusPill status={order.status} />
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {canFulfill && (
            <button
              disabled={actionInFlight !== null}
              onClick={() => transitionTo('fulfilled')}
              className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-sm font-semibold disabled:opacity-50"
            >
              {actionInFlight === 'fulfilled' ? '…' : fulfillLabel}
            </button>
          )}
          {canConfirm && (
            <button
              disabled={actionInFlight !== null}
              onClick={() => transitionTo('confirmed')}
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-sm font-semibold disabled:opacity-50"
            >
              {actionInFlight === 'confirmed' ? '…' : confirmLabel}
            </button>
          )}
          {canCancel && (
            <button
              disabled={actionInFlight !== null}
              onClick={() => transitionTo('cancelled')}
              className="px-4 py-2 rounded-md bg-red-600/20 hover:bg-red-600/40 text-sm font-semibold border border-red-500/40 disabled:opacity-50"
            >
              {actionInFlight === 'cancelled' ? '…' : cancelLabel}
            </button>
          )}
          {!canFulfill && !canConfirm && !canCancel && (
            <span className="text-xs opacity-50">No actions available — order is in a terminal state.</span>
          )}
        </div>

        {/* Customer */}
        <section className="border border-white/10 rounded-lg p-4">
          <h2 className="text-xs uppercase tracking-wider opacity-60 mb-3">Customer</h2>
          <p className="text-base font-semibold">{order.customerName}</p>
          <p className="text-sm">
            <a href={`mailto:${order.customerEmail}`} className="underline opacity-80 hover:opacity-100">
              {order.customerEmail}
            </a>
          </p>
          <p className="text-sm">
            <a href={`tel:${order.customerPhone}`} className="underline opacity-80 hover:opacity-100">
              {order.customerPhone}
            </a>
          </p>
        </section>

        {/* Vertical-specific block */}
        {hotelDetails && (
          <section className="border border-white/10 rounded-lg p-4">
            <h2 className="text-xs uppercase tracking-wider opacity-60 mb-3">Booking</h2>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="opacity-60">Check-in</dt>
              <dd>{hotelDetails.checkIn || '—'}</dd>
              <dt className="opacity-60">Check-out</dt>
              <dd>{hotelDetails.checkOut || '—'}</dd>
              <dt className="opacity-60">Nights</dt>
              <dd>{hotelDetails.nights}</dd>
              <dt className="opacity-60">Guests</dt>
              <dd>{hotelDetails.guests}</dd>
              <dt className="opacity-60">Room</dt>
              <dd className="font-mono text-xs">{hotelDetails.roomId}</dd>
            </dl>
          </section>
        )}
        {addressDetails && addressDetails.deliveryAddress && (
          <section className="border border-white/10 rounded-lg p-4">
            <h2 className="text-xs uppercase tracking-wider opacity-60 mb-3">Delivery address</h2>
            <p className="text-sm whitespace-pre-line">{addressDetails.deliveryAddress}</p>
          </section>
        )}

        {/* Items */}
        <section className="border border-white/10 rounded-lg p-4">
          <h2 className="text-xs uppercase tracking-wider opacity-60 mb-3">Items</h2>
          <ul className="divide-y divide-white/10">
            {items.map((it) => (
              <li key={it.id} className="flex items-center gap-3 py-3">
                {it.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.imageUrl} alt={it.name} className="w-12 h-12 object-cover rounded" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{it.name}</p>
                  {it.description && <p className="text-xs opacity-60 truncate">{it.description}</p>}
                  {it.variant && <p className="text-xs opacity-60">{it.variant}</p>}
                </div>
                <p className="text-sm whitespace-nowrap">
                  {it.quantity} × {order.currency}{it.unitPrice.toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Money + payment */}
        <section className="border border-white/10 rounded-lg p-4 space-y-2 text-sm">
          <div className="flex justify-between"><span className="opacity-60">Subtotal</span><span>{order.currency}{order.subtotal.toLocaleString()}</span></div>
          <div className="flex justify-between font-semibold border-t border-white/10 pt-2"><span>Total</span><span>{order.currency}{order.total.toLocaleString()}</span></div>
          <div className="flex justify-between text-xs opacity-60 pt-2"><span>Payment method</span><span>{order.paymentMethod ?? 'Awaiting payment'}</span></div>
          {order.paymentRef && (
            <div className="flex justify-between text-xs opacity-60"><span>Payment ref</span><span className="font-mono">{order.paymentRef}</span></div>
          )}
        </section>

        {/* Footer timestamps */}
        <p className="text-xs opacity-40">
          Created {new Date(order.createdAt).toLocaleString()} · Updated {new Date(order.updatedAt).toLocaleString()}
        </p>

        {/* Avoid unused-router warning */}
        <span className="hidden">{router.replace ? '' : ''}</span>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: clean build, new route `/builder/[id]/orders/[orderId]`.

- [ ] **Step 3: Smoke-test**

Visit `/builder/[id]/orders/[orderId]` for an order from earlier. Confirm:
- Customer block shows name, email (mailto link), phone (tel link).
- Vertical-specific block renders (hotel: check-in/out, nights, guests, roomId; store/restaurant: delivery address).
- Items list renders with quantities and per-item totals.
- Action buttons match status (e.g., a `confirmed` order shows `Mark Fulfilled` + `Cancel`).
- Click `Mark Fulfilled` → status pill updates to `Fulfilled`, action buttons disappear.
- Test a `pending` hotel order: shows `Confirm Payment Received` + `Cancel`.

- [ ] **Step 4: Commit**

```bash
git add app/builder/\[id\]/orders/\[orderId\]/page.tsx
git commit -m "feat(builder): merchant order detail page with status actions"
```

---

## Phase 4: Hotel Buyer Migration

After this phase, the localStorage-backed booking store is gone, replaced by the lookup-by-email pattern.

### Task 18: PendingBookingsDrawer email-entry + lookup

Drawer now asks the buyer for their email, then fetches from `/api/orders/lookup`. The drawer also threads the order's id and customer email back up to `SiteShopHotel` so pay-later can PATCH correctly. We also fix Reserve & Pay to thread the customer details from the modal into `SiteShopHotel.handlePayNow` (a small bug from Task 13 step 5).

**Files:**
- Modify: `components/booking/PendingBookingsDrawer.tsx`
- Modify: `components/site/SiteShopHotel.tsx`

- [ ] **Step 1: Rewrite the drawer**

Replace the entire contents of `components/booking/PendingBookingsDrawer.tsx` with:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CalendarDays, Users, ArrowRight, Trash2 } from 'lucide-react';
import type { OrderItem } from '@/lib/types';

const SESSION_EMAIL_KEY = 'flot:lookup-email';

interface BackendOrder {
  id: string;
  reference: string;
  vertical: string;
  status: 'pending' | 'confirmed' | 'fulfilled' | 'cancelled';
  total: number;
  currency: string;
  details: { roomId?: string; nights?: number; guests?: number; checkIn?: string; checkOut?: string };
  items: { id: string; name: string; imageUrl?: string | null; quantity: number; unitPrice: number; description?: string | null; variant?: string | null }[];
  createdAt: string;
}

interface PendingBookingsDrawerProps {
  accentColor: string;
  brandName: string;
  siteSlug: string;
  onPayNow: (args: {
    orderId: string;
    customerEmail: string;
    orderItems: OrderItem[];
  }) => void;
  onClose: () => void;
}

export default function PendingBookingsDrawer({
  accentColor,
  brandName,
  siteSlug,
  onPayNow,
  onClose,
}: PendingBookingsDrawerProps) {
  const [email, setEmail] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore email from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_EMAIL_KEY);
    if (saved) setEmail(saved);
  }, []);

  // Fetch orders whenever email changes
  useEffect(() => {
    if (!email) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/orders/lookup?siteSlug=${encodeURIComponent(siteSlug)}&email=${encodeURIComponent(email!)}`,
        );
        if (!res.ok) {
          if (res.status === 429) throw new Error('Too many lookups — please wait a moment.');
          throw new Error('Lookup failed');
        }
        const data = (await res.json()) as { orders: BackendOrder[] };
        if (cancelled) return;
        // Show only pending and confirmed bookings (the buyer's "live" reservations).
        setOrders(data.orders.filter((o) => o.status === 'pending' || o.status === 'confirmed'));
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [email, siteSlug]);

  function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email');
      return;
    }
    sessionStorage.setItem(SESSION_EMAIL_KEY, trimmed);
    setEmail(trimmed);
  }

  async function cancelBooking(orderId: string) {
    if (!confirm('Cancel this reservation?')) return;
    try {
      // The buyer can't directly hit PATCH (it's auth-merchant-only). For v1 we just
      // remove the row from the local view and trust the merchant to cancel server-side
      // when contacted. (A buyer-cancel endpoint can be added later — out of v1 scope.)
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch {/* swallow */}
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-[var(--ink)] border-l border-[var(--ash)] flex flex-col"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--ash)]">
            <div>
              <h2 className="font-display text-[var(--text-lg)] text-[var(--paper)] font-medium">My Reservations</h2>
              <p className="text-[var(--text-xs)] text-[var(--fog)] font-body mt-0.5">{brandName}</p>
            </div>
            <button onClick={onClose} className="text-[var(--fog)] hover:text-[var(--paper)] transition-colors cursor-pointer">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!email ? (
              <form onSubmit={submitEmail} className="flex flex-col gap-3 mt-8">
                <p className="text-sm text-[var(--paper)]">
                  Enter the email you used when reserving to see your bookings:
                </p>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="you@example.com"
                  className="px-3 py-2 rounded-md bg-[var(--stone)] border border-[var(--ash)] text-[var(--paper)]"
                />
                {error && <p className="text-xs text-red-400">{error}</p>}
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md font-semibold text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  Show my reservations
                </button>
              </form>
            ) : loading ? (
              <p className="text-sm text-[var(--fog)] text-center mt-8">Loading…</p>
            ) : error ? (
              <p className="text-sm text-red-400 text-center mt-8">{error}</p>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <CalendarDays size={32} className="mb-3" style={{ color: accentColor, opacity: 0.4 }} />
                <p className="text-[var(--text-sm)] text-[var(--fog)] font-body">No reservations for this email.</p>
                <button
                  onClick={() => { sessionStorage.removeItem(SESSION_EMAIL_KEY); setEmail(null); }}
                  className="text-xs underline mt-3 opacity-60 hover:opacity-100"
                >
                  Try a different email
                </button>
              </div>
            ) : (
              orders.map((booking) => {
                const firstItem = booking.items[0];
                const orderItems: OrderItem[] = booking.items.map((it) => ({
                  id: it.id,
                  name: it.name,
                  description: it.description ?? undefined,
                  quantity: it.quantity,
                  unitPrice: it.unitPrice,
                  image: it.imageUrl ?? undefined,
                  variant: it.variant ?? undefined,
                  vertical: 'hotel',
                  siteSlug,
                }));
                return (
                  <div key={booking.id} className="bg-[var(--stone)] border border-[var(--ash)] rounded-sm overflow-hidden">
                    {firstItem?.imageUrl && (
                      <div className="relative aspect-[16/7] overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={firstItem.imageUrl} alt={firstItem.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display text-[var(--text-md)] text-[var(--paper)] font-medium">{firstItem?.name ?? 'Reservation'}</h3>
                        <span
                          className="flex-shrink-0 text-[9px] font-body font-semibold uppercase tracking-wider px-2 py-0.5 rounded border"
                          style={{ color: accentColor, borderColor: accentColor + '50' }}
                        >
                          {booking.status === 'pending' ? 'Pending' : 'Confirmed'}
                        </span>
                      </div>
                      <p className="font-mono text-xs opacity-60">{booking.reference}</p>
                      {(booking.details?.checkIn || booking.details?.checkOut) && (
                        <div className="flex items-center gap-2 text-[var(--text-xs)] text-[var(--fog)] font-body">
                          <CalendarDays size={12} style={{ color: accentColor }} />
                          {booking.details.checkIn || '—'} → {booking.details.checkOut || '—'}
                          {booking.details.nights ? ` (${booking.details.nights} nights)` : ''}
                        </div>
                      )}
                      {booking.details?.guests !== undefined && (
                        <div className="flex items-center gap-2 text-[var(--text-xs)] text-[var(--fog)] font-body">
                          <Users size={12} style={{ color: accentColor }} />
                          {booking.details.guests} {booking.details.guests === 1 ? 'guest' : 'guests'}
                        </div>
                      )}
                      <div className="flex items-end justify-between">
                        <p className="text-sm opacity-70">Total due</p>
                        <p className="font-display text-[var(--text-lg)] font-bold" style={{ color: accentColor }}>
                          {booking.currency}{booking.total.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => cancelBooking(booking.id)}
                          className="flex items-center justify-center w-10 h-10 rounded-sm border border-[var(--ash)] text-[var(--fog)] hover:text-[var(--error)] hover:border-[var(--error)] transition-colors cursor-pointer"
                          aria-label="Hide reservation"
                        >
                          <Trash2 size={14} />
                        </button>
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => onPayNow({
                              orderId: booking.id,
                              customerEmail: email,
                              orderItems,
                            })}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-sm text-[var(--text-xs)] font-body font-semibold uppercase tracking-wider transition-opacity hover:opacity-90 cursor-pointer"
                            style={{ backgroundColor: accentColor, color: '#000' }}
                          >
                            Pay Now <ArrowRight size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Update SiteShopHotel to use the new drawer signature**

Open `components/site/SiteShopHotel.tsx`. Find `handlePayFromDrawer`:

```ts
function handlePayFromDrawer(orderItems: OrderItem[], bookingId: string) {
  setCheckoutItems(orderItems);
  setPayBookingId(bookingId);
  setDrawerOpen(false);
}
```

Replace it with:

```ts
function handlePayFromDrawer(args: { orderId: string; customerEmail: string; orderItems: OrderItem[] }) {
  setCheckoutItems(args.orderItems);
  setPayDbOrderId(args.orderId);
  setPayDbOrderEmail(args.customerEmail);
  setDrawerOpen(false);
}
```

Then find the `<PendingBookingsDrawer` JSX block. Replace its props block:

```tsx
<PendingBookingsDrawer
  accentColor={accent}
  brandName={config.brand.businessName}
  onPayNow={handlePayFromDrawer}
  onClose={() => setDrawerOpen(false)}
/>
```

with:

```tsx
<PendingBookingsDrawer
  accentColor={accent}
  brandName={config.brand.businessName}
  siteSlug={config.slug}
  onPayNow={handlePayFromDrawer}
  onClose={() => setDrawerOpen(false)}
/>
```

Also delete the now-unused state and store imports near the top of `SiteShopHotel.tsx`. Find:

```ts
const [payBookingId, setPayBookingId] = useState<string | null>(null);

const pendingBookings = useBookingStore((s) => s.pendingBookings);
const addBooking = useBookingStore((s) => s.addBooking);
const removeBooking = useBookingStore((s) => s.removeBooking);

const sitePendingBookings = pendingBookings.filter(
  (b) => b.orderItems[0]?.siteSlug === config.slug
);
```

and replace with:

```ts
const [pendingCount, setPendingCount] = useState(0);

// Refresh the pending count from the server when the email is known.
// For now we keep the badge based on whether the buyer has any pending — the drawer
// lazily fetches the full list via /api/orders/lookup once opened.
useEffect(() => {
  const email = typeof window !== 'undefined' ? sessionStorage.getItem('flot:lookup-email') : null;
  if (!email) { setPendingCount(0); return; }
  fetch(`/api/orders/lookup?siteSlug=${encodeURIComponent(config.slug)}&email=${encodeURIComponent(email)}`)
    .then((r) => r.ok ? r.json() : { orders: [] })
    .then((data: { orders: { status: string }[] }) => {
      setPendingCount(data.orders.filter((o) => o.status === 'pending').length);
    })
    .catch(() => setPendingCount(0));
}, [config.slug, drawerOpen]);
```

Add `useEffect` to the React import at the top if not already there.

Find any references to `sitePendingBookings.length` and replace with `pendingCount`. Find the references to `removeBooking` and `addBooking` — they should be removed since the bookingStore is gone:
- The `addBooking` call was already replaced in Task 12.
- Any `removeBooking` call (likely in the FlotCheckout `onSuccess` from Task 13) should be deleted.

Search for `useBookingStore` and remove the import (`import { useBookingStore, type CustomerDetails } from '@/store/bookingStore';`). Replace with just the type import:

```ts
import type { CustomerDetails } from '@/store/bookingStore';
```

(We'll move this type out of the store in Task 19.)

- [ ] **Step 3: Build**

```bash
npm run build
```

Expected: clean build. Fix any leftover references the compiler complains about (likely small follow-on edits in the same file).

- [ ] **Step 4: Smoke-test cross-device**

Open two browsers (or one normal + one private window). In Browser A: visit a published hotel site, reserve a room with email `cross-test@example.com`. In Browser B: visit the same site, click "My Reservations", enter `cross-test@example.com` — your reservation should appear. Click "Pay Now" → mock checkout → confirm the order's status flipped from `pending` to `confirmed` in the merchant dashboard.

- [ ] **Step 5: Commit**

```bash
git add components/booking/PendingBookingsDrawer.tsx components/site/SiteShopHotel.tsx
git commit -m "feat(orders): PendingBookingsDrawer uses /api/orders/lookup; cross-device works"
```

---

### Task 19: Delete `bookingStore.ts`, move shared type

**Files:**
- Delete: `store/bookingStore.ts`
- Create: `lib/orders/customer.ts` (move the type out)
- Modify: every file importing from `@/store/bookingStore`

- [ ] **Step 1: Create the new home for `CustomerDetails`**

Create `lib/orders/customer.ts`:

```ts
export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address?: string;
}
```

- [ ] **Step 2: Find all importers**

Run:
```bash
grep -rn "from '@/store/bookingStore'" components app
```

Expected: a list of TSX files. Each one needs its import updated.

- [ ] **Step 3: Update each importer**

For each file in the grep output, change:

```ts
import { ... } from '@/store/bookingStore';
import type { CustomerDetails } from '@/store/bookingStore';
```

to:

```ts
import type { CustomerDetails } from '@/lib/orders/customer';
```

(Drop the value imports — `useBookingStore`, `addBooking`, `removeBooking`, `pendingBookings` — they should already be unused per Tasks 12 and 18.)

Files known to need this update:
- `components/booking/CustomerDetailsModal.tsx` (type only)
- `components/site/SiteShopHotel.tsx` (was updated in Task 18 step 2)
- `components/site/SiteFloatingCart.tsx` (was updated in Task 11; double-check the import)
- `app/hotel/page.tsx`, `app/hotel/rooms/[id]/page.tsx`, `app/restaurant/page.tsx`, `app/store/products/[id]/page.tsx` — these are template-preview pages (not the merchant-facing surface). They still use the old localStorage-backed `useBookingStore`. **Decision: leave them on `useBookingStore` for now** — we'll deal with them only if we delete the store.

**Important:** because the template-preview pages still use the store, we cannot delete `store/bookingStore.ts` yet. Adjust the plan: for v1 we keep `bookingStore.ts` alive but only the template-preview pages use it; the merchant-facing site components are now DB-backed. That's the actual goal — "merchant sites at build.flotme.ai/[slug] use DB; template demos don't matter."

- [ ] **Step 4: Update bookingStore.ts to import the type from its new home**

Open `store/bookingStore.ts`. Replace the `CustomerDetails` interface declaration with:

```ts
import type { CustomerDetails } from '@/lib/orders/customer';
export type { CustomerDetails };  // re-export for callers still using the old path
```

This way, both the new path (`@/lib/orders/customer`) and the old path (`@/store/bookingStore`) yield the same type.

- [ ] **Step 5: Build**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 6: Commit**

```bash
git add lib/orders/customer.ts store/bookingStore.ts components/booking/CustomerDetailsModal.tsx components/site/SiteFloatingCart.tsx
git commit -m "refactor(orders): move CustomerDetails type to lib/orders/customer; bookingStore now template-only"
```

---

## Final verification

- [ ] **Step 1: Full clean build**

```bash
rm -rf .next
npm run build
```

Expected: clean build, all 19+ routes generated, including:
- `ƒ /api/orders`
- `ƒ /api/orders/[id]`
- `ƒ /api/orders/lookup`
- `ƒ /builder/[id]/orders`
- `ƒ /builder/[id]/orders/[orderId]`

- [ ] **Step 2: All unit tests pass**

```bash
npm test
```

Expected: ~16 tests pass (sanity + reference + status).

- [ ] **Step 3: End-to-end manual smoke**

In dev (`npm run dev`), do this full loop:

1. Sign in as merchant. Publish a hotel site.
2. Open it in a private window. Reserve a room (Reserve Only) with email `e2e@example.com`.
3. Switch to merchant browser. Visit `/builder/[id]/orders` — see the pending order. Click in. Click `Confirm Payment Received` → status flips to `confirmed`.
4. Cancel a different order — confirm status flips to `cancelled` and buttons disappear.
5. Open private window again, "My Reservations" with `e2e@example.com` — see the now-confirmed booking.

- [ ] **Step 4: Push**

```bash
git push origin main
```

(Or open a PR — depends on the branching policy; the spec describes 4 phases, each independently deployable, so you can also push at the end of each phase.)

---

## Self-review checklist (executed during planning)

- ✅ Spec coverage:
  - Schema (orders + order_items, indexes, JSON details) → Task 4
  - Reference format → Task 2
  - State machine → Task 3, enforced server-side in Task 7 (PATCH)
  - Multi-tenant isolation → Tasks 5, 6, 7 (every read filters on owner / site ownership)
  - All 5 endpoints → Tasks 5, 6, 7, 8, 9
  - Reference shown on success screen → Task 10
  - SiteFloatingCart writes → Task 11
  - SiteShopHotel Reserve Only writes → Task 12
  - SiteShopHotel pay-later PATCHes → Task 13
  - BuilderTabs nav → Task 14
  - StatusPill → Task 15
  - List page with filters → Task 16
  - Detail page with status actions → Task 17
  - PendingBookingsDrawer email lookup → Task 18
  - bookingStore deletion (revised: kept for template demos only) → Task 19
- ✅ No placeholders, every step has actual code.
- ✅ Type consistency: `OrderStatus`, `OrderVertical` defined in Task 3, used everywhere.
- ✅ Each phase ends in a deployable state.
