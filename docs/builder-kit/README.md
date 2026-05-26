# Flot Builder Kit

A mirror of the merchant-side of the Flot platform — site builder, editor,
orders dashboard, preview, auth, notifications, and supporting libraries —
extracted into a self-contained directory so you can drop it into a new
project as a starting scaffold.

**This is real, currently-deployed code copied verbatim**, not a template
generated from scratch. It builds and runs as-is; nothing is stubbed.

---

## 1. What's included

Everything a merchant touches:

| Surface | Path |
|---|---|
| Landing/marketing | *(intentionally excluded — see §3)* |
| Sign-in (OTP via email or phone) | `app/api/auth/`, `components/auth/`, `lib/auth.ts`, `lib/otp.ts`, `lib/email.ts`, `lib/sms.ts` |
| My Sites grid | `app/builder/page.tsx` |
| Site editor (sidebar + live preview) | `app/builder/[id]/page.tsx` |
| Orders inbox (list + filters + auto-refresh) | `app/builder/[id]/orders/page.tsx` |
| Order detail (status actions + delete) | `app/builder/[id]/orders/[orderId]/page.tsx` |
| Site preview (owner-only) | `app/preview/[id]/page.tsx` |
| Sites CRUD API | `app/api/sites/route.ts`, `app/api/sites/[id]/route.ts` |
| Orders CRUD + lookup API | `app/api/orders/route.ts`, `app/api/orders/[id]/route.ts`, `app/api/orders/lookup/route.ts` |
| DB schema + migrations | `lib/db/schema.ts`, `lib/db/index.ts`, `drizzle/` |
| Notifications hook (polling + badges + Notification API) | `lib/hooks/useOrderNotifications.ts` |
| Order utilities (status machine, reference generator, retry helper) | `lib/orders/` |
| Live preview renderer + shop components | `components/site/` |
| All form modals (booking choice, customer details, order type, pending drawer) | `components/booking/` |
| Checkout UI (mock payment) | `components/checkout/` |
| Customization controls (color picker, image uploader, etc.) | `components/customization/` |
| Builder tabs, status pill, shared UI primitives | `components/builder/`, `components/orders/`, `components/ui/`, `components/layout/`, `components/motion/`, `components/providers/` |
| Client stores (Zustand) | `store/` |
| Middleware (auth gate on `/builder/*` and `/preview/*`) | `middleware.ts` |
| Config files | `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.mjs`, `postcss.config.mjs`, `drizzle.config.ts`, `vitest.config.ts`, `.eslintrc.json`, `next-env.d.ts` |
| Public assets | `public/flot-logo.png`, `public/flot-logo.svg`, `public/fonts/` |

**124 files, ready to `npm install && npm run dev`.**

---

## 2. Tech stack

Identical to the running app:

- **Next.js 14** (App Router) on **Vercel** (works on any Node host)
- **TypeScript**
- **Tailwind CSS**
- **drizzle-orm** + **Turso (libsql)** for the DB (Postgres is a 1-day swap)
- **NextAuth v5** beta with credentials provider for OTP-by-email-or-phone
- **Resend** for transactional email (OTP, order confirmations)
- **AppHive SL** for SMS — wired but optional, you can rip it out if you don't need SMS OTP
- **framer-motion** for the animated transitions
- **lucide-react** for icons
- **Zustand** for client state (site builder, customization, cart, bookings)
- **nanoid** for IDs + order references
- **Vitest** for unit tests (16 tests covering the reference generator + status state machine)

A deeper "why these choices, and what's swap-able" walkthrough lives in
`../merchant-orders-dashboard-blueprint.md` in the parent repo.

---

## 3. What's deliberately excluded

This kit is the **merchant admin** half. The buyer-facing entry pages — the
URL a customer types to visit the merchant's site — are NOT in here:

- `app/[slug]/page.tsx` and `app/site/[slug]/page.tsx` (the routes a buyer hits)
- `app/api/sites/public/[slug]/route.ts` (the public site-config endpoint)
- `app/page.tsx` (the Flot marketing landing page)
- `app/checkout-preview/page.tsx` (a demo route)
- `app/hotel/`, `app/restaurant/`, `app/store/`, `app/travel/` (template demo pages)
- `app/customize/` (an older pre-builder customizer flow — superseded by `/builder/[id]`)
- `app/api/debug-env/` (a debug-only endpoint)
- `app/opengraph-image.tsx`, `app/twitter-image.tsx` (Flot-branded OG images)

If you DO want a buyer-facing rendered site, copy `components/site/SiteRenderer.tsx`
into a new `app/[slug]/page.tsx` that fetches a site config and renders it.
The components live in `components/site/Site*.tsx` and they expect a
`SiteConfig` (typed in `lib/types/customization.ts`).

**Note:** `components/site/SiteShop*` and `components/site/SiteFloatingCart`
are included because the editor's live preview renders them. Replace these
with your own shop UI when you build the buyer-facing pages.

---

## 4. Setup

### a) Copy the kit into a new repo

```bash
cp -r docs/builder-kit/* /path/to/new-project/
cd /path/to/new-project
npm install
```

### b) Environment variables

Create `.env.local`:

