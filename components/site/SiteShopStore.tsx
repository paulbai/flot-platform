'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X } from 'lucide-react';
import type { SiteConfig } from '@/lib/types/customization';
import type { Product } from '@/lib/types';
import { useCartStore } from '@/store/cartStore';
import { resolveBrand } from '@/lib/brand-helpers';

export default function SiteShopStore({ config }: { config: SiteConfig }) {
  const products = config.storeContent?.products ?? [];
  const categoryLabels = config.storeContent?.categoryLabels ?? {};
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const addItem = useCartStore((s) => s.addItem);
  const rb = resolveBrand(config.brand);
  const accent = config.brand.accentColor;

  if (products.length === 0) return null;

  const categories = Object.keys(categoryLabels);
  const filtered = activeCategory === 'all'
    ? products
    : products.filter((p) => p.category === activeCategory);

  // Whether the open product is missing any required selection.
  const sizeRequired = !!(selectedProduct?.sizes && selectedProduct.sizes.length > 0);
  const colorRequired = !!(selectedProduct?.colors && selectedProduct.colors.length > 0);
  const canAddToCart =
    !!selectedProduct &&
    (!sizeRequired || !!selectedSize) &&
    (!colorRequired || !!selectedColor);

  function handleAddToCart(product: Product) {
    if (!canAddToCart) return;
    const variantParts = [selectedSize, selectedColor].filter(Boolean) as string[];
    const variantLabel = variantParts.join(' / ');
    addItem({
      id: `${config.slug}-product-${product.id}-${variantParts.join('-') || 'default'}-${Date.now()}`,
      name: product.name,
      description: variantLabel ? variantLabel : undefined,
      quantity: 1,
      unitPrice: product.price,
      image: product.images?.[0],
      variant: variantLabel || undefined,
      vertical: 'store',
      siteSlug: config.slug,
    });
    setSelectedProduct(null);
    setSelectedSize(null);
    setSelectedColor(null);
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
              backgroundColor: activeCategory === 'all' ? accent : rb.cardColor,
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
                backgroundColor: activeCategory === cat ? accent : rb.cardColor,
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
              className="group rounded-xl overflow-hidden border cursor-pointer transition-all"
              style={{ backgroundColor: rb.cardColor, borderColor: rb.borderColor }}
              onClick={() => {
                setSelectedProduct(product);
                // Pre-select the first option so the most common case is one tap.
                // The buyer can still change before adding to cart; the Add button
                // is gated on a real selection in `canAddToCart`.
                setSelectedSize(product.sizes?.[0] ?? null);
                setSelectedColor(product.colors?.[0] ?? null);
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
              style={{ backgroundColor: config.brand.backgroundColor, border: `1px solid ${rb.borderColor}` }}
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
                {sizeRequired && (
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Size <span style={{ color: accent }}>*</span>
                    </span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedProduct.sizes!.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className="px-4 py-2 rounded-lg text-sm font-medium border transition-all"
                          style={{
                            borderColor: selectedSize === size ? accent : rb.borderColor,
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

                {/* Color selector */}
                {colorRequired && (
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Color <span style={{ color: accent }}>*</span>
                      {selectedColor && (
                        <span className="ml-2 normal-case tracking-normal text-gray-400 font-normal">
                          {selectedColor}
                        </span>
                      )}
                    </span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedProduct.colors!.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-all"
                          style={{
                            borderColor: selectedColor === color ? accent : rb.borderColor,
                            backgroundColor: selectedColor === color ? accent + '20' : 'transparent',
                            color: selectedColor === color ? accent : 'inherit',
                          }}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleAddToCart(selectedProduct)}
                  disabled={!canAddToCart}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{ backgroundColor: accent }}
                  title={
                    canAddToCart
                      ? 'Add to cart'
                      : `Pick a ${sizeRequired && !selectedSize ? 'size' : 'color'} first`
                  }
                >
                  <ShoppingCart size={16} />
                  {canAddToCart
                    ? 'Add to Cart'
                    : `Pick ${sizeRequired && !selectedSize ? 'size' : 'color'}`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
