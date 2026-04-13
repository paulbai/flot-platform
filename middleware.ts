import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const BASE_DOMAIN = 'flotme.ai';
const RESERVED_SUBDOMAINS = new Set(['build', 'www', 'api', 'mail', 'smtp', 'ftp', 'admin']);

function getSubdomain(host: string): string | null {
  const hostname = host.split(':')[0]; // strip port
  if (!hostname.endsWith(`.${BASE_DOMAIN}`)) return null;
  const sub = hostname.slice(0, -(BASE_DOMAIN.length + 1));
  if (!sub || RESERVED_SUBDOMAINS.has(sub) || sub.includes('.')) return null;
  return sub;
}

export default auth((req) => {
  const host = req.headers.get('host') ?? '';
  const subdomain = getSubdomain(host);
  const { pathname } = req.nextUrl;

  // Subdomain merchant site routing: [slug].flotme.ai → /site/[slug]
  if (subdomain) {
    // Pass through Next.js internals and API routes unchanged
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname === '/favicon.ico'
    ) {
      return NextResponse.next();
    }

    const url = req.nextUrl.clone();
    url.pathname = `/site/${subdomain}`;
    return NextResponse.rewrite(url);
  }

  // Builder auth protection
  if (!req.auth && pathname.startsWith('/builder')) {
    const signInUrl = new URL('/', req.nextUrl.origin);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
