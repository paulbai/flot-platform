import { NextResponse } from 'next/server';

// TEMPORARY: Remove after debugging
export async function GET() {
  const url = process.env.TURSO_DATABASE_URL || '';
  const token = process.env.TURSO_AUTH_TOKEN || '';
  return NextResponse.json({
    urlLen: url.length,
    urlFirst50: url.slice(0, 50),
    urlLast10: url.slice(-10),
    urlCharCodes: [...url.slice(0, 60)].map(c => c.charCodeAt(0)),
    tokenLen: token.length,
    tokenFirst10: token.slice(0, 10),
  });
}
