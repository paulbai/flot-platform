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
import SitePartners from './SitePartners';
import SiteContact from './SiteContact';
import SiteBottomCTA from './SiteBottomCTA';
import SiteFooter from './SiteFooter';
import SiteFloatingCart from './SiteFloatingCart';
import { sanitizeFont } from '@/lib/sanitize';
import TemplateStyles from './TemplateStyles';
import SectionDivider from './SectionDivider';

const fallbackTemplate: TemplateDefinition = {
  id: 'default',
  name: 'Default',
  vertical: 'hotel',
  description: '',
  previewGradient: '',
  designFamily: 'opulent',
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
  const headingFont = sanitizeFont(config.brand.headingFont, 'Inter');
  const bodyFont = sanitizeFont(config.brand.bodyFont, 'Inter');

  const fontsUrl = useMemo(
    () => buildGoogleFontsUrl(headingFont, bodyFont),
    [headingFont, bodyFont]
  );

  const accentColor = config.brand.accentColor || '#c9a84c';
  const bgColor = config.brand.backgroundColor || '#0a0a0a';

  return (
    <TemplateContext.Provider value={template}>
      <div
        data-family={template.designFamily}
        style={{
          backgroundColor: config.brand.backgroundColor,
          color: config.brand.textColor,
          fontFamily: `"${bodyFont}", sans-serif`,
          ['--heading-font' as string]: `"${headingFont}", serif`,
          ['--body-font' as string]: `"${bodyFont}", sans-serif`,
          ['--accent' as string]: accentColor,
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

        <TemplateStyles family={template.designFamily} />

        <SiteNavbar config={config} />
        <SiteHero config={config} />

        <SectionDivider
          family={template.designFamily}
          accentColor={accentColor}
          bgColor={bgColor}
          nextBgColor={bgColor}
        />

        <SiteShop config={config} />

        <SectionDivider
          family={template.designFamily}
          accentColor={accentColor}
          bgColor={bgColor}
          nextBgColor={bgColor}
          flip={true}
        />

        <SiteAbout config={config} />

        <SectionDivider
          family={template.designFamily}
          accentColor={accentColor}
          bgColor={bgColor}
          nextBgColor={bgColor}
        />

        <SiteGallery config={config} />

        <SectionDivider
          family={template.designFamily}
          accentColor={accentColor}
          bgColor={bgColor}
          nextBgColor={bgColor}
          flip={true}
        />

        <SiteTestimonials config={config} />

        <SectionDivider
          family={template.designFamily}
          accentColor={accentColor}
          bgColor={bgColor}
          nextBgColor={bgColor}
        />

        <SitePartners config={config} />

        <SectionDivider
          family={template.designFamily}
          accentColor={accentColor}
          bgColor={bgColor}
          nextBgColor={bgColor}
          flip={true}
        />

        <SiteContact config={config} />

        <SectionDivider
          family={template.designFamily}
          accentColor={accentColor}
          bgColor={bgColor}
          nextBgColor={bgColor}
          flip={true}
        />

        <SiteBottomCTA config={config} />

        <SectionDivider
          family={template.designFamily}
          accentColor={accentColor}
          bgColor={bgColor}
          nextBgColor={bgColor}
        />

        <SiteFooter config={config} />
        <SiteFloatingCart config={config} />
      </div>
    </TemplateContext.Provider>
  );
}
