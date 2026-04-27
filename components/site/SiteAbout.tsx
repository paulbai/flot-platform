'use client';

import { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Heart,
  Leaf,
  Shield,
  Star,
  Gem,
  Coffee,
  Utensils,
  MapPin,
  Clock,
  Award,
  Zap,
  Target,
  Users,
  Globe,
  Smile,
  Sun,
  Moon,
  Flame,
  Music,
  Camera,
  Wifi,
  Phone,
  Mail,
  Home,
  BookOpen,
  Briefcase,
  TrendingUp,
  ThumbsUp,
  CheckCircle,
  type LucideIcon,
} from 'lucide-react';
import type { SiteConfig } from '@/lib/types/customization';
import { TemplateContext } from './SiteRenderer';
import {
  useTiltEffect,
  getSectionVariants,
  getItemDelay,
  getBorderRadius,
  getSectionPadding,
  getCardStyles,
} from '@/lib/templates/animations';
import { resolveBrand } from '@/lib/brand-helpers';

const iconMap: Record<string, LucideIcon> = {
  Sparkles,
  Heart,
  Leaf,
  Shield,
  Star,
  Gem,
  Coffee,
  Utensils,
  MapPin,
  Clock,
  Award,
  Zap,
  Target,
  Users,
  Globe,
  Smile,
  Sun,
  Moon,
  Flame,
  Music,
  Camera,
  Wifi,
  Phone,
  Mail,
  Home,
  BookOpen,
  Briefcase,
  TrendingUp,
  ThumbsUp,
  CheckCircle,
};

function resolveIcon(name: string): LucideIcon {
  return iconMap[name] || Sparkles;
}

/* ── TiltCard wrapper ── */

function TiltCard({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { ref, onMouseMove, onMouseLeave, style: tiltStyle } = useTiltEffect(50);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  if (isTouch) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={className}
      style={{ ...style, ...tiltStyle }}
    >
      {children}
    </div>
  );
}

/* ── FlipCard wrapper ── */

function FlipCard({
  front,
  back,
  className,
  style,
}: {
  front: React.ReactNode;
  back: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`group ${className ?? ''}`} style={{ perspective: '800px', ...style }}>
      <div
        className="relative h-full w-full transition-transform duration-500"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-6 group-hover:[transform:rotateY(180deg)] transition-transform duration-500"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {front}
        </div>
        {/* Back */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-6 [transform:rotateY(180deg)] group-hover:[transform:rotateY(0deg)] transition-transform duration-500"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {back}
        </div>
      </div>
    </div>
  );
}

/* ── Main component ── */

