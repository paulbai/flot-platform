'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { ShoppingBag, Plus, Flame, Leaf, Wheat } from 'lucide-react';
import NavBar from '@/components/layout/NavBar';
import { useRestaurantData } from '@/lib/hooks/useCustomizedData';
import { useCartStore } from '@/store/cartStore';
import { leonesOf } from '@/lib/currency';
import type { ExtraField } from '@/lib/types';

const FlotCheckout = dynamic(() => import('@/components/checkout/FlotCheckout'), { ssr: false });

const dietaryIcons: Record<string, { icon: React.ReactNode; label: string }> = {
  V: { icon: <Leaf size={10} />, label: 'Vegetarian' },
  GF: { icon: <Wheat size={10} />, label: 'Gluten Free' },
};

const restaurantExtraFields: ExtraField[] = [
  {
    name: 'tip',
    label: 'Add a Tip',
    type: 'select',
    required: false,
    options: ['No tip', '10%', '15%', '20%', 'Custom'],
  },
];

export default function RestaurantPage() {
  const { brand, heroImage, heroHeadline, heroSubline, heroDescription, categories } = useRestaurantData();
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || '');
  const [showMenu, setShowMenu] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const addItem = useCartStore((s) => s.addItem);
  const allItems = useCartStore((s) => s.items);
  const cartItems = allItems.filter((i) => i.vertical === 'restaurant');
  const total = cartItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const scrollToCategory = (id: string) => {
    setActiveCategory(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main id="main-content" className="min-h-screen" style={{ backgroundColor: brand.backgroundColor }}>
      <NavBar />

      {!showMenu ? (
        /* Landing / Hero */
        <div className="relative min-h-screen flex flex-col">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, ${brand.backgroundColor}, ${brand.backgroundColor}b3 30%, ${brand.backgroundColor}4d)`,
            }}
          />

          <div className="relative z-10 flex-1 flex flex-col justify-end px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto w-full pb-16 pt-32">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              {brand.logoUrl && (
                <img src={brand.logoUrl} alt={brand.businessName} className="h-12 mb-4 object-contain" />
              )}
              <div className="w-12 h-[2px] mb-6" style={{ backgroundColor: brand.accentColor }} />
              <h1 className="font-display text-[var(--text-hero)] font-medium leading-[0.9] tracking-tight text-[var(--paper)] mb-4">
                {heroHeadline}<br />
                <span className="italic font-light" style={{ color: brand.accentColor }}>{heroSubline}</span>
              </h1>
              <p className="text-[var(--text-md)] text-[var(--cloud)] font-body max-w-md mb-12">
                {heroDescription}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="group relative bg-[var(--ink)] border border-[var(--ash)] rounded-sm p-8 flex flex-col items-center cursor-pointer transition-colors"
                style={{ borderColor: 'var(--ash)' }}
                onClick={() => setShowMenu(true)}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = brand.accentColor + '80')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--ash)')}
              >
                <div className="bg-white p-4 rounded-sm mb-6 transition-shadow" style={{ boxShadow: `0 0 0 0 ${brand.accentColor}1a` }}>
                  <QRCodeSVG
                    value="https://flot.demo/restaurant/menu"
                    size={140}
                    bgColor="#ffffff"
                    fgColor={brand.backgroundColor}
                    level="M"
                  />
                </div>
                <p className="text-[var(--text-xs)] font-body font-semibold uppercase tracking-[0.15em] text-[var(--cloud)] text-center">
                  Point your camera at the QR<br />to view today&apos;s menu
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="group relative bg-[var(--ink)] border border-[var(--ash)] rounded-sm p-8 flex flex-col items-center justify-center cursor-pointer transition-colors"
                onClick={() => setShowMenu(true)}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = brand.accentColor + '80')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--ash)')}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                  style={{ backgroundColor: brand.accentColor, opacity: 0.15 }}
                />
                <div className="absolute top-1/2 -translate-y-1/2 mt-[-12px]">
                  <span className="text-4xl">🍽</span>
                </div>
                <h3 className="font-display text-[var(--text-lg)] text-[var(--paper)] font-medium mb-2 mt-4">
                  Browse Menu
                </h3>
                <p className="text-[var(--text-xs)] text-[var(--fog)] font-body text-center">
                  View the full menu online
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      ) : (
        /* Menu View */
        <div className="pt-16">
          <div
            className="sticky top-16 z-20 border-b border-[var(--ash)]/50 overflow-x-auto hide-scrollbar"
            style={{ backgroundColor: `${brand.backgroundColor}f2`, backdropFilter: 'blur(12px)' }}
          >
            <div className="max-w-[900px] mx-auto px-4 flex gap-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => scrollToCategory(cat.id)}
                  className="flex-shrink-0 px-4 py-3 text-[var(--text-xs)] font-body font-semibold uppercase tracking-[0.15em] border-b-2 transition-colors duration-mid whitespace-nowrap cursor-pointer"
                  style={{
                    color: activeCategory === cat.id ? brand.accentColor : 'var(--fog)',
                    borderColor: activeCategory === cat.id ? brand.accentColor : 'transparent',
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-[900px] mx-auto px-4 py-8 pb-32">
            {categories.map((category) => (
              <div
                key={category.id}
                ref={(el) => { sectionRefs.current[category.id] = el; }}
                className="mb-12"
              >
                <h2 className="font-display text-[var(--text-lg)] text-[var(--paper)] font-medium mb-6 flex items-center gap-3">
                  <span className="w-8 h-[1px]" style={{ backgroundColor: brand.accentColor }} />
                  {category.name}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {category.items.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="group relative bg-[var(--ink)] border border-[var(--ash)]/50 rounded-sm p-5 transition-colors"
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = brand.accentColor + '4d')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '')}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-display text-[var(--text-md)] text-[var(--paper)] font-medium">
                              {item.name}
                            </h3>
                            {item.popular && (
                              <Flame size={14} style={{ color: brand.accentColor }} />
                            )}
                          </div>
                          <p className="text-[var(--text-xs)] text-[var(--fog)] leading-relaxed mb-3">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-2">
                            {item.dietary.map((d) => (
                              <span
                                key={d}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-body font-semibold uppercase tracking-wider border"
                                style={{
                                  color: d === 'V' ? 'var(--success)' : 'var(--hotel)',
                                  borderColor: d === 'V' ? 'var(--success)' : 'var(--hotel)',
                                  opacity: 0.7,
                                }}
                                title={dietaryIcons[d]?.label}
                              >
                                {dietaryIcons[d]?.icon}
                                {d}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <span className="font-display text-[var(--text-md)] text-[var(--paper)]">
                            ${item.price}
                            <span className="block text-[var(--text-xs)] text-[var(--fog)] font-mono">{leonesOf(item.price)}</span>
                          </span>
                          <button
                            onClick={() => {
                              addItem({
                                id: item.id,
                                name: item.name,
                                quantity: 1,
                                unitPrice: item.price,
                                vertical: 'restaurant',
                              });
                            }}
                            className="w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-mid hover:scale-110 cursor-pointer"
                            style={{
                              borderColor: brand.accentColor,
                              color: brand.accentColor,
                            }}
                            aria-label={`Add ${item.name} to order`}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <AnimatePresence>
            {itemCount > 0 && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 z-30 p-4 safe-bottom"
              >
                <div className="max-w-[900px] mx-auto">
                  <button
                    onClick={() => setCheckoutOpen(true)}
                    className="w-full flex items-center justify-between px-6 py-4 rounded-sm cursor-pointer transition-transform hover:scale-[1.01]"
                    style={{ backgroundColor: brand.accentColor }}
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingBag size={18} className="text-white" />
                      <span className="text-[var(--text-sm)] font-body font-semibold text-white">
                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--text-sm)] font-body font-semibold text-white">
                        Review Order
                      </span>
                      <span className="font-display text-[var(--text-md)] font-bold text-white" aria-live="polite" aria-atomic="true">
                        ${total.toFixed(2)} <span className="text-white/70 font-mono text-[var(--text-xs)]">({leonesOf(total)})</span>
                      </span>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {checkoutOpen && cartItems.length > 0 && (
          <FlotCheckout
            brandName={brand.businessName}
            accentColor={brand.accentColor}
            orderSummary={cartItems}
            currency="USD"
            vertical="restaurant"
            extraFields={restaurantExtraFields}
            onSuccess={() => {}}
            onError={() => {}}
            onClose={() => setCheckoutOpen(false)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
