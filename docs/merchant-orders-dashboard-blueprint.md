# Merchant Order Dashboard — Build Blueprint

A reference for porting the order-persistence + merchant-admin pattern shipped in
Flot to another platform. Optimised for re-use: the layered concerns (data
model, API, multi-tenancy, retry, notifications, mobile) are all framework-
agnostic; only the routing/SSR conventions are Next.js-specific.

If your stack is React + Postgres / SQLite + a serverless host, you can follow
this almost verbatim. If your stack is something else, every decision still
maps — just swap the framework noun.

---

## 1. Goals

What the dashboard has to do, in order of importance:

1. **Persist every successful checkout** to a database, regardless of vertical
   (hotel reservation, restaurant order, store delivery, etc).
2. **Show each merchant their own orders only** — strict multi-tenant isolation.
3. **Let the merchant act on orders** — confirm payment, mark fulfilled, cancel.
4. **Surface new orders without polling** — so a merchant who left the tab
   open, or just signed in, sees pending work immediately.
5. **Survive cold starts and flaky mobile networks** — every transaction must
   be either applied exactly once or visibly fail.

What it deliberately does *not* do:

- Real payment processing (mocked behind a single interface so it's swappable).
- SMS notifications (cost-sensitive — replaceable later via the same
  notifications hook).
- Refunds, partial fulfilment, edits, exports — explicitly v2.

The non-goals matter because they constrain the schema and API. If you
include "refunds" in v1 you end up with order-level state machines plus
line-item-level state machines, audit logs, money reconciliation — twice the
code with the same merchant value.

---

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 14 App Router** | Co-located server route handlers + client pages without a separate API service. Edge-compatible. |
| Language | **TypeScript** | The order shape is the same client-side and server-side; one type file = no drift. |
| Database | **Turso (libsql)** | Serverless SQLite, edge-replicated, free tier is generous. Drop-in for Postgres later. |
| ORM | **drizzle-orm** | Schema-as-TS-types, no runtime overhead, plays well with Turso. |
| Auth | **NextAuth v5 (beta)** with OTP via email or phone | We already had it from a previous sub-project; works for the dashboard with no extra config. |
| Hosting | **Vercel** | Zero-config Next.js deploys, serverless functions, edge runtime when needed. |
| Email | **Resend** | One free key, sends a confirmation email to the buyer. Lazy-fired post-insert. |
| Charting / Tables | **None — plain HTML** | A merchant inbox doesn't need react-table. Custom CSS grid + status pills. Saves ~80 KB. |
| State (client) | **React state + sessionStorage** | No need for Redux/Zustand for an inbox. The polling hook owns its state. |

**Hard truth on swap-ability:** Turso → Postgres is a 5-line change. Drizzle
→ Prisma is a day. NextAuth → any other auth is mostly relabeling
`session.user.email`. Don't over-invest in abstraction layers; the schema
itself is the only durable interface.

---

## 3. Data Model

Two tables. That's the entire feature.

```ts
// drizzle/schema.ts
export const orders = sqliteTable('orders', {
  id:            text('id').primaryKey(),                       // 'ord_' + nanoid(16)
  reference:     text('reference').notNull().unique(),          // 'FLT-A8F2C4' — buyer-facing
  siteId:        text('site_id').notNull(),                     // FK → sites.id
  ownerEmail:    text('owner_email').notNull(),                 // denormalised — fast filter
  vertical:      text('vertical').notNull(),                    // hotel | restaurant | store | ...
  status:        text('status').notNull().default('confirmed'), // pending | confirmed | fulfilled | cancelled

  // Customer snapshot (do NOT mutate after creation)
  customerName:  text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerPhone: text('customer_phone').notNull(),

  // Money snapshot — integer in lowest currency unit
  subtotal:      integer('subtotal').notNull(),
  total:         integer('total').notNull(),
  currency:      text('currency').notNull().default('Le'),

  // Payment
  paymentMethod: text('payment_method'),                        // null while pending
  paymentRef:    text('payment_ref'),                           // gateway transaction id

  // Vertical-specific fields go in JSON — see "Why JSON details" below
  details:       text('details', { mode: 'json' }).notNull().default('{}'),

  createdAt:     integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt:     integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (t) => ({
  byOwner:    index('idx_orders_owner').on(t.ownerEmail, t.createdAt),  // dashboard query
  bySite:     index('idx_orders_site').on(t.siteId, t.createdAt),       // per-site dashboard
  byCustomer: index('idx_orders_customer').on(t.customerEmail),         // buyer lookup
}));

export const orderItems = sqliteTable('order_items', {
  id:          text('id').primaryKey(),
  orderId:     text('order_id').notNull(),
  name:        text('name').notNull(),
  description: text('description'),
  quantity:    integer('quantity').notNull().default(1),
  unitPrice:   integer('unit_price').notNull(),
  imageUrl:    text('image_url'),
  variant:     text('variant'),                                  // "M / Ecru" etc.
}, (t) => ({
  byOrder: index('idx_order_items_order').on(t.orderId),
}));
```

### Why exactly two tables, not five

A natural temptation: separate `bookings` (hotel) / `orders` (store) /
`reservations` (restaurant) tables, each typed for its vertical. **Don't.**
The merchant dashboard needs a single sorted-by-time inbox. Three tables means
a UNION query every page load, three migrations every time you add a field, and
a per-vertical detail page that diverges over time. One table with a `vertical`
column + a `details` JSON blob keeps:

- The dashboard query as a single index seek (`WHERE owner_email=? ORDER BY created_at DESC`)
- New verticals zero-migration (just a new value in `vertical` and a new shape in `details`)
- Aggregations trivial (`COUNT` / `SUM` across all order types)

The `details` JSON is **displayed** but never **queried**. If you ever need to
query inside it ("show me hotel orders checking in this week"), add an index
on the JSON path then — Turso, Postgres, and SQLite all support JSON expression
indexes. Until then, schema-on-write is overkill.

### Why money is `integer`

`Math.round(amount * 100)` everywhere. The Le (Sierra Leonean Leones) doesn't
even have a sub-unit, so we store whole leones. If we ever support USD we'll
add cents. The point is: never put `REAL`/`FLOAT` in a money column. Every
addition will eventually drift by 0.01 and that's the bug nobody can find.

### Why `reference` is separate from `id`

`id` is internal (`ord_a8f2c4d3e9b1`). `reference` is what the buyer sees
(`FLT-A8F2C4`). You want them separate because:

- Buyers will email/whatsapp the reference. It needs to be human-readable and
  free of look-alikes (no `0`/`O`, no `1`/`I`/`L`).
- The internal `id` should be opaque so changing it (sharding, etc.) doesn't
  leak into customer-support workflows.

The reference generator is `nanoid` with a custom alphabet
`ABCDEFGHJKMNPQRSTUVWXYZ23456789` — 30 chars, 6 characters wide → ~729M
combinations. Insert with retry on the unique constraint up to 3 times. At
your scale that's effectively never collision.

### Why the customer is snapshotted on the order

If a merchant later renames a product or updates a customer record, the
historical order shouldn't mutate. Every buyer-facing string the order
carries (customer name, item name, unit price, image URL) is **copied at
checkout time**, not joined at read time. Same pattern as Stripe, Shopify,
Square.

---

## 4. API Surface

Five endpoints. Three under `app/api/orders/route.ts`, two under
`app/api/orders/[id]/route.ts` and `app/api/orders/lookup/route.ts`.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/orders` | none | Buyer submits an order. Validates → looks up site by slug → inserts order + items in one transaction. |
| `GET` | `/api/orders?siteId=X` | merchant session | Dashboard list. Filters orders to the authenticated owner. Supports `?status=` and cursor pagination. |
| `GET` | `/api/orders/[id]` | merchant session | Order detail + line items. Ownership-checked. |
| `PATCH` | `/api/orders/[id]` | merchant session | Update status (with state-machine transition validation) and optionally payment fields. |
| `DELETE` | `/api/orders/[id]` | merchant session | Hard-delete a terminal-state order (`fulfilled` or `cancelled`). 400 on active orders. |
| `GET` | `/api/orders/lookup?siteSlug=X&email=Y` | none, rate-limited | Anonymous buyer-side lookup for "My Reservations". |

### Multi-tenancy is enforced at the SQL layer

Every authenticated read filters by the caller's identity:

```ts
const owned = await db.select().from(orders)
  .where(and(eq(orders.id, id), eq(orders.ownerEmail, userId)));
if (owned.length === 0) {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
```

Two crucial details:

1. **404, not 403, on cross-tenant access.** A 403 leaks the existence of an
   order under another merchant. A 404 is indistinguishable from "doesn't
   exist", so an attacker can't enumerate.
2. **The `POST` derives `ownerEmail` from the looked-up site, never from the
   request body.** A buyer cannot spoof which merchant gets the order. The
   site-slug → site-row lookup is the trust boundary.

### Validation returns *which* field failed

```ts
type ValidationResult =
  | { ok: true; body: CreateOrderBody }
  | { ok: false; reason: string };

function validateBody(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object') return { ok: false, reason: 'body is not an object' };
  // ...
  if (c.phone.trim().length > 0 && !PHONE_RE.test(c.phone)) {
    return { ok: false, reason: `customer.phone "${c.phone}" must be 7–15 digits with optional + prefix` };
  }
  // ...
  return { ok: true, body: b as unknown as CreateOrderBody };
}
```

The 400 response body includes the reason, which the buyer-side banner shows
verbatim. We learned this the hard way: a generic "Invalid request body"
message lost a real customer because their phone format failed a too-strict
regex and they had no way to know.

### Status state machine — universal vocabulary

```
        pending  →  confirmed  →  fulfilled
           ↓           ↓
       cancelled   cancelled
```

Four states across every vertical. Vertical-specific labels live in the UI
("Mark Completed" for hotels vs "Mark Fulfilled" for stores) but the
underlying state name is shared. Server-enforced transitions in `PATCH`:

```ts
const ALLOWED: Record<OrderStatus, readonly OrderStatus[]> = {
  pending:   ['confirmed', 'cancelled'],
  confirmed: ['fulfilled', 'cancelled'],
  fulfilled: [],
  cancelled: [],
};
```

The vocabulary is sticky. Adding a 5th state (e.g., `refunded`) is a real
schema change because it forks the state machine; resist the urge.

### Cold-start retry on the buyer side

Vercel's first hit on a serverless function can timeout / 5xx while the libsql
connection initialises. A single naïve POST will sometimes fail and the buyer
will see "Payment Failed" even though the mock charge succeeded. The fix is a
client-side wrapper that retries 3× with exponential backoff (600ms / 1.2s /
2.4s):

```ts
// lib/orders/post.ts
export async function postOrder(body, opts) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch('/api/orders', { method: 'POST', body: JSON.stringify(body), ... });
      if (res.ok) return { ok: true, ...await res.json() };
      // 4xx — won't get better on retry; surface immediately
      if (res.status >= 400 && res.status < 500) return { ok: false, error: ..., status: res.status };
      // 5xx — fall through to retry
    } catch (err) { /* network — fall through */ }
    if (attempt < 3) await new Promise(r => setTimeout(r, 600 * 2**(attempt-1)));
  }
  return { ok: false, error: 'failed after 3 attempts' };
}
```

**Critical detail:** **never retry 4xx.** If the request was bad, retrying
won't make it good — it'll just hide the error. Only retry on network errors
and 5xx. You'll need a real idempotency key for fully-correct retry semantics
(otherwise a successful insert whose response was lost gets duplicated). For
v1 we accept rare duplicates; merchants can cancel them.

### Anonymous lookup is rate-limited

`/api/orders/lookup?siteSlug=X&email=Y` is open to anyone — the buyer's
"My Reservations" drawer hits it. To keep it from being a free email-harvest
endpoint:

- Returns *only* orders matching both `siteSlug` AND `email` — neither alone
  returns anything. Attacker needs both.
- Rate-limited at 30 req/min per email via the same DB-backed limiter we use
  for OTP (more lenient than OTP because lookups are cheap).
- Returns a stripped order shape — no `ownerEmail`, no internal id format.

---

## 5. Frontend

```
app/builder/                        ← Merchant area (auth-gated by middleware)
├── page.tsx                        ← My Sites grid (with new-orders badge per site)
└── [id]/
    ├── page.tsx                    ← Site editor (with BuilderTabs)
    └── orders/
        ├── page.tsx                ← Inbox: filter pills, list, refresh, auto-refresh on tab focus
        └── [orderId]/page.tsx      ← Detail: customer, items, money, action buttons, delete

