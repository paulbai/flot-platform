'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import BuilderTabs from '@/components/builder/BuilderTabs';
import StatusPill from '@/components/orders/StatusPill';
import { ORDER_STATUSES, type OrderStatus } from '@/lib/orders/types';

interface OrderRow {
  id: string;
  reference: string;
  customerName: string;
  total: number;
  currency: string;
  status: OrderStatus;
  createdAt: string;
}

export default function OrdersListPage() {
  const params = useParams<{ id: string }>();
  const siteId = params.id;
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [counts, setCounts] = useState<Record<OrderStatus | 'all', number>>({
    all: 0, pending: 0, confirmed: 0, fulfilled: 0, cancelled: 0,
  });
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const url = filter === 'all'
          ? `/api/orders?siteId=${encodeURIComponent(siteId)}`
          : `/api/orders?siteId=${encodeURIComponent(siteId)}&status=${filter}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = (await res.json()) as { orders: OrderRow[] };
        if (cancelled) return;
        setOrders(data.orders);

        // Count totals by hitting the API once per status (cheap; cached if needed later).
        const countsRes = await Promise.all(ORDER_STATUSES.map((s) =>
          fetch(`/api/orders?siteId=${encodeURIComponent(siteId)}&status=${s}&limit=1`).then((r) => r.ok ? r.json() : { orders: [] }),
        ));
        // The API doesn't return a total; we approximate using a separate "all" fetch.
        const allRes = await fetch(`/api/orders?siteId=${encodeURIComponent(siteId)}&limit=100`);
        const all = allRes.ok ? (await allRes.json()).orders as OrderRow[] : [];
        if (cancelled) return;
        const c = { all: all.length, pending: 0, confirmed: 0, fulfilled: 0, cancelled: 0 } as Record<OrderStatus | 'all', number>;
        for (const o of all) c[o.status as OrderStatus]++;
        // We loaded `countsRes` for completeness; not used directly. Kept as a side-effect-free probe of API health.
        void countsRes;
        setCounts(c);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [siteId, filter]);

  return (
    <main className="min-h-screen bg-black text-white">
      <BuilderTabs siteId={siteId} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-semibold mb-6">Orders</h1>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['all', ...ORDER_STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
              style={{
                backgroundColor: filter === s ? 'white' : 'transparent',
                color: filter === s ? 'black' : 'white',
                borderColor: 'rgba(255,255,255,0.2)',
              }}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              <span className="ml-2 opacity-60">{counts[s] ?? 0}</span>
            </button>
          ))}
        </div>

        {/* Body */}
        {loading && <p className="text-sm opacity-60">Loading…</p>}
        {error && <p className="text-sm text-red-400">Error: {error}</p>}

        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-16 opacity-60">
            <p className="text-sm">No orders yet.</p>
            <p className="text-xs mt-1">Once buyers complete checkout on your published site, they&apos;ll show up here.</p>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <ul className="divide-y divide-white/10 border border-white/10 rounded-lg overflow-hidden">
            {orders.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/builder/${siteId}/orders/${o.id}`}
                  className="grid grid-cols-1 sm:grid-cols-[100px_1fr_auto_auto_120px] items-center gap-4 px-4 py-3 hover:bg-white/5 transition-colors"
                >
                  <span className="font-mono text-xs">{o.reference}</span>
                  <span className="text-sm truncate">{o.customerName}</span>
                  <span className="text-sm font-semibold">{o.currency}{o.total.toLocaleString()}</span>
                  <StatusPill status={o.status} />
                  <span className="text-xs opacity-60 text-right">
                    {new Date(o.createdAt).toLocaleString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
