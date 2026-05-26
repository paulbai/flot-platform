import { NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { orders, orderItems } from '@/lib/db/schema';
import { ORDER_STATUSES, type OrderStatus } from '@/lib/orders/types';
import { isValidTransition } from '@/lib/orders/status';

function getUserId(reqAuth: { user?: { email?: string | null; name?: string | null } } | null | undefined): string | null {
  if (!reqAuth?.user) return null;
  if (reqAuth.user.email) return reqAuth.user.email;
  const name = reqAuth.user.name;
  if (name && name.startsWith('+')) return name;
  return null;
}

export const GET = auth(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const userId = getUserId(req.auth);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await ctx.params;
  const rows = await db().select().from(orders)
    .where(and(eq(orders.id, id), eq(orders.ownerEmail, userId)));
  if (rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const order = rows[0];

  const items = await db().select().from(orderItems)
    .where(eq(orderItems.orderId, id));

  return NextResponse.json({
    order: {
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    },
    items,
  });
}) as unknown as (req: Request, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;

export const PATCH = auth(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const userId = getUserId(req.auth);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = (await req.json()) as {
    status?: unknown;
    paymentMethod?: unknown;
    paymentRef?: unknown;
  };
  const nextStatus = body.status;

  if (typeof nextStatus !== 'string' || !ORDER_STATUSES.includes(nextStatus as OrderStatus)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const rows = await db().select().from(orders)
    .where(and(eq(orders.id, id), eq(orders.ownerEmail, userId)));
  if (rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const current = rows[0];

  if (!isValidTransition(current.status as OrderStatus, nextStatus as OrderStatus)) {
    return NextResponse.json(
      { error: `Invalid status transition: ${current.status} → ${nextStatus}` },
      { status: 400 },
    );
  }

  // PATCH may also fill in payment fields on the pending → confirmed transition
  // (the buyer who reserved without paying is now paying online). Both fields
  // are optional; if absent the existing values are preserved.
  const update: Partial<typeof orders.$inferInsert> = {
    status: nextStatus,
    updatedAt: new Date(),
  };
  if (typeof body.paymentMethod === 'string' && ['flot', 'mobile-money', 'card'].includes(body.paymentMethod)) {
    update.paymentMethod = body.paymentMethod;
  }
  if (typeof body.paymentRef === 'string' && body.paymentRef.length > 0) {
    update.paymentRef = body.paymentRef;
  }

  await db().update(orders).set(update).where(eq(orders.id, id));

  return NextResponse.json({ success: true, status: nextStatus });
}) as unknown as (req: Request, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;

/**
 * Hard-delete an order and its line items. Restricted to TERMINAL states
 * (`fulfilled` or `cancelled`) — active orders (pending, confirmed) must be
 * cancelled first. This stops a merchant from accidentally nuking a live
 * reservation, while letting them tidy up history once an order is done.
 */
export const DELETE = auth(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const userId = getUserId(req.auth);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await ctx.params;
  const rows = await db().select().from(orders)
    .where(and(eq(orders.id, id), eq(orders.ownerEmail, userId)));
  if (rows.length === 0) {
    // 404 (not 403) on cross-tenant — we don't want to leak whether the
    // order exists under a different merchant.
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const current = rows[0];

  if (current.status !== 'fulfilled' && current.status !== 'cancelled') {
    return NextResponse.json(
      { error: 'Only fulfilled or cancelled orders can be deleted. Cancel the order first.' },
      { status: 400 },
    );
  }

  // Drizzle doesn't auto-cascade delete on Turso/libsql since we didn't
  // declare FK constraints; do it manually in two statements.
  await db().delete(orderItems).where(eq(orderItems.orderId, id));
  await db().delete(orders).where(eq(orders.id, id));

  return NextResponse.json({ success: true });
}) as unknown as (req: Request, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;
