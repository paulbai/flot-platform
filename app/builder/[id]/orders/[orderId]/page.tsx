'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import BuilderTabs from '@/components/builder/BuilderTabs';
import StatusPill from '@/components/orders/StatusPill';
import { isValidTransition } from '@/lib/orders/status';
import type { OrderStatus, OrderVertical, OrderDetailsHotel, OrderDetailsAddressed } from '@/lib/orders/types';

interface OrderItem {
  id: string;
  name: string;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  imageUrl?: string | null;
  variant?: string | null;
}

interface OrderDetail {
  id: string;
  reference: string;
  vertical: OrderVertical;
  status: OrderStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  subtotal: number;
  total: number;
  currency: string;
  paymentMethod: string | null;
  paymentRef: string | null;
  details: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string; orderId: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInFlight, setActionInFlight] = useState<OrderStatus | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${params.orderId}`);
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = (await res.json()) as { order: OrderDetail; items: OrderItem[] };
      setOrder(data.order);
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [params.orderId]);

  useEffect(() => { load(); }, [load]);

  async function transitionTo(next: OrderStatus) {
    if (!order || !isValidTransition(order.status, next)) return;
    setActionInFlight(next);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `status ${res.status}`);
      }
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setActionInFlight(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <BuilderTabs siteId={params.id} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-sm opacity-60">Loading…</p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-black text-white">
        <BuilderTabs siteId={params.id} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-sm text-red-400">Error: {error ?? 'Order not found'}</p>
          <Link href={`/builder/${params.id}/orders`} className="text-sm underline mt-4 inline-block">
            ← Back to orders
          </Link>
        </div>
      </main>
    );
  }

  const fulfillLabel = order.vertical === 'hotel' ? 'Mark Completed' : 'Mark Fulfilled';
  const confirmLabel = 'Confirm Payment Received';
  const cancelLabel  = 'Cancel';

  const canFulfill = isValidTransition(order.status, 'fulfilled');
  const canConfirm = isValidTransition(order.status, 'confirmed');
  const canCancel  = isValidTransition(order.status, 'cancelled');

  const hotelDetails = order.vertical === 'hotel'
    ? (order.details as unknown as OrderDetailsHotel)
    : null;
  const addressDetails = (order.vertical === 'restaurant' || order.vertical === 'store')
    ? (order.details as unknown as OrderDetailsAddressed)
    : null;

  // Restaurants tag each order with the order type (dine-in / takeaway / delivery)
  // — surface it prominently so kitchen / floor staff know how to fulfill.
  const restaurantOrderType =
    order.vertical === 'restaurant' && typeof (order.details as { orderType?: unknown }).orderType === 'string'
      ? ((order.details as { orderType: string }).orderType as 'dine-in' | 'takeaway' | 'delivery')
      : null;
  const orderTypeLabel: Record<'dine-in' | 'takeaway' | 'delivery', string> = {
    'dine-in':  'Dine In',
    'takeaway': 'Takeaway',
    'delivery': 'Delivery',
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <BuilderTabs siteId={params.id} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <Link href={`/builder/${params.id}/orders`} className="text-xs opacity-60 hover:opacity-100">
          ← All orders
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-sm opacity-60">{order.reference}</p>
            <h1 className="text-2xl font-semibold mt-1">Order detail</h1>
          </div>
          <StatusPill status={order.status} />
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {canFulfill && (
            <button
              disabled={actionInFlight !== null}
              onClick={() => transitionTo('fulfilled')}
              className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-sm font-semibold disabled:opacity-50"
            >
              {actionInFlight === 'fulfilled' ? '…' : fulfillLabel}
            </button>
          )}
          {canConfirm && (
            <button
              disabled={actionInFlight !== null}
              onClick={() => transitionTo('confirmed')}
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-sm font-semibold disabled:opacity-50"
            >
              {actionInFlight === 'confirmed' ? '…' : confirmLabel}
            </button>
          )}
          {canCancel && (
            <button
              disabled={actionInFlight !== null}
              onClick={() => transitionTo('cancelled')}
              className="px-4 py-2 rounded-md bg-red-600/20 hover:bg-red-600/40 text-sm font-semibold border border-red-500/40 disabled:opacity-50"
            >
              {actionInFlight === 'cancelled' ? '…' : cancelLabel}
            </button>
          )}
          {!canFulfill && !canConfirm && !canCancel && (
            <span className="text-xs opacity-50">No actions available — order is in a terminal state.</span>
          )}
        </div>

        {/* Customer */}
        <section className="border border-white/10 rounded-lg p-4">
          <h2 className="text-xs uppercase tracking-wider opacity-60 mb-3">Customer</h2>
          <p className="text-base font-semibold">{order.customerName}</p>
          {order.customerEmail ? (
            <p className="text-sm">
              <a href={`mailto:${order.customerEmail}`} className="underline opacity-80 hover:opacity-100">
                {order.customerEmail}
              </a>
            </p>
          ) : (
            <p className="text-sm opacity-50 italic">No email provided</p>
          )}
          <p className="text-sm">
            <a href={`tel:${order.customerPhone}`} className="underline opacity-80 hover:opacity-100">
              {order.customerPhone}
            </a>
          </p>
        </section>

        {/* Vertical-specific block */}
        {hotelDetails && (
          <section className="border border-white/10 rounded-lg p-4">
            <h2 className="text-xs uppercase tracking-wider opacity-60 mb-3">Booking</h2>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="opacity-60">Check-in</dt>
              <dd>{hotelDetails.checkIn || '—'}</dd>
              <dt className="opacity-60">Check-out</dt>
              <dd>{hotelDetails.checkOut || '—'}</dd>
              <dt className="opacity-60">Nights</dt>
              <dd>{hotelDetails.nights}</dd>
              <dt className="opacity-60">Guests</dt>
              <dd>{hotelDetails.guests}</dd>
              <dt className="opacity-60">Room</dt>
              <dd className="font-mono text-xs">{hotelDetails.roomId}</dd>
            </dl>
          </section>
        )}
        {/* Restaurant: order type pill + delivery address (when applicable) */}
        {restaurantOrderType && (
          <section className="border border-white/10 rounded-lg p-4">
            <h2 className="text-xs uppercase tracking-wider opacity-60 mb-3">Order type</h2>
            <p className="text-base font-semibold">{orderTypeLabel[restaurantOrderType]}</p>
            {restaurantOrderType === 'delivery' && addressDetails?.deliveryAddress && (
              <>
                <p className="text-xs uppercase tracking-wider opacity-60 mt-3 mb-1">Delivery address</p>
                <p className="text-sm whitespace-pre-line">{addressDetails.deliveryAddress}</p>
              </>
            )}
          </section>
        )}
        {/* Store: just the delivery address (no type picker) */}
        {!restaurantOrderType && addressDetails?.deliveryAddress && (
          <section className="border border-white/10 rounded-lg p-4">
            <h2 className="text-xs uppercase tracking-wider opacity-60 mb-3">Delivery address</h2>
            <p className="text-sm whitespace-pre-line">{addressDetails.deliveryAddress}</p>
          </section>
        )}

        {/* Items */}
        <section className="border border-white/10 rounded-lg p-4">
          <h2 className="text-xs uppercase tracking-wider opacity-60 mb-3">Items</h2>
          <ul className="divide-y divide-white/10">
            {items.map((it) => (
              <li key={it.id} className="flex items-center gap-3 py-3">
                {it.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.imageUrl} alt={it.name} className="w-12 h-12 object-cover rounded" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{it.name}</p>
                  {it.description && <p className="text-xs opacity-60 truncate">{it.description}</p>}
                  {it.variant && <p className="text-xs opacity-60">{it.variant}</p>}
                </div>
                <p className="text-sm whitespace-nowrap">
                  {it.quantity} × {order.currency}{it.unitPrice.toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Money + payment */}
        <section className="border border-white/10 rounded-lg p-4 space-y-2 text-sm">
          <div className="flex justify-between"><span className="opacity-60">Subtotal</span><span>{order.currency}{order.subtotal.toLocaleString()}</span></div>
          <div className="flex justify-between font-semibold border-t border-white/10 pt-2"><span>Total</span><span>{order.currency}{order.total.toLocaleString()}</span></div>
          <div className="flex justify-between text-xs opacity-60 pt-2"><span>Payment method</span><span>{order.paymentMethod ?? 'Awaiting payment'}</span></div>
          {order.paymentRef && (
            <div className="flex justify-between text-xs opacity-60"><span>Payment ref</span><span className="font-mono">{order.paymentRef}</span></div>
          )}
        </section>

        {/* Footer timestamps */}
        <p className="text-xs opacity-40">
          Created {new Date(order.createdAt).toLocaleString()} · Updated {new Date(order.updatedAt).toLocaleString()}
        </p>

        {/* Avoid unused-router warning */}
        <span className="hidden">{String(!!router)}</span>
      </div>
    </main>
  );
}
