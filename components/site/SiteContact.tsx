'use client';

import { useState } from 'react';
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

  if (!contact.enabled) return null;

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

  return (
    <section
      id="contact"
      className="py-20 sm:py-28"
      style={{ backgroundColor: brand.backgroundColor, color: brand.textColor }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mx-auto mb-16 max-w-3xl text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          {contact.title && (
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ fontFamily: 'var(--heading-font)' }}>
              {contact.title}
            </h2>
          )}
          {contact.subtitle && (
            <p className="mt-4 text-base leading-relaxed opacity-70 sm:text-lg">
              {contact.subtitle}
            </p>
          )}
        </motion.div>

        <div
          className={`grid gap-12 ${hasBusinessInfo ? 'lg:grid-cols-2' : 'mx-auto max-w-2xl'}`}
        >
          {/* Left: Business Info */}
          {hasBusinessInfo && (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
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

              {/* Social Links */}
              {activeSocials.length > 0 && (
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
              )}

              {/* Map */}
              {contact.showMap && contact.mapEmbed && (() => {
                // Extract src URL if user pasted full <iframe> HTML
                let mapSrc = contact.mapEmbed.trim();
                const srcMatch = mapSrc.match(/src=["']([^"']+)["']/);
                if (srcMatch) mapSrc = srcMatch[1];
                return (
                  <div className="mt-6 overflow-hidden rounded-xl">
                    <iframe
                      src={mapSrc}
                      width="100%"
                      height="250"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Map"
                    />
                  </div>
                );
              })()}
            </motion.div>
          )}

          {/* Right: Form */}
          {contact.showForm && contact.formFields && contact.formFields.length > 0 && (
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="space-y-5"
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
                        className="w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm outline-none transition-all"
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
                        className="w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm outline-none transition-all"
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
                {contact.title ? `Send ${contact.title.toLowerCase().includes('message') ? 'Message' : 'Inquiry'}` : 'Send Message'}
              </button>
            </motion.form>
          )}
        </div>
      </div>
    </section>
  );
}
