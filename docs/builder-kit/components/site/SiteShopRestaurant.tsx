'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import type { SiteConfig } from '@/lib/types/customization';
import { useCartStore } from '@/store/cartStore';

export default function SiteShopRestaurant({ config }: { config: SiteConfig }) {
  const categories = config.restaurantContent?.categories ?? [];
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? '');
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const accent = config.brand.accentColor;

  if (categories.length === 0) return null;

  const activeItems = categories.find((c) => c.id === activeCategory)?.items ?? [];

  function getCartQuantity(itemId: string) {
    const cartItem = items.find((i) => i.id === `${config.slug}-menu-${itemId}` && i.siteSlug === config.slug);
    return cartItem?.quantity ?? 0;
  }

  function handleAdd(item: { id: string; name: string; price: number; description?: string }) {
    const cartId = `${config.slug}-menu-${item.id}`;
    const existing = items.find((i) => i.id === cartId);
    if (existing) {
      updateQuantity(cartId, existing.quantity + 1);
    } else {
      addItem({
        id: cartId,
        name: item.name,
        description: item.description,
        quantity: 1,
        unitPrice: item.price,
        vertical: 'restaurant',
        siteSlug: config.slug,
      });
    }
  }

  function handleRemove(itemId: string) {
    const cartId = `${config.slug}-menu-${itemId}`;
    const existing = items.find((i) => i.id === cartId);
    if (existing && existing.quantity > 1) {
      updateQuantity(cartId, existing.quantity - 1);
    } else if (existing) {
      updateQuantity(cartId, 0);
    }
  }

  return (
    <section id="shop" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <span
            className="text-xs font-semibold uppercase tracking-[0.25em]"
            style={{ color: accent }}
          >
            Menu
          </span>
          <h2
            className="text-3xl sm:text-4xl font-bold mt-3"
            style={{ fontFamily: 'var(--heading-font)' }}
          >
            Our Menu
          </h2>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="px-5 py-2 rounded-full text-sm font-medium transition-all"
              style={{
                backgroundColor: activeCategory === cat.id ? accent : 'rgba(255,255,255,0.08)',
                color: activeCategory === cat.id ? '#fff' : 'inherit',
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu items */}
        <div className="space-y-3">
          {activeItems.map((item, i) => {
            const qty = getCartQuantity(item.id);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-xl border border-white/10 transition-colors hover:border-white/20"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{item.name}</h3>
                    {item.popular && (
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: accent + '20', color: accent }}
                      >
                        Popular
                      </span>
                    )}
                    {item.dietary?.length > 0 && (
                      <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">
                        {item.dietary[0]}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-bold" style={{ color: accent }}>
                      Le{item.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-400">
                      (${(item.price / 24).toFixed(2)})
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{item.description}</p>
                  )}
                </div>
                {qty === 0 ? (
                  <button
                    onClick={() => handleAdd(item)}
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white transition-transform active:scale-95 shrink-0"
                    style={{ backgroundColor: accent }}
                    aria-label={`Add ${item.name}`}
                  >
                    <Plus size={18} />
                  </button>
                ) : (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:border-white/40 active:scale-95 transition-transform"
                      aria-label={`Remove one ${item.name}`}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold tabular-nums">{qty}</span>
                    <button
                      onClick={() => handleAdd(item)}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white active:scale-95 transition-transform"
                      style={{ backgroundColor: accent }}
                      aria-label={`Add another ${item.name}`}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