export default function SiteAbout({ config }: { config: SiteConfig }) {
  const { brand, about } = config;
  const rb = resolveBrand(brand);
  const template = useContext(TemplateContext);

  if (!about.enabled) return null;

  const layout = template.aboutLayout;
  const sectionVariants = getSectionVariants(template.animationPreset);
  const borderRadius = getBorderRadius(template.sectionStyles.borderRadius);
  const sectionPadding = getSectionPadding(template.sectionStyles.sectionSpacing);
  const cardStyle = getCardStyles(
    template.sectionStyles.cardStyle,
    brand.accentColor,
    brand.backgroundColor,
  );
  const cardEffect = template.threeDEffects.cards;

  /* Helper: wrap a card node with 3D effect */
  function wrapCard(
    node: React.ReactNode,
    idx: number,
    extraClass?: string,
    extraStyle?: React.CSSProperties,
  ) {
    const cls = `site-card ${borderRadius} ${extraClass ?? ''}`;
    const sty = { ...cardStyle, ...extraStyle };

    if (cardEffect === 'tilt-cards') {
      return (
        <TiltCard key={idx} className={cls} style={sty}>
          {node}
        </TiltCard>
      );
    }

    if (cardEffect === 'float') {
      return (
        <div key={idx} className={`${cls} animate-float`} style={sty}>
          {node}
        </div>
      );
    }

    // default / none
    return (
      <div key={idx} className={cls} style={sty}>
        {node}
      </div>
    );
  }

  /* ── Shared header ── */
  const headerBlock = (
    <motion.div
      className="mx-auto mb-16 max-w-3xl text-center"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
    >
      {about.title && (
        <h2
          className="text-3xl font-bold tracking-tight sm:text-4xl"
          style={{ fontFamily: 'var(--heading-font)' }}
        >
          {about.title}
        </h2>
      )}
      {about.description && (
        <p className="mt-4 text-base leading-relaxed sm:text-lg" style={{ opacity: 0.8 }}>
          {about.description}
        </p>
      )}
    </motion.div>
  );

  /* ── STANDARD layout ── */
  if (layout === 'standard') {
    return (
      <section
        id="about"
        className={`site-section ${sectionPadding}`}
        style={{ backgroundColor: brand.backgroundColor, color: brand.textColor }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {headerBlock}

          {/* Content: Image + Mission */}
          {(about.image || about.mission) && (
            <div className="mb-16 grid items-center gap-12 lg:grid-cols-2">
              {about.image && (
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6 }}
                  className={`overflow-hidden ${borderRadius}`}
                >
                  <img loading="lazy" decoding="async"
                    src={about.image}
                    alt={about.title}
                    className="h-auto w-full object-cover"
                  />
                </motion.div>
              )}
              {about.mission && (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                >
                  <p
                    className="text-lg leading-relaxed sm:text-xl"
                    style={{ opacity: 0.85 }}
                  >
                    {about.mission}
                  </p>
                </motion.div>
              )}
            </div>
          )}

          {/* Features Grid */}
          {about.features && about.features.length > 0 && (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {about.features.map((feature, idx) => {
                const Icon = resolveIcon(feature.icon);

                if (cardEffect === 'flip-reveal') {
                  return (
                    <motion.div
                      key={idx}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, margin: '-80px' }}
                      variants={sectionVariants}
                      transition={{ delay: getItemDelay(template.animationPreset, idx) }}
                      className="min-h-[180px]"
                    >
                      <FlipCard
                        className={`site-card ${borderRadius} border min-h-[180px]`}
                        style={{ ...cardStyle, borderColor: rb.borderColor }}
                        front={
                          <>
                            <div
                              className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                              style={{
                                backgroundColor: `color-mix(in srgb, ${brand.accentColor} 15%, transparent)`,
                              }}
                            >
                              <Icon size={24} style={{ color: brand.accentColor }} />
                            </div>
                            <h3
                              className="text-base font-semibold"
                              style={{ fontFamily: 'var(--heading-font)' }}
                            >
                              {feature.title}
                            </h3>
                          </>
                        }
                        back={
                          <p
                            className="text-sm leading-relaxed sm:text-base text-center"
                            style={{ opacity: 0.75 }}
                          >
                            {feature.description}
                          </p>
                        }
                      />
                    </motion.div>
                  );
                }

                const cardContent = (
                  <>
                    <div
                      className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${brand.accentColor} 15%, transparent)`,
                      }}
                    >
                      <Icon size={24} style={{ color: brand.accentColor }} />
                    </div>
                    <h3
                      className="mb-2 text-base font-semibold"
                      style={{ fontFamily: 'var(--heading-font)' }}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed sm:text-base"
                      style={{ opacity: 0.75 }}
                    >
                      {feature.description}
                    </p>
                  </>
                );

                return (
                  <motion.div
                    key={idx}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-80px' }}
                    variants={sectionVariants}
                    transition={{ delay: getItemDelay(template.animationPreset, idx) }}
                  >
                    {wrapCard(
                      cardContent,
                      idx,
                      'border p-6 transition-shadow hover:shadow-lg',
                    { borderColor: rb.borderColor },
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    );
  }

  /* ── TIMELINE layout ── */
  if (layout === 'timeline') {
    return (
      <section
        id="about"
        className={`site-section ${sectionPadding}`}
        style={{ backgroundColor: brand.backgroundColor, color: brand.textColor }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {headerBlock}

          {about.features && about.features.length > 0 && (
            <div className="relative">
              {/* Center vertical line */}
              <div
                className="absolute left-4 top-0 h-full w-0.5 md:left-1/2 md:-translate-x-px"
                style={{
                  backgroundColor: `color-mix(in srgb, ${brand.accentColor} 30%, transparent)`,
                }}
              />

              <div className="space-y-12">
                {about.features.map((feature, idx) => {
                  const Icon = resolveIcon(feature.icon);
                  const isLeft = idx % 2 === 0;

                  const cardContent = (
                    <>
                      <div
                        className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${brand.accentColor} 15%, transparent)`,
                        }}
                      >
                        <Icon size={20} style={{ color: brand.accentColor }} />
                      </div>
                      <h3
                        className="mb-2 text-lg font-semibold"
                        style={{ fontFamily: 'var(--heading-font)' }}
                      >
                        {feature.title}
                      </h3>
                      <p
                        className="text-sm leading-relaxed sm:text-base"
                        style={{ opacity: 0.75 }}
                      >
                        {feature.description}
                      </p>
                    </>
                  );

                  return (
                    <motion.div
                      key={idx}
                      className={`relative pl-12 md:pl-0 md:flex ${
                        isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                      }`}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, margin: '-80px' }}
                      variants={sectionVariants}
                      transition={{ delay: getItemDelay(template.animationPreset, idx) }}
                    >
                      {/* Dot on line */}
                      <div
                        className="absolute left-2.5 top-2 h-3 w-3 rounded-full md:left-1/2 md:-translate-x-1/2"
                        style={{ backgroundColor: brand.accentColor }}
                      />

                      {/* Spacer for the other side */}
                      <div className="hidden md:block md:w-1/2" />

                      {/* Card */}
                      <div className={`md:w-1/2 ${isLeft ? 'md:pr-12' : 'md:pl-12'}`}>
                        {wrapCard(
                          cardContent,
                          idx,
                          'border p-6 transition-shadow hover:shadow-lg',
                    { borderColor: rb.borderColor },
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  /* ── CARDS-ONLY layout ── */
  if (layout === 'cards-only') {
    return (
      <section
        id="about"
        className={`site-section ${sectionPadding}`}
        style={{ backgroundColor: brand.backgroundColor, color: brand.textColor }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {headerBlock}

          {about.features && about.features.length > 0 && (
            <div className="grid gap-8 sm:grid-cols-2">
              {about.features.map((feature, idx) => {
                const Icon = resolveIcon(feature.icon);

                if (cardEffect === 'flip-reveal') {
                  return (
                    <motion.div
                      key={idx}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, margin: '-80px' }}
                      variants={sectionVariants}
                      transition={{ delay: getItemDelay(template.animationPreset, idx) }}
                      className="min-h-[220px]"
                    >
                      <FlipCard
                        className={`site-card ${borderRadius} border min-h-[220px]`}
                        style={{ ...cardStyle, borderColor: rb.borderColor }}
                        front={
                          <>
                            <div
                              className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl"
                              style={{
                                backgroundColor: `color-mix(in srgb, ${brand.accentColor} 15%, transparent)`,
                              }}
                            >
                              <Icon size={32} style={{ color: brand.accentColor }} />
                            </div>
                            <h3
                              className="text-lg font-semibold"
                              style={{ fontFamily: 'var(--heading-font)' }}
                            >
                              {feature.title}
                            </h3>
                          </>
                        }
                        back={
                          <p
                            className="text-sm leading-relaxed sm:text-base text-center"
                            style={{ opacity: 0.75 }}
                          >
                            {feature.description}
                          </p>
                        }
                      />
                    </motion.div>
                  );
                }

                const cardContent = (
                  <>
                    <div
                      className="mb-5 flex h-16 w-16 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${brand.accentColor} 15%, transparent)`,
                      }}
                    >
                      <Icon size={32} style={{ color: brand.accentColor }} />
                    </div>
                    <h3
                      className="mb-3 text-lg font-semibold"
                      style={{ fontFamily: 'var(--heading-font)' }}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed sm:text-base"
                      style={{ opacity: 0.75 }}
                    >
                      {feature.description}
                    </p>
                  </>
                );

                return (
                  <motion.div
                    key={idx}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-80px' }}
                    variants={sectionVariants}
                    transition={{ delay: getItemDelay(template.animationPreset, idx) }}
                  >
                    {wrapCard(
                      cardContent,
                      idx,
                      'border p-8 transition-shadow hover:shadow-lg',
                    { borderColor: rb.borderColor },
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    );
  }

  /* ── FULL-WIDTH-IMAGE layout ── */
  if (layout === 'full-width-image') {
    return (
      <section
        id="about"
        className={`site-section ${sectionPadding}`}
        style={{ backgroundColor: brand.backgroundColor, color: brand.textColor }}
      >
        {/* Full-width image with text overlay */}
        {about.image && (
          <motion.div
            className="relative mb-16 overflow-hidden"
            style={{ minHeight: '420px' }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={sectionVariants}
          >
            <img loading="lazy" decoding="async"
              src={about.image}
              alt={about.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to top, ${brand.backgroundColor}, transparent 30%, transparent 70%, ${brand.backgroundColor})`,
              }}
            />
            <div
              className="absolute inset-0"
              style={{ backgroundColor: `color-mix(in srgb, ${brand.backgroundColor} 55%, transparent)` }}
            />
            {/* Text overlay */}
            <div className="relative z-10 mx-auto flex min-h-[420px] max-w-4xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
              {about.title && (
                <h2
                  className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                  style={{ fontFamily: 'var(--heading-font)' }}
                >
                  {about.title}
                </h2>
              )}
              {about.description && (
                <p className="mt-4 text-base leading-relaxed sm:text-lg" style={{ opacity: 0.85 }}>
                  {about.description}
                </p>
              )}
              {about.mission && (
                <p className="mt-6 text-lg leading-relaxed sm:text-xl" style={{ opacity: 0.9 }}>
                  {about.mission}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* If no image, render header normally */}
        {!about.image && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {headerBlock}
            {about.mission && (
              <motion.p
                className="mx-auto mb-16 max-w-3xl text-center text-lg leading-relaxed sm:text-xl"
                style={{ opacity: 0.85 }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={sectionVariants}
              >
                {about.mission}
              </motion.p>
            )}
          </div>
        )}

        {/* Features Grid below image */}
        {about.features && about.features.length > 0 && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {about.features.map((feature, idx) => {
                const Icon = resolveIcon(feature.icon);

                if (cardEffect === 'flip-reveal') {
                  return (
                    <motion.div
                      key={idx}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, margin: '-80px' }}
                      variants={sectionVariants}
                      transition={{ delay: getItemDelay(template.animationPreset, idx) }}
                      className="min-h-[180px]"
                    >
                      <FlipCard
                        className={`site-card ${borderRadius} border min-h-[180px]`}
                        style={{ ...cardStyle, borderColor: rb.borderColor }}
                        front={
                          <>
                            <div
                              className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                              style={{
                                backgroundColor: `color-mix(in srgb, ${brand.accentColor} 15%, transparent)`,
                              }}
                            >
                              <Icon size={24} style={{ color: brand.accentColor }} />
                            </div>
                            <h3
                              className="text-base font-semibold"
                              style={{ fontFamily: 'var(--heading-font)' }}
                            >
                              {feature.title}
                            </h3>
                          </>
                        }
                        back={
                          <p
                            className="text-sm leading-relaxed sm:text-base text-center"
                            style={{ opacity: 0.75 }}
                          >
                            {feature.description}
                          </p>
                        }
                      />
                    </motion.div>
                  );
                }

                const cardContent = (
                  <>
                    <div
                      className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${brand.accentColor} 15%, transparent)`,
                      }}
                    >
                      <Icon size={24} style={{ color: brand.accentColor }} />
                    </div>
                    <h3
                      className="mb-2 text-base font-semibold"
                      style={{ fontFamily: 'var(--heading-font)' }}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed sm:text-base"
                      style={{ opacity: 0.75 }}
                    >
                      {feature.description}
                    </p>
                  </>
                );

                return (
                  <motion.div
                    key={idx}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-80px' }}
                    variants={sectionVariants}
                    transition={{ delay: getItemDelay(template.animationPreset, idx) }}
                  >
                    {wrapCard(
                      cardContent,
                      idx,
                      'border p-6 transition-shadow hover:shadow-lg',
                    { borderColor: rb.borderColor },
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    );
  }

  /* ── ZIGZAG layout ── */
  if (layout === 'zigzag') {
    return (
      <section
        id="about"
        className={`site-section ${sectionPadding}`}
        style={{ backgroundColor: brand.backgroundColor, color: brand.textColor }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {headerBlock}

          {about.features && about.features.length > 0 && (
            <div className="space-y-16">
              {about.features.map((feature, idx) => {
                const Icon = resolveIcon(feature.icon);
                const isEven = idx % 2 === 0;

                return (
                  <motion.div
                    key={idx}
                    className={`flex flex-col items-center gap-8 lg:flex-row ${
                      isEven ? '' : 'lg:flex-row-reverse'
                    }`}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-80px' }}
                    variants={sectionVariants}
                    transition={{ delay: getItemDelay(template.animationPreset, idx) }}
                  >
                    {/* Text side */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
                          style={{
                            backgroundColor: `color-mix(in srgb, ${brand.accentColor} 15%, transparent)`,
                          }}
                        >
                          <Icon size={28} style={{ color: brand.accentColor }} />
                        </div>
                        <h3
                          className="text-xl font-semibold sm:text-2xl"
                          style={{ fontFamily: 'var(--heading-font)' }}
                        >
                          {feature.title}
                        </h3>
                      </div>
                      <p
                        className="text-base leading-relaxed sm:text-lg"
                        style={{ opacity: 0.8 }}
                      >
                        {feature.description}
                      </p>
                    </div>

                    {/* Decorative accent */}
                    <div className="flex flex-1 items-center justify-center">
                      <div
                        className={`${borderRadius} h-32 w-full max-w-xs lg:h-40`}
                        style={{
                          background: `linear-gradient(135deg, color-mix(in srgb, ${brand.accentColor} 20%, transparent), color-mix(in srgb, ${brand.accentColor} 5%, transparent))`,
                          border: `1px solid color-mix(in srgb, ${brand.accentColor} 15%, transparent)`,
                        }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    );
  }

  /* ── Fallback (should not happen) — render standard ── */
  return null;
}
