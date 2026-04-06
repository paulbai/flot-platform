'use client';

import { useMemo } from 'react';
import type { SiteConfig } from '@/lib/types/customization';
import type { TemplateDefinition } from './types';
import { getTemplate, DEFAULT_TEMPLATE_IDS } from './registry';

const fallback: TemplateDefinition = {
  id: 'default',
  name: 'Default',
  vertical: 'hotel',
  description: 'Default template',
  previewGradient: 'linear-gradient(135deg, #111 0%, #333 100%)',
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

export function useTemplate(config: SiteConfig): TemplateDefinition {
  return useMemo(() => {
    const id = config.templateId || DEFAULT_TEMPLATE_IDS[config.vertical] || '';
    return getTemplate(id) || fallback;
  }, [config.templateId, config.vertical]);
}
