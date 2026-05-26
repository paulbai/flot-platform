'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CalendarDays, Users, ArrowRight, Trash2 } from 'lucide-react';
import type { OrderItem } from '@/lib/types';

const SESSION_EMAIL_KEY = 'flot:lookup-email';

interface BackendOrder {
  id: string;
  reference: string;
  vertical: string;
  status: 'pending' | 'confirmed' | 'fulfilled' | 'cancelled';
  total: number;
  currency: string;
  details: { roomId?: string; nights?: number; guests?: number; checkIn?: string; checkOut?: string };
  items: { id: string; name: string; imageUrl?: string | null; quantity: number; unitPrice: number; description?: string | null; variant?: string | null }[];
  createdAt: string;
}

interface PendingBookingsDrawerProps {
  accentColor: string;
  brandName: string;
  siteSlug: string;
  onPayNow: (args: {
    orderId: string;
    customerEmail: string;
    orderItems: OrderItem[];
  }) => void;
  onClose: () => void;
}

export default function PendingBookingsDrawer({
  accentColor,
  brandName,
  siteSlug,
  onPayNow,
  onClose,
}: PendingBookingsDrawerProps) {
  const [email, setEmail] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAt, setRetryAt] = useState<number | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  // Restore email from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_EMAIL_KEY);
    if (saved) setEmail(saved);
  }, []);

  // Fetch orders whenever email changes (or the user clicks retry).
  useEffect(() => {
    if (!email) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/orders/lookup?siteSlug=${encodeURIComponent(siteSlug)}&email=${encodeURIComponent(email!)}`,
        );
        if (!res.ok) {
          if (res.status === 429) {
            // Schedule a retry hint ~30s out (rate-limit window is 60s).
            setRetryAt(Date.now() + 30_000);
            throw new Error('Too many lookups right now — try again in a moment.');
          }
          throw new Error('Lookup failed — check your connection.');
        }
        const data = (await res.json()) as { orders: BackendOrder[] };
        if (cancelled) return;
        // Show pending and confirmed bookings (the buyer's "live" reservations).
        setOrders(data.orders.filter((o) => o.status === 'pending' || o.status === 'confirmed'));
        setRetryAt(null);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [email, siteSlug, refreshTick]);

  function retry() {
    setRefreshTick((t) => t + 1);
  }

  function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email');
      return;
    }
    sessionStorage.setItem(SESSION_EMAIL_KEY, trimmed);
    setEmail(trimmed);
  }

  async function cancelBooking(orderId: string) {
    if (!confirm('Cancel this reservation?')) return;
    try {
      // The buyer can't directly hit PATCH (it's auth-merchant-only). For v1 we just
      // remove the row from the local view and trust the merchant to cancel server-side
      // when contacted. (A buyer-cancel endpoint can be added later — out of v1 scope.)
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch {/* swallow */}
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          // Explicit dark palette + colorScheme:dark — same rationale as the
          // other modals: don't inherit brand text-color washout.
          style={{ backgroundColor: '#0f0f10', borderColor: '#27272a', color: '#ffffff', colorScheme: 'dark' }}
          className="absolute right-0 top-0 bottom-0 w-full max-w-md border-l flex flex-col safe-bottom"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
            <div>
              <h2 className="text-lg font-semibold text-white">My Reservations</h2>
              <p className="text-xs text-zinc-400 mt-0.5">{brandName}</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors" aria-label="Close">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!email ? (
              <form onSubmit={submitEmail} className="flex flex-col gap-3 mt-8">
                <p className="text-sm text-white">
                  Enter the email you used when reserving to see your bookings:
                </p>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="you@example.com"
                  className="px-3 py-2.5 rounded-md bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-500"
                />
                {error && <p className="text-xs text-red-400">{error}</p>}
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md font-semibold text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  Show my reservations
                </button>
              </form>
            ) : loading ? (
              <p className="text-sm text-[var(--fog)] text-center mt-8">Loading…</p>
            ) : error ? (
              <div className="flex flex-col items-center gap-3 mt-8 px-2 text-center">
                <p className="text-sm text-red-400">{error}</p>
                <button
                  onClick={retry}
                  className="px-4 py-2 rounded-md text-sm font-semibold border border-white/20 hover:bg-white/5 transition-colors"
                >
                  {retryAt && retryAt > Date.now() ? 'Try again' : 'Retry'}
                </button>
                <button
                  onClick={() => { sessionStorage.removeItem(SESSION_EMAIL_KEY); setEmail(null); setError(null); }}
                  className="text-xs underline opacity-60 hover:opacity-100"
                >
                  Use a different email
                </button>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <CalendarDays size={32} className="mb-3" style={{ color: accentColor, opacity: 0.4 }} />
                <p className="text-[var(--text-sm)] text-[var(--fog)] font-body">No reservations for this email.</p>
                <button
                  onClick={() => { sessionStorage.removeItem(SESSION_EMAIL_KEY); setEmail(null); }}
                  className="text-xs underline mt-3 opacity-60 hover:opacity-100"
                >
                  Try a different email
                </button>
              </div>
            ) : (
              orders.map((booking) => {
                const firstItem = booking.items[0];
                const orderItems: OrderItem[] = booking.items.map((it) => ({
                  id: it.id,
                  name: it.name,
                  description: it.description ?? undefined,
                  quantity: it.quantity,
                  unitPrice: it.unitPrice,
                  image: it.imageUrl ?? undefined,
                  variant: it.variant ?? undefined,
                  vertical: 'hotel',
                  siteSlug,
                }));
                return (
                  <div key={booking.id} className="bg-[var(--stone)] border border-[var(--ash)] rounded-sm overflow-hidden">
                    {firstItem?.imageUrl && (
                      <div className="relative aspect-[16/7] overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={firstItem.imageUrl} alt={firstItem.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display text-[var(--text-md)] text-[var(--paper)] font-medium">{firstItem?.name ?? 'Reservation'}</h3>
                        <span
                          className="flex-shrink-0 text-[9px] font-body font-semibold uppercase tracking-wider px-2 py-0.5 rounded border"
                          style={{ color: accentColor, borderColor: accentColor + '50' }}
                        >
                          {booking.status === 'pending' ? 'Pending' : 'Confirmed'}
                        </span>
                      </div>
                      <p className="font-mono text-xs opacity-60">{booking.reference}</p>
                      {(booking.details?.checkIn || booking.details?.checkOut) && (
                        <div className="flex items-center gap-2 text-[var(--text-xs)] text-[var(--fog)] font-body">
                          <CalendarDays size={12} style={{ color: accentColor }} />
                          {booking.details.checkIn || '—'} → {booking.details.checkOut || '—'}
                          {booking.details.nights ? ` (${booking.details.nights} nights)` : ''}
                        </div>
                      )}
                      {booking.details?.guests !== undefined && (
                        <div className="flex items-center gap-2 text-[var(--text-xs)] text-[var(--fog)] font-body">
                          <Users size={12} style={{ color: accentColor }} />
                          {booking.details.guests} {booking.details.guests === 1 ? 'guest' : 'guests'}
                        </div>
                      )}
                      <div className="flex items-end justify-between">
                        <p className="text-sm opacity-70">Total due</p>
                        <p className="font-display text-[var(--text-lg)] font-bold" style={{ color: accentColor }}>
                          {booking.currency}{booking.total.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => cancelBooking(booking.id)}
                          className="flex items-center justify-center w-10 h-10 rounded-sm border border-[var(--ash)] text-[var(--fog)] hover:text-[var(--error)] hover:border-[var(--error)] transition-colors cursor-pointer"
                          aria-label="Hide reservation"
                        >
                          <Trash2 size={14} />
                        </button>
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => onPayNow({
                              orderId: booking.id,
                              customerEmail: email,
                              orderItems,
                            })}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-sm text-[var(--text-xs)] font-body font-semibold uppercase tracking-wider transition-opacity hover:opacity-90 cursor-pointer"
                            style={{ backgroundColor: accentColor, color: '#000' }}
                          >
                            Pay Now <ArrowRight size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
