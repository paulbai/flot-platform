import { NextResponse } from 'next/server';
import { customAlphabet } from 'nanoid';
import { eq, and, desc, lt } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { sites, orders, orderItems } from '@/lib/db/schema';
import { generateReference } from '@/lib/orders/reference';
import { ORDER_STATUSES, type OrderStatus, type OrderVertical } from '@/lib/orders/types';
import { sendOrderConfirmationEmail } from '@/lib/email';

const idAlphabet = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 16);
const newOrderId = () => `ord_${idAlphabet()}`;
const newItemId  = () => `oi_${idAlphabet()}`;

interface IncomingItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string;
  variant?: string;
}

interface CreateOrderBody {
  siteSlug: string;
  status: 'pending' | 'confirmed';
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: IncomingItem[];
  subtotal: number;
  total: number;
  currency?: string;
  paymentMethod?: 'flot' | 'mobile-money' | 'card';
  paymentRef?: string;
  details?: Record<string, unknown>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Accept both Sierra Leone local format (e.g., 076800100) AND international
// format (e.g., +23276800100). 7–15 digits with an optional leading +.
// Previously this required `[1-9]` as the first digit, which rejected the
// completely valid local format starting with `0`.
const PHONE_RE = /^\+?\d{7,15}$/;

type ValidationResult =
  | { ok: true; body: CreateOrderBody }
  | { ok: false; reason: string };

function validateBody(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object') return { ok: false, reason: 'body is not an object' };
  const b = body as Record<string, unknown>;
  if (typeof b.siteSlug !== 'string' || !b.siteSlug.trim()) return { ok: false, reason: 'siteSlug is required' };
  if (b.status !== 'pending' && b.status !== 'confirmed') return { ok: false, reason: 'status must be pending or confirmed' };
  if (!b.customer || typeof b.customer !== 'object') return { ok: false, reason: 'customer is required' };
  const c = b.customer as Record<string, unknown>;
  if (typeof c.name !== 'string' || !c.name.trim()) return { ok: false, reason: 'customer.name is required' };
  // Email is optional for store/restaurant flows. If provided, it must be valid;
  // otherwise empty string is accepted (the merchant dashboard renders "—").
  if (typeof c.email !== 'string') return { ok: false, reason: 'customer.email must be a string' };
  if (c.email.trim().length > 0 && !EMAIL_RE.test(c.email)) return { ok: false, reason: 'customer.email is not a valid email' };
  // Phone is optional for dine-in. Same rule: accept empty, otherwise validate.
  if (typeof c.phone !== 'string') return { ok: false, reason: 'customer.phone must be a string' };
  if (c.phone.trim().length > 0 && !PHONE_RE.test(c.phone)) {
    return { ok: false, reason: `customer.phone "${c.phone}" must be 7–15 digits with optional + prefix` };
  }
  if (!Array.isArray(b.items) || b.items.length === 0) return { ok: false, reason: 'items array is empty' };
  if (typeof b.subtotal !== 'number' || !Number.isFinite(b.subtotal) || b.subtotal < 0) {
    return { ok: false, reason: 'subtotal must be a non-negative number' };
  }
  if (typeof b.total !== 'number' || !Number.isFinite(b.total) || b.total < 0) {
    return { ok: false, reason: 'total must be a non-negative number' };
  }
  if (b.status === 'confirmed' && (typeof b.paymentMethod !== 'string' || !b.paymentMethod)) {
    return { ok: false, reason: 'paymentMethod is required when status=confirmed' };
  }
  return { ok: true, body: b as unknown as CreateOrderBody };
}

async function insertOrderWithRetry(args: {
  body: CreateOrderBody;
  siteId: string;
  ownerEmail: string;
  vertical: OrderVertical;
}, attempt = 0): Promise<{ id: string; reference: string }> {
  const { body, siteId, ownerEmail, vertical } = args;
  const id = newOrderId();
  const reference = generateReference();

  try {
    await db().transaction(async (tx) => {
      await tx.insert(orders).values({
        id,
        reference,
        siteId,
        ownerEmail,
        vertical,
        status: body.status,
        customerName: body.customer.name.trim(),
        customerEmail: body.customer.email.toLowerCase().trim(),
        customerPhone: body.customer.phone.trim(),
        subtotal: Math.round(body.subtotal),
        total: Math.round(body.total),
        currency: body.currency || 'Le',
        paymentMethod: body.paymentMethod || null,
        paymentRef: body.paymentRef || null,
        details: (body.details ?? {}) as Record<string, unknown>,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const itemRows = body.items.map((it) => ({
        id: newItemId(),
        orderId: id,
        name: it.name,
        description: it.description ?? null,
        quantity: Math.max(1, Math.round(it.quantity)),
        unitPrice: Math.round(it.unitPrice),
        imageUrl: it.imageUrl ?? null,
        variant: it.variant ?? null,
      }));

      if (itemRows.length > 0) {
        await tx.insert(orderItems).values(itemRows);
      }
    });
    return { id, reference };
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (attempt < 3 && /unique/i.test(msg) && /reference/i.test(msg)) {
      return insertOrderWithRetry(args, attempt + 1);
    }
    throw err;
  }
}

export async function POST(request: Request) {
  try {
    const parsedBody = (await request.json()) as unknown;
    const validation = validateBody(parsedBody);
    if (!validation.ok) {
      // Be loud about validation rejects so we can debug from Vercel logs why
      // a buyer's reservation didn't make it through. Includes the slug so we
      // can correlate with the merchant report; redacts customer values.
      const safe = parsedBody && typeof parsedBody === 'object'
        ? {
            siteSlug: (parsedBody as Record<string, unknown>).siteSlug,
            status: (parsedBody as Record<string, unknown>).status,
            itemCount: Array.isArray((parsedBody as Record<string, unknown>).items)
              ? ((parsedBody as { items: unknown[] }).items.length)
              : 'n/a',
            customerKeys: (parsedBody as { customer?: object }).customer
              ? Object.keys((parsedBody as { customer: object }).customer)
              : 'n/a',
          }
        : 'not-an-object';
      console.warn(`[POST /api/orders] validation failed: ${validation.reason}`, JSON.stringify(safe));
      // Surface the specific reason in the response body so the buyer-side
      // banner can show "phone must be 7–15 digits" instead of "check your
      // connection". The buyer-facing client decides how to render this.
      return NextResponse.json({ error: validation.reason }, { status: 400 });
    }
    const body = validation.body;

    const rows = await db().select().from(sites)
      .where(and(eq(sites.slug, body.siteSlug), eq(sites.status, 'published')));
    if (rows.length === 0) {
      console.warn(`[POST /api/orders] site not found or unpublished: slug=${body.siteSlug}`);
      return NextResponse.json({ error: 'Site not found or not published' }, { status: 404 });
    }
    const site = rows[0];
    const vertical = site.vertical as OrderVertical;

    const created = await insertOrderWithRetry({
      body,
      siteId: site.id,
      ownerEmail: site.ownerEmail,
      vertical,
    });

    console.log(`[POST /api/orders] created order ${created.reference} (${created.id}) for site=${body.siteSlug} status=${body.status}`);

    // Best-effort: send a confirmation email to the buyer if they provided
    // one. Doesn't await — we don't want a slow email provider to delay the
    // 201 response or surface as a 5xx if Resend hiccups. The function
    // already swallows its own errors.
    const businessName = (() => {
      try {
        const cfg = (typeof site.config === 'string' ? JSON.parse(site.config) : site.config) as
          { brand?: { businessName?: string } } | null;
        return cfg?.brand?.businessName || site.slug;
      } catch {
        return site.slug;
      }
    })();
    void sendOrderConfirmationEmail({
      to: body.customer.email,
      reference: created.reference,
      brandName: businessName,
      customerName: body.customer.name,
      total: Math.round(body.total),
      currency: body.currency || 'Le',
      items: body.items.map((it) => ({
        name: it.name,
        quantity: Math.max(1, Math.round(it.quantity)),
        unitPrice: Math.round(it.unitPrice),
      })),
      vertical,
      status: body.status,
    });

    return NextResponse.json({
      id: created.id,
      reference: created.reference,
      status: body.status,
    }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/orders]', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export const GET = auth(async (req) => {
  const userEmail = req.auth?.user?.email;
  const userName  = req.auth?.user?.name;
  const userId = userEmail || (userName?.startsWith('+') ? userName : null);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const siteId = url.searchParams.get('siteId');
  const status = url.searchParams.get('status') as OrderStatus | null;
  const cursor = url.searchParams.get('cursor');
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit') || 50)));

  if (!siteId) {
    return NextResponse.json({ error: 'siteId is required' }, { status: 400 });
  }
  if (status && !ORDER_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const owned = await db().select().from(sites)
    .where(and(eq(sites.id, siteId), eq(sites.ownerEmail, userId)));
  if (owned.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const conditions = [eq(orders.siteId, siteId)];
  if (status) conditions.push(eq(orders.status, status));
  if (cursor) conditions.push(lt(orders.createdAt, new Date(cursor)));

  const rows = await db().select().from(orders)
    .where(and(...conditions))
    .orderBy(desc(orders.createdAt))
    .limit(limit);

  const nextCursor = rows.length === limit
    ? rows[rows.length - 1].createdAt.toISOString()
    : null;

  return NextResponse.json({
    orders: rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() })),
    nextCursor,
  });
}) as unknown as (req: Request) => Promise<Response>;
