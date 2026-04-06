'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import type { SiteConfig } from '@/lib/types/customization';
import { useCartStore } from '@/store/cartStore';
import FlotCheckout from '@/components/checkout/FlotCheckout';

export default function SiteFloatingCart({ config }: { config: SiteConfig }) {
  const [showCheckout, setShowCheckout] = useState(false);
  const items = useCartStore((s) => s.items);
  const clearSite = useCartStore((s) => s.clearSite);
  const accent = config.brand.accentColor;

  const siteItems = useMemo(() => items.filter((i) => i.siteSlug === config.slug), [items, config.slug]);
  const siteTotal = useMemo(() => siteItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0), [siteItems]);
  const itemCount = useMemo(() => siteItems.reduce((sum, i) => sum + i.quantity, 0), [siteItems]);

  if (itemCount === 0 && !showCheckout) return null;

  return (
    <>
      {/* Floating cart button */}
      <AnimatePresence>
        {itemCount > 0 && !showCheckout && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setShowCheckout(true)}
            className="fixed bottom-6 right-4 sm:right-6 z-40 flex items-center gap-3 rounded-full px-5 sm:px-6 py-3.5 text-white shadow-2xl transition-transform hover:scale-105 safe-bottom"
            style={{ backgroundColor: accent }}
          >
            <div className="relative">
              <ShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white text-[10px] font-bold flex items-center justify-center"
                style={{ color: accent }}
              >
                {itemCount}
              </span>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold">Le{siteTotal.toLocaleString()}</span>
              <p className="text-[10px] opacity-70">${(siteTotal / 24).toFixed(2)}</p>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Checkout modal */}
      <AnimatePresence>
        {showCheckout && (
          <FlotCheckout
            brandName={config.brand.businessName}
            accentColor={accent}
            orderSummary={siteItems}
            currency="Le"
            vertical={config.vertical}
            onSuccess={() => {
              clearSite(config.slug);
            }}
            onError={() => {}}
            onClose={() => setShowCheckout(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