```bash
# Turso (libsql) — sign up at turso.tech, create a database, copy the url + auth token
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=eyJ...

# NextAuth — generate via `openssl rand -base64 32`
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000

# Resend (optional but recommended — OTP + order confirmation emails)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL="Your Brand <onboarding@yourdomain.com>"

# AppHive SMS (optional — only if you need phone-based OTP)
APPHIVESL_API_KEY=...
APPHIVESL_USERNAME=...
APPHIVESL_PASSWORD=...
APPHIVESL_FROM=YourBrand
```

Without `RESEND_API_KEY`, OTP codes are logged to the dev console — perfect
for local dev, but you'll want to wire it for production.

### c) Run the schema migration

```bash
set -a; . .env.local; set +a
npx drizzle-kit push
```

This creates the 6 tables: `users`, `sites`, `orders`, `order_items`,
`otp_codes`, `rate_limits`. The `drizzle/0000_*.sql` and `0001_*.sql`
migration files are included for reference / version control.

### d) Run dev

```bash
npm run dev
```

Visit `http://localhost:3000/builder` — you'll be bounced to `/` because of
the middleware auth gate. Add a minimal `app/page.tsx` with a sign-in button
(or re-purpose `components/auth/AuthModal.tsx`) to enter the flow.

---

## 5. Routes overview

```
/builder                              → My Sites grid
/builder/[id]                         → Site editor (sidebar + live preview)
/builder/[id]/orders                  → Orders list (filter pills, refresh)
/builder/[id]/orders/[orderId]        → Order detail (status actions + delete)
/preview/[id]                         → Full-screen owner-only site preview

/api/auth/[...nextauth]               → NextAuth handler (sign-in flow)
/api/auth/send-otp                    → Issues OTP via email or SMS (rate-limited)

/api/sites                            → List the signed-in merchant's sites
/api/sites/[id]                       → GET / PATCH / DELETE a single site
                                        PATCH gates publish on merchantId being set

/api/orders                           → POST (buyer creates) + GET (merchant lists)
/api/orders/[id]                      → GET / PATCH (status) / DELETE (terminal-only)
/api/orders/lookup                    → Anonymous buyer lookup (rate-limited)
```

---

## 6. Key patterns at a glance

A few decisions baked into this kit that you'll want to understand:

- **Multi-tenancy is enforced at the SQL layer**, not the UI. Every
  authenticated read filters by `ownerEmail`. Cross-tenant access returns
  404, not 403, so existence isn't leakable.
- **Status state machine** (`lib/orders/status.ts`):
  `pending → confirmed → fulfilled`, with `cancelled` as a terminal branch.
  Server-enforced on every PATCH.
- **Resilient order POST** (`lib/orders/post.ts`) retries 3× with
  exponential backoff on network/5xx errors — but **never on 4xx** so
  validation failures surface to the user instead of being hidden.
- **Validation returns the specific failing field**, not a generic
  "Invalid request body". Buyer-side error banners display this verbatim.
- **In-app notifications** without SMS cost: 30-second polling hook +
  `document.title` updates + lazy-asked browser `Notification` API.
- **Order references** are `FLT-XXXXXX` from a 30-char alphabet with no
  visually-confusing chars (no `0`/`O`/`1`/`I`/`L`).
- **Customer + line items are snapshotted** onto the order at creation —
  if a merchant later renames a product, historical orders don't mutate.
- **Money is stored as integer** in the lowest currency unit. Never
  float — float arithmetic drifts at scale.

For deeper rationale on each of these, see the blueprint doc:
`../merchant-orders-dashboard-blueprint.md`.

---

## 7. What you'll want to customize

| In the kit | Probably swap |
|---|---|
| `lib/email.ts` (Resend) | Your transactional email provider |
| `lib/sms.ts` (AppHive SL — Sierra Leone) | Twilio, Vonage, or rip out |
| `lib/sheets.ts` (Google Sheets logging on publish) | Your own analytics/lead pipe |
| `lib/dummy-data/` (hotel rooms, menu, products, flights) | Real seed data for your verticals |
| `components/site/SiteShop*` (buyer-facing shop UI) | Your own shop / catalog UI |
| `components/checkout/FlotCheckout.tsx` (mock payment) | Real Stripe / Paystack / Flutterwave |
| `lib/flot-mock.ts` (mock payment gateway) | Real charge call |
| `public/flot-logo.png` | Your logo |
| Brand colors in `tailwind.config.ts` and `app/globals.css` | Your palette |

Everything else — auth, sites schema, orders flow, notifications, preview —
is platform-agnostic and shouldn't need changes beyond branding.

---

## 8. Testing

```bash
npm test           # Runs vitest once (16 tests)
npm run test:watch # Watch mode
```

Tests cover the order reference generator and the status state machine. You
can write more — the API routes use plain SQL via drizzle so they're easy
to test in isolation if you spin up a test libsql in-memory.

---

## 9. License + attribution

This kit is yours to use however you want for your own projects.
The original Flot platform is the source — if you build on it, a nod in
your README is appreciated but not required.

Questions? The full source repo with commit history is at
`github.com/paulbai/flot-platform`. The blueprint doc explains the *why*
behind each decision in much more depth.
