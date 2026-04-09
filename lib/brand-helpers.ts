import type { BrandConfig } from './types/customization';

/**
 * Returns the full resolved palette for a brand config.
 * Optional extended colors fall back to derived values from the 3 base colors.
 */
export function resolveBrand(brand: BrandConfig) {
  const bg = brand.backgroundColor || '#0f0e0d';
  const accent = brand.accentColor || '#d4a96a';
  const text = brand.textColor || '#ffffff';

  return {
    ...brand,
    accentColor: accent,
    backgroundColor: bg,
    textColor: text,
    navColor: brand.navColor || `color-mix(in srgb, ${bg} 90%, ${text})`,
    cardColor: brand.cardColor || `color-mix(in srgb, ${bg} 92%, ${text})`,
    footerColor: brand.footerColor || `color-mix(in srgb, ${bg} 85%, black)`,
    borderColor: brand.borderColor || `color-mix(in srgb, ${text} 15%, transparent)`,
  };
}
