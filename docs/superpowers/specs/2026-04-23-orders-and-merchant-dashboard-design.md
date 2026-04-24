# Orders & Merchant Dashboard — Design Spec

**Date:** 2026-04-23
**Sub-project:** #1 of the "end-to-end functional Flot platform" roadmap
**Status:** Approved by user

## Problem

Today, when a buyer completes checkout on a published Flot merchant site, the order vanishes into RAM. `FlotCheckout.onSuccess` clears local state and closes the modal — nothing is persisted. The merchant has no way to see incoming orders, no way to follow up with customers, and no record of what was bought. Hotel "Reserve Only" bookings live only in the buyer's browser localStorage, so the merchant doesn't see them at all and the buyer loses them when switching devices.

This sub-project introduces order persistence and a merchant dashboard so a real merchant can sign up, publish a site, and immediately start tracking incoming business.

## Goals (in scope for v1)

- Every successful checkout writes a row to a new `orders` table + N rows to a new `order_items` table.
- Hotel "Reserve Only" creates a row with `status='pending'` (no payment yet) — visible to both merchant and buyer.
- New page at `/builder/[id]/orders` — list of orders for a specific site, filterable by status, click for details.
- Three merchant write actions on each order, gated by a server-enforced state machine:
  - **Mark Fulfilled** (delivered / checked-out / completed)
  - **Confirm Payment Received** (manual fallback when a hotel pending booking gets paid offline)
  - **Cancel**
- Buyer "My Reservations" drawer (hotel only in v1) migrated from localStorage to DB-backed lookup-by-email.
- Buyer sees an order reference (e.g., `FLT-A8F2C4`) on the FlotCheckout success screen.

## Non-goals (deferred to later sub-projects)

| Out of scope | Why | Deferred to |
|---|---|---|
| Email/SMS confirmations to buyer or merchant | Real comms is its own subsystem | Sub-project #2 |
| Real payment gateway (Paystack, Flutterwave, mobile money) | Currently mocked by `flot-mock.ts`; replacement is a separate project | Sub-project #3 |
| Inventory decrement / room availability calendar | Separate concern, can ship after orders persist | Sub-project #4 |
| Buyer accounts and "My Orders" lookup for store/restaurant | Lookup-by-email drawer is hotel-only in v1 | Sub-project #5 |
| Refunds, partial fulfillment, edits | Need real payments first | Sub-project #6 |
| Search, CSV export, analytics, payouts | Wait for usage signal | Sub-project #6 |

## Architecture

### Data model

Two new tables added to `lib/db/schema.ts`. **Unified `orders` table for all verticals** (hotel/restaurant/store/travel) with vertical-specific data in a JSON `details` column. Multi-tenancy enforced by `ownerEmail` and `siteId` columns plus filtering at the SQL layer in every authenticated read.

```ts
export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),                    // 'ord_' + nanoid(16)
  reference: text('reference').notNull().unique(),// 'FLT-A8F2C4' — shown to buyer
  siteId: text('site_id').notNull(),              // FK → sites.id (no enforced cascade)
  ownerEmail: text('owner_email').notNull(),      // denormalized for fast filter
  vertical: text('vertical').notNull(),           // 'hotel' | 'restaurant' | 'store' | 'travel'
  status: text('status').notNull().default('confirmed'),
                                                  // 'pending' | 'confirmed' | 'fulfilled' | 'cancelled'

  // customer (snapshot — never updated after creation)
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerPhone: text('customer_phone').notNull(),

  // money (snapshot, integer in lowest currency unit)
  // v1: 'Le' = whole leones, no decimals. If we ever support USD, store in cents.
  subtotal: integer('subtotal').notNull(),
  total: integer('total').notNull(),
  currency: text('currency').notNull().default('Le'),

  // payment (mock today, real later)
  paymentMethod: text('payment_method'),          // 'flot' | 'mobile-money' | 'card' | null
  paymentRef: text('payment_ref'),                // mock token id today

  // vertical-specific
  details: text('details', { mode: 'json' }).notNull().default('{}'),
  // hotel:           { checkIn, checkOut, nights, guests, roomId }
  // store/restaurant:{ deliveryAddress }
  // travel:          { /* future */ }

  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (t) => ({
  byOwner:    index('idx_orders_owner').on(t.ownerEmail, t.createdAt),
  bySite:     index('idx_orders_site').on(t.siteId, t.createdAt),
  byCustomer: index('idx_orders_customer').on(t.customerEmail),
}));

export const orderItems = sqliteTable('order_items', {
  id: text('id').primaryKey(),                    // 'oi_' + nanoid(16)
  orderId: text('order_id').notNull(),            // FK → orders.id
  name: text('name').notNull(),
  description: text('description'),
  quantity: integer('quantity').notNull().default(1),
  unitPrice: integer('unit_price').notNull(),
  imageUrl: text('image_url'),
  variant: text('variant'),
}, (t) => ({
  byOrder: index('idx_order_items_order').on(t.orderId),
}));
```

