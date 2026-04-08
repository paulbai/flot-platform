import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { sites, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { SiteConfig } from '@/lib/types/customization';

/** Extract the authenticated user's identifier (email or phone) */
function getUserId(reqAuth: { user?: { email?: string | null; name?: string | null } } | null | undefined): string | null {
  if (!reqAuth?.user) return null;
  // email-based users
  if (reqAuth.user.email) return reqAuth.user.email;
  // phone-based users store phone in name (NextAuth workaround)
  const name = reqAuth.user.name;
  if (name && name.startsWith('+')) return name;
  return null;
}

// GET /api/sites — list authenticated user's sites
export const GET = auth(async (req) => {
  const userId = getUserId(req.auth);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rows = await db().select().from(sites).where(eq(sites.ownerEmail, userId));

  const configs: SiteConfig[] = rows.map((row) => ({
    ...(row.config as Omit<SiteConfig, 'id' | 'slug' | 'status' | 'createdAt' | 'updatedAt'>),
    id: row.id,
    slug: row.slug,
    status: row.status as 'draft' | 'published',
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));

  return NextResponse.json(configs);
}) as unknown as (req: Request) => Promise<Response>;

// POST /api/sites — create a new site
export const POST = auth(async (req) => {
  const userId = getUserId(req.auth);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const config = body as SiteConfig;

  if (!config.id || !config.slug || !config.vertical) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Ensure user exists in users table (upsert)
  const existingUser = await db().select().from(users).where(eq(users.id, userId));
  if (existingUser.length === 0) {
    const isPhone = userId.startsWith('+');
    await db().insert(users).values({
      id: userId,
      email: isPhone ? null : userId,
      phone: isPhone ? userId : null,
      name: isPhone ? userId : userId.split('@')[0],
    });
  }

  // Force owner to be the authenticated user
  config.ownerEmail = userId;

  await db().insert(sites).values({
    id: config.id,
    slug: config.slug,
    ownerEmail: userId,
    vertical: config.vertical,
    templateId: config.templateId || '',
    status: config.status || 'draft',
    config: config as unknown as Record<string, unknown>,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return NextResponse.json(config, { status: 201 });
}) as unknown as (req: Request) => Promise<Response>;
