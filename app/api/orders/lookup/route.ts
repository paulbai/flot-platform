import { NextResponse } from 'next/server';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { sites, orders, orderItems } from '@/lib/db/schema';
import { isRateLimited } from '@/lib/otp';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const siteSlug = url.searchParams.get('siteSlug');
    const email = url.searchParams.get('email')?.toLowerCase().trim();

    if (!siteSlug || !email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'siteSlug and a valid email are required' }, { status: 400 });
    }

    // Lookup is cheap (read-only, no SMS/email send) — use a much more lenient
    // bucket than the default 3/min OTP limit. 30/min per email is plenty for
    // human use and still cuts off any abusive scripted scan.
    if (await isRateLimited(`lookup:${email}`, 30)) {
      return NextResponse.json(
        { error: 'Too many lookup requests. Please wait a moment.' },
        { status: 429 },
      );
    }

    const siteRows = await db().select().from(sites)
      .where(and(eq(sites.slug, siteSlug), eq(sites.status, 'published')));
    if (siteRows.length === 0) {
      return NextResponse.json({ orders: [] });
    }
    const siteId = siteRows[0].id;

    const orderRows = await db().select().from(orders)
      .where(and(
        eq(orders.siteId, siteId),
        eq(orders.customerEmail, email),
      ))
      .orderBy(desc(orders.createdAt))
      .limit(50);

    if (orderRows.length === 0) {
      return NextResponse.json({ orders: [] });
    }

    const orderIds = orderRows.map((o) => o.id);
    const allItems = await db().select().from(orderItems);
    const itemsByOrder = new Map<string, typeof allItems>();
    for (const item of allItems) {
      if (!orderIds.includes(item.orderId)) continue;
      const list = itemsByOrder.get(item.orderId) ?? [];
      list.push(item);
      itemsByOrder.set(item.orderId, list);
    }

    return NextResponse.json({
      orders: orderRows.map((o) => ({
        id: o.id,
        reference: o.reference,
        vertical: o.vertical,
        status: o.status,
        total: o.total,
        currency: o.currency,
        details: o.details,
        items: itemsByOrder.get(o.id) ?? [],
        createdAt: o.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error('[GET /api/orders/lookup]', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }
}
