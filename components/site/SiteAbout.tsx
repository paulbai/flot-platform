'use client';

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

export default function SiteAbout({ config }: { config: SiteConfig }) {
  const { brand, about } = config;

  if (!about.enabled) return null;

  return (
    <section
      id="about"
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
          {about.title && (
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ fontFamily: 'var(--heading-font)' }}>
              {about.title}
            </h2>
          )}
          {about.description && (
            <p className="mt-4 text-base leading-relaxed sm:text-lg" style={{ opacity: 0.8 }}>
              {about.description}
            </p>
          )}
        </motion.div>

        {/* Content: Image + Mission */}
        {(about.image || about.mission) && (
          <div className="mb-16 grid items-center gap-12 lg:grid-cols-2">
            {about.image && (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6 }}
                className="overflow-hidden rounded-2xl"
              >
                <img
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
                <p className="text-lg leading-relaxed sm:text-xl" style={{ opacity: 0.85 }}>
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
              return (
                <motion.div
                  key={idx}
                  className="rounded-2xl border border-white/10 p-6 transition-shadow hover:shadow-lg"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${brand.backgroundColor} 90%, ${brand.accentColor})`,
                  }}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <div
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${brand.accentColor} 15%, transparent)`,
                    }}
                  >
                    <Icon
                      size={24}
                      style={{ color: brand.accentColor }}
                    />
                  </div>
                  <h3 className="mb-2 text-base font-semibold" style={{ fontFamily: 'var(--heading-font)' }}>
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed sm:text-base" style={{ opacity: 0.75 }}>
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
