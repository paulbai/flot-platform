'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import CartDrawer from '@/components/cart/CartDrawer';
import { leonesOf } from '@/lib/currency';
import type { Vertical } from '@/lib/types';

const verticals: { name: string; href: string; key: Vertical; color: string }[] = [
  { name: 'Hotel', href: '/hotel', key: 'hotel', color: 'var(--hotel)' },
  { name: 'Restaurant', href: '/restaurant', key: 'restaurant', color: 'var(--restaurant)' },
  { name: 'Travel', href: '/travel', key: 'travel', color: 'var(--travel)' },
  { name: 'Store', href: '/store', key: 'store', color: 'var(--fashion)' },
];

function getActiveVertical(pathname: string): Vertical | null {
  for (const v of verticals) {
    if (pathname.startsWith(v.href)) return v.key;
  }
  return null;
}

function getAccentColor(vertical: Vertical | null): string {
  if (!vertical) return 'var(--flot)';
  return verticals.find((v) => v.key === vertical)?.color || 'var(--flot)';
}

export default function NavBar() {
  const pathname = usePathname();
  const activeVertical = getActiveVertical(pathname);
  const accentColor = getAccentColor(activeVertical);
  const items = useCartStore((s) => s.items);
  const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-40 border-b border-[var(--ash)]/50"
        style={{ backgroundColor: 'rgba(8, 8, 8, 0.85)', backdropFilter: 'blur(16px)' }}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 group">
            <span
              className="font-display text-2xl font-bold tracking-tight"
              style={{ color: accentColor }}
            >
              Flot
            </span>
            <span className="w-1.5 h-1.5 rounded-full mt-1 transition-colors duration-mid" style={{ backgroundColor: accentColor }} />
          </Link>

          {/* Desktop vertical tabs */}
          <div className="hidden md:flex items-center gap-1">
            {verticals.map((v) => {
              const isActive = activeVertical === v.key;
              return (
                <Link
                  key={v.key}
                  href={v.href}
                  className="relative px-4 py-2 text-[var(--text-xs)] font-body font-semibold uppercase tracking-[0.15em] transition-colors duration-mid"
                  style={{ color: isActive ? v.color : 'var(--fog)' }}
                >
                  {v.name}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-2 right-2 h-[2px]"
                      style={{ backgroundColor: v.color }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side: Cart + mobile menu */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 px-3 py-2 rounded-sm hover:bg-white/5 transition-colors cursor-pointer"
              aria-label={`Cart: ${itemCount} items`}
            >
              <ShoppingBag size={18} className="text-[var(--cloud)]" />
              {itemCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1.5"
                >
                  <span
                    className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-body font-bold"
                    style={{ backgroundColor: accentColor, color: 'var(--void)' }}
                  >
                    {itemCount}
                  </span>
                  <span className="hidden sm:block text-[var(--text-xs)] font-mono text-[var(--cloud)]">
                    ${total.toFixed(2)} <span className="text-[var(--fog)]">({leonesOf(total)})</span>
                  </span>
                </motion.div>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-[var(--cloud)] hover:text-[var(--paper)] transition-colors cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-30 border-b border-[var(--ash)]/50 md:hidden"
            style={{ backgroundColor: 'rgba(8, 8, 8, 0.95)', backdropFilter: 'blur(16px)' }}
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {verticals.map((v) => {
                const isActive = activeVertical === v.key;
                return (
                  <Link
                    key={v.key}
                    href={v.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-sm transition-colors"
                    style={{
                      color: isActive ? v.color : 'var(--cloud)',
                      backgroundColor: isActive ? `${v.color}10` : 'transparent',
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: v.color }}
                    />
                    <span className="text-[var(--text-sm)] font-body font-semibold uppercase tracking-[0.1em]">
                      {v.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <CartDrawer
            isOpen={cartOpen}
            onClose={() => setCartOpen(false)}
            onCheckout={() => {
              setCartOpen(false);
              // Navigate to appropriate checkout based on items
              const verticals = useCartStore.getState().getVerticals();
              if (verticals.length === 1) {
                window.location.href = `/${verticals[0]}/checkout`;
              }
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
