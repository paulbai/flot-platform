'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SiteConfig } from '@/lib/types/customization';

export default function SiteNavbar({ config }: { config: SiteConfig }) {
  const { brand, navbar } = config;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const bgClass = (() => {
    if (navbar.style === 'solid' || (navbar.style === 'transparent' && scrolled)) {
      return 'bg-white/95 shadow-sm backdrop-blur-sm';
    }
    if (navbar.style === 'glass') {
      return 'bg-white/20 backdrop-blur-xl';
    }
    // transparent and not scrolled
    return 'bg-transparent';
  })();

  const showSolidText =
    navbar.style === 'solid' || navbar.style === 'glass' || scrolled;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${bgClass}`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo / Brand */}
        <a href="#hero" className="flex items-center gap-2">
          {brand.logoUrl && (
            <img
              src={brand.logoUrl}
              alt={brand.businessName}
              className="h-8 w-auto object-contain"
            />
          )}
          <span
            className="text-xl font-bold tracking-tight"
            style={{ color: brand.accentColor, fontFamily: 'var(--heading-font)' }}
          >
            {brand.businessName}
          </span>
        </a>

        {/* Desktop Links */}
        <div className="hidden items-center gap-8 md:flex">
          {navbar.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{
                color: showSolidText ? brand.textColor : brand.textColor,
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          {navbar.ctaText && (
            <a
              href={navbar.ctaLink || '#contact'}
              className="inline-flex items-center rounded-full px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: brand.accentColor }}
            >
              {navbar.ctaText}
            </a>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          style={{ color: showSolidText ? brand.textColor : brand.textColor }}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Panel */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-white/10 bg-white/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-3 px-4 py-4">
              {navbar.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium"
                  style={{ color: brand.textColor }}
                >
                  {link.label}
                </a>
              ))}
              {navbar.ctaText && (
                <a
                  href={navbar.ctaLink || '#contact'}
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white"
                  style={{ backgroundColor: brand.accentColor }}
                >
                  {navbar.ctaText}
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
