'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface BentoCard {
  title: string;
  subtitle: string;
  description: string;
  href: string;
  accentColor: string;
  bgImage: string;
  gridClass: string;
}

const cards: BentoCard[] = [
  {
    title: 'Hotel',
    subtitle: 'Book your stay',
    description: 'Luxury suites and villas with seamless reservation and payment.',
    href: '/hotel',
    accentColor: 'var(--hotel)',
    bgImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    gridClass: 'md:col-span-6 md:row-span-3',
  },
  {
    title: 'Restaurant',
    subtitle: 'Order & pay at table',
    description: 'Scan, browse the menu, order, and pay — all from your phone.',
    href: '/restaurant',
    accentColor: 'var(--restaurant)',
    bgImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    gridClass: 'md:col-span-6 md:row-span-2',
  },
  {
    title: 'Travel',
    subtitle: 'Find your flight',
    description: 'Search flights, pick seats, and book in under a minute.',
    href: '/travel',
    accentColor: 'var(--travel)',
    bgImage: 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=800&q=80',
    gridClass: 'md:col-span-8 md:row-span-2',
  },
  {
    title: 'Store',
    subtitle: 'Fashion & Art',
    description: 'Curated clothing, prints, and objects — gallery meets commerce.',
    href: '/store',
    accentColor: 'var(--fashion)',
    bgImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80',
    gridClass: 'md:col-span-4 md:row-span-3',
  },
];

function BentoCardComponent({ card, index }: { card: BentoCard; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.8,
        delay: 0.4 + index * 0.1,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
      className={`${card.gridClass} col-span-1`}
    >
      <Link href={card.href} className="group block relative h-full min-h-[200px] sm:min-h-[240px] md:min-h-[280px] overflow-hidden rounded-sm">
        {/* Left accent border */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 z-20 transition-all duration-mid group-hover:w-1.5"
          style={{ backgroundColor: card.accentColor }}
        />

        {/* Background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={card.bgImage}
          alt={card.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-slow ease-out-expo group-hover:scale-[1.03]"
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/50 to-black/20 group-hover:from-black/80 group-hover:via-black/40 transition-all duration-mid" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-8">
          {/* Label */}
          <span
            className="text-[var(--text-xs)] font-body font-extrabold uppercase tracking-[0.2em] mb-2"
            style={{ color: card.accentColor }}
          >
            {card.title}
          </span>

          {/* Headline */}
          <h3 className="font-display text-[var(--text-lg)] md:text-[var(--text-xl)] text-white font-medium leading-tight mb-2">
            {card.subtitle}
          </h3>

          {/* Description — visible on mobile, fades in on hover for desktop */}
          <p className="text-[var(--text-sm)] text-[var(--cloud)] max-w-sm opacity-100 md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-mid">
            {card.description}
          </p>

          {/* Arrow indicator */}
          <div
            className="mt-3 md:mt-4 flex items-center gap-2 text-[var(--text-xs)] font-body font-semibold uppercase tracking-[0.15em] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-mid translate-x-0 group-hover:translate-x-1"
            style={{ color: card.accentColor }}
          >
            Explore <ArrowRight size={14} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function BentoGrid() {
  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 auto-rows-[minmax(200px,1fr)]">
        {cards.map((card, i) => (
          <BentoCardComponent key={card.title} card={card} index={i} />
        ))}
      </div>
    </section>
  );
}
