'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import NavBar from '@/components/layout/NavBar';
import Badge from '@/components/ui/Badge';
import { products } from '@/lib/dummy-data/store';
import { useCartStore } from '@/store/cartStore';
import { leonesOf } from '@/lib/currency';
import type { Product } from '@/lib/types';

const categories = ['All', 'Clothing', 'Art Prints', 'Accessories', 'Objects'] as const;
const categoryMap: Record<string, Product['category'] | 'all'> = {
  All: 'all',
  Clothing: 'clothing',
  'Art Prints': 'art',
  Accessories: 'accessories',
  Objects: 'objects',
};

export default function StorePage() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const addItem = useCartStore((s) => s.addItem);

  const filtered =
    activeCategory === 'All'
      ? products
      : products.filter((p) => p.category === categoryMap[activeCategory]);

  const featured = products[0];
  const secondary = products.slice(2, 4);

  return (
    <main id="main-content" className="min-h-screen" style={{ backgroundColor: '#faf9f7', color: '#111111' }}>
      <NavBar />

      {/* Hero Grid — asymmetric editorial layout */}
      <section className="pt-20 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-4"
        >
          <span className="text-[var(--text-xs)] font-body font-extrabold uppercase tracking-[0.25em]" style={{ color: 'var(--fashion)' }}>
            Fashion & Art
          </span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-12">
          {/* Featured large */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-2 lg:row-span-2"
          >
            <Link href={`/store/products/${featured.id}`} className="group block relative overflow-hidden rounded-sm aspect-[4/3] lg:aspect-auto lg:h-full">
              <Image
                src={featured.images[0]}
                alt={featured.name}
                fill
                className="object-cover transition-transform duration-slow ease-out-expo group-hover:scale-[1.03]"
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                {featured.badge && <Badge color="var(--fashion)" className="mb-2">{featured.badge}</Badge>}
                <h2 className="font-display text-[var(--text-xl)] text-white font-medium leading-tight">
                  {featured.name}
                </h2>
                <p className="font-display text-[var(--text-lg)] text-white/80 mt-1">
                  ${featured.price} <span className="text-[var(--text-xs)] text-white/50 font-mono">({leonesOf(featured.price)})</span>
                </p>
              </div>
            </Link>
          </motion.div>

          {/* Secondary pieces */}
          {secondary.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href={`/store/products/${product.id}`} className="group block relative overflow-hidden rounded-sm aspect-square">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-slow ease-out-expo group-hover:scale-[1.03]"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  {product.badge && <Badge color="var(--fashion)" className="mb-1.5">{product.badge}</Badge>}
                  <h3 className="font-display text-[var(--text-md)] text-white font-medium">
                    {product.name}
                  </h3>
                  {product.artist && (
                    <p className="text-[var(--text-xs)] text-white/60 font-body">{product.artist}</p>
                  )}
                  <p className="font-display text-[var(--text-sm)] text-white/80 mt-0.5">
                    ${product.price} <span className="text-white/50 font-mono text-[var(--text-xs)]">({leonesOf(product.price)})</span>
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-4 sm:gap-6 mb-8 border-b pb-4 overflow-x-auto hide-scrollbar"
          style={{ borderColor: '#e0ddd5' }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="flex-shrink-0 text-[var(--text-xs)] font-body font-semibold uppercase tracking-[0.15em] transition-colors duration-mid pb-1 border-b-2 cursor-pointer whitespace-nowrap"
              style={{
                color: activeCategory === cat ? '#111111' : '#999999',
                borderColor: activeCategory === cat ? 'var(--fashion)' : 'transparent',
              }}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Product Grid — masonry-style with varying heights */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-24">
          {filtered.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{
                duration: 0.6,
                delay: (i % 4) * 0.08,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
              className={i % 3 === 0 ? 'row-span-1' : ''}
            >
              <div className="group relative">
                <Link href={`/store/products/${product.id}`} className="block relative overflow-hidden rounded-sm mb-3">
                  <div className={`relative ${i % 3 === 0 ? 'aspect-[3/4]' : 'aspect-square'}`}>
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-slow ease-out-expo group-hover:scale-[1.04]"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                  {product.badge && (
                    <div className="absolute top-3 left-3">
                      <Badge color="var(--fashion)">{product.badge}</Badge>
                    </div>
                  )}

                  {/* Quick add overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-mid flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addItem({
                          id: product.id,
                          name: product.name,
                          quantity: 1,
                          unitPrice: product.price,
                          image: product.images[0],
                          vertical: 'store',
                        });
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-[#111] text-[var(--text-xs)] font-body font-semibold uppercase tracking-wider rounded-sm shadow-lg hover:bg-[var(--fashion)] hover:text-white transition-colors cursor-pointer"
                    >
                      <ShoppingBag size={14} />
                      Add to Cart
                    </button>
                  </div>
                </Link>

                {/* Product info */}
                <div>
                  {product.artist && (
                    <p className="text-[var(--text-xs)] font-body text-[#999] uppercase tracking-wider mb-0.5">
                      {product.artist}
                    </p>
                  )}
                  <h3 className="font-display text-[var(--text-md)] font-medium leading-tight" style={{ color: '#111' }}>
                    <Link href={`/store/products/${product.id}`} className="hover:opacity-70 transition-opacity">
                      {product.name}
                    </Link>
                  </h3>
                  <p className="font-display text-[var(--text-sm)] mt-1" style={{ color: '#333' }}>
                    ${product.price} <span className="text-[var(--text-xs)] font-mono" style={{ color: '#999' }}>({leonesOf(product.price)})</span>
                  </p>
                  {product.stock <= 5 && product.stock > 0 && (
                    <p className="text-[var(--text-xs)] font-body mt-1" style={{ color: 'var(--fashion)' }}>
                      Only {product.stock} left
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