components/
├── builder/BuilderTabs.tsx         ← "Editor / Orders" nav with badge
└── orders/StatusPill.tsx           ← The four-state pill — green / blue / orange / grey

lib/
├── hooks/useOrderNotifications.ts  ← Polling + lastSeen + browser Notification API
└── orders/
    ├── post.ts                     ← Resilient POST helper with retry
    ├── status.ts                   ← isValidTransition() + assertTransition()
    ├── reference.ts                ← FLT-XXXXXX generator
    ├── customer.ts                 ← Shared CustomerDetails type
    └── types.ts                    ← OrderStatus, OrderVertical, ORDER_STATUSES
```

### Single fetch per page, not six

The original orders page fetched once for the visible list, then four more
times to compute per-status counts, then once more to compute totals. **Six
sequential round trips on every filter switch.** On 3G that was 4-6 seconds.

The fix: fetch ALL orders for the site once (limit 200), compute counts and
filtered list **client-side** with `useMemo`. Filter switching is now
instant (zero network) and initial paint is one round-trip.

```ts
const { allOrders } = useFetchOrders(siteId);
const counts = useMemo(() => /* count by status */, [allOrders]);
const visible = useMemo(
  () => filter === 'all' ? allOrders : allOrders.filter(o => o.status === filter),
  [allOrders, filter],
);
```

### Two layers of cache

1. **`sessionStorage`** keyed by `siteId`, 5-minute TTL. On page mount, render
   from cache *immediately*, then trigger a background refetch. Flicker-free
   navigation, fresh data on every load.
2. **Browser HTTP cache.** Don't add a `Cache-Control` header — orders
   shouldn't be cached. The `sessionStorage` layer is for *navigation*, not
   for staleness.

### Auto-refresh on tab focus

Browsers expose `visibilitychange` and `focus` events. When the merchant
returns to the orders tab from another window, we silently re-fetch. No
spinner — they only see fresh data. This is the cheapest, most respectful
"realtime" you can build without WebSockets.

```ts
useEffect(() => {
  const onVisible = () => {
    if (document.visibilityState === 'visible') fetchOrders().then(setAllOrders);
  };
  document.addEventListener('visibilitychange', onVisible);
  window.addEventListener('focus', onVisible);
  return () => {
    document.removeEventListener('visibilitychange', onVisible);
    window.removeEventListener('focus', onVisible);
  };
}, [siteId]);
```

---

## 6. Notifications (without paying for SMS)

Three layers, all free:

### a) Per-site count badge

`useOrderNotifications(siteId)` polls `/api/orders?siteId=X&limit=50` every
30 seconds and computes `newCount` = orders with `createdAt > lastSeen`.
`lastSeen` is per-browser localStorage; resets to `Date.now()` whenever the
merchant opens `/builder/[id]/orders` or returns focus to that tab. The
`BuilderTabs` "Orders" tab and the "My Sites" cards both read this count.

```ts
// Pseudo
const lastSeen = readLastSeen(siteId);
const fresh = data.orders.filter(o => new Date(o.createdAt) > lastSeen);
setNewCount(fresh.length);
```

### b) Document title

`document.title = newCount > 0 ? \`(${newCount}) Flot Builder\` : 'Flot Builder';`

