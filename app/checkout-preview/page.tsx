'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import FlotCheckout from '@/components/checkout/FlotCheckout';

export default function CheckoutPreviewPage() {
  const [show, setShow] = useState(true);

  const mockItems = [
    { id: '1', name: 'Lobster Tagliatelle', unitPrice: 38, quantity: 1, vertical: 'restaurant' as const, image: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=200&q=80' },
    { id: '2', name: 'Tiramisu Classico', unitPrice: 16, quantity: 2, vertical: 'restaurant' as const, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=200&q=80' },
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
      {!show && (
        <button
          onClick={() => setShow(true)}
          className="px-6 py-3 bg-emerald-400 text-black font-bold rounded-xl"
        >
          Open Checkout
        </button>
      )}
      <AnimatePresence>
        {show && (
          <FlotCheckout
            brandName="St Mary's Supermarket"
            accentColor="#e85d3a"
            orderSummary={mockItems}
            currency="SLE"
            vertical="restaurant"
            onSuccess={() => {}}
            onError={() => {}}
            onClose={() => setShow(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
