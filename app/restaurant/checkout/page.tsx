'use client';

import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import NavBar from '@/components/layout/NavBar';
import FlotCheckout from '@/components/checkout/FlotCheckout';
import { useCartStore } from '@/store/cartStore';

export default function RestaurantCheckoutPage() {
  const router = useRouter();
  const cartItems = useCartStore((s) => s.items).filter((i) => i.vertical === 'restaurant');
  const clearVertical = useCartStore((s) => s.clearVertical);

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: '#0d0a08' }}>
        <NavBar />
        <div className="pt-32 text-center">
          <p className="text-[var(--text-md)] text-[var(--fog)]">No items in your order.</p>
          <button
            onClick={() => router.push('/restaurant')}
            className="mt-4 text-[var(--text-sm)] font-body underline cursor-pointer"
            style={{ color: 'var(--restaurant)' }}
          >
            Back to menu
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#0d0a08' }}>
      <NavBar />
      <AnimatePresence>
        <FlotCheckout
          brandName="Osteria Flot"
          accentColor="#e85d3a"
          orderSummary={cartItems}
          currency="USD"
          vertical="restaurant"
          onSuccess={() => clearVertical('restaurant')}
          onError={() => {}}
          onClose={() => router.push('/restaurant')}
        />
      </AnimatePresence>
    </main>
  );
}