A merchant with the dashboard tab in the background sees the unread count in
their browser tab title. No permissions required.

### c) Native browser notification

`Notification.requestPermission()` is asked **lazily** — 4 seconds after the
hook first runs, never on initial page load (which would feel like a spam
prompt). On each new order *id* we haven't notified about yet:

```ts
if (Notification.permission === 'granted' && document.visibilityState !== 'visible') {
  new Notification('New order', {
    body: `${order.reference} from ${order.customerName}`,
    tag: order.id,  // dedup
  });
}
```

The `tag` field deduplicates — if the same order id polls twice, it replaces
rather than stacks.

### d) Buyer-side email confirmation

`sendOrderConfirmationEmail()` is called *unawaited* (`void send…`) right
after the DB insert in `POST /api/orders`. If Resend is down or the buyer
didn't provide an email, the function silently no-ops; the order is already
in the DB so the merchant still sees it. Critical: don't `await` the email
send — a slow SMTP provider should never delay a 201 response.

---

## 7. Mobile Considerations You Will Forget

Buyers WILL test on phones. Lessons from a real audit pass:

1. **iOS Safari auto-zooms inputs with `font-size < 16px` on focus**, breaking
   modal layouts. Global rule:
   ```css
   @media (max-width: 640px) {
     input, textarea, select { font-size: 16px !important; }
   }
   ```
