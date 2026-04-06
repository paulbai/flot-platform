'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X } from 'lucide-react';
import type { SiteConfig } from '@/lib/types/customization';
import type { Product } from '@/lib/types';
import { useCartStore } from '@/store/cartStore';

export default function SiteShopStore({ config }: { config: SiteConfig }) {
  const products = config.storeContent?.products ?? [];
  const categoryLabels = config.storeContent?.categoryLabels ?? {};
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const addItem = useCartStore((s) => s.addItem);
  const accent = config.brand.accentColor;

  if (products.length === 0) return null;

  const categories = Object.keys(categoryLabels);
  const filtered = activeCategory === 'all'
    ? products
    : products.filter((p) => p.category === activeCategory);

  function handleAddToCart(product: Product) {
    addItem({
      id: `${config.slug}-product-${product.id}-${selectedSize || 'default'}-${Date.now()}`,
      name: product.name,
      description: selectedSize ? `Size: ${selectedSize}` : undefined,
      quantity: 1,
      unitPrice: product.price,
      image: product.images?.[0],
      variant: selectedSize || undefined,
      vertical: 'store',
      siteSlug: config.slug,
    });
    setSelectedProduct(null);
    setSelectedSize(null);
  }

  return (
    <section id="shop" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <span
            className="text-xs font-semibold uppercase tracking-[0.25em]"
            style={{ color: accent }}
          >
            Collection
          </span>
          <h2
            className="text-3xl sm:text-4xl font-bold mt-3"
            style={{ fontFamily: 'var(--heading-font)' }}
          >
            Shop Our Products
          </h2>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <button
            onClick={() => setActiveCategory('all')}
            className="px-5 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              backgroundColor: activeCategory === 'all' ? accent : 'rgba(255,255,255,0.08)',
              color: activeCategory === 'all' ? '#fff' : 'inherit',
            }}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-5 py-2 rounded-full text-sm font-medium transition-all"
              style={{
                backgroundColor: activeCategory === cat ? accent : 'rgba(255,255,255,0.08)',
                color: activeCategory === cat ? '#fff' : 'inherit',
              }}
            >
              {categoryLabels[cat] || cat}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group rounded-xl overflow-hidden border border-white/10 cursor-pointer transition-all hover:border-white/20"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
              onClick={() => {
                setSelectedProduct(product);
                setSelectedSize(product.sizes?.[0] ?? null);
              }}
            >
              {product.images?.[0] && (
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {product.badge && (
                    <span
                      className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full text-white"
                      style={{ backgroundColor: accent }}
                    >
                      {product.badge}
                    </span>
                  )}
                </div>
              )}
              <div className="p-3">
                <h3 className="text-sm font-semibold truncate text-gray-900 dark:text-white">{product.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-bold" style={{ color: accent }}>
                    Le{product.price.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-gray-400">${(product.price / 24).toFixed(2)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Product detail modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl overflow-hidden"
              style={{ backgroundColor: config.brand.backgroundColor, border: '1px solid rgba(255,255,255,0.15)' }}
            >
              {selectedProduct.images?.[0] && (
                <div className="relative aspect-[4/3]">
                  <img
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <div className="p-6 space-y-4">
                <div>
                  <h3
                    className="text-xl font-bold"
                    style={{ fontFamily: 'var(--heading-font)' }}
                  >
                    {selectedProduct.name}
                  </h3>
                  <div className="mt-1">
                    <span className="text-lg font-bold" style={{ color: accent }}>
                      Le{selectedProduct.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-400 ml-2">${(selectedProduct.price / 24).toFixed(2)}</span>
                  </div>
                </div>
                {selectedProduct.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedProduct.description}</p>
                )}

                {/* Size selector */}
                {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Size</span>
                    <div className="flex gap-2 mt-2">
                      {selectedProduct.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className="px-4 py-2 rounded-lg text-sm font-medium border transition-all"
                          style={{
                            borderColor: selectedSize === size ? accent : 'rgba(255,255,255,0.2)',
                            backgroundColor: selectedSize === size ? accent + '20' : 'transparent',
                            color: selectedSize === size ? accent : 'inherit',
                          }}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleAddToCart(selectedProduct)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: accent }}
                >
                  <ShoppingCart size={16} />
                  Add to Cart
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
