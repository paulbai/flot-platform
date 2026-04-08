import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { sites } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import type { SiteConfig } from '@/lib/types/customization';

// GET /api/sites/[id]
export const GET = auth(async (req, { params }: { params: Promise<{ id: string }> }) => {
  if (!req.auth?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const email = req.auth.user.email;

  const rows = await db.select().from(sites)
    .where(and(eq(sites.id, id), eq(sites.ownerEmail, email)));

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
}) as unknown as (req: Request, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;

// PATCH /api/sites/[id] — partial update
export const PATCH = auth(async (req, { params }: { params: Promise<{ id: string }> }) => {
  if (!req.auth?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const email = req.auth.user.email;
  const updates = await req.json();

  // Verify ownership
  const rows = await db.select().from(sites)
    .where(and(eq(sites.id, id), eq(sites.ownerEmail, email)));

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const existing = rows[0];
  const existingConfig = existing.config as Record<string, unknown>;

  // Merge the update into the existing config
  const merged = { ...existingConfig, ...updates };

  // Update top-level columns if they changed
  await db.update(sites)
    .set({
      config: merged,
      slug: (updates.slug as string) || existing.slug,
      status: (updates.status as string) || existing.status,
      templateId: (updates.templateId as string) || existing.templateId,
      updatedAt: new Date(),
    })
    .where(eq(sites.id, id));

  return NextResponse.json({ success: true });
}) as unknown as (req: Request, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;

// DELETE /api/sites/[id]
export const DELETE = auth(async (req, { params }: { params: Promise<{ id: string }> }) => {
  if (!req.auth?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const email = req.auth.user.email;

  await db.delete(sites)
    .where(and(eq(sites.id, id), eq(sites.ownerEmail, email)));

  return NextResponse.json({ success: true });
}) as unknown as (req: Request, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;
