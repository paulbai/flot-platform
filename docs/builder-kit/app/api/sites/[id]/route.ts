import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { sites } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import type { SiteConfig } from '@/lib/types/customization';
import { logMerchantPublish } from '@/lib/sheets';

/** Extract the authenticated user's identifier (email or phone) */
function getUserId(reqAuth: { user?: { email?: string | null; name?: string | null } } | null | undefined): string | null {
  if (!reqAuth?.user) return null;
  if (reqAuth.user.email) return reqAuth.user.email;
  const name = reqAuth.user.name;
  if (name && name.startsWith('+')) return name;
  return null;
}

// GET /api/sites/[id]
export const GET = auth(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const userId = getUserId(req.auth);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const rows = await db().select().from(sites)
    .where(and(eq(sites.id, id), eq(sites.ownerEmail, userId)));

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const row = rows[0];
  const config: SiteConfig = {
    ...(row.config as Omit<SiteConfig, 'id' | 'slug' | 'status' | 'createdAt' | 'updatedAt'>),
    id: row.id,
    slug: row.slug,
    status: row.status as 'draft' | 'published',
    merchantId: row.merchantId ?? '',
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };

  return NextResponse.json(config);
}) as unknown as (req: Request, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;

// PATCH /api/sites/[id] — partial update
export const PATCH = auth(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const userId = getUserId(req.auth);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const updates = await req.json();

  // Verify ownership
  const rows = await db().select().from(sites)
    .where(and(eq(sites.id, id), eq(sites.ownerEmail, userId)));

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const existing = rows[0];
  const existingConfig = existing.config as Record<string, unknown>;

  // Merge the update into the existing config
  const merged = { ...existingConfig, ...updates };

  // Update top-level columns if they changed
  const newStatus = (updates.status as string) || existing.status;

  // The merchant ID is a top-level column on the row, not part of `config`.
  // Read it out of the update payload (or fall back to the existing value).
  const newMerchantId =
    typeof updates.merchantId === 'string' ? updates.merchantId.trim() : existing.merchantId;

  // Gate: publishing requires a non-empty Flot Merchant ID. The buyer-side
  // FlotCheckout uses this value as the routing key for real payments, so a
  // site without one would silently take orders that can't be settled.
  if (newStatus === 'published' && !newMerchantId) {
    return NextResponse.json(
      { error: 'A Flot Merchant ID is required to publish your site. Add yours from pay.flotme.ai and try again.' },
      { status: 400 },
    );
  }

  await db().update(sites)
    .set({
      config: merged,
      slug: (updates.slug as string) || existing.slug,
      status: newStatus,
      templateId: (updates.templateId as string) || existing.templateId,
      merchantId: newMerchantId,
      updatedAt: new Date(),
    })
    .where(eq(sites.id, id));

  // Log to Google Sheets when a site is first published
  if (newStatus === 'published' && existing.status !== 'published') {
    const fullConfig = { ...merged, id, slug: (updates.slug as string) || existing.slug } as SiteConfig;
    logMerchantPublish(fullConfig, userId).catch(() => {});
  }

  return NextResponse.json({ success: true });
}) as unknown as (req: Request, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;

// DELETE /api/sites/[id]
export const DELETE = auth(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const userId = getUserId(req.auth);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  await db().delete(sites)
    .where(and(eq(sites.id, id), eq(sites.ownerEmail, userId)));

  return NextResponse.json({ success: true });
}) as unknown as (req: Request, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;
