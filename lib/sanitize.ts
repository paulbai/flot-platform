/**
 * Security utilities for sanitizing user-provided values
 */

const SAFE_URL_PROTOCOLS = ['https:', 'http:', 'mailto:', 'tel:'];
const SAFE_HREF_PATTERN = /^(https?:\/\/|mailto:|tel:|\/|#)/i;

/**
 * Sanitize a URL/href to prevent javascript: and other dangerous protocols.
 * Returns '#' for invalid/dangerous URLs.
 */
export function sanitizeHref(href: string | undefined | null): string {
  if (!href || typeof href !== 'string') return '#';

  const trimmed = href.trim();

  // Allow anchor links and relative paths
  if (trimmed.startsWith('#') || trimmed.startsWith('/')) return trimmed;

  // Block javascript:, data:, vbscript:, and other dangerous protocols
  try {
    const url = new URL(trimmed, 'https://placeholder.com');
    if (!SAFE_URL_PROTOCOLS.includes(url.protocol)) return '#';
  } catch {
    // If it's not a valid URL and doesn't start with # or /, block it
    if (!SAFE_HREF_PATTERN.test(trimmed)) return '#';
  }

  return trimmed;
}

/**
 * Sanitize iframe src to only allow trusted map embed domains.
 */
export function sanitizeMapSrc(src: string | undefined | null): string | null {
  if (!src || typeof src !== 'string') return null;

  const trimmed = src.trim();

  try {
    const url = new URL(trimmed);
    const allowedHosts = [
      'www.google.com',
      'maps.google.com',
      'google.com',
      'www.openstreetmap.org',
    ];

    if (url.protocol !== 'https:') return null;
    if (!allowedHosts.some(host => url.hostname === host || url.hostname.endsWith('.' + host))) {
      return null;
    }

    return trimmed;
  } catch {
    return null;
  }
}

/**
 * Sanitize a color value to ensure it's a valid hex color.
 */
export function sanitizeColor(color: string | undefined | null, fallback: string): string {
  if (!color || typeof color !== 'string') return fallback;
  if (/^#[0-9a-fA-F]{3,8}$/.test(color.trim())) return color.trim();
  return fallback;
}

/**
 * Sanitize a font name to prevent CSS injection via Google Fonts URL.
 */
export function sanitizeFont(font: string | undefined | null, fallback: string = 'Inter'): string {
  if (!font || typeof font !== 'string') return fallback;
  // Only allow alphanumeric, spaces, hyphens, and plus signs
  const cleaned = font.replace(/[^a-zA-Z0-9 \-+]/g, '');
  return cleaned || fallback;
}