2. **Tap targets must be ≥ 44 × 44 px.** Especially +/- quantity buttons and
   icon-only actions. `min-h-[44px] min-w-[44px]` everywhere.
3. **Modal close buttons positioned outside the card with negative offsets are
   unreachable** when the modal is centred and clipped by the viewport. Pin
   them inside the card top-right.
4. **Brand text colour cascades through child modals** if you use Tailwind's
   CSS variable approach (`text-[var(--paper)]`). Hardcode modal text colours
   to plain white/zinc to prevent merchant brand from washing out the form.
5. **Phone numbers come in any format.** Strip everything but digits and `+`
   before sending. Accept both `076800100` and `+23276800100`.
6. **`inputMode` and `autoComplete` matter.** `inputMode="numeric"` for cards,
   `autoComplete="one-time-code"` for OTP, `autoComplete="tel"` for phone.
   The mobile keyboard difference is huge.
7. **iOS home indicator** covers the bottom 34 px of the viewport. Floating
   action buttons need `padding-bottom: max(1rem, env(safe-area-inset-bottom))`.
8. **localStorage caches break across devices.** A merchant on phone + laptop
   sees different "lastSeen" values. For v1 this is acceptable; for v2 sync
   to the server.

---

## 8. Security checklist

- [ ] All authenticated reads filter by the caller's identity at the SQL layer
- [ ] 404 (not 403) on cross-tenant access
- [ ] POST derives ownership from the looked-up site, never from the request body
- [ ] Validation returns specific field reasons but redacts customer values from logs
- [ ] Anonymous lookup endpoint requires both slug AND email
- [ ] Rate-limit any anonymous endpoint (per-email or per-IP bucket)
- [ ] Public site config strips merchant `ownerEmail` before returning
- [ ] Status transitions validated server-side, not just client-side
- [ ] Delete endpoint rejects active orders
- [ ] Type-to-confirm guardrail on destructive merchant actions (delete site)

