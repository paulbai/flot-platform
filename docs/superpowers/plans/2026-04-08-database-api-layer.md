# Phase 1: Database + API Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace localStorage-only architecture with a Turso database + API layer so 1000+ users can persist sites server-side, access from any device, and serve published sites to visitors.

**Architecture:** Turso (libsql) for the database, Drizzle ORM for type-safe queries, Next.js API routes for CRUD with server-side auth. Zustand remains as a client-side cache but syncs to/from the API. SiteConfig is stored as a JSON column to avoid 50+ relational columns.

**Tech Stack:** Turso/libsql, Drizzle ORM, Next.js API Routes, NextAuth session, Zod validation

---

## File Structure

### New Files
- `lib/db/index.ts` — Database client (libsql connection)
- `lib/db/schema.ts` — Drizzle schema (users, sites, otp_codes tables)
- `lib/db/migrate.ts` — Migration runner script
- `drizzle.config.ts` — Drizzle Kit configuration
- `app/api/sites/route.ts` — GET (list) + POST (create) sites
- `app/api/sites/[id]/route.ts` — GET + PATCH + DELETE single site
- `app/api/sites/public/[slug]/route.ts` — Public read for published sites

### Modified Files
- `package.json` — Add @libsql/client, drizzle-orm, drizzle-kit
- `lib/otp.ts` — Replace in-memory Map with database table
- `app/api/auth/send-otp/route.ts` — Use DB-backed rate limiting
- `store/siteBuilderStore.ts` — Replace localStorage with API calls
- `app/builder/page.tsx` — Fetch sites from API
- `app/builder/[id]/page.tsx` — Load site from API
- `app/site/[slug]/page.tsx` — Server-render published sites from DB

---

## Task 1: Install Dependencies and Configure Turso

**Files:**
- Modify: `package.json`
- Create: `drizzle.config.ts`
- Create: `lib/db/index.ts`

- [ ] **Step 1: Install database dependencies**

```bash
cd "/Users/pabai/Documents/Flot checkout/flot-platform"
npm install @libsql/client drizzle-orm
npm install -D drizzle-kit
```

- [ ] **Step 2: Create Turso database**

```bash
# Install Turso CLI if needed
brew install tursodatabase/tap/turso
turso auth login
turso db create flot-platform
turso db show flot-platform --url
turso db tokens create flot-platform
```

Save the URL and token. Add to `.env.local`:
```
TURSO_DATABASE_URL=libsql://flot-platform-<username>.turso.io
TURSO_AUTH_TOKEN=<token>
```

- [ ] **Step 3: Create database client**

Create `lib/db/index.ts`:
```typescript
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
```

- [ ] **Step 4: Create Drizzle config**

Create `drizzle.config.ts`:
```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
} satisfies Config;
```

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json drizzle.config.ts lib/db/index.ts .env.local
git commit -m "feat: add Turso database client and Drizzle config"
```

---

## Task 2: Define Database Schema

**Files:**
- Create: `lib/db/schema.ts`

- [ ] **Step 1: Create the schema with users, sites, and otp_codes tables**

Create `lib/db/schema.ts`:
```typescript
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
```

- [ ] **Step 2: Push schema to Turso**

```bash
npx drizzle-kit push
```

- [ ] **Step 3: Verify tables were created**

```bash
turso db shell flot-platform ".tables"
```

Expected: `users  sites  otp_codes  rate_limits`

- [ ] **Step 4: Commit**

```bash
git add lib/db/schema.ts
git commit -m "feat: define database schema for users, sites, otp_codes, rate_limits"
```

---

## Task 3: Migrate OTP System to Database

**Files:**
- Modify: `lib/otp.ts`
- Modify: `app/api/auth/send-otp/route.ts`

- [ ] **Step 1: Rewrite lib/otp.ts to use database**

Replace the entire file `lib/otp.ts`:
```typescript
import { randomInt } from 'crypto';
import { db } from './db';
import { otpCodes, rateLimits } from './db/schema';
import { eq, and, gt, lt } from 'drizzle-orm';

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3;

