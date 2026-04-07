'use client';

import { useContext, useRef } from 'react';
import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion';
import type { SiteConfig } from '@/lib/types/customization';
import { TemplateContext } from './SiteRenderer';
import { getBorderRadius } from '@/lib/templates/animations';
import { sanitizeHref } from '@/lib/sanitize';

export default function SiteHero({ config }: { config: SiteConfig }) {
  const { brand, hero } = config;
  const template = useContext(TemplateContext);

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Parallax / depth transforms (used by parallax & depth-scroll layouts)
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const depthZ = useTransform(scrollYProgress, [0, 1], [0, -80]);

  const borderRadius = getBorderRadius(template.sectionStyles.borderRadius);
  const heroEffect = template.threeDEffects.hero;
  const floatClass = heroEffect === 'float' ? 'animate-float' : '';

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

  const textColor = hero.backgroundImage ? '#ffffff' : brand.textColor;

  // ── Shared sub-components ──────────────────────────────────────────

  const Logo = () =>
    brand.logoUrl ? (
      <motion.img
        src={brand.logoUrl}
        alt={brand.businessName}
        className="mb-6 h-16 w-auto object-contain"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      />
    ) : null;

  const Subline = ({ color }: { color?: string }) =>
    hero.subline ? (
      <motion.p
        className="mb-4 text-sm font-semibold uppercase tracking-widest"
        style={{ color: color ?? brand.accentColor }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {hero.subline}
      </motion.p>
    ) : null;

  const Headline = ({
    color,
    className: extra,
  }: {
    color?: string;
    className?: string;
  }) =>
    hero.headline ? (
      <motion.h1
        className={`max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl ${extra ?? ''}`}
        style={{
          color: color ?? textColor,
          fontFamily: 'var(--heading-font)',
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        {hero.headline}
      </motion.h1>
    ) : null;

  const Description = ({ color }: { color?: string }) =>
    hero.description ? (
      <motion.p
        className="mt-6 max-w-2xl text-base leading-relaxed opacity-80 sm:text-lg"
        style={{ color: color ?? textColor }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
      >
        {hero.description}
      </motion.p>
    ) : null;

  const CTAs = ({ textColorOverride }: { textColorOverride?: string }) => (
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
              window.location.href = sanitizeHref(hero.ctaLink);
            }
          }}
          className={`inline-flex items-center rounded-full px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 ${floatClass}`}
          style={{ backgroundColor: brand.accentColor }}
        >
          {hero.ctaText}
        </button>
      )}
      {hero.secondaryCtaText && (
        <a
          href={sanitizeHref(hero.secondaryCtaLink) || '#about'}
          className={`inline-flex items-center rounded-full border-2 px-8 py-3.5 text-sm font-semibold transition-transform hover:scale-105 ${floatClass}`}
          style={{
            borderColor: brand.accentColor,
            color: textColorOverride ?? textColor,
          }}
        >
          {hero.secondaryCtaText}
        </a>
      )}
    </motion.div>
  );

  const BgImage = ({ className: extra }: { className?: string }) =>
    hero.backgroundImage ? (
      <div className={`absolute inset-0 ${extra ?? ''}`}>
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
    ) : null;

  // Depth-scroll: reactive translateZ via motion values
  const depthTransform = useMotionTemplate`translateZ(${depthZ}px)`;
  const isDepthScroll = heroEffect === 'depth-scroll';

  // ── Layout renderers ───────────────────────────────────────────────

  const layout = template.heroLayout;

  // ── SPLIT ──────────────────────────────────────────────────────────
  if (layout === 'split') {
    return (
      <motion.section
        ref={sectionRef}
        id="hero"
        className="site-hero relative flex min-h-screen items-center"
        style={isDepthScroll ? { transform: depthTransform, perspective: 1000 } : undefined}
      >
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 py-32 sm:px-6 md:grid-cols-2 lg:px-8">
          {/* Text column */}
          <div className={`flex flex-col justify-center ${alignClass}`}>
            <Logo />
            <Subline />
            <Headline color={brand.textColor} />
            <Description color={brand.textColor} />
            <CTAs textColorOverride={brand.textColor} />
          </div>

          {/* Image column */}
          {hero.backgroundImage && (
            <motion.div
              className={`order-first overflow-hidden md:order-last ${borderRadius}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <img
                src={hero.backgroundImage}
                alt=""
                className="h-full w-full object-cover"
              />
            </motion.div>
          )}
        </div>
      </motion.section>
    );
  }

  // ── PARALLAX ───────────────────────────────────────────────────────
  if (layout === 'parallax') {
    return (
      <motion.section
        ref={sectionRef}
        id="hero"
        className="site-hero relative flex min-h-screen items-center overflow-hidden"
      >
        {/* Parallax background */}
        {hero.backgroundImage && (
          <motion.div className="absolute inset-0" style={{ y: bgY }}>
            <img
              src={hero.backgroundImage}
              alt=""
              className="h-[150%] w-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: `rgba(0,0,0,${(hero.overlayOpacity ?? 50) / 100})`,
              }}
            />
          </motion.div>
        )}

        {/* Fixed text */}
        <div
          className={`relative z-10 mx-auto flex w-full max-w-7xl flex-col px-4 py-32 sm:px-6 lg:px-8 ${alignClass} ${justifyClass}`}
        >
          <Logo />
          <Subline />
          <Headline />
          <Description />
          <CTAs />
        </div>
      </motion.section>
    );
  }

  // ── MINIMAL ────────────────────────────────────────────────────────
  if (layout === 'minimal') {
    return (
      <motion.section
        ref={sectionRef}
        id="hero"
        className="site-hero relative flex min-h-screen items-center"
        style={{
          backgroundColor: brand.backgroundColor,
          ...(isDepthScroll ? { transform: depthTransform, perspective: 1000 } : {}),
        }}
      >
        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-4 py-32 text-center sm:px-6 lg:px-8">
          <Logo />
          <Subline />
          <Headline color={brand.accentColor} className="max-w-5xl" />
          <Description color={brand.textColor} />
          <CTAs textColorOverride={brand.textColor} />
        </div>
      </motion.section>
    );
  }

  // ── FULLSCREEN-CARD ────────────────────────────────────────────────
  if (layout === 'fullscreen-card') {
    return (
      <motion.section
        ref={sectionRef}
        id="hero"
        className="site-hero relative flex min-h-screen items-center justify-center"
        style={isDepthScroll ? { transform: depthTransform, perspective: 1000 } : undefined}
      >
        <BgImage />

        <motion.div
          className={`relative z-10 mx-4 max-w-2xl bg-white/20 p-10 backdrop-blur-xl sm:mx-6 sm:p-14 ${borderRadius}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex flex-col items-center text-center">
            <Logo />
            <Subline />
            <Headline />
            <Description />
            <CTAs />
          </div>
        </motion.div>
      </motion.section>
    );
  }

  // ── DIAGONAL ───────────────────────────────────────────────────────
  if (layout === 'diagonal') {
    return (
      <motion.section
        ref={sectionRef}
        id="hero"
        className="site-hero relative flex min-h-screen flex-col"
        style={isDepthScroll ? { transform: depthTransform, perspective: 1000 } : undefined}
      >
        {/* Top portion with diagonal clip */}
        {hero.backgroundImage && (
          <div
            className="relative h-[60vh] w-full"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0 100%)',
            }}
          >
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

        {/* Text below diagonal */}
        <div
          className={`mx-auto flex w-full max-w-7xl flex-col px-4 py-16 sm:px-6 lg:px-8 ${alignClass}`}
        >
          <Logo />
          <Subline />
          <Headline color={brand.textColor} />
          <Description color={brand.textColor} />
          <CTAs textColorOverride={brand.textColor} />
        </div>
      </motion.section>
    );
  }

  // ── STACKED ────────────────────────────────────────────────────────
  if (layout === 'stacked') {
    return (
      <motion.section
        ref={sectionRef}
        id="hero"
        className="site-hero relative flex min-h-screen flex-col"
        style={isDepthScroll ? { transform: depthTransform, perspective: 1000 } : undefined}
      >
        {/* Text first */}
        <div
          className={`mx-auto flex w-full max-w-7xl flex-col px-4 pb-10 pt-32 sm:px-6 lg:px-8 ${alignClass}`}
        >
          <Logo />
          <Subline />
          <Headline color={brand.textColor} />
          <Description color={brand.textColor} />
          <CTAs textColorOverride={brand.textColor} />
        </div>

        {/* Full-width image below */}
        {hero.backgroundImage && (
          <motion.div
            className={`mx-auto w-full max-w-7xl overflow-hidden px-4 pb-20 sm:px-6 lg:px-8`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <img
              src={hero.backgroundImage}
              alt=""
              className={`h-auto w-full object-cover ${borderRadius}`}
            />
          </motion.div>
        )}
      </motion.section>
    );
  }

  // ── MOSAIC ─────────────────────────────────────────────────────────
  if (layout === 'mosaic') {
    const mosaicImages = (config.gallery?.images ?? []).slice(0, 4);

    return (
      <motion.section
        ref={sectionRef}
        id="hero"
        className="site-hero relative flex min-h-screen items-center"
        style={isDepthScroll ? { transform: depthTransform, perspective: 1000 } : undefined}
      >
        {/* 2x2 image grid behind text */}
        {mosaicImages.length > 0 && (
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
            {mosaicImages.map((img, i) => (
              <motion.div
                key={i}
                className="relative overflow-hidden"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: i * 0.15 }}
              >
                <img
                  src={img.url}
                  alt={img.caption ?? ''}
                  className="h-full w-full object-cover"
                />
              </motion.div>
            ))}
            {/* Overlay for readability */}
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: `rgba(0,0,0,${(hero.overlayOpacity ?? 60) / 100})`,
              }}
            />
          </div>
        )}

        <div
          className={`relative z-10 mx-auto flex w-full max-w-7xl flex-col px-4 py-32 sm:px-6 lg:px-8 ${alignClass} ${justifyClass}`}
        >
          <Logo />
          <Subline />
          <Headline />
          <Description />
          <CTAs />
        </div>
      </motion.section>
    );
  }

  // ── VIDEO-BG ───────────────────────────────────────────────────────
  if (layout === 'video-bg') {
    return (
      <motion.section
        ref={sectionRef}
        id="hero"
        className="site-hero relative flex min-h-screen items-center"
        style={isDepthScroll ? { transform: depthTransform, perspective: 1000 } : undefined}
      >
        {hero.backgroundImage && (
          <div className="absolute inset-0">
            <img
              src={hero.backgroundImage}
              alt=""
              className="h-full w-full object-cover"
              style={{ objectFit: 'cover', objectPosition: 'center' }}
            />
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: `rgba(0,0,0,${(hero.overlayOpacity ?? 50) / 100})`,
              }}
            />
          </div>
        )}

        <div
          className={`relative z-10 mx-auto flex w-full max-w-7xl flex-col px-4 py-32 sm:px-6 lg:px-8 ${alignClass} ${justifyClass}`}
        >
          <Logo />
          <Subline />
          <Headline />
          <Description />
          <CTAs />
        </div>
      </motion.section>
    );
  }

  // ── BOLD-TYPE ──────────────────────────────────────────────────────
  if (layout === 'bold-type') {
    return (
      <motion.section
        ref={sectionRef}
        id="hero"
        className="site-hero relative flex min-h-screen items-center"
        style={isDepthScroll ? { transform: depthTransform, perspective: 1000 } : undefined}
      >
        {/* Background with heavy overlay */}
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
                backgroundColor: `rgba(0,0,0,${Math.max((hero.overlayOpacity ?? 50) / 100, 0.65)})`,
              }}
            />
          </div>
        )}

        <div
          className={`relative z-10 mx-auto flex w-full max-w-7xl flex-col px-4 py-40 sm:px-6 lg:px-8 ${alignClass} ${justifyClass}`}
        >
          <Logo />
          {/* Oversized headline */}
          {hero.headline && (
            <motion.h1
              className="max-w-5xl text-7xl font-black leading-[0.9] tracking-tighter sm:text-8xl md:text-9xl"
              style={{
                color: '#ffffff',
                fontFamily: 'var(--heading-font)',
              }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
            >
              {hero.headline}
            </motion.h1>
          )}
          {/* Minimal description, no subline */}
          {hero.description && (
            <motion.p
              className="mt-10 max-w-xl text-lg leading-relaxed opacity-70"
              style={{ color: '#ffffff' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {hero.description}
            </motion.p>
          )}
          <CTAs />
        </div>
      </motion.section>
    );
  }

  // ── CLASSIC (default) ──────────────────────────────────────────────
  return (
    <motion.section
      ref={sectionRef}
      id="hero"
      className="site-hero relative flex min-h-screen items-center"
      style={isDepthScroll ? { transform: depthTransform, perspective: 1000 } : undefined}
    >
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
        <Logo />
        <Subline />
        <Headline />
        <Description />
        <CTAs />
      </div>
    </motion.section>
  );
}
