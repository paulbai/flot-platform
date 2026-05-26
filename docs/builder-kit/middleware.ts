import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const path = req.nextUrl.pathname;
  if (!req.auth && (path.startsWith('/builder') || path.startsWith('/preview'))) {
    const signInUrl = new URL('/', req.nextUrl.origin);
    return NextResponse.redirect(signInUrl);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ['/builder/:path*', '/preview/:path*'],
};
