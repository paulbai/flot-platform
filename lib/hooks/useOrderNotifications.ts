'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Per-browser localStorage tracking of when the merchant last *viewed* the
 * orders for a given site. New-order count is computed as: orders with
 * createdAt > lastSeen[siteId]. Cross-device sync is out of scope for v1.
 */
const LAST_SEEN_PREFIX = 'flot:orders-last-seen:';
const POLL_INTERVAL_MS = 30_000;

function readLastSeen(siteId: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(LAST_SEEN_PREFIX + siteId);
    if (!raw) return 0;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

export function markOrdersSeen(siteId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LAST_SEEN_PREFIX + siteId, String(Date.now()));
  } catch {
    /* localStorage unavailable */
  }
}

interface OrderRow {
  id: string;
  reference: string;
  customerName: string;
  status: string;
  createdAt: string; // ISO
}

interface UseOrderNotificationsResult {
  /** Count of orders newer than the merchant's last-seen timestamp. */
  newCount: number;
  /** Most-recent order's reference + customer (for the toast). */
  latest: { reference: string; customerName: string } | null;
  /** Trigger an immediate refetch (e.g., after a manual refresh). */
  refresh: () => void;
}

/**
 * Polls /api/orders for a single site and reports the count of orders newer
 * than the last-seen timestamp. Side-effects:
 *   - updates document.title with "(N) Flot Builder" while N > 0
 *   - asks once for browser-notification permission, then fires a native
 *     desktop notification on each NEW order (transitions, not the steady
 *     state — won't spam on every poll)
 *
 * Returns { newCount, latest, refresh }.
 */
export function useOrderNotifications(siteId: string | null): UseOrderNotificationsResult {
  const [newCount, setNewCount] = useState(0);
  const [latest, setLatest] = useState<{ reference: string; customerName: string } | null>(null);

  // Track which order ids we've ALREADY notified on so we don't re-pop the
  // browser notification every poll while the merchant is away.
  const seenIdsRef = useRef<Set<string>>(new Set());
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previousTitleRef = useRef<string | null>(null);
  const permissionAskedRef = useRef(false);

  const fetchOnce = useCallback(async () => {
    if (!siteId) return;
    try {
      const res = await fetch(`/api/orders?siteId=${encodeURIComponent(siteId)}&limit=50`);
      if (!res.ok) return;
      const data = (await res.json()) as { orders: OrderRow[] };
      const lastSeen = readLastSeen(siteId);

      const fresh = data.orders.filter((o) => new Date(o.createdAt).getTime() > lastSeen);
      setNewCount(fresh.length);
      setLatest(fresh[0] ? { reference: fresh[0].reference, customerName: fresh[0].customerName } : null);

      // Fire a browser notification for any NEW (id-novel) order.
      if (typeof window !== 'undefined' && 'Notification' in window) {
        for (const order of fresh) {
          if (seenIdsRef.current.has(order.id)) continue;
          seenIdsRef.current.add(order.id);
          if (Notification.permission === 'granted' && document.visibilityState !== 'visible') {
            try {
              new Notification('New order', {
                body: `${order.reference} from ${order.customerName}`,
                tag: order.id,
              });
            } catch { /* some browsers throw on programmatic Notifications without a user gesture */ }
          }
        }
      }
    } catch {
      /* swallow — we'll try again next poll */
    }
  }, [siteId]);

  // Ask for browser-notification permission once, lazily — only after the
  // dashboard has been open long enough that we've seen at least one poll.
  useEffect(() => {
    if (!siteId) return;
    if (permissionAskedRef.current) return;
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'default') return;
    permissionAskedRef.current = true;
    // Defer the permission prompt slightly so it doesn't fire mid-page-load.
    const t = setTimeout(() => {
      try { Notification.requestPermission(); } catch { /* ignore */ }
    }, 4000);
    return () => clearTimeout(t);
  }, [siteId]);

  // Poll loop + visibilitychange refetch.
  useEffect(() => {
    if (!siteId) return;
    fetchOnce();
    pollTimerRef.current = setInterval(fetchOnce, POLL_INTERVAL_MS);

    function onVisible() {
      if (document.visibilityState === 'visible') fetchOnce();
    }
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [siteId, fetchOnce]);

  // Document title with the badge count.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (previousTitleRef.current === null) {
      previousTitleRef.current = document.title;
    }
    const base = previousTitleRef.current ?? 'Flot Builder';
    document.title = newCount > 0 ? `(${newCount}) ${base}` : base;
    return () => {
      if (previousTitleRef.current) document.title = previousTitleRef.current;
    };
  }, [newCount]);

  return { newCount, latest, refresh: fetchOnce };
}

interface UseAllSitesNotificationsResult {
  /** Map of siteId → count of new orders since last viewed. */
  countsBySite: Record<string, number>;
  refresh: () => void;
}

/**
 * Cross-site variant for the My Sites page. Polls each site one at a time
 * (sequential to keep request load low) and reports per-site counts.
 */
export function useAllSitesOrderNotifications(siteIds: string[]): UseAllSitesNotificationsResult {
  const [countsBySite, setCountsBySite] = useState<Record<string, number>>({});
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const idsKey = siteIds.slice().sort().join(',');

  const fetchAll = useCallback(async () => {
    if (siteIds.length === 0) {
      setCountsBySite({});
      return;
    }
    const next: Record<string, number> = {};
    for (const id of siteIds) {
      try {
        const res = await fetch(`/api/orders?siteId=${encodeURIComponent(id)}&limit=50`);
        if (!res.ok) { next[id] = 0; continue; }
        const data = (await res.json()) as { orders: OrderRow[] };
        const lastSeen = readLastSeen(id);
        next[id] = data.orders.filter((o) => new Date(o.createdAt).getTime() > lastSeen).length;
      } catch {
        next[id] = 0;
      }
    }
    setCountsBySite(next);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  useEffect(() => {
    if (siteIds.length === 0) return;
    fetchAll();
    pollTimerRef.current = setInterval(fetchAll, POLL_INTERVAL_MS);

    function onVisible() {
      if (document.visibilityState === 'visible') fetchAll();
    }
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, fetchAll]);

  return { countsBySite, refresh: fetchAll };
}
