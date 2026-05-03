'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Hotel, UtensilsCrossed, Plane, ShoppingBag, ArrowRight, Sparkles, Globe, Palette, Zap, ChevronDown, Check, Code2 } from 'lucide-react';
import Link from 'next/link';
import AuthModal from '@/components/auth/AuthModal';
import LandingCheckoutDemo from '@/components/landing/LandingCheckoutDemo';

const verticals = [
  {
    key: 'hotel' as const,
    label: 'Hotel',
    icon: Hotel,
    color: '#d4a96a',
    description: 'Luxury stays, room booking, spa services',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
  },
  {
    key: 'restaurant' as const,
    label: 'Restaurant',
    icon: UtensilsCrossed,
    color: '#e85d3a',
    description: 'Menus, QR ordering, dine-in payments',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
  },
  {
    key: 'store' as const,
    label: 'Store',
    icon: ShoppingBag,
    color: '#8b5cf6',
    description: 'Fashion, art, products, online shopping',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80',
  },
  {
    key: 'travel' as const,
    label: 'Travel',
    icon: Plane,
    color: '#4a9eff',
    description: 'Flight search, seat selection, booking',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=600&q=80',
    comingSoon: true,
  },
];

const features = [
  {
    icon: Palette,
    title: '100% Customizable',
    description: 'Every section of your page is fully editable: navbar, hero, about, gallery, testimonials, contact, and footer.',
  },
  {
    icon: Zap,
    title: 'Go Live Instantly',
    description: 'Publish your site with a dedicated URL in one click. Share it anywhere and start getting customers.',
  },
  {
    icon: Globe,
    title: 'Your Own Domain',
    description: 'Each business gets a unique URL. Your brand, your page, your customers.',
  },
  {
    icon: Sparkles,
    title: 'Built-in Checkout',
    description: 'Accept payments seamlessly with Flot Checkout, integrated into every template.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1, y: 0,
    transition: { delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();
  const [hoveredVertical, setHoveredVertical] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);

  const requireAuth = useCallback((redirect: string) => {
    if (session) {
      router.push(redirect);
    } else {
      setPendingRedirect(redirect);
      setShowAuth(true);
    }
  }, [session, router]);

  const handleAuthSuccess = useCallback(() => {
    setShowAuth(false);
    if (pendingRedirect) {
      router.push(pendingRedirect);
      setPendingRedirect(null);
    } else {
      router.push('/builder');
    }
  }, [pendingRedirect, router]);

  return (
    <main id="main-content" className="min-h-screen bg-[var(--void)]">
      {/* Minimal top nav */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ backgroundColor: 'rgba(8, 8, 8, 0.85)', backdropFilter: 'blur(16px)' }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/flot-logo.png" alt="Flot" className="w-8 h-8 rounded-lg" />
            <span className="font-display text-2xl font-bold tracking-tight text-[var(--flot)] font-satoshi">Flot</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => requireAuth('/builder')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm text-[var(--cloud)] hover:text-white transition-colors"
            >
              My Sites
            </button>
            <button
              onClick={() => requireAuth('/builder')}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-[var(--flot)] text-[var(--void)] hover:opacity-90 transition-opacity"
            >
              <span className="hidden sm:inline">Create Your Site</span>
              <span className="sm:hidden">Get Started</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center pt-16 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(var(--ash) 1px, transparent 1px), linear-gradient(90deg, var(--ash) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.03 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display font-bold text-[20vw] text-white pointer-events-none select-none whitespace-nowrap overflow-hidden max-w-full"
        >
          FLOT
        </motion.div>

        <div className="relative z-10 max-w-3xl">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="w-16 h-[2px] bg-[var(--flot)] mb-8 origin-left"
          />

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="font-satoshi font-bold leading-[0.9] tracking-tight mb-6"
            style={{ fontSize: 'var(--text-hero)' }}
          >
            <span className="text-[var(--paper)]">Get a free </span>
            <span className="font-light text-[var(--flot)]">business</span>
            <span className="text-[var(--paper)]"><br />page.</span>
          </motion.h1>

          <motion.p
            custom={0.4}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-[var(--text-md)] text-[var(--cloud)] font-satoshi font-medium max-w-lg mb-4"
          >
            <strong className="text-[var(--paper)]">Plus 1 year hosting with Flot Business.</strong>{' '}
            Start accepting payments from:
          </motion.p>

          <motion.ul
            custom={0.48}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-[var(--text-sm)] text-[var(--cloud)] font-satoshi font-medium max-w-lg mb-4 space-y-1"
          >
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[var(--flot)]" /> Flot</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[var(--flot)]" /> Mobile Money</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[var(--flot)]" /> Visa & Mastercard</li>
          </motion.ul>

          <motion.p
            custom={0.52}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-[var(--text-sm)] text-[var(--fog)] font-satoshi mb-8"
          >
            Call{' '}
            <a href="tel:+23280800100" className="text-[var(--flot)] font-semibold hover:underline">+23280800100</a>
            {' '}/{' '}
            <a href="tel:+23299800100" className="text-[var(--flot)] font-semibold hover:underline">+23299800100</a>
          </motion.p>

          <motion.div custom={0.55} initial="hidden" animate="visible" variants={fadeUp} className="flex flex-wrap gap-3">
            <button
              onClick={() => requireAuth('/builder')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold bg-[var(--flot)] text-[var(--void)] hover:opacity-90 transition-opacity"
            >
              Get Started Free <ArrowRight size={16} />
            </button>
            <button
              onClick={() => requireAuth('/builder')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold border border-[var(--ash)] text-[var(--cloud)] hover:text-white hover:border-[var(--fog)] transition-colors"
            >
              View My Sites
            </button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          custom={0.9}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
          onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <span className="text-[10px] font-satoshi uppercase tracking-[0.3em] text-[var(--fog)]">Scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            <ChevronDown size={16} className="text-[var(--fog)]" />
          </motion.div>
        </motion.div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-[var(--text-xs)] font-satoshi font-bold uppercase tracking-[0.25em] text-[var(--flot)]">
              How it works
            </span>
            <h2 className="font-satoshi text-[var(--text-xl)] text-[var(--paper)] font-bold mt-3">
              Three steps to your business page
            </h2>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { step: '01', title: 'Pick a Template', desc: 'Choose from Hotel, Restaurant, Store, or Travel. Each designed for your industry.' },
            { step: '02', title: 'Customize Everything', desc: 'Brand colors, photos, menu items, pricing, testimonials, contact info. Make it yours.' },
            { step: '03', title: 'Go Live', desc: 'Hit publish and get your dedicated URL. Share it with the world.' },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-[var(--flot)]/30 mb-4">
                <span className="font-mono text-sm text-[var(--flot)]">{item.step}</span>
              </div>
              <h3 className="font-satoshi text-[var(--text-md)] text-[var(--paper)] font-bold mb-2">{item.title}</h3>
              <p className="text-[var(--text-sm)] text-[var(--fog)] font-satoshi leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-[var(--ash)]/20">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-[var(--text-xs)] font-satoshi font-bold uppercase tracking-[0.25em] text-[var(--flot)]">
                Features
              </span>
              <h2 className="font-satoshi text-[var(--text-xl)] text-[var(--paper)] font-bold mt-3">
                Everything you need to go live
              </h2>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.6 }}
                  className="bg-[var(--ink)] border border-[var(--ash)]/30 rounded-xl p-6 hover:border-[var(--flot)]/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-[var(--flot)]/10">
                    <Icon size={20} className="text-[var(--flot)]" />
                  </div>
                  <h3 className="font-satoshi text-[var(--text-md)] text-[var(--paper)] font-bold mb-2">{feature.title}</h3>
                  <p className="text-[var(--text-xs)] text-[var(--fog)] leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Flot Checkout — Standalone */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-[var(--ash)]/20 overflow-hidden">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left: Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <span className="text-[var(--text-xs)] font-satoshi font-bold uppercase tracking-[0.25em] text-[var(--flot)]">
                Already have a website?
              </span>
              <h2 className="font-satoshi text-[var(--text-xl)] text-[var(--paper)] font-bold mt-3 mb-4">
                Add Flot Checkout to any site
              </h2>
              <p className="text-[var(--text-sm)] text-[var(--fog)] font-satoshi leading-relaxed mb-6 max-w-md">
                Drop our checkout into your existing website with a single link. Accept payments via Flot, Mobile Money, and Bank Cards — no code changes required.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  'Works with any website or platform',
                  'Accept Flot, Mobile Money, Visa & Mastercard',
                  'Customers can save payment methods',
                  'Instant receipts via Email or WhatsApp',
                  'PCIDSS compliant & secured by Flot',
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.06, duration: 0.5 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-[var(--flot)]/10 flex items-center justify-center shrink-0">
                      <Check size={12} className="text-[var(--flot)]" />
                    </div>
                    <span className="text-sm text-[var(--cloud)] font-satoshi">{item}</span>
                  </motion.div>
                ))}
              </div>

              <p className="text-[var(--text-xs)] text-[var(--fog)] font-satoshi italic mb-4">
                Try it now — tap a payment method and hit Pay on the live demo →
              </p>

              <div className="flex flex-wrap gap-3">
                <a
                  href="https://pay.flotme.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold border border-[var(--ash)] text-[var(--cloud)] hover:text-white hover:border-[var(--fog)] transition-colors"
                  aria-label="Open Flot checkout link"
                >
                  <Code2 size={16} />
                  Checkout Link
                </a>
              </div>
            </motion.div>

            {/* Right: Live interactive demo (replaces the static mockup +
                "Try Live Demo" button — visitors can play with the checkout
                right here instead of being navigated away). */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex justify-center"
            >
              <LandingCheckoutDemo />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Template Selection - Get Started */}
      <section id="get-started" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-[var(--ash)]/20">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-[var(--text-xs)] font-satoshi font-bold uppercase tracking-[0.25em] text-[var(--flot)]">
                Get Started
              </span>
              <h2 className="font-satoshi text-[var(--text-xl)] text-[var(--paper)] font-bold mt-3 mb-4">
                Choose your business type
              </h2>
              <p className="text-[var(--text-sm)] text-[var(--fog)] font-satoshi max-w-md mx-auto">
                Pick a template to start building your site. Everything is fully customizable.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
            {verticals.map((v, i) => {
              const Icon = v.icon;
              const isHovered = hoveredVertical === v.key;
              return (
                <motion.div
                  key={v.key}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.6 }}
                  onMouseEnter={() => setHoveredVertical(v.key)}
                  onMouseLeave={() => setHoveredVertical(null)}
                  onClick={() => !v.comingSoon && requireAuth(`/builder?create=${v.key}`)}
                  className={`group relative overflow-hidden rounded-xl border border-[var(--ash)]/30 transition-all duration-300 ${v.comingSoon ? 'cursor-default' : 'cursor-pointer'}`}
                  style={{ borderColor: isHovered && !v.comingSoon ? v.color + '60' : '' }}
                >
                  {/* Background image */}
                  <div className="relative aspect-[3/4] sm:aspect-[3/4]">
                    <div
                      className={`absolute inset-0 bg-cover bg-center transition-transform duration-700 ${v.comingSoon ? 'grayscale' : 'group-hover:scale-110'}`}
                      style={{ backgroundImage: `url(${v.image})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
                  </div>

                  {/* Coming soon badge */}
                  {v.comingSoon && (
                    <div className="absolute top-4 right-4 z-10">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
                        Coming Soon
                      </span>
                    </div>
                  )}

                  {/* Content overlay */}
                  <div className={`absolute inset-0 flex flex-col justify-end p-6 ${v.comingSoon ? 'opacity-60' : ''}`}>
                    <div className="mb-3 w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: v.color + '20' }}>
                      <Icon size={20} style={{ color: v.color }} />
                    </div>
                    <h3 className="font-satoshi text-lg text-white font-bold mb-1">{v.label}</h3>
                    <p className="text-xs text-white/60 font-satoshi mb-4">{v.description}</p>
                    {v.comingSoon ? (
                      <span className="text-xs font-satoshi font-bold uppercase tracking-wider text-white/40">
                        Coming Soon
                      </span>
                    ) : (
                      <div
                        className="flex items-center gap-2 text-xs font-satoshi font-bold uppercase tracking-wider transition-all"
                        style={{ color: v.color }}
                      >
                        Start Building <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--ash)]/20 py-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <img src="/flot-logo.png" alt="Flot" className="w-7 h-7 rounded-lg" />
              <span className="font-display text-xl font-bold text-[var(--flot)]">Flot</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <button onClick={() => requireAuth('/builder')} className="text-sm text-[var(--fog)] hover:text-white transition-colors">My Sites</button>
              <Link href="/hotel" className="text-sm text-[var(--fog)] hover:text-white transition-colors">Hotel</Link>
              <Link href="/restaurant" className="text-sm text-[var(--fog)] hover:text-white transition-colors">Restaurant</Link>
              <Link href="/store" className="text-sm text-[var(--fog)] hover:text-white transition-colors">Store</Link>
              <Link href="/travel" className="text-sm text-[var(--fog)] hover:text-white transition-colors">Travel</Link>
            </div>
            <span className="font-mono text-[10px] text-[var(--fog)]/50 uppercase tracking-wider">
              Commerce without friction
            </span>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={showAuth}
        onClose={() => { setShowAuth(false); setPendingRedirect(null); }}
        onSuccess={handleAuthSuccess}
      />
    </main>
  );
}
