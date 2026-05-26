'use client';

import { useContext, useState, useEffect, useCallback } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SiteConfig } from '@/lib/types/customization';
import type { TemplateDefinition } from '@/lib/templates/types';
import { TemplateContext } from './SiteRenderer';
import {
  useTiltEffect,
  getSectionPadding,
  getBorderRadius,
  getCardStyles,
  getSectionVariants,
  getItemDelay,
} from '@/lib/templates/animations';
import { resolveBrand } from '@/lib/brand-helpers';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/* ── TiltCard wrapper for 3D tilt effect ── */
function TiltCard({
  children,
  intensity,
  className,
  style,
}: {
  children: React.ReactNode;
  intensity: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const tilt = useTiltEffect(intensity);
  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      className={className}
      style={{ ...style, ...tilt.style }}
    >
      {children}
    </div>
  );
}

/* ── Shared sub-components ── */

function Stars({ rating, accentColor }: { rating: number; accentColor: string }) {
  return (
    <div className="mb-4 flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={16}
          fill={i < rating ? accentColor : 'none'}
          stroke={accentColor}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function AuthorBlock({
  item,
  accentColor,
}: {
  item: { name: string; role?: string; avatar?: string };
  accentColor: string;
}) {
  return (
    <div className="flex items-center gap-3">
      {item.avatar ? (
        <img loading="lazy" decoding="async"
          src={item.avatar}
          alt={item.name}
          className="h-10 w-10 rounded-full object-cover"
        />
      ) : (
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: accentColor }}
        >
          {getInitials(item.name)}
        </div>
      )}
      <div>
        <p className="text-sm font-semibold">{item.name}</p>
        {item.role && (
          <p className="text-sm" style={{ opacity: 0.65 }}>
            {item.role}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Layout: Cards (default 3-column grid) ── */

function CardsLayout({
  items,
  brand,
  template,
}: {
  items: SiteConfig['testimonials']['items'];
  brand: SiteConfig['brand'];
  template: TemplateDefinition;
}) {
  const borderRadius = getBorderRadius(template.sectionStyles.borderRadius);
  const cardStyle = getCardStyles(
    template.sectionStyles.cardStyle,
    brand.accentColor,
    brand.backgroundColor
  );
  const sectionVariants = getSectionVariants(template.animationPreset);
  const useTilt = template.threeDEffects.cards === 'tilt-cards';
  const useFloat = template.threeDEffects.cards === 'float';

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {(items ?? []).map((item, idx) => {
        const cardContent = (
          <>
            <Stars rating={item.rating} accentColor={brand.accentColor} />
            <p className="mb-6 text-sm leading-relaxed opacity-80 sm:text-base">
              &ldquo;{item.quote}&rdquo;
            </p>
            <AuthorBlock item={item} accentColor={brand.accentColor} />
          </>
        );

        const baseClassName = `site-card ${borderRadius} border p-6 sm:p-8 ${useFloat ? 'animate-float' : ''}`;
        const baseStyle = {
          ...cardStyle,
          borderColor: resolveBrand(brand).borderColor,
        };
        const delay = getItemDelay(template.animationPreset, idx);

        if (useTilt) {
          return (
            <motion.div
              key={idx}
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay }}
            >
              <TiltCard
                intensity={template.threeDEffects.intensity}
                className={baseClassName}
                style={baseStyle}
              >
                {cardContent}
              </TiltCard>
            </motion.div>
          );
        }

        return (
          <motion.div
            key={idx}
            className={baseClassName}
            style={baseStyle}
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay }}
          >
            {cardContent}
          </motion.div>
        );
      })}
    </div>
  );
}

/* ── Layout: Single Slider ── */

