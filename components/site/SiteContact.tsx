'use client';

import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Camera,
  Globe,
  Hash,
  Briefcase,
  Play,
  MessageCircle,
  type LucideIcon,
} from 'lucide-react';
import type { SiteConfig } from '@/lib/types/customization';
import { TemplateContext } from './SiteRenderer';
import {
  getSectionPadding,
  getBorderRadius,
  getCardStyles,
  getSectionVariants,
} from '@/lib/templates/animations';

const socialIcons: Record<string, LucideIcon> = {
  instagram: Camera,
  facebook: Globe,
  twitter: Hash,
  linkedin: Briefcase,
  youtube: Play,
  whatsapp: MessageCircle,
};

export default function SiteContact({ config }: { config: SiteConfig }) {
  const { brand, contact, businessInfo, social } = config;
  const [formData, setFormData] = useState<Record<string, string>>({});
  const template = useContext(TemplateContext);

  if (!contact.enabled) return null;

  const layout = template.contactLayout ?? 'split';
  const sectionPadding = getSectionPadding(template.sectionStyles.sectionSpacing);
  const borderRadius = getBorderRadius(template.sectionStyles.borderRadius);
  const cardStyle = getCardStyles(
    template.sectionStyles.cardStyle,
    brand.accentColor,
    brand.backgroundColor
  );
  const sectionVariants = getSectionVariants(template.animationPreset);

  const hasBusinessInfo =
    businessInfo.address ||
    businessInfo.phone ||
    businessInfo.email ||
    businessInfo.hours;

  const activeSocials = Object.entries(social).filter(
    ([key, value]) => value && key !== 'website' && key !== 'tripadvisor'
  );

  const fieldLabels: Record<string, string> = {
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    message: 'Message',
    subject: 'Subject',
    company: 'Company',
    date: 'Preferred Date',
    guests: 'Number of Guests',
    budget: 'Budget',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission would be handled by the platform
  };

  // Extract map src URL
  const mapSrc = (() => {
    if (!contact.showMap || !contact.mapEmbed) return null;
    let src = contact.mapEmbed.trim();
    const srcMatch = src.match(/src=["']([^"']+)["']/);
    if (srcMatch) src = srcMatch[1];
    return src;
  })();

  const hasMap = !!mapSrc;

  // Determine effective layout (map-focus falls back to split if no map)
  const effectiveLayout = layout === 'map-focus' && !hasMap ? 'split' : layout;

  // ── Shared sub-components ──

  const renderHeader = () => (
    <motion.div
      className="mx-auto mb-16 max-w-3xl text-center"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
    >
      {contact.title && (
        <h2
          className="text-3xl font-bold tracking-tight sm:text-4xl"
          style={{ fontFamily: 'var(--heading-font)' }}
        >
          {contact.title}
        </h2>
      )}
      {contact.subtitle && (
        <p className="mt-4 text-base leading-relaxed opacity-70 sm:text-lg">
          {contact.subtitle}
        </p>
      )}
    </motion.div>
  );

  const renderBusinessInfoFull = () => {
    if (!hasBusinessInfo) return null;
    return (
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="space-y-6"
      >
        {businessInfo.address && (
          <div className="flex items-start gap-4">
            <MapPin
              size={20}
              className="mt-0.5 shrink-0"
              style={{ color: brand.accentColor }}
            />
            <div>
              <p className="text-sm font-semibold">Address</p>
              <p className="text-sm opacity-70">
                {businessInfo.address}
                {businessInfo.city && `, ${businessInfo.city}`}
                {businessInfo.postalCode && ` ${businessInfo.postalCode}`}
                {businessInfo.country && `, ${businessInfo.country}`}
              </p>
            </div>
          </div>
        )}

        {businessInfo.phone && (
          <div className="flex items-start gap-4">
            <Phone
              size={20}
              className="mt-0.5 shrink-0"
              style={{ color: brand.accentColor }}
            />
            <div>
              <p className="text-sm font-semibold">Phone</p>
              <a
                href={`tel:${businessInfo.phone}`}
                className="text-sm opacity-70 hover:opacity-100"
              >
                {businessInfo.phone}
              </a>
            </div>
          </div>
        )}

        {businessInfo.email && (
          <div className="flex items-start gap-4">
            <Mail
              size={20}
              className="mt-0.5 shrink-0"
              style={{ color: brand.accentColor }}
            />
            <div>
              <p className="text-sm font-semibold">Email</p>
              <a
                href={`mailto:${businessInfo.email}`}
                className="text-sm opacity-70 hover:opacity-100"
              >
                {businessInfo.email}
              </a>
            </div>
          </div>
        )}

        {businessInfo.hours && (
          <div className="flex items-start gap-4">
            <Clock
              size={20}
              className="mt-0.5 shrink-0"
              style={{ color: brand.accentColor }}
            />
            <div>
              <p className="text-sm font-semibold">Hours</p>
              <p className="text-sm opacity-70">{businessInfo.hours}</p>
            </div>
          </div>
        )}

        {renderSocialLinks()}

        {renderMap()}
      </motion.div>
    );
  };

  const renderBusinessInfoCompact = () => {
    const items: { icon: LucideIcon; text: string; href?: string }[] = [];
    if (businessInfo.address) {
      const fullAddress = [
        businessInfo.address,
        businessInfo.city,
        businessInfo.postalCode,
        businessInfo.country,
      ]
        .filter(Boolean)
        .join(', ');
      items.push({ icon: MapPin, text: fullAddress });
    }
    if (businessInfo.phone) {
      items.push({ icon: Phone, text: businessInfo.phone, href: `tel:${businessInfo.phone}` });
    }
    if (businessInfo.email) {
      items.push({ icon: Mail, text: businessInfo.email, href: `mailto:${businessInfo.email}` });
    }
    if (businessInfo.hours) {
      items.push({ icon: Clock, text: businessInfo.hours });
    }

    if (items.length === 0 && activeSocials.length === 0) return null;

    return (
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="flex flex-wrap items-center justify-center gap-4 sm:gap-6"
      >
        {items.map(({ icon: Icon, text, href }, i) => {
          const content = (
            <span className="flex items-center gap-2 text-sm opacity-70 hover:opacity-100 transition-opacity">
              <Icon size={16} style={{ color: brand.accentColor }} className="shrink-0" />
              <span className="truncate max-w-[200px]">{text}</span>
            </span>
          );
          return href ? (
            <a key={i} href={href}>
              {content}
            </a>
          ) : (
            <span key={i}>{content}</span>
          );
        })}
        {activeSocials.length > 0 && (
          <span className="flex items-center gap-2">
            {activeSocials.map(([key, value]) => {
              const Icon = socialIcons[key];
              if (!Icon) return null;
              return (
                <a
                  key={key}
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${brand.accentColor} 15%, transparent)`,
                    color: brand.accentColor,
                  }}
                >
                  <Icon size={14} />
                </a>
              );
            })}
          </span>
        )}
      </motion.div>
    );
  };

  const renderSocialLinks = () => {
    if (activeSocials.length === 0) return null;
    return (
      <div className="flex gap-3 pt-4">
        {activeSocials.map(([key, value]) => {
          const Icon = socialIcons[key];
          if (!Icon) return null;
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
    );
  };

  const renderMap = (height: string = '250') => {
    if (!mapSrc) return null;
    return (
      <div className={`mt-6 overflow-hidden ${borderRadius}`}>
        <iframe
          src={mapSrc}
          width="100%"
          height={height}
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Map"
        />
      </div>
    );
  };

  const renderForm = (extraClass: string = '') => {
    if (!contact.showForm || !contact.formFields || contact.formFields.length === 0) return null;
    return (
      <motion.form
        onSubmit={handleSubmit}
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className={`space-y-5 ${extraClass}`}
      >
        {contact.formFields.map((field) => {
          const label = fieldLabels[field] || field;
          const isTextarea = field === 'message';

          return (
            <div key={field}>
              <label className="mb-1.5 block text-sm font-medium">
                {label}
              </label>
              {isTextarea ? (
                <textarea
                  rows={4}
                  value={formData[field] || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [field]: e.target.value,
                    }))
                  }
                  className={`w-full border bg-transparent px-4 py-2.5 text-sm outline-none transition-all ${borderRadius}`}
                  style={
                    {
                      borderColor: `color-mix(in srgb, ${brand.textColor} 20%, transparent)`,
                      '--tw-ring-color': brand.accentColor,
                      color: brand.textColor,
                    } as React.CSSProperties
                  }
                  onFocus={(e) =>
                    (e.target.style.borderColor = brand.accentColor)
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = `color-mix(in srgb, ${brand.textColor} 20%, transparent)`)
                  }
                />
              ) : (
                <input
                  type={
                    field === 'email'
                      ? 'email'
                      : field === 'phone'
                        ? 'tel'
                        : field === 'date'
                          ? 'date'
                          : 'text'
                  }
                  value={formData[field] || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [field]: e.target.value,
                    }))
                  }
                  className={`w-full border bg-transparent px-4 py-2.5 text-sm outline-none transition-all ${borderRadius}`}
                  style={
                    {
                      borderColor: `color-mix(in srgb, ${brand.textColor} 20%, transparent)`,
                      '--tw-ring-color': brand.accentColor,
                      color: brand.textColor,
                    } as React.CSSProperties
                  }
                  onFocus={(e) =>
                    (e.target.style.borderColor = brand.accentColor)
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = `color-mix(in srgb, ${brand.textColor} 20%, transparent)`)
                  }
                />
              )}
            </div>
          );
        })}

        <button
          type="submit"
          className="w-full rounded-full px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: brand.accentColor }}
        >
          {contact.title
            ? `Send ${contact.title.toLowerCase().includes('message') ? 'Message' : 'Inquiry'}`
            : 'Send Message'}
        </button>
      </motion.form>
    );
  };

  // ── Layout: split (default) ──
  if (effectiveLayout === 'split') {
    return (
      <section
        id="contact"
        className={sectionPadding}
        style={{ backgroundColor: brand.backgroundColor, color: brand.textColor }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {renderHeader()}
          <div
            className={`grid gap-12 ${hasBusinessInfo ? 'lg:grid-cols-2' : 'mx-auto max-w-2xl'}`}
          >
            {renderBusinessInfoFull()}
            {renderForm()}
          </div>
        </div>
      </section>
    );
  }

  // ── Layout: centered-form ──
  if (effectiveLayout === 'centered-form') {
    return (
      <section
        id="contact"
        className={sectionPadding}
        style={{ backgroundColor: brand.backgroundColor, color: brand.textColor }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {renderHeader()}

          {/* Compact business info row */}
          {hasBusinessInfo && (
            <div className="mb-10">
              {renderBusinessInfoCompact()}
            </div>
          )}

          <div className="mx-auto max-w-lg">
            {renderForm()}
          </div>

          {/* Map below, centered */}
          {mapSrc && (
            <div className="mx-auto mt-12 max-w-2xl">
              {renderMap('300')}
            </div>
          )}
        </div>
      </section>
    );
  }

  // ── Layout: card ──
  if (effectiveLayout === 'card') {
    return (
      <section
        id="contact"
        className={sectionPadding}
        style={{ backgroundColor: brand.backgroundColor, color: brand.textColor }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {renderHeader()}

          <div className="mx-auto max-w-xl">
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              className={`p-6 sm:p-8 ${borderRadius}`}
              style={{
                ...cardStyle,
                boxShadow: cardStyle.boxShadow ?? '0 8px 30px rgba(0,0,0,0.12)',
                backdropFilter: cardStyle.backdropFilter ?? 'blur(12px)',
                border: cardStyle.border ?? `1px solid color-mix(in srgb, ${brand.accentColor} 20%, transparent)`,
              }}
            >
              {renderForm()}
            </motion.div>
          </div>

          {/* Compact info bar below the card */}
          {hasBusinessInfo && (
            <div className="mt-10">
              {renderBusinessInfoCompact()}
            </div>
          )}

          {/* Map below */}
          {mapSrc && (
            <div className="mx-auto mt-10 max-w-2xl">
              {renderMap('250')}
            </div>
          )}
        </div>
      </section>
    );
  }

  // ── Layout: map-focus ──
  if (effectiveLayout === 'map-focus') {
    return (
      <section
        id="contact"
        className="relative"
        style={{ color: brand.textColor }}
      >
        {/* Full-width map background */}
        <div className="relative w-full" style={{ minHeight: '600px' }}>
          <iframe
            src={mapSrc!}
            width="100%"
            height="100%"
            style={{ border: 0, position: 'absolute', inset: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Map"
          />

          {/* Gradient overlay for readability */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `linear-gradient(to right, ${brand.backgroundColor}cc 0%, ${brand.backgroundColor}44 50%, transparent 100%)`,
            }}
          />

          {/* Content overlay */}
          <div className={`relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${sectionPadding}`}>
            {/* Header */}
            <motion.div
              className="mb-8 max-w-md"
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
            >
              {contact.title && (
                <h2
                  className="text-3xl font-bold tracking-tight sm:text-4xl"
                  style={{ fontFamily: 'var(--heading-font)' }}
                >
                  {contact.title}
                </h2>
              )}
              {contact.subtitle && (
                <p className="mt-4 text-base leading-relaxed opacity-70 sm:text-lg">
                  {contact.subtitle}
                </p>
              )}
            </motion.div>

            {/* Overlay card with form, positioned bottom-right on desktop */}
            <div className="flex justify-end">
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                className={`w-full max-w-md p-6 sm:p-8 ${borderRadius}`}
                style={{
                  backgroundColor: `color-mix(in srgb, ${brand.backgroundColor} 85%, transparent)`,
                  backdropFilter: 'blur(16px)',
                  border: `1px solid color-mix(in srgb, ${brand.accentColor} 20%, transparent)`,
                  boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                }}
              >
                {/* Compact business info inside card */}
                {hasBusinessInfo && (
                  <div className="mb-6 space-y-3">
                    {businessInfo.address && (
                      <div className="flex items-center gap-3 text-sm opacity-80">
                        <MapPin size={16} style={{ color: brand.accentColor }} className="shrink-0" />
                        <span>
                          {businessInfo.address}
                          {businessInfo.city && `, ${businessInfo.city}`}
                        </span>
                      </div>
                    )}
                    {businessInfo.phone && (
                      <a href={`tel:${businessInfo.phone}`} className="flex items-center gap-3 text-sm opacity-80 hover:opacity-100">
                        <Phone size={16} style={{ color: brand.accentColor }} className="shrink-0" />
                        <span>{businessInfo.phone}</span>
                      </a>
                    )}
                    {businessInfo.email && (
                      <a href={`mailto:${businessInfo.email}`} className="flex items-center gap-3 text-sm opacity-80 hover:opacity-100">
                        <Mail size={16} style={{ color: brand.accentColor }} className="shrink-0" />
                        <span>{businessInfo.email}</span>
                      </a>
                    )}
                    {businessInfo.hours && (
                      <div className="flex items-center gap-3 text-sm opacity-80">
                        <Clock size={16} style={{ color: brand.accentColor }} className="shrink-0" />
                        <span>{businessInfo.hours}</span>
                      </div>
                    )}
                    {activeSocials.length > 0 && (
                      <div className="flex gap-2 pt-1">
                        {activeSocials.map(([key, value]) => {
                          const Icon = socialIcons[key];
                          if (!Icon) return null;
                          return (
                            <a
                              key={key}
                              href={value}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex h-8 w-8 items-center justify-center rounded-full transition-opacity hover:opacity-80"
                              style={{
                                backgroundColor: `color-mix(in srgb, ${brand.accentColor} 15%, transparent)`,
                                color: brand.accentColor,
                              }}
                            >
                              <Icon size={14} />
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {renderForm()}
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Fallback (should not reach here, but just in case)
  return null;
}
