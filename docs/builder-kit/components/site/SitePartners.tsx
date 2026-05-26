'use client';

import { useContext } from 'react';
import { motion } from 'framer-motion';
import type { SiteConfig } from '@/lib/types/customization';
import { TemplateContext } from './SiteRenderer';
import { getSectionVariants, getSectionPadding, getBorderRadius } from '@/lib/templates/animations';

export default function SitePartners({ config }: { config: SiteConfig }) {
  const { brand, partners } = config;
  const template = useContext(TemplateContext);

  if (!partners?.enabled || !partners.items || partners.items.length === 0) return null;

  const sectionPadding = getSectionPadding(template.sectionStyles.sectionSpacing);
  const variants = getSectionVariants(template.animationPreset);
  const borderRadius = getBorderRadius(template.sectionStyles.borderRadius);

  // Duplicate items for seamless infinite scroll
  const scrollItems = [...partners.items, ...partners.items];

  return (
    <section id="partners" className={`site-section ${sectionPadding} px-4 sm:px-6 lg:px-8 overflow-hidden`}>
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={variants}
        >
          {partners.subtitle && (
            <p className="text-sm uppercase tracking-widest mb-3 opacity-50"
               style={{ color: brand.accentColor }}>
              {partners.subtitle}
            </p>
          )}
          <h2
            className="text-2xl sm:text-3xl font-bold"
            style={{ fontFamily: 'var(--heading-font)', color: brand.textColor }}
          >
            {partners.title}
          </h2>
        </motion.div>

        {/* Infinite scrolling marquee */}
        <div className="relative">
          {/* Left fade gradient */}
          <div
            className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 z-10 pointer-events-none"
            style={{
              background: `linear-gradient(to right, ${brand.backgroundColor}, transparent)`,
            }}
          />
          {/* Right fade gradient */}
          <div
            className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 z-10 pointer-events-none"
            style={{
              background: `linear-gradient(to left, ${brand.backgroundColor}, transparent)`,
            }}
          />

          <motion.div
            className="flex gap-8 sm:gap-12 items-center"
            animate={{ x: ['0%', '-50%'] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: 'loop',
                duration: partners.items.length * 2,
                ease: 'linear',
              },
            }}
          >
            {scrollItems.map((partner, i) => (
              <div
                key={`${partner.name}-${i}`}
                className="site-card flex-shrink-0 flex flex-col items-center gap-3 px-6 py-4"
                style={{ minWidth: '160px' }}
              >
                {partner.logoUrl ? (
                  <img loading="lazy" decoding="async"
                    src={partner.logoUrl}
                    alt={partner.name}
                    className={`h-10 sm:h-12 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity duration-300`}
                  />
                ) : (
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 ${borderRadius} flex items-center justify-center text-lg sm:text-xl font-bold opacity-60 hover:opacity-100 transition-opacity duration-300`}
                    style={{
                      backgroundColor: brand.accentColor + '20',
                      color: brand.accentColor,
                    }}
                  >
                    {partner.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span
                  className="text-xs sm:text-sm font-medium whitespace-nowrap opacity-50 hover:opacity-80 transition-opacity"
                  style={{ color: brand.textColor }}
                >
                  {partner.name}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
