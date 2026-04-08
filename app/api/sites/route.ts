import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { sites, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { SiteConfig } from '@/lib/types/customization';

// GET /api/sites — list authenticated user's sites
export const GET = auth(async (req) => {
  if (!req.auth?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const email = req.auth.user.email;
  const rows = await db.select().from(sites).where(eq(sites.ownerEmail, email));

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
  if (!req.auth?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const email = req.auth.user.email;
  const body = await req.json();
  const config = body as SiteConfig;

  if (!config.id || !config.slug || !config.vertical) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Ensure user exists in users table (upsert)
  const existingUser = await db.select().from(users).where(eq(users.email, email));
  if (existingUser.length === 0) {
    await db.insert(users).values({
      id: email,
      email,
      name: email.split('@')[0],
    });
  }

  // Force ownerEmail to be the authenticated user
  config.ownerEmail = email;

  await db.insert(sites).values({
    id: config.id,
    slug: config.slug,
    ownerEmail: email,
    vertical: config.vertical,
    templateId: config.templateId || '',
    status: config.status || 'draft',
    config: config as unknown as Record<string, unknown>,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return NextResponse.json(config, { status: 201 });
}) as unknown as (req: Request) => Promise<Response>;
