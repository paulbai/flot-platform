# Flot Platform

A multi-vertical commerce showcase featuring 4 storefronts — **Hotel**, **Restaurant**, **Travel**, and **Fashion/Art Store** — unified under one landing page and powered by a shared white-label **Flot Checkout** engine.

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8) ![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-purple)

## Verticals

| Vertical | Description |
|----------|-------------|
| **Hotel** | Luxury room booking with date picker, room gallery, and per-night pricing |
| **Restaurant** | QR-code enabled menu with category tabs, floating cart bar, and dine-in ordering |
| **Travel** | Flight search with animated flight paths, seat map selection, and passenger details |
| **Store** | Editorial fashion/art store with size & color selectors, product detail pages, and cart drawer |

## Features

- **Unified Checkout** — Shared 3-step Flot Checkout drawer (Review -> Details -> Payment) across all verticals
- **Dual Currency** — All prices displayed in USD and Sierra Leonean Leones (Le) at $1 = Le24
- **Receipt Delivery** — Users choose WhatsApp or Email for receipt delivery during checkout
- **Animations** — Page transitions, scroll-reveal effects, and confetti on successful payment (Framer Motion)
- **Accessibility** — WCAG 2.1 AA: skip links, focus traps, aria-live regions, dialog roles, reduced-motion support
- **Mobile First** — Full-width drawers on mobile, safe area insets for notched devices, touch-friendly tap targets
- **State Management** — Zustand for cart & saved payments with localStorage persistence
- **Mock Payment SDK** — Simulated Flot payment flow (tokenize -> charge -> success/error)

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v3 with CSS custom properties for design tokens
- **Animations:** Framer Motion
- **State:** Zustand
- **Forms:** React Hook Form + Zod validation
- **Icons:** Lucide React
- **Fonts:** Cormorant Garamond, Syne, JetBrains Mono (Google Fonts via next/font)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the platform.

## Project Structure

```
flot-platform/
  app/
    hotel/          # Hotel vertical (landing + room detail)
    restaurant/     # Restaurant vertical (menu + ordering)
    store/          # Store vertical (catalog + product detail)
    travel/         # Travel vertical (search + results)
    globals.css     # Design tokens & utility classes
    layout.tsx      # Root layout with fonts & nav
    page.tsx        # Landing page with bento grid
    template.tsx    # Page transition wrapper
  components/
    cart/           # Cart drawer & item components
    checkout/       # Flot Checkout engine (form, card fields, saved payments)
    layout/         # NavBar & BentoGrid
    motion/         # PageTransition, ScrollReveal, Confetti
    ui/             # Button, Badge, Modal
  lib/
    currency.ts     # USD/Leones conversion utilities
    flot-mock.ts    # Mock payment SDK
    types.ts        # TypeScript type definitions
    dummy-data/     # Hotel, restaurant, travel, store seed data
  store/
    cartStore.ts    # Zustand cart store
    paymentStore.ts # Zustand saved payment store
```

## License

MIT
