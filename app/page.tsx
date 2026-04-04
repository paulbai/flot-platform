'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import NavBar from '@/components/layout/NavBar';
import BentoGrid from '@/components/layout/BentoGrid';

const wordVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

export default function Home() {
  return (
    <main id="main-content" className="min-h-screen bg-[var(--void)]">
      <NavBar />

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex flex-col justify-center pt-16 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
        {/* Subtle grid lines background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `
            linear-gradient(var(--ash) 1px, transparent 1px),
            linear-gradient(90deg, var(--ash) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }} />

        {/* Flot wordmark — large, desaturated */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.04 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display font-bold text-[20vw] text-white pointer-events-none select-none whitespace-nowrap"
        >
          FLOT
        </motion.div>

        <div className="relative z-10">
          {/* Logo accent line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="w-16 h-[2px] bg-[var(--flot)] mb-8 origin-left"
          />

          {/* Main headline */}
          <h1 className="font-display font-medium leading-[0.9] tracking-tight mb-6">
            {['Commerce', 'without', 'friction.'].map((word, i) => (
              <motion.span
                key={word}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={wordVariants}
                className="block"
                style={{ fontSize: 'var(--text-hero)' }}
              >
                {word === 'friction.' ? (
                  <span className="italic font-light text-[var(--flot)]">{word}</span>
                ) : (
                  <span className="text-[var(--paper)]">{word}</span>
                )}
              </motion.span>
            ))}
          </h1>

          {/* Subheadline */}
          <motion.p
            custom={0.5}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-[var(--text-md)] text-[var(--cloud)] font-body max-w-md mb-10"
          >
            Four categories. One checkout. Zero friction.
          </motion.p>

          {/* Scroll indicator */}
          <motion.div
            custom={0.8}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="flex items-center gap-2 text-[var(--fog)] group cursor-pointer"
            onClick={() => {
              document.getElementById('verticals')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span className="text-[var(--text-xs)] font-body font-semibold uppercase tracking-[0.2em] group-hover:text-[var(--flot)] transition-colors duration-mid">
              Browse all verticals
            </span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronDown size={16} className="group-hover:text-[var(--flot)] transition-colors duration-mid" />
            </motion.div>
          </motion.div>
        </div>

        {/* Right-side decorative element */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2"
        >
          <div className="relative w-[280px] h-[280px]">
            {/* Decorative orbiting dots */}
            <div className="absolute inset-0 rounded-full border border-[var(--ash)]/30" />
            <div className="absolute inset-4 rounded-full border border-[var(--ash)]/20" />
            <div className="absolute inset-8 rounded-full border border-[var(--ash)]/10" />

            {/* Accent dots at cardinal points */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[var(--hotel)]" />
            <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[var(--restaurant)]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[var(--travel)]" />
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[var(--fashion)]" />

            {/* Center Flot dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-[var(--flot)] glow-flot" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Bento Grid */}
      <section id="verticals" className="pb-24 pt-8">
        {/* Section header */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-[var(--ash)] to-transparent" />
            <span className="text-[var(--text-xs)] font-mono text-[var(--fog)] uppercase tracking-[0.3em]">
              Verticals
            </span>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-[var(--ash)] to-transparent" />
          </div>
        </div>

        <BentoGrid />
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--ash)]/30 py-8">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[var(--text-xs)] text-[var(--fog)]">
              Powered by{' '}
              <span className="text-[var(--flot)] font-medium">Flot</span>
            </span>
          </div>
          <span className="font-mono text-[var(--text-xs)] text-[var(--fog)]/50">
            Demo Platform &middot; No real transactions
          </span>
        </div>
      </footer>
    </main>
  );
}
