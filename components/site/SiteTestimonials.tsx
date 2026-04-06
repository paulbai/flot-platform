'use client';

import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import type { SiteConfig } from '@/lib/types/customization';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function SiteTestimonials({ config }: { config: SiteConfig }) {
  const { brand, testimonials } = config;

  if (!testimonials.enabled) return null;

  const items = testimonials.items ?? [];
  if (items.length === 0) return null;

  return (
    <section
      id="testimonials"
      className="py-20 sm:py-28"
      style={{ backgroundColor: brand.backgroundColor, color: brand.textColor }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mx-auto mb-16 max-w-3xl text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          {testimonials.title && (
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ fontFamily: 'var(--heading-font)' }}>
              {testimonials.title}
            </h2>
          )}
          {testimonials.subtitle && (
            <p className="mt-4 text-base leading-relaxed opacity-70 sm:text-lg">
              {testimonials.subtitle}
            </p>
          )}
        </motion.div>

        {/* Cards Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              className="rounded-2xl border p-6 sm:p-8"
              style={{
                borderColor: `color-mix(in srgb, ${brand.accentColor} 25%, transparent)`,
                backgroundColor: `color-mix(in srgb, ${brand.backgroundColor} 95%, ${brand.accentColor})`,
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              {/* Stars */}
              <div className="mb-4 flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < item.rating ? brand.accentColor : 'none'}
                    stroke={brand.accentColor}
                    strokeWidth={1.5}
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="mb-6 text-sm leading-relaxed opacity-80 sm:text-base">
                &ldquo;{item.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                {item.avatar ? (
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: brand.accentColor }}
                  >
                    {getInitials(item.name)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold">{item.name}</p>
                  {item.role && (
                    <p className="text-sm" style={{ opacity: 0.65 }}>{item.role}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
