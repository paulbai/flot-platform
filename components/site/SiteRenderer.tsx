'use client';

import { useMemo, createContext } from 'react';
import type { SiteConfig } from '@/lib/types/customization';
import type { TemplateDefinition } from '@/lib/templates/types';
import { useTemplate } from '@/lib/templates/useTemplate';
import SiteNavbar from './SiteNavbar';
import SiteHero from './SiteHero';
import SiteShop from './SiteShop';
import SiteAbout from './SiteAbout';
import SiteGallery from './SiteGallery';
import SiteTestimonials from './SiteTestimonials';
import SiteContact from './SiteContact';
import SiteBottomCTA from './SiteBottomCTA';
import SiteFooter from './SiteFooter';
import SiteFloatingCart from './SiteFloatingCart';

const fallbackTemplate: TemplateDefinition = {
  id: 'default',
  name: 'Default',
  vertical: 'hotel',
  description: '',
  previewGradient: '',
  heroLayout: 'classic',
  navStyle: 'glass',
  aboutLayout: 'standard',
  galleryLayout: 'masonry',
  testimonialsLayout: 'cards',
  contactLayout: 'split',
  footerLayout: 'standard',
  animationPreset: 'fade-up',
  threeDEffects: { hero: 'none', cards: 'none', gallery: 'none', intensity: 0 },
  sectionStyles: { borderRadius: 'lg', cardStyle: 'flat', sectionSpacing: 'normal' },
};

export const TemplateContext = createContext<TemplateDefinition>(fallbackTemplate);

/** Build a Google Fonts URL for the selected heading + body fonts */
function buildGoogleFontsUrl(headingFont: string, bodyFont: string): string {
  const families = new Set<string>();
  if (headingFont) families.add(headingFont);
  if (bodyFont) families.add(bodyFont);
  if (families.size === 0) return '';

  const params = Array.from(families)
    .map((f) => `family=${f.replace(/ /g, '+')}:wght@300;400;500;600;700;800`)
    .join('&');
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

export default function SiteRenderer({ config }: { config: SiteConfig }) {
  const template = useTemplate(config);
  const headingFont = config.brand.headingFont || 'Inter';
  const bodyFont = config.brand.bodyFont || 'Inter';

  const fontsUrl = useMemo(
    () => buildGoogleFontsUrl(headingFont, bodyFont),
    [headingFont, bodyFont]
  );

  return (
    <TemplateContext.Provider value={template}>
      <div
        style={{
          backgroundColor: config.brand.backgroundColor,
          color: config.brand.textColor,
          fontFamily: `"${bodyFont}", sans-serif`,
          ['--heading-font' as string]: `"${headingFont}", serif`,
          ['--body-font' as string]: `"${bodyFont}", sans-serif`,
        }}
      >
        {/* Load Google Fonts dynamically */}
        {fontsUrl && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            {/* eslint-disable-next-line @next/next/no-page-custom-font */}
            <link rel="stylesheet" href={fontsUrl} />
          </>
        )}

        <SiteNavbar config={config} />
        <SiteHero config={config} />
        <SiteShop config={config} />
        <SiteAbout config={config} />
        <SiteGallery config={config} />
        <SiteTestimonials config={config} />
        <SiteContact config={config} />
        <SiteBottomCTA config={config} />
        <SiteFooter config={config} />
        <SiteFloatingCart config={config} />
      </div>
    </TemplateContext.Provider>
  );
}