---

## 9. Process — How This Was Built

Roughly 4 hours of focused work spread across a few sessions. The order
matters; resist parallelizing.

1. **Audit the existing state.** Catalog what already persists, what doesn't,
   what tables exist, which flows are end-to-end and which dead-end. We
   wrote a punchy 10-section audit report before designing anything. Saved
   us from designing for problems that didn't exist.
2. **Brainstorm scope.** Six independent subsystems were on the table
   (orders, payments, notifications, inventory, buyer accounts, analytics).
   Picked one to ship first: orders + dashboard. The others got numbered
   sub-projects and a recommended order.
3. **Lock decisions before designing.** Six binary-ish questions answered in
   sequence (unified vs split tables, status state machine, dashboard URL,
   per-browser vs per-user, etc.). Each followed by "approve and build, or
   change?". Took 15 minutes and zeroed-out scope creep.
4. **Write the spec doc.** ~300 lines covering goals, non-goals, schema, API,
   components, data flow, errors, testing, rollout phases. Committed before
   any code.
5. **Implement in 4 phases.** P1 schema + API, P2 wire checkout writes,
   P3 build the dashboard, P4 migrate the buyer drawer. Each phase deployable
   independently.
6. **Test on a real phone.** Three audits (buyer site, merchant builder,
   perf/correctness) found ~30 issues. Fix the P0/P1 ones; leave P2 polish
   for after launch.
7. **Iterate from real-user reports.** Vercel runtime logs are how you find
   out which form field your validator is killing. Surface the failing reason
   in the response body so support tickets contain the root cause.

The fastest part is the implementation. The spec + audits paid for themselves
multiple times during P3 when "should this go in details JSON or as a
top-level column?" was already answered.

---

## 10. What to copy verbatim

If you're porting this to another platform, these files are essentially
framework-agnostic and can be lifted with minor renaming:

- `lib/orders/types.ts` — pure types
- `lib/orders/status.ts` — pure functions
- `lib/orders/reference.ts` — pure function (uses `nanoid`)
- `lib/orders/post.ts` — uses `fetch`, no framework deps
- `lib/orders/customer.ts` — pure types
- `lib/hooks/useOrderNotifications.ts` — React hook, `localStorage` + `fetch` only
- The schema (`drizzle-orm/sqlite-core`) — translates 1:1 to Postgres or any
  other dialect
- The validation function — pure TS, swap the regexes if your locale differs

Framework-specific (rewrite for your stack):

- The route handlers (`app/api/orders/*/route.ts`) — Next.js convention
- `auth(async (req) => …)` wrapper — NextAuth-specific
- The pages (`app/builder/…`) — Next.js App Router
- `BuilderTabs` — uses `usePathname` from `next/navigation`

---

## 11. Closing notes

If you only remember three things:

- **One unified `orders` table with a JSON `details` blob** beats per-vertical
  schemas every time, because the merchant inbox is a single sorted list.
- **Multi-tenancy is enforced at the SQL layer**, not the UI. Filter by
  `ownerEmail` in *every* authenticated read; 404 on cross-tenant.
- **Make every error self-describing.** A 400 with `{"error": "Invalid request
  body"}` is a customer support ticket. A 400 with
  `{"error": "customer.phone must be 7–15 digits"}` is a self-correction.

— Built April 2026, Flot platform.