export async function generateOtp(email: string): Promise<string> {
  const key = email.toLowerCase().trim();
  const code = randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  // Delete any existing OTP for this email
  await db.delete(otpCodes).where(eq(otpCodes.email, key));

  // Insert new OTP
  await db.insert(otpCodes).values({
    email: key,
    code,
    attempts: 0,
    expiresAt,
  });

  return code;
}

export async function verifyOtp(email: string, code: string): Promise<boolean> {
  const key = email.toLowerCase().trim();
  const now = new Date();

  // Find the OTP entry
  const entries = await db.select().from(otpCodes)
    .where(and(eq(otpCodes.email, key), gt(otpCodes.expiresAt, now)));

  if (entries.length === 0) return false;

  const entry = entries[0];

  // Check brute-force attempts
  if (entry.attempts >= MAX_ATTEMPTS) {
    await db.delete(otpCodes).where(eq(otpCodes.id, entry.id));
    return false;
  }

  // Increment attempts
  await db.update(otpCodes)
    .set({ attempts: entry.attempts + 1 })
    .where(eq(otpCodes.id, entry.id));

  // Timing-safe comparison
  if (entry.code.length !== code.length) return false;
  let mismatch = 0;
  for (let i = 0; i < entry.code.length; i++) {
    mismatch |= entry.code.charCodeAt(i) ^ code.charCodeAt(i);
  }
  if (mismatch !== 0) return false;

  // Success — delete the OTP
  await db.delete(otpCodes).where(eq(otpCodes.id, entry.id));
  return true;
}

export async function isRateLimited(key: string): Promise<boolean> {
  const now = new Date();

  // Clean up expired entries
  await db.delete(rateLimits).where(lt(rateLimits.resetAt, now));

  // Check current rate
  const entries = await db.select().from(rateLimits)
    .where(and(eq(rateLimits.key, key), gt(rateLimits.resetAt, now)));

  if (entries.length === 0) {
    await db.insert(rateLimits).values({
      key,
      count: 1,
      resetAt: new Date(Date.now() + RATE_LIMIT_WINDOW_MS),
    });
    return false;
  }

  const entry = entries[0];
  await db.update(rateLimits)
    .set({ count: entry.count + 1 })
    .where(eq(rateLimits.id, entry.id));

  return entry.count >= MAX_REQUESTS_PER_WINDOW;
}

// Cleanup expired entries (call periodically or on each request)
export async function cleanupExpired(): Promise<void> {
  const now = new Date();
  await db.delete(otpCodes).where(lt(otpCodes.expiresAt, now));
  await db.delete(rateLimits).where(lt(rateLimits.resetAt, now));
}
```

- [ ] **Step 2: Update lib/auth.ts to use async verifyOtp**

In `lib/auth.ts`, change the `authorize` function to await `verifyOtp`:
```typescript
const isValid = await verifyOtp(email, code);
if (!isValid) return null;
```

- [ ] **Step 3: Rewrite send-otp route to use DB-backed rate limiting**

Replace `app/api/auth/send-otp/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { generateOtp, isRateLimited, cleanupExpired } from '@/lib/otp';
import { sendOtpEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    await cleanupExpired();

    // Rate limit by IP
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';

    if (await isRateLimited(`ip:${ip}`)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute.' },
        { status: 429 }
      );
    }

    const { email } = await request.json();

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Rate limit by email
    if (await isRateLimited(`email:${email.toLowerCase().trim()}`)) {
      return NextResponse.json(
        { error: 'Too many requests for this email. Please wait a minute.' },
        { status: 429 }
      );
    }

    const code = await generateOtp(email);
    await sendOtpEmail(email, code);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 4: Build and verify**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add lib/otp.ts lib/auth.ts app/api/auth/send-otp/route.ts
