'use client';

import { useContext } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';
import type { SiteConfig } from '@/lib/types/customization';
import { TemplateContext } from './SiteRenderer';
import {
  getSectionPadding,
  getBorderRadius,
  getSectionVariants,
} from '@/lib/templates/animations';

const verticalCTA: Record<string, { label: string; sub: string }> = {
  hotel: { label: 'Book Your Stay', sub: 'Browse our rooms and reserve today' },
  restaurant: { label: 'Ready to Order?', sub: 'View our menu and place your order' },
  store: { label: 'Start Shopping', sub: 'Explore our collection and find something you love' },
  travel: { label: 'Search Flights', sub: 'Find the best fares for your next trip' },
};

export default function SiteBottomCTA({ config }: { config: SiteConfig }) {
  const template = useContext(TemplateContext);
  const cta = verticalCTA[config.vertical] ?? { label: 'Get Started', sub: '' };
  const accent = config.brand.accentColor;

  const sectionPadding = getSectionPadding(template.sectionStyles.sectionSpacing);
  const borderRadius = getBorderRadius(template.sectionStyles.borderRadius);
  const sectionVariants = getSectionVariants(template.animationPreset);

  const shouldFloat =
    template.threeDEffects.hero === 'float' || template.threeDEffects.cards === 'float';

  return (
    <section className={`${sectionPadding} px-4 sm:px-6 lg:px-8`}>
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div
          className={`mx-auto max-w-3xl text-center ${borderRadius} p-10 border border-white/10`}
          style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
        >
          <h3
            className="text-2xl sm:text-3xl font-bold mb-3"
            style={{ fontFamily: 'var(--heading-font)' }}
          >
            {cta.label}
          </h3>
          <p className="text-sm opacity-50 mb-6">{cta.sub}</p>
          <button
            onClick={() => {
              document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-white transition-transform hover:scale-105${shouldFloat ? ' animate-float' : ''}`}
            style={{ backgroundColor: accent }}
          >
            <ArrowUp size={16} />
            {cta.label}
          </button>
        </div>
      </motion.div>
    </section>
  );
}
