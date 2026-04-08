import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sites } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import type { SiteConfig } from '@/lib/types/customization';

// GET /api/sites/public/[slug] — no auth, only published sites
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const rows = await db().select().from(sites)
    .where(and(eq(sites.slug, slug), eq(sites.status, 'published')));

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const row = rows[0];
  const config: SiteConfig = {
    ...(row.config as Omit<SiteConfig, 'id' | 'slug' | 'status' | 'createdAt' | 'updatedAt'>),
    id: row.id,
    slug: row.slug,
    status: row.status as 'draft' | 'published',
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };

  return NextResponse.json(config);
}
