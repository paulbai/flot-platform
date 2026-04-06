'use client';

import { motion } from 'framer-motion';
import type { SiteConfig } from '@/lib/types/customization';

export default function SiteHero({ config }: { config: SiteConfig }) {
  const { brand, hero } = config;

  const alignClass =
    hero.alignment === 'left'
      ? 'items-start text-left'
      : hero.alignment === 'right'
        ? 'items-end text-right'
        : 'items-center text-center';

  const justifyClass =
    hero.alignment === 'left'
      ? 'justify-start'
      : hero.alignment === 'right'
        ? 'justify-end'
        : 'justify-center';

  return (
    <section id="hero" className="relative flex min-h-screen items-center">
      {/* Background Image */}
      {hero.backgroundImage && (
        <div className="absolute inset-0">
          <img
            src={hero.backgroundImage}
            alt=""
            className="h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: `rgba(0,0,0,${(hero.overlayOpacity ?? 50) / 100})`,
            }}
          />
        </div>
      )}

      {/* Content */}
      <div
        className={`relative z-10 mx-auto flex w-full max-w-7xl flex-col px-4 py-32 sm:px-6 lg:px-8 ${alignClass} ${justifyClass}`}
      >
        {/* Logo */}
        {brand.logoUrl && (
          <motion.img
            src={brand.logoUrl}
            alt={brand.businessName}
            className="mb-6 h-16 w-auto object-contain"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}

        {/* Subline */}
        {hero.subline && (
          <motion.p
            className="mb-4 text-sm font-semibold uppercase tracking-widest"
            style={{ color: brand.accentColor }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {hero.subline}
          </motion.p>
        )}

        {/* Headline */}
        {hero.headline && (
          <motion.h1
            className="max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            style={{
              color: hero.backgroundImage ? '#ffffff' : brand.textColor,
              fontFamily: 'var(--heading-font)',
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {hero.headline}
          </motion.h1>
        )}

        {/* Description */}
        {hero.description && (
          <motion.p
            className="mt-6 max-w-2xl text-base leading-relaxed opacity-80 sm:text-lg"
            style={{
              color: hero.backgroundImage ? '#ffffff' : brand.textColor,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            {hero.description}
          </motion.p>
        )}

        {/* CTAs */}
        <motion.div
          className="mt-10 flex flex-wrap gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {hero.ctaText && (
            <button
              onClick={() => {
                const target = document.getElementById('shop');
                if (target) {
                  target.scrollIntoView({ behavior: 'smooth' });
                } else if (hero.ctaLink) {
                  window.location.href = hero.ctaLink;
                }
              }}
              className="inline-flex items-center rounded-full px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105"
              style={{ backgroundColor: brand.accentColor }}
            >
              {hero.ctaText}
            </button>
          )}
          {hero.secondaryCtaText && (
            <a
              href={hero.secondaryCtaLink || '#about'}
              className="inline-flex items-center rounded-full border-2 px-8 py-3.5 text-sm font-semibold transition-transform hover:scale-105"
              style={{
                borderColor: brand.accentColor,
                color: hero.backgroundImage ? '#ffffff' : brand.textColor,
              }}
            >
              {hero.secondaryCtaText}
            </a>
          )}
        </motion.div>
      </div>
    </section>
  );
}