function SingleSliderLayout({
  items,
  brand,
  template,
}: {
  items: SiteConfig['testimonials']['items'];
  brand: SiteConfig['brand'];
  template: TemplateDefinition;
}) {
  const safeItems = items ?? [];
  const [current, setCurrent] = useState(0);

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % safeItems.length),
    [safeItems.length]
  );
  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + safeItems.length) % safeItems.length),
    [safeItems.length]
  );

  useEffect(() => {
    if (safeItems.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, safeItems.length]);

  if (safeItems.length === 0) return null;

  const borderRadius = getBorderRadius(template.sectionStyles.borderRadius);
  const cardStyle = getCardStyles(
    template.sectionStyles.cardStyle,
    brand.accentColor,
    brand.backgroundColor
  );
  const useTilt = template.threeDEffects.cards === 'tilt-cards';
  const useFloat = template.threeDEffects.cards === 'float';
  const item = safeItems[current];

  const slideContent = (
    <div className={`site-card ${borderRadius} border p-8 sm:p-12 ${useFloat ? 'animate-float' : ''}`} style={{
      ...cardStyle,
      borderColor: `color-mix(in srgb, ${brand.accentColor} 25%, transparent)`,
    }}>
      <Stars rating={item.rating} accentColor={brand.accentColor} />
      <p className="mb-8 text-lg leading-relaxed opacity-80 sm:text-xl">
        &ldquo;{item.quote}&rdquo;
      </p>
      <AuthorBlock item={item} accentColor={brand.accentColor} />
    </div>
  );

  return (
    <div className="relative mx-auto max-w-3xl">
      {/* Arrows (desktop) */}
      {safeItems.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute -left-14 top-1/2 hidden -translate-y-1/2 rounded-full p-2 opacity-60 transition-opacity hover:opacity-100 lg:block"
            style={{ color: brand.textColor }}
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={next}
            className="absolute -right-14 top-1/2 hidden -translate-y-1/2 rounded-full p-2 opacity-60 transition-opacity hover:opacity-100 lg:block"
            style={{ color: brand.textColor }}
            aria-label="Next testimonial"
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.4 }}
        >
          {useTilt ? (
            <TiltCard intensity={template.threeDEffects.intensity}>
              {slideContent}
            </TiltCard>
          ) : (
            slideContent
          )}
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      {safeItems.length > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {safeItems.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="h-2.5 w-2.5 rounded-full transition-all"
              style={{
                backgroundColor:
                  i === current
                    ? brand.accentColor
                    : `color-mix(in srgb, ${brand.accentColor} 30%, transparent)`,
                transform: i === current ? 'scale(1.3)' : 'scale(1)',
              }}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Layout: Quote Wall ── */

function QuoteWallLayout({
  items,
  brand,
  template,
}: {
  items: SiteConfig['testimonials']['items'];
  brand: SiteConfig['brand'];
  template: TemplateDefinition;
}) {
  const sectionVariants = getSectionVariants(template.animationPreset);

  return (
    <div className="mx-auto max-w-4xl space-y-0">
      {(items ?? []).map((item, idx) => (
        <motion.div
          key={idx}
          className="py-12 first:pt-0 last:pb-0"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          transition={{
            duration: 0.6,
            delay: getItemDelay(template.animationPreset, idx),
          }}
        >
          {/* Decorative quote mark */}
          <span
            className="block text-6xl font-bold leading-none select-none"
            style={{ color: brand.accentColor }}
            aria-hidden="true"
          >
            &ldquo;
          </span>

          {/* Quote text */}
          <p className="-mt-4 text-xl leading-relaxed opacity-90 sm:text-2xl">
            {item.quote}
          </p>

          {/* Author */}
          <div className="mt-6">
            <AuthorBlock item={item} accentColor={brand.accentColor} />
          </div>

          {/* Stars */}
          <div className="mt-3">
            <Stars rating={item.rating} accentColor={brand.accentColor} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Layout: Minimal Inline ── */

function MinimalInlineLayout({
  items,
  brand,
  template,
}: {
  items: SiteConfig['testimonials']['items'];
  brand: SiteConfig['brand'];
  template: TemplateDefinition;
}) {
  const sectionVariants = getSectionVariants(template.animationPreset);

  return (
    <div className="mx-auto max-w-3xl divide-y" style={{
      borderColor: resolveBrand(brand).borderColor,
    }}>
      {(items ?? []).map((item, idx) => (
        <motion.div
          key={idx}
          className="py-8 first:pt-0 last:pb-0"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          transition={{
            duration: 0.5,
            delay: getItemDelay(template.animationPreset, idx),
          }}
        >
          <p className="text-lg italic leading-relaxed opacity-85 sm:text-xl">
            &ldquo;{item.quote}&rdquo;
            <span className="ml-2 not-italic text-base font-medium opacity-70">
              &mdash; {item.name}{item.role ? `, ${item.role}` : ''}
            </span>
          </p>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Main Component ── */

export default function SiteTestimonials({ config }: { config: SiteConfig }) {
  const template = useContext(TemplateContext);
  const { brand, testimonials } = config;

  if (!testimonials.enabled) return null;

  const items = testimonials.items ?? [];
  if (items.length === 0) return null;

  const sectionPadding = getSectionPadding(template.sectionStyles.sectionSpacing);

  function renderLayout() {
    switch (template.testimonialsLayout) {
      case 'single-slider':
        return (
          <SingleSliderLayout items={items} brand={brand} template={template} />
        );
      case 'quote-wall':
        return (
          <QuoteWallLayout items={items} brand={brand} template={template} />
        );
      case 'minimal-inline':
        return (
          <MinimalInlineLayout items={items} brand={brand} template={template} />
        );
      case 'cards':
      default:
        return (
          <CardsLayout items={items} brand={brand} template={template} />
        );
    }
  }

  return (
    <section
      id="testimonials"
      className={`site-section ${sectionPadding}`}
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
            <h2
              className="text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ fontFamily: 'var(--heading-font)' }}
            >
              {testimonials.title}
            </h2>
          )}
          {testimonials.subtitle && (
            <p className="mt-4 text-base leading-relaxed opacity-70 sm:text-lg">
              {testimonials.subtitle}
            </p>
          )}
        </motion.div>

        {/* Layout */}
        {renderLayout()}
      </div>
    </section>
  );
}
