'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import BuilderTabs from '@/components/builder/BuilderTabs';
import StatusPill from '@/components/orders/StatusPill';
import { ORDER_STATUSES, type OrderStatus } from '@/lib/orders/types';
import { markOrdersSeen } from '@/lib/hooks/useOrderNotifications';

interface OrderRow {
  id: string;
  reference: string;
  customerName: string;
  total: number;
  currency: string;
  status: OrderStatus;
  createdAt: string;
}

const PAGE_SIZE = 200;

// localStorage cache for instant first paint on slow connections.
const cacheKey = (siteId: string) => `flot:orders-cache:${siteId}`;

function readCache(siteId: string): OrderRow[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(cacheKey(siteId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { orders: OrderRow[]; ts: number };
    // Cache valid for 5 minutes — beyond that we'd rather show fresh.
    if (Date.now() - parsed.ts > 5 * 60_000) return null;
    return parsed.orders;
  } catch {
    return null;
  }
}

function writeCache(siteId: string, orders: OrderRow[]) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(cacheKey(siteId), JSON.stringify({ orders, ts: Date.now() }));
  } catch {
    // sessionStorage may be unavailable / full — ignore.
  }
}

export default function OrdersListPage() {
  const params = useParams<{ id: string }>();
  const siteId = params.id;

  // Single source of truth: ALL orders for this site.
  // Counts and the filtered list are derived locally — zero refetches when switching pills.
  const [allOrders, setAllOrders] = useState<OrderRow[]>(() => readCache(siteId) ?? []);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [loading, setLoading] = useState(allOrders.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (signal?: AbortSignal) => {
    const url = `/api/orders?siteId=${encodeURIComponent(siteId)}&limit=${PAGE_SIZE}`;
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = (await res.json()) as { orders: OrderRow[] };
    return data.orders;
  }, [siteId]);

  // Initial load (or background refresh if we have cached data).
  useEffect(() => {
    // Viewing the orders list = the merchant has "seen" the new ones.
    // Reset the badge counter every time this page mounts so the BuilderTabs
    // pill clears immediately, and the next poll computes from this moment.
    markOrdersSeen(siteId);

    const ctrl = new AbortController();
    let cancelled = false;

    async function load() {
      setError(null);
      try {
        const orders = await fetchOrders(ctrl.signal);
        if (cancelled) return;
        setAllOrders(orders);
        writeCache(siteId, orders);
      } catch (err) {
        if (cancelled || ctrl.signal.aborted) return;
        // If we already had cached data, don't blow away the UI on a transient failure —
        // just surface a small error chip.
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    load();
    return () => { cancelled = true; ctrl.abort(); };
  }, [siteId, fetchOrders]);

  // Auto-refresh when the merchant returns to the tab — so they always see the latest
  // orders on resume without having to remember to hit Refresh.
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState !== 'visible') return;
      // Returning to this tab = the merchant has caught up; clear the badge.
      markOrdersSeen(siteId);
      // Background refresh — silent; the spinner is reserved for explicit clicks.
      fetchOrders()
        .then((orders) => {
          setAllOrders(orders);
          writeCache(siteId, orders);
          setError(null);
        })
        .catch(() => { /* keep last data; the error chip is for explicit clicks */ });
    }
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [siteId, fetchOrders]);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const orders = await fetchOrders();
      setAllOrders(orders);
      writeCache(siteId, orders);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh');
    } finally {
      setRefreshing(false);
    }
  }

  // Derive counts from the single fetched list.
  const counts = useMemo(() => {
    const c: Record<OrderStatus | 'all', number> = {
      all: allOrders.length,
      pending: 0,
      confirmed: 0,
      fulfilled: 0,
      cancelled: 0,
    };
    for (const o of allOrders) c[o.status]++;
    return c;
  }, [allOrders]);

  // Derive the visible list from the active pill.
  const visibleOrders = useMemo(() => {
    if (filter === 'all') return allOrders;
    return allOrders.filter((o) => o.status === filter);
  }, [allOrders, filter]);

  const showSkeleton = loading && allOrders.length === 0;

  return (
    <main className="min-h-screen bg-black text-white">
      <BuilderTabs siteId={siteId} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6 gap-3">
          <h1 className="text-xl sm:text-2xl font-semibold truncate min-w-0">Orders</h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing || showSkeleton}
            // On phones the label is hidden — the spinning icon is enough.
            className="flex items-center justify-center gap-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 sm:px-3 sm:py-1.5 rounded-full text-xs font-medium border border-white/20 hover:bg-white/5 transition-colors disabled:opacity-40 shrink-0"
            aria-label={refreshing ? 'Refreshing' : 'Refresh orders'}
            title={refreshing ? 'Refreshing…' : 'Refresh orders'}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">{refreshing ? 'Refreshing…' : 'Refresh'}</span>
          </button>
        </div>

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
              <span className="ml-2 opacity-60">{counts[s]}</span>
            </button>
          ))}
        </div>

        {/* Inline error banner — non-blocking when we have cached data to show. */}
        {error && (
          <div className="mb-4 px-3 py-2 rounded-md text-xs bg-red-500/10 border border-red-500/30 text-red-300">
            Couldn&apos;t reach the server: {error}. Showing last loaded data.
          </div>
        )}

        {/* Body */}
        {showSkeleton && (
          <ul className="divide-y divide-white/10 border border-white/10 rounded-lg overflow-hidden">
            {[0, 1, 2, 3].map((i) => (
              <li key={i} className="grid grid-cols-1 sm:grid-cols-[100px_1fr_auto_auto_120px] items-center gap-4 px-4 py-3">
                <span className="h-3 w-16 bg-white/10 rounded animate-pulse" />
                <span className="h-3 w-32 bg-white/10 rounded animate-pulse" />
                <span className="h-3 w-12 bg-white/10 rounded animate-pulse" />
                <span className="h-4 w-16 bg-white/10 rounded-full animate-pulse" />
                <span className="h-3 w-20 bg-white/10 rounded animate-pulse justify-self-end" />
              </li>
            ))}
          </ul>
        )}

        {!showSkeleton && visibleOrders.length === 0 && (
          <div className="text-center py-16 opacity-60">
            <p className="text-sm">{filter === 'all' ? 'No orders yet.' : `No ${filter} orders.`}</p>
            <p className="text-xs mt-1">
              {filter === 'all'
                ? "Once buyers complete checkout on your published site, they'll show up here."
                : 'Try a different filter.'}
            </p>
          </div>
        )}

        {!showSkeleton && visibleOrders.length > 0 && (
          <ul className="divide-y divide-white/10 border border-white/10 rounded-lg overflow-hidden">
            {visibleOrders.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/builder/${siteId}/orders/${o.id}`}
                  prefetch={false}
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
