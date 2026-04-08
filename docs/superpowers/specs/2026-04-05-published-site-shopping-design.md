# Published Site Shopping & Checkout Integration

## Overview

Add vertical-specific shopping experiences to published sites built with the Flot site builder. Business owners manage their items (rooms, menu, products) in the builder editor. Customers browse and purchase directly on the published site via the FlotCheckout modal.

## Published Site Page Structure

Top to bottom:

1. **Navbar** (existing, unchanged)
2. **Hero** — CTA button is vertical-aware, scrolls to shopping section:
   - Hotel: "Browse Rooms"
   - Restaurant: "View Our Menu"
   - Store: "Shop Now"
   - Travel: "Search Flights" (placeholder, not implemented)
3. **Shopping Section (NEW)** — always visible below hero, vertical-specific
4. **About** (existing)
5. **Gallery** (existing)
6. **Testimonials** (existing)
7. **Contact** (existing)
8. **Bottom CTA Banner (NEW)** — scrolls back up to shopping section
9. **Footer** (existing)
10. **Floating Cart Button (NEW)** — fixed bottom-right, shows when cart has items, opens FlotCheckout

## Shopping Section by Vertical

### Hotel — `SiteShopHotel`
- Grid of room cards (image, name, price/night, max guests, bed type)
- Clicking a room card expands an inline detail panel below it
- Detail panel: larger image, description, night count selector (1-14), guest count selector (1-max), "Add to Cart" button
- Price shown as: `SLE X.XX / night` with calculated total for selected nights

### Restaurant — `SiteShopRestaurant`
- Horizontal category tabs (e.g. Starters, Mains, Desserts, Drinks)
- Scrolls/filters to show items in selected category
- Menu item cards: image (optional), name, description, price, dietary tag badge
- "Add" button on each card, increments quantity if already in cart

### Store — `SiteShopStore`
- Category filter pills (All + custom categories)
- Product grid (responsive: 2 cols mobile, 3-4 cols desktop)
- Product cards: image, name, price, category badge
- Clicking opens inline detail with description, size selector (if sizes defined), "Add to Cart" button

### Travel
- Not implemented in this phase. Shopping section shows a "Coming Soon" placeholder.

## Floating Cart & Checkout

- **Floating cart button**: Fixed position bottom-right corner. Shows item count badge and total amount. Appears only when cart has 1+ items. Uses `useCartStore`.
- **Clicking cart**: Opens `FlotCheckout` modal as full-screen overlay
- **FlotCheckout props sourced from site config**:
  - `brandName` = `site.brand.businessName`
  - `currency` = `"SLE"` (default, can be extended later)
  - `vertical` = `site.vertical`
  - `orderSummary` = cart items filtered by site
  - `onClose` = closes modal
  - `onSuccess` = clears cart, shows success
  - `onError` = shows error

## Cart Scoping

Cart items are tagged with the site slug to prevent cross-site cart conflicts. `useCartStore` already has a `vertical` field on `OrderItem` — we'll add an optional `siteSlug` field and filter by it.

## Builder Editor — Item Management

Each vertical gets a new collapsible section in `/builder/[id]` editor sidebar.

### Hotel — "Rooms" Section
Fields per room:
- `name`: string (required)
- `pricePerNight`: number (required)
- `image`: string URL (required)
- `maxGuests`: number (default 2)
- `bedType`: select — King, Queen, Twin, Double (default King)
- `description`: string (optional)

### Restaurant — "Menu" Section
Category management:
- Add/rename/delete categories
- Reorder categories

Fields per menu item:
- `name`: string (required)
- `price`: number (required)
- `image`: string URL (optional)
- `category`: select from defined categories (required)
- `description`: string (optional)
- `dietaryTag`: select — None, Vegan, Vegetarian, Gluten-Free (optional)

### Store — "Products" Section
Fields per product:
- `name`: string (required)
- `price`: number (required)
- `image`: string URL (required)
- `category`: string (required)
- `description`: string (optional)
- `sizes`: string comma-separated (optional, e.g. "S,M,L,XL")

### Travel
Not implemented. Editor shows "Coming soon" placeholder.

## Default Sample Data

Each vertical gets 3-4 sample items when a new site is created, so the published site isn't empty:

- **Hotel**: 3 rooms (Deluxe Suite, Ocean View Room, Standard Room)
- **Restaurant**: 6 items across 3 categories (Starters x2, Mains x2, Desserts x2)
- **Store**: 4 products across 2 categories

## Type Changes

### `OrderItem` (lib/types.ts)
Add optional field:
- `siteSlug?: string`

### Existing types used as-is:
- `HotelContent.rooms` — matches Room type
- `RestaurantContent.categories` — matches MenuItem + category structure
- `StoreContent.products` — matches Product type

## Components to Create

| Component | File | Purpose |
|-----------|------|---------|
| `SiteShop` | `components/site/SiteShop.tsx` | Router — renders correct vertical shop |
| `SiteShopHotel` | `components/site/SiteShopHotel.tsx` | Hotel room browsing + booking |
| `SiteShopRestaurant` | `components/site/SiteShopRestaurant.tsx` | Menu browsing + ordering |
| `SiteShopStore` | `components/site/SiteShopStore.tsx` | Product browsing + shopping |
| `SiteBottomCTA` | `components/site/SiteBottomCTA.tsx` | Bottom call-to-action banner |
| `SiteFloatingCart` | `components/site/SiteFloatingCart.tsx` | Floating cart button + checkout trigger |

## Files to Modify

| File | Change |
|------|--------|
| `components/site/SiteRenderer.tsx` | Add SiteShop after hero, SiteBottomCTA before footer, SiteFloatingCart |
| `components/site/SiteHero.tsx` | Make CTA scroll to `#shop` section |
| `app/builder/[id]/page.tsx` | Add item management sections per vertical |
| `store/siteBuilderStore.ts` | Add default sample items to `createDefaultSite()` |
| `store/cartStore.ts` | Add `siteSlug` to OrderItem, add site-scoped filtering |
| `lib/types.ts` | Add `siteSlug` to OrderItem |

## Out of Scope

- Authentication / signup (separate feature)
- Travel vertical shopping (complex, needs API)
- Payment processing (uses existing mock)
- Multi-currency support (hardcoded SLE for now)
- Image upload (URLs only for now)