git commit -m "feat: migrate OTP and rate limiting to Turso database"
```

---

## Task 4: Build Sites API — Create and List

**Files:**
- Create: `app/api/sites/route.ts`

- [ ] **Step 1: Create the sites API route (GET + POST)**

Create `app/api/sites/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { sites, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { SiteConfig, Vertical } from '@/lib/types/customization';

// GET /api/sites — list authenticated user's sites
export const GET = auth(async (req) => {
  if (!req.auth?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const email = req.auth.user.email;
  const rows = await db.select().from(sites).where(eq(sites.ownerEmail, email));

  const configs: SiteConfig[] = rows.map((row) => ({
    ...(row.config as Omit<SiteConfig, 'id' | 'slug' | 'status' | 'createdAt' | 'updatedAt'>),
    id: row.id,
    slug: row.slug,
    status: row.status as 'draft' | 'published',
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));

  return NextResponse.json(configs);
}) as unknown as (req: Request) => Promise<Response>;

// POST /api/sites — create a new site
export const POST = auth(async (req) => {
  if (!req.auth?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const email = req.auth.user.email;
  const body = await req.json();
  const config = body as SiteConfig;

  if (!config.id || !config.slug || !config.vertical) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Ensure user exists in users table (upsert)
  const existingUser = await db.select().from(users).where(eq(users.email, email));
  if (existingUser.length === 0) {
    await db.insert(users).values({
      id: email,
      email,
      name: email.split('@')[0],
    });
  }

  // Force ownerEmail to be the authenticated user
  config.ownerEmail = email;

  await db.insert(sites).values({
    id: config.id,
    slug: config.slug,
    ownerEmail: email,
    vertical: config.vertical,
    templateId: config.templateId || '',
    status: config.status || 'draft',
    config: config as unknown as Record<string, unknown>,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return NextResponse.json(config, { status: 201 });
}) as unknown as (req: Request) => Promise<Response>;
```

- [ ] **Step 2: Build and verify**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add app/api/sites/route.ts
git commit -m "feat: add sites API — list and create endpoints"
```

---

## Task 5: Build Sites API — Read, Update, Delete

**Files:**
- Create: `app/api/sites/[id]/route.ts`

- [ ] **Step 1: Create single-site API route (GET + PATCH + DELETE)**

Create `app/api/sites/[id]/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { sites } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import type { SiteConfig } from '@/lib/types/customization';

// GET /api/sites/[id]
export const GET = auth(async (req, { params }: { params: Promise<{ id: string }> }) => {
  if (!req.auth?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const email = req.auth.user.email;

  const rows = await db.select().from(sites)
    .where(and(eq(sites.id, id), eq(sites.ownerEmail, email)));

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const row = rows[0];
  const config: SiteConfig = {
    ...(row.config as Omit<SiteConfig, 'id' | 'slug' | 'status' | 'createdAt' | 'updatedAt'>),
    id: row.id,
    slug: row.slug,
    status: row.status as 'draft' | 'published',
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };

  return NextResponse.json(config);
}) as unknown as (req: Request, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;

// PATCH /api/sites/[id] — partial update
export const PATCH = auth(async (req, { params }: { params: Promise<{ id: string }> }) => {
  if (!req.auth?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const email = req.auth.user.email;
  const updates = await req.json();

  // Verify ownership
  const rows = await db.select().from(sites)
    .where(and(eq(sites.id, id), eq(sites.ownerEmail, email)));

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const existing = rows[0];
  const existingConfig = existing.config as Record<string, unknown>;

  // Merge the update into the existing config
  const merged = { ...existingConfig, ...updates };

  // Update top-level columns if they changed
  await db.update(sites)
    .set({
      config: merged,
      slug: (updates.slug as string) || existing.slug,
      status: (updates.status as string) || existing.status,
      templateId: (updates.templateId as string) || existing.templateId,
      updatedAt: new Date(),
    })
    .where(eq(sites.id, id));

  return NextResponse.json({ success: true });
}) as unknown as (req: Request, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;

// DELETE /api/sites/[id]
export const DELETE = auth(async (req, { params }: { params: Promise<{ id: string }> }) => {
  if (!req.auth?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const email = req.auth.user.email;

  const result = await db.delete(sites)
    .where(and(eq(sites.id, id), eq(sites.ownerEmail, email)));

  return NextResponse.json({ success: true });
}) as unknown as (req: Request, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;
```

- [ ] **Step 2: Build and verify**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add "app/api/sites/[id]/route.ts"
git commit -m "feat: add single-site API — read, update, delete with ownership check"
```

---

## Task 6: Build Public Site Endpoint

**Files:**
- Create: `app/api/sites/public/[slug]/route.ts`

- [ ] **Step 1: Create public endpoint for published sites (no auth required)**

Create `app/api/sites/public/[slug]/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sites } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import type { SiteConfig } from '@/lib/types/customization';

// GET /api/sites/public/[slug] — no auth, only published sites
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const rows = await db.select().from(sites)
    .where(and(eq(sites.slug, slug), eq(sites.status, 'published')));

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const row = rows[0];
  const config: SiteConfig = {
    ...(row.config as Omit<SiteConfig, 'id' | 'slug' | 'status' | 'createdAt' | 'updatedAt'>),
    id: row.id,
    slug: row.slug,
    status: row.status as 'draft' | 'published',
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };

  return NextResponse.json(config);
}
```

- [ ] **Step 2: Build and verify**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add "app/api/sites/public/[slug]/route.ts"
git commit -m "feat: add public site endpoint for published sites"
```

---

## Task 7: Migrate Zustand Store to API-Backed

**Files:**
- Modify: `store/siteBuilderStore.ts`

This is the critical migration. The store will call API endpoints for all CRUD operations, while keeping Zustand as a client-side cache for responsive UI. Writes go to the API first, then update local state on success.

- [ ] **Step 1: Add API helper functions at the top of siteBuilderStore.ts**

Add above the `useSiteBuilderStore` definition:
```typescript
async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function apiPost<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function apiPatch(url: string, body: unknown): Promise<void> {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
}

async function apiDelete(url: string): Promise<void> {
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
}
```

- [ ] **Step 2: Add fetchSites and syncSite actions to the store interface**

In `lib/types/customization.ts`, add to `SiteBuilderState`:
```typescript
  fetchSites: () => Promise<void>;
  syncSite: (id: string) => Promise<void>;
```

- [ ] **Step 3: Update createSite to POST to API**

Replace the `createSite` action:
```typescript
createSite: (vertical, name, ownerEmail, templateId) => {
  const site = createDefaultSite(vertical, name, ownerEmail, templateId);
  set((s) => ({ sites: [...s.sites, site], activeSiteId: site.id }));
  // Async save to API (fire-and-forget, will retry on next sync)
  apiPost('/api/sites', site).catch(console.error);
  return site.id;
},
```

- [ ] **Step 4: Update deleteSite to call API**

```typescript
deleteSite: (id) => {
  set((s) => ({
    sites: s.sites.filter((site) => site.id !== id),
    activeSiteId: s.activeSiteId === id ? null : s.activeSiteId,
  }));
  apiDelete(`/api/sites/${id}`).catch(console.error);
},
```

- [ ] **Step 5: Add a debounced save helper for all update* actions**

Add a debounce map above the store:
```typescript
const saveTimers = new Map<string, NodeJS.Timeout>();

function debouncedSave(id: string, getSite: (id: string) => SiteConfig | undefined) {
  const existing = saveTimers.get(id);
  if (existing) clearTimeout(existing);
  saveTimers.set(id, setTimeout(() => {
    const site = getSite(id);
    if (site) {
      apiPatch(`/api/sites/${id}`, site).catch(console.error);
    }
    saveTimers.delete(id);
  }, 1000)); // Debounce 1 second
}
```

- [ ] **Step 6: Wire debouncedSave into every update action**

For each `update*` method, add `debouncedSave(id, get().getSite)` after the `set()` call. Example for `updateBrand`:
```typescript
updateBrand: (id, data) => {
  set((s) => ({
    sites: s.sites.map((site) =>
      site.id === id ? { ...site, brand: { ...site.brand, ...data }, updatedAt: new Date().toISOString() } : site
    ),
  }));
  debouncedSave(id, (sid) => get().getSite(sid));
},
```

Apply the same pattern to ALL 17 update methods.

- [ ] **Step 7: Add fetchSites action**

```typescript
fetchSites: async () => {
  try {
    const sites = await apiGet<SiteConfig[]>('/api/sites');
    set({ sites });
  } catch (err) {
    console.error('Failed to fetch sites:', err);
  }
},

syncSite: async (id) => {
  try {
    const site = await apiGet<SiteConfig>(`/api/sites/${id}`);
    set((s) => ({
      sites: s.sites.map((existing) => existing.id === id ? site : existing),
    }));
  } catch (err) {
    console.error('Failed to sync site:', err);
  }
},
```

- [ ] **Step 8: Update publishSite and unpublishSite to save to API**

```typescript
publishSite: (id) => {
  set((s) => ({
    sites: s.sites.map((site) =>
      site.id === id ? { ...site, status: 'published', updatedAt: new Date().toISOString() } : site
    ),
  }));
  const site = get().getSite(id);
  if (site) apiPatch(`/api/sites/${id}`, site).catch(console.error);
},
```

Same pattern for `unpublishSite`.

- [ ] **Step 9: Build and verify**

```bash
npm run build
```

- [ ] **Step 10: Commit**

```bash
git add store/siteBuilderStore.ts lib/types/customization.ts
git commit -m "feat: migrate Zustand store to API-backed with debounced saves"
```

---

## Task 8: Update Builder Pages to Fetch from API

**Files:**
- Modify: `app/builder/page.tsx`
- Modify: `app/builder/[id]/page.tsx`

- [ ] **Step 1: Update builder listing page to fetch sites on mount**

In `app/builder/page.tsx`, add an effect to fetch sites from the API when the page loads:

Add after existing hooks:
```typescript
const fetchSites = useSiteBuilderStore((s) => s.fetchSites);

useEffect(() => {
  if (session?.user?.email) {
    fetchSites();
  }
}, [session?.user?.email, fetchSites]);
```

This replaces the localStorage-only approach. The store will be hydrated from the API.

- [ ] **Step 2: Update editor page to sync the active site on mount**

In `app/builder/[id]/page.tsx`, add an effect to ensure the site is loaded from the API:

Add after existing hooks:
```typescript
const syncSite = useSiteBuilderStore((s) => s.syncSite);

useEffect(() => {
  if (id) {
    syncSite(id);
  }
}, [id, syncSite]);
```

- [ ] **Step 3: Build and verify**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add app/builder/page.tsx "app/builder/[id]/page.tsx"
git commit -m "feat: builder pages fetch sites from API on mount"
```

---

## Task 9: Update Published Site Page to Use API

**Files:**
- Modify: `app/site/[slug]/page.tsx`

- [ ] **Step 1: Rewrite published site page to fetch from public API**

The published site page must fetch the site config from the server, not from localStorage. Replace the Zustand store lookup with an API call:

```typescript
'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import SiteRenderer from '@/components/site/SiteRenderer';
import type { SiteConfig } from '@/lib/types/customization';

export default function PublishedSitePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [site, setSite] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/sites/public/${slug}`)
      .then((res) => {
        if (!res.ok) {
          setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setSite(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (notFound || !site) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">404</h1>
          <p className="text-gray-400">This site does not exist or is not published.</p>
        </div>
      </div>
    );
  }

  return <SiteRenderer config={site} />;
}
```

- [ ] **Step 2: Build and verify**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add "app/site/[slug]/page.tsx"
git commit -m "feat: published sites served from database via public API"
```

---

## Task 10: Set Vercel Environment Variables and Deploy

**Files:**
- None (configuration only)

- [ ] **Step 1: Set environment variables on Vercel**

```bash
cd "/Users/pabai/Documents/Flot checkout/flot-platform"
printf '%s' "libsql://flot-platform-<username>.turso.io" | vercel env add TURSO_DATABASE_URL production
printf '%s' "<turso-auth-token>" | vercel env add TURSO_AUTH_TOKEN production
```

- [ ] **Step 2: Push to GitHub and deploy**

```bash
git push origin main
```

- [ ] **Step 3: Verify deployment**

Check Vercel dashboard for successful build. Test:
1. Sign in and create a site
2. Refresh — site should persist (from database, not localStorage)
3. Open in incognito, sign in with same email — sites should appear
4. Publish a site, visit `/site/<slug>` in a different browser — should render

---

## Post-Implementation Notes

### What This Achieves
- All site data persisted in Turso database
- OTP codes and rate limits survive serverless cold starts
- Published sites accessible to anyone (no localStorage dependency)
- Server-side ownership verification on all CRUD operations
- Cross-device access for authenticated users

### What's Left for Phase 2
- Image upload to Vercel Blob/Cloudinary (currently base64 in DB JSON)
- Edge caching for published sites (ISR or Redis)
- Database backups and monitoring
- Pagination for users with many sites
