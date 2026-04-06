'use client';

import { useState } from 'react';
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
  const { brand, footer, social } = config;
  const [email, setEmail] = useState('');

  const activeSocials = Object.entries(social ?? {}).filter(
    ([key, value]) =>
      value && key !== 'website' && key !== 'tripadvisor' && socialIcons[key]
  );

  // Slightly darker bg
  const footerBg = brand.backgroundColor
    ? `color-mix(in srgb, ${brand.backgroundColor} 85%, black)`
    : '#111';

  return (
    <footer
      style={{ backgroundColor: footerBg, color: brand.textColor }}
    >
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

          {footer.showNewsletter && (
            <div className="w-full max-w-sm">
              {footer.newsletterHeadline && (
                <p className="mb-2 text-sm font-medium">
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
                  className="flex-1 rounded-full border bg-transparent px-4 py-2 text-sm outline-none"
                  style={{
                    borderColor: `color-mix(in srgb, ${brand.textColor} 20%, transparent)`,
                    color: brand.textColor,
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = brand.accentColor)
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = `color-mix(in srgb, ${brand.textColor} 20%, transparent)`)
                  }
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-full px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: brand.accentColor }}
                >
                  Subscribe
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Separator */}
        <div
          className="h-px w-full"
          style={{
            backgroundColor: `color-mix(in srgb, ${brand.accentColor} 20%, transparent)`,
          }}
        />

        {/* Middle: Columns */}
        {footer.columns && footer.columns.length > 0 && (
          <div className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
            {footer.columns.map((col, idx) => (
              <div key={idx}>
                <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">
                  {col.title}
                </h4>
                <ul className="space-y-2">
                  {col.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <a
                        href={link.href}
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
        )}

        {/* Social Icons */}
        {footer.showSocial && activeSocials.length > 0 && (
          <div className="flex justify-center gap-4 py-6">
            {activeSocials.map(([key, value]) => {
              const Icon = socialIcons[key];
              return (
                <a
                  key={key}
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${brand.accentColor} 15%, transparent)`,
                    color: brand.accentColor,
                  }}
                >
                  <Icon size={18} />
                </a>
              );
            })}
          </div>
        )}

        {/* Separator */}
        <div
          className="h-px w-full"
          style={{
            backgroundColor: `color-mix(in srgb, ${brand.accentColor} 20%, transparent)`,
          }}
        />

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-3 py-6 text-sm sm:flex-row" style={{ opacity: 0.6 }}>
          <p>{footer.copyrightText}</p>
          {footer.bottomText && <p>{footer.bottomText}</p>}
        </div>
      </div>
    </footer>
  );
}
