'use client';

import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import NavBar from '@/components/layout/NavBar';
import FlotCheckout from '@/components/checkout/FlotCheckout';
import { useCartStore } from '@/store/cartStore';

export default function StoreCheckoutPage() {
  const router = useRouter();
  const cartItems = useCartStore((s) => s.items).filter((i) => i.vertical === 'store');
  const clearVertical = useCartStore((s) => s.clearVertical);

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: '#faf9f7', color: '#111' }}>
        <NavBar />
        <div className="pt-32 text-center">
          <p className="text-[var(--text-md)] text-[#666]">Your cart is empty.</p>
          <button
            onClick={() => router.push('/store')}
            className="mt-4 text-[var(--text-sm)] font-body underline cursor-pointer"
            style={{ color: 'var(--fashion)' }}
          >
            Continue shopping
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#faf9f7', color: '#111' }}>
      <NavBar />
      <AnimatePresence>
        <FlotCheckout
          brandName="Flot Store"
          accentColor="var(--fashion)"
          orderSummary={cartItems}
          currency="USD"
          vertical="store"
          onSuccess={() => {
            clearVertical('store');
          }}
          onError={() => {}}
          onClose={() => router.push('/store')}
        />
      </AnimatePresence>
    </main>
  );
}
