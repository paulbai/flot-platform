'use client';

import { useState, useContext } from 'react';
import {
  Camera,
  Globe,
  Hash,
  Music,
  Briefcase,
  Play,
  MessageCircle,
  type LucideIcon,
} from 'lucide-react';
import type { SiteConfig } from '@/lib/types/customization';
import { TemplateContext } from './SiteRenderer';
import { sanitizeHref } from '@/lib/sanitize';

const socialIcons: Record<string, LucideIcon> = {
  instagram: Camera,
  facebook: Globe,
  twitter: Hash,
  tiktok: Music,
  linkedin: Briefcase,
  youtube: Play,
  whatsapp: MessageCircle,
};

export default function SiteFooter({ config }: { config: SiteConfig }) {
  const { brand, footer, social, businessInfo } = config;
  const template = useContext(TemplateContext);
  const [email, setEmail] = useState('');

  const activeSocials = Object.entries(social ?? {}).filter(
    ([key, value]) =>
      value && key !== 'website' && key !== 'tripadvisor' && socialIcons[key]
  );

  const footerBg = brand.backgroundColor
    ? `color-mix(in srgb, ${brand.backgroundColor} 85%, black)`
    : '#111';

  const layout = template.footerLayout ?? 'standard';

  const borderColor = `color-mix(in srgb, ${brand.accentColor} 20%, transparent)`;
  const inputBorderColor = `color-mix(in srgb, ${brand.textColor} 20%, transparent)`;

  // ── Shared sub-components ──────────────────────────────────────────

  const renderSocialIcons = (size: number, iconBoxClass: string) =>
    footer.showSocial && activeSocials.length > 0 ? (
      <div className="flex flex-wrap justify-center gap-4">
        {activeSocials.map(([key, value]) => {
          const Icon = socialIcons[key];
          return (
            <a
              key={key}
              href={sanitizeHref(value)}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center rounded-full transition-opacity hover:opacity-80 ${iconBoxClass}`}
              style={{
                backgroundColor: `color-mix(in srgb, ${brand.accentColor} 15%, transparent)`,
                color: brand.accentColor,
              }}
            >
              <Icon size={size} />
            </a>
          );
        })}
      </div>
    ) : null;

  const renderNewsletter = (centered?: boolean, prominent?: boolean) =>
    footer.showNewsletter ? (
      <div className={`w-full ${prominent ? 'max-w-lg' : 'max-w-sm'} ${centered ? 'mx-auto text-center' : ''}`}>
        {footer.newsletterHeadline && (
          <p className={`mb-2 font-medium ${prominent ? 'text-base' : 'text-sm'}`}>
            {footer.newsletterHeadline}
          </p>
        )}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col sm:flex-row gap-2"
        >
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`flex-1 rounded-full border bg-transparent px-4 text-sm outline-none ${prominent ? 'py-3' : 'py-2'}`}
            style={{
              borderColor: inputBorderColor,
              color: brand.textColor,
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = brand.accentColor)
            }
            onBlur={(e) =>
              (e.target.style.borderColor = inputBorderColor)
            }
          />
          <button
            type="submit"
            className={`shrink-0 rounded-full font-semibold text-white transition-opacity hover:opacity-90 ${prominent ? 'px-6 py-3 text-base' : 'px-5 py-2 text-sm'}`}
            style={{ backgroundColor: brand.accentColor }}
          >
            Subscribe
          </button>
        </form>
      </div>
    ) : null;

  const renderColumns = (extraGap?: boolean) =>
    footer.columns && footer.columns.length > 0 ? (
      <div className={`grid ${extraGap ? 'gap-12' : 'gap-8'} py-12 sm:grid-cols-2 lg:grid-cols-4`}>
        {footer.columns.map((col, idx) => (
          <div key={idx}>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              {col.title}
            </h4>
            <ul className="space-y-2">
              {col.links.map((link, linkIdx) => (
                <li key={linkIdx}>
                  <a
                    href={sanitizeHref(link.href)}
                    className="text-sm opacity-60 transition-opacity hover:opacity-100"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    ) : null;

  const renderSeparator = () => (
    <div
      className="h-px w-full"
      style={{ backgroundColor: borderColor }}
    />
  );

  const renderBottomBar = () => (
    <div
      className="flex flex-col items-center justify-between gap-3 py-6 text-sm sm:flex-row"
      style={{ opacity: 0.6 }}
    >
      <p>{footer.copyrightText}</p>
      {footer.bottomText && <p>{footer.bottomText}</p>}
    </div>
  );

  // ── Layout: minimal ────────────────────────────────────────────────

  if (layout === 'minimal') {
    return (
      <footer className="site-section" style={{ backgroundColor: footerBg, color: brand.textColor }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
            <p className="text-sm" style={{ opacity: 0.6 }}>
              {footer.copyrightText}
            </p>
            {renderSocialIcons(16, 'h-8 w-8')}
          </div>
        </div>
      </footer>
    );
  }

  // ── Layout: centered ───────────────────────────────────────────────

  if (layout === 'centered') {
    return (
      <footer className="site-section" style={{ backgroundColor: footerBg, color: brand.textColor }}>
        <div className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
          {/* Brand centered */}
          <div className="flex flex-col items-center gap-2 pb-8 text-center">
            {brand.logoUrl && (
              <img
                src={brand.logoUrl}
                alt={brand.businessName}
                className="h-10 w-auto object-contain"
              />
            )}
            <h3
              className="text-xl font-bold"
              style={{ color: brand.accentColor, fontFamily: 'var(--heading-font)' }}
            >
              {brand.businessName}
            </h3>
            {brand.tagline && (
              <p className="text-sm opacity-60">{brand.tagline}</p>
            )}
          </div>

          {/* Newsletter centered */}
          <div className="pb-8">{renderNewsletter(true)}</div>

          {/* Social icons centered */}
          <div className="pb-8">{renderSocialIcons(18, 'h-10 w-10')}</div>

          {renderSeparator()}

          {/* Copyright centered */}
          <div className="py-6 text-center text-sm" style={{ opacity: 0.6 }}>
            <p>{footer.copyrightText}</p>
            {footer.bottomText && <p className="mt-1">{footer.bottomText}</p>}
          </div>
        </div>
      </footer>
    );
  }

  // ── Layout: mega ───────────────────────────────────────────────────

  if (layout === 'mega') {
    return (
      <footer className="site-section" style={{ backgroundColor: footerBg, color: brand.textColor }}>
        <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
          {/* Brand section — larger */}
          <div className="pb-12">
            <div className="flex items-center gap-3">
              {brand.logoUrl && (
                <img
                  src={brand.logoUrl}
                  alt={brand.businessName}
                  className="h-14 w-auto object-contain"
                />
              )}
              <h3
                className="text-2xl font-bold"
                style={{ color: brand.accentColor, fontFamily: 'var(--heading-font)' }}
              >
                {brand.businessName}
              </h3>
            </div>
            {brand.tagline && (
              <p className="mt-2 text-base opacity-70">{brand.tagline}</p>
            )}
            {businessInfo?.description && (
              <p className="mt-3 max-w-xl text-sm leading-relaxed opacity-60">
                {businessInfo.description}
              </p>
            )}
          </div>

          {renderSeparator()}

          {/* Columns with extra spacing */}
          {renderColumns(true)}

          {renderSeparator()}

          {/* Large social icons grid */}
          <div className="py-10">{renderSocialIcons(24, 'h-12 w-12')}</div>

          {renderSeparator()}

          {/* Prominent newsletter */}
          <div className="py-10">{renderNewsletter(true, true)}</div>

          {renderSeparator()}

          {/* Bottom bar + Flot credit */}
          <div className="py-6">
            <div
              className="flex flex-col items-center justify-between gap-3 text-sm sm:flex-row"
              style={{ opacity: 0.6 }}
            >
              <p>{footer.copyrightText}</p>
              {footer.bottomText && <p>{footer.bottomText}</p>}
            </div>
            <p className="mt-4 text-center text-xs opacity-40">
              Powered by Flot
            </p>
          </div>
        </div>
      </footer>
    );
  }

  // ── Layout: standard (default) ─────────────────────────────────────

  return (
    <footer className="site-section" style={{ backgroundColor: footerBg, color: brand.textColor }}>
      {/* Top: Brand + Newsletter */}
      <div className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 pb-12 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              {brand.logoUrl && (
                <img
                  src={brand.logoUrl}
                  alt={brand.businessName}
                  className="h-10 w-auto object-contain"
                />
              )}
              <h3
                className="text-xl font-bold"
                style={{ color: brand.accentColor, fontFamily: 'var(--heading-font)' }}
              >
                {brand.businessName}
              </h3>
            </div>
            {brand.tagline && (
              <p className="mt-1 text-sm opacity-60">{brand.tagline}</p>
            )}
          </div>

          {renderNewsletter()}
        </div>

        {renderSeparator()}

        {/* Middle: Columns */}
        {renderColumns()}

        {/* Social Icons */}
        <div className="py-6">{renderSocialIcons(18, 'h-10 w-10')}</div>

        {renderSeparator()}

        {/* Bottom Bar */}
        {renderBottomBar()}
      </div>
    </footer>
  );
}