**Why these specific choices:**

- **Two indexes on `orders`** (`owner+createdAt`, `site+createdAt`) cover both "merchant's overall inbox" and "single site's inbox" without table scans.
- **`reference` column separate from `id`** — `id` is internal, `reference` is the human-facing string buyers share with support. Easier to recognize.
- **Money as integer** in lowest currency unit (e.g., leones with no decimals) — avoids floating-point bugs at totals.
- **Customer + line items snapshotted** — if the merchant later updates a product's price/name, historical orders don't mutate.
- **`details` as JSON** matches the unified-table choice. The `details` blob is displayed but never queried (so an index isn't needed); if v2 needs `WHERE details.checkIn > today`, we add one then.
- **No CASCADE FK constraints** — deleting a site shouldn't silently nuke its order history. We keep the data and let the dashboard render "site deleted" gracefully.

### Status state machine

```
       (Hotel Reserve Only)        (Hotel Reserve & Pay, Store, Restaurant)
            pending                              confirmed
           /       \                            /         \
   (pay/manual)  (cancel)                 (deliver)    (cancel)
        \         /                            \        /
       confirmed                            fulfilled
       /       \
  (deliver)  (cancel)
       \      /
     fulfilled  ×  cancelled
       (both terminal — no further transitions)
```

Server-enforced in `PATCH /api/orders/:id`. Illegal transitions return 400.

### API surface

All endpoints live under `app/api/orders/`. Authenticated routes use the existing NextAuth `auth()` wrapper and ownership check pattern from `app/api/sites/route.ts`.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/orders` | none | Buyer creates an order. Validates `siteSlug` exists and is published, looks up `siteId` + `ownerEmail`, inserts order + items in a transaction. Returns full order including `reference`. |
| `GET` | `/api/orders?siteId=X[&status=Y]` | merchant | Lists orders for a site the merchant owns. Filters by status. Paginated by `?cursor=createdAt`. |
| `GET` | `/api/orders/:id` | merchant | Order detail + line items. Ownership check. |
| `PATCH` | `/api/orders/:id` | merchant | Body: `{ status }`. Validates transition. Updates `updatedAt`. |
| `GET` | `/api/orders/lookup?siteSlug=X&email=Y` | none (rate-limited) | Anonymous buyer-side lookup. Returns only orders matching both `siteSlug` and `customerEmail`. Rate-limited via existing `isRateLimited('lookup:<email>')`. |

**Multi-tenancy guarantees:**
- Authenticated routes filter by `WHERE owner_email = session.user`.
- Public lookup requires both `siteSlug` AND `email` — neither alone returns anything, and the response includes only orders matching both.
- `POST /api/orders` derives `ownerEmail` from the looked-up site, never from the request body — buyer cannot spoof.

### Order reference format

`FLT-` prefix + 6 uppercased base32 chars (alphabet excluding similar-looking 0/O/1/I/L). Generated server-side; uniqueness enforced by the `unique` constraint on `reference`. Collision retry up to 3 times with regenerated values. Example: `FLT-A8F2C4`.

### Where checkout writes orders

| Trigger | Flow |
|---|---|
| Buyer completes payment in `FlotCheckout` (any vertical) | The component's `onSuccess(chargeResult)` callback now first calls `POST /api/orders` with `status='confirmed'`, the snapshotted customer details, and the cart items. The returned `reference` is shown on the success screen. |
| Hotel Reserve Only — buyer submits `CustomerDetailsModal` | `SiteShopHotel.handleReserveOnly` calls `POST /api/orders` with `status='pending'`, no payment fields. Success toast displays the reference. |
| Hotel Reserve Only → buyer pays later via "My Reservations" drawer | The existing `FlotCheckout` flow opens, but `onSuccess` PATCHes the existing order to `status='confirmed'` with the payment fields, instead of creating a new one. Implementation: `FlotCheckout` gains an optional `existingOrderId` prop; when present, the parent's `onSuccess` PATCHes that order. When absent (the default), it POSTs a new order. The `PendingBookingsDrawer` → `SiteShopHotel` → `FlotCheckout` chain threads the value through. |

## Components

### Buyer-side changes

1. **`components/checkout/FlotCheckout.tsx`** — success step adds an "Order reference: **FLT-A8F2C4**" line above the existing animation. The `onSuccess` callback signature stays the same; the new behavior (POST or PATCH) is in the parent that supplies `onSuccess`.
2. **`components/site/SiteShopHotel.tsx`** — `handleReserveOnly` calls the new `/api/orders` POST instead of `bookingStore.addBooking`. Shows the reference in the existing toast.
3. **`components/site/SiteFloatingCart.tsx`** — `onSuccess` for the FlotCheckout instance posts the order before clearing the cart.
4. **`components/booking/PendingBookingsDrawer.tsx`** — replaces zustand reads with a server fetch via `/api/orders/lookup`. First open per session shows an "Enter your email to see your reservations" form, caches the email in `sessionStorage`.
5. **`store/bookingStore.ts`** — **deleted** in P4. No longer needed.

### Merchant-side changes

New pages under `app/builder/[id]/orders/`:

```
app/builder/[id]/page.tsx                      ← existing editor; gets a tab bar
app/builder/[id]/orders/page.tsx               ← NEW: list view
app/builder/[id]/orders/[orderId]/page.tsx     ← NEW: detail view
```

**Tab navigation** — a shared header component (`components/builder/BuilderTabs.tsx`) renders `Editor | Orders` links and is included on both `app/builder/[id]/page.tsx` and the new `/orders` pages. The "tabs" are just two route links styled to look like tabs; they're not in-page tabs. Merchants flip between the two without leaving the site context.

**List view** (`/builder/[id]/orders`):
- Header: site name + status-filter pills (All / Pending / Confirmed / Fulfilled / Cancelled) with count badges.
- Rows: reference, customer name, total, status pill, relative time. Click → detail view.
- Pagination: load-more button (cursor-based, page size 50).
- Empty state copy: "No orders yet. Once buyers complete checkout on your published site, they'll show up here."

**Detail view** (`/builder/[id]/orders/[orderId]`):
- Header: reference, status pill, action buttons appropriate to the current status.
- Customer block: name, email (`mailto:`), phone (`tel:`).
- Vertical-specific block from `details`:
  - Hotel: check-in / check-out / nights / guests / room name (from line item).
  - Store / Restaurant: delivery address.
- Line items table with thumbnails, quantities, line totals.
- Money breakdown: subtotal, total, currency.
- Payment block: method + masked ref, or "Awaiting payment" if `pending`.
- Footer: created/updated timestamps.

### New shared component

`components/orders/StatusPill.tsx` — small consistent UI for rendering the four statuses with appropriate colors.

## Data flow

### Buyer-pays flow (store/restaurant/hotel paid)

```
SiteFloatingCart / SiteShopHotel
  → user fills CustomerDetailsModal
  → user fills payment in FlotCheckout
  → flotMock.charge() succeeds
  → onSuccess(chargeResult) callback:
      POST /api/orders { siteSlug, customer, items, payment, details, status: 'confirmed' }
  → API:
      tx: insert orders row + insert N order_items rows
      return { id, reference, ... }
  → success step shows reference
  → cart cleared
```

### Hotel Reserve Only flow

```
SiteShopHotel
  → user picks Reserve Only in BookingChoiceModal
  → user fills CustomerDetailsModal
  → handleReserveOnly:
      POST /api/orders { siteSlug, customer, items, details, status: 'pending' }
  → API: same insert path as above
  → toast: "Reserved! Reference FLT-XXXXXX"
```

### Hotel Reserve Only → pay later flow

```
PendingBookingsDrawer
  → user clicks "Pay Now" on a pending order
  → SiteShopHotel opens FlotCheckout with existingOrderId
  → flotMock.charge() succeeds
  → onSuccess:
      PATCH /api/orders/:existingOrderId { status: 'confirmed', paymentMethod, paymentRef }
  → close modal, refresh drawer
```

### Merchant ops flow

```
Merchant signs in → /builder
  → clicks site → /builder/[id]
  → clicks "Orders" tab → /builder/[id]/orders
  → sees list, clicks one → /builder/[id]/orders/[orderId]
  → clicks "Mark Fulfilled":
      PATCH /api/orders/:id { status: 'fulfilled' }
  → API validates ownership + transition, updates row, returns 200
  → page re-fetches and re-renders
```

### Buyer drawer flow (hotel)

```
PendingBookingsDrawer first open this session:
  → "Enter your email to see your reservations" → user enters
  → GET /api/orders/lookup?siteSlug=<slug>&email=<email>
  → API rate-limits, fetches orders matching both
  → drawer renders pending + confirmed bookings
  → user clicks "Pay Now" on a pending one → existing flow above
```

## Error handling

- **POST /api/orders** with invalid `siteSlug` (not published, doesn't exist) → 404 with safe message.
- **POST /api/orders** with empty cart → 400.
- **PATCH /api/orders/:id** with illegal transition (e.g., `cancelled` → `fulfilled`) → 400 `Invalid status transition`.
- **PATCH /api/orders/:id** by a merchant who doesn't own the site → 404 (not 403, to avoid leaking existence).
- **GET /api/orders/lookup** rate-limit hit → 429.
- **`POST /api/orders`** transaction failure (e.g., DB hiccup mid-insert) → roll back the orders row if `order_items` insert fails. Use a single libsql transaction.
- **Reference collision** on `POST` → retry up to 3 times with new value, then 500.
- **Network error during checkout-success → POST orders**: the buyer sees an error overlay with "Try again" — payment was mocked, so no money was lost; for real payments later, this becomes a critical reconciliation path (out of scope for v1).

## Testing

Manual smoke test plan after each phase ships:

**P1 (schema + API):**
- `curl -X POST /api/orders` with valid payload → row appears in DB, response has `reference`.
- `curl GET /api/orders?siteId=X` with the merchant's session cookie → returns their orders.
- Same call without auth or with another merchant's session → 401 or empty.
- `curl PATCH /api/orders/:id { status: cancelled }` after fulfilled → 400.

**P2 (checkout writes):**
- Buy from a published store site → row appears with `status='confirmed'`, items snapshot intact, reference shown on screen.
- Reserve a hotel room without paying → row appears with `status='pending'`.
- Pay later from drawer → same row flips to `confirmed`, no second row created.

**P3 (merchant dashboard):**
- Sign in as merchant → `/builder/[id]/orders` lists everything from P2.
- Filter by status pills → counts and rows match.
- Click an order → detail page renders all the right fields per vertical.
- Click "Mark Fulfilled" → status flips, button disappears.

**P4 (buyer migration):**
- New buyer reserves on phone → switches to laptop → enters email in drawer → reservation appears.
- Old localStorage data: confirm graceful "no reservations found" if a buyer's localStorage was the only record (we accept this loss for v1; localStorage data is dev/demo only).

## Rollout phases

| Phase | Scope | Demo state after |
|---|---|---|
| **P1: Schema + API** | New tables, all 5 endpoints, ownership/auth, rate limiting. No UI. | `curl` POST writes a row; merchant `curl` GET with session reads it. |
| **P2: Checkout writes** | Wire `SiteFloatingCart` and `SiteShopHotel` to POST on success/reserve. FlotCheckout success screen shows reference. | A real buyer flow on a published site creates DB rows. |
| **P3: Merchant dashboard** | List page, detail page, status update buttons, navigation tab. | Merchant signs in → `/builder/[id]/orders` shows everything. |
| **P4: Hotel buyer migration** | `PendingBookingsDrawer` rewired to email lookup. Delete `bookingStore.ts`. | Cross-device "My Reservations" works. |

Each phase is a deployable PR. P1+P2 can ship together to staging on day one and deliver working orders before the dashboard lands.

## Open questions

None at design time — all picked. Real questions will surface during planning and implementation.
