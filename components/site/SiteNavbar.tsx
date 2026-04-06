'use client';

import { useState, useEffect, useContext } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SiteConfig } from '@/lib/types/customization';
import { TemplateContext } from './SiteRenderer';

export default function SiteNavbar({ config }: { config: SiteConfig }) {
  const { brand, navbar } = config;
  const template = useContext(TemplateContext);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Template navStyle overrides navbar.style when set
  const activeStyle = template.navStyle || navbar.style;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const bgClass = (() => {
    if (activeStyle === 'solid' || (activeStyle === 'transparent' && scrolled)) {
      return 'bg-white/95 shadow-sm backdrop-blur-sm';
    }
    if (activeStyle === 'glass' || activeStyle === 'centered' || activeStyle === 'minimal') {
      return 'bg-white/20 backdrop-blur-xl';
    }
    // transparent and not scrolled
    return 'bg-transparent';
  })();

  const showSolidText =
    activeStyle === 'solid' || activeStyle === 'glass' || scrolled;

  // Split links for centered layout: first half left, second half right
  const midpoint = Math.ceil(navbar.links.length / 2);
  const leftLinks = navbar.links.slice(0, midpoint);
  const rightLinks = navbar.links.slice(midpoint);

  const isCentered = activeStyle === 'centered';
  const isMinimal = activeStyle === 'minimal';

  // ── Shared pieces ──

  const logoBlock = (
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
  );

  const ctaButton = navbar.ctaText ? (
    <a
      href={navbar.ctaLink || '#contact'}
      className="inline-flex items-center rounded-full px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      style={{ backgroundColor: brand.accentColor }}
    >
      {navbar.ctaText}
    </a>
  ) : null;

  const linkItem = (link: { label: string; href: string }) => (
    <a
      key={link.href}
      href={link.href}
      className="text-sm font-medium transition-colors hover:opacity-80"
      style={{ color: showSolidText ? brand.textColor : brand.textColor }}
    >
      {link.label}
    </a>
  );

  // ── Mobile panel (shared by all variants) ──

  const mobilePanel = (
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
  );

  // For minimal, the mobile panel should show on all screen sizes
  const minimalPanel = (
    <AnimatePresence>
      {mobileOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden border-t border-white/10 bg-white/95 backdrop-blur-xl"
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
  );

  const hamburgerButton = (
    <button
      onClick={() => setMobileOpen((v) => !v)}
      aria-label="Toggle menu"
      style={{ color: showSolidText ? brand.textColor : brand.textColor }}
    >
      {mobileOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  );

  // ── Centered layout ──

  if (isCentered) {
    return (
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${bgClass}`}
      >
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          {/* Desktop: links-left | logo-center | links-right + CTA */}
          <div className="hidden items-center md:grid md:grid-cols-3">
            {/* Left links */}
            <div className="flex items-center gap-8">
              {leftLinks.map(linkItem)}
            </div>

            {/* Center logo */}
            <div className="flex justify-center">{logoBlock}</div>

            {/* Right links + CTA */}
            <div className="flex items-center justify-end gap-8">
              {rightLinks.map(linkItem)}
              {ctaButton}
            </div>
          </div>

          {/* Mobile: standard logo-left, hamburger-right */}
          <div className="flex items-center justify-between md:hidden">
            {logoBlock}
            <button
              className="md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              style={{ color: showSolidText ? brand.textColor : brand.textColor }}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile panel (same as default) */}
        {mobilePanel}
      </nav>
    );
  }

  // ── Minimal layout: logo + hamburger only, all screen sizes ──

  if (isMinimal) {
    return (
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${bgClass}`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {logoBlock}
          {hamburgerButton}
        </div>

        {/* Panel shows on ALL screen sizes for minimal */}
        {minimalPanel}
      </nav>
    );
  }

  // ── Default layout (glass / solid / transparent) ──

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${bgClass}`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo / Brand */}
        {logoBlock}

        {/* Desktop Links */}
        <div className="hidden items-center gap-8 md:flex">
          {navbar.links.map(linkItem)}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:block">{ctaButton}</div>

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
      {mobilePanel}
    </nav>
  );
}
