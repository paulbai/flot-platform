'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, BedDouble, Minus, Plus, CalendarCheck, BookMarked, Calendar } from 'lucide-react';
import type { SiteConfig } from '@/lib/types/customization';
import type { Room, OrderItem } from '@/lib/types';
import FlotCheckout from '@/components/checkout/FlotCheckout';
import BookingChoiceModal from '@/components/booking/BookingChoiceModal';
import CustomerDetailsModal from '@/components/booking/CustomerDetailsModal';
import PendingBookingsDrawer from '@/components/booking/PendingBookingsDrawer';
import type { CustomerDetails } from '@/lib/orders/customer';
import { postOrder } from '@/lib/orders/post';

type FlowStep = 'idle' | 'choice' | 'details-reserve' | 'details-pay';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function nightsBetween(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  if (!Number.isFinite(ms) || ms <= 0) return 0;
  return Math.max(1, Math.round(ms / 86400000));
}

export default function SiteShopHotel({ config }: { config: SiteConfig }) {
  const rooms = config.hotelContent?.rooms ?? [];
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [step, setStep] = useState<FlowStep>('idle');
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [activeCheckIn, setActiveCheckIn] = useState('');
  const [activeCheckOut, setActiveCheckOut] = useState('');
  const [activeNights, setActiveNights] = useState(1);
  const [activeGuests, setActiveGuests] = useState(1);
  const [checkoutItems, setCheckoutItems] = useState<OrderItem[] | null>(null);
  const [payDbOrderId, setPayDbOrderId] = useState<string | null>(null);
  const [payDbOrderEmail, setPayDbOrderEmail] = useState<string | null>(null);
  const [activeCustomer, setActiveCustomer] = useState<CustomerDetails | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [reservedJustNow, setReservedJustNow] = useState<{ name: string; reference?: string; error?: boolean; reason?: string } | null>(null);
  // Optimistic local count of reservations the buyer has just made on this device.
  // The drawer fetches the authoritative list on open — no eager pre-fetch from the
  // page (that was burning the lookup rate-limit bucket on every drawer toggle).
  const [pendingCount, setPendingCount] = useState(0);

  const accent = config.brand.accentColor;

  if (rooms.length === 0) return null;

  function buildOrderItems(room: Room, n: number, g: number): OrderItem[] {
    return [
      {
        id: `${config.slug}-room-${room.id}-${Date.now()}`,
        name: `${room.name} (${n} night${n > 1 ? 's' : ''})`,
        description: `${g} guest${g > 1 ? 's' : ''} · ${room.view || room.size}`,
        quantity: 1,
        unitPrice: room.pricePerNight * n,
        image: room.images?.[0],
        vertical: 'hotel',
        siteSlug: config.slug,
      },
    ];
  }

  function openChoice(room: Room) {
    const computedNights = nightsBetween(checkIn, checkOut);
    if (!checkIn || !checkOut || computedNights < 1) return;
    setActiveRoom(room);
    setActiveCheckIn(checkIn);
    setActiveCheckOut(checkOut);
    setActiveNights(computedNights);
    setActiveGuests(guests);
    setSelectedRoom(null);
    setStep('choice');
  }

  async function handleReserveOnly(customer: CustomerDetails) {
    if (!activeRoom) return;
    const items = buildOrderItems(activeRoom, activeNights, activeGuests);
    const subtotal = activeRoom.pricePerNight * activeNights;

    try {
      // Strip non-digit/+ from phone to satisfy server regex
      // (buyers naturally type "+232 76 000 000" with spaces).
      const normalizedCustomer: CustomerDetails = {
        ...customer,
        name: customer.name.trim(),
        email: customer.email.trim().toLowerCase(),
        phone: customer.phone.replace(/[^\d+]/g, ''),
      };
      const out = await postOrder({
        siteSlug: config.slug,
        status: 'pending',
        customer: normalizedCustomer,
        items: items.map((it) => ({
          name: it.name,
          description: it.description,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          imageUrl: it.image,
          variant: it.variant,
        })),
        subtotal,
        total: subtotal,
        currency: 'Le',
        details: {
          checkIn: activeCheckIn,
          checkOut: activeCheckOut,
          nights: activeNights,
          guests: activeGuests,
          roomId: activeRoom.id,
        },
      });
      if (!out.ok) throw new Error(out.error || 'reserve failed');
      setReservedJustNow({ name: activeRoom.name, reference: out.reference });
      setPendingCount((c) => c + 1);
      // Pre-seed the lookup email so when the buyer opens "My Reservations"
      // we don't have to ask them to type it again.
      try {
        sessionStorage.setItem('flot:lookup-email', normalizedCustomer.email);
      } catch { /* sessionStorage unavailable — fine */ }
      setStep('idle');
      setActiveRoom(null);
    } catch (err) {
      console.error('[hotel reserve only]', err);
      // Surface the specific server reason if we got one (e.g., bad phone format)
      // so the buyer can self-correct instead of seeing a generic "try again".
      const reason = err instanceof Error ? err.message : '';
      setReservedJustNow({
        name: activeRoom.name,
        error: true,
        reason: reason && reason !== 'reserve failed' ? reason : undefined,
      });
      setStep('idle');
      setActiveRoom(null);
    }
  }

  function handlePayNow(customer: CustomerDetails) {
    if (!activeRoom) return;
    const items = buildOrderItems(activeRoom, activeNights, activeGuests);
    setCheckoutItems(items);
    setPayDbOrderId(null);
    setPayDbOrderEmail(null);
    setActiveCustomer(customer);
    setStep('idle');
  }

  function handlePayFromDrawer(args: { orderId: string; customerEmail: string; orderItems: OrderItem[] }) {
    setCheckoutItems(args.orderItems);
    setPayDbOrderId(args.orderId);
    setPayDbOrderEmail(args.customerEmail);
    setDrawerOpen(false);
  }

  return (
    <>
      <section
        id="shop"
        className="py-20 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: config.brand.backgroundColor, color: config.brand.textColor }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-6">
            <span
              className="text-sm font-semibold uppercase tracking-[0.25em]"
              style={{ color: accent }}
            >
              Accommodation
            </span>
            <h2
              className="text-3xl sm:text-4xl font-bold mt-3"
              style={{ fontFamily: 'var(--heading-font)' }}
            >
              Our Rooms
            </h2>
          </div>

          {/* My Reservations button */}
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold uppercase tracking-wider transition-colors"
              style={{ borderColor: accent + '60', color: accent }}
            >
              <BookMarked size={14} />
              My Reservations
              {pendingCount > 0 && (
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ backgroundColor: accent }}
                >
                  {pendingCount}
                </span>
              )}
            </button>
          </div>

          {/* Reserved-confirmation banner — persistent until dismissed so the
              buyer sees the reference and any error clearly. */}
          <AnimatePresence>
            {reservedJustNow && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 mx-auto max-w-xl rounded-lg border px-4 py-3 flex items-start gap-3"
                style={{
                  borderColor: reservedJustNow.error ? '#ef4444' : accent + '60',
                  backgroundColor: reservedJustNow.error ? '#ef444410' : accent + '10',
                  color: reservedJustNow.error ? '#fca5a5' : accent,
                }}
              >
                <div className="flex-1 text-sm">
                  {reservedJustNow.error ? (
                    <>
                      <strong>Couldn&apos;t save your reservation for {reservedJustNow.name}.</strong>{' '}
                      {reservedJustNow.reason
                        ? <>{reservedJustNow.reason}.</>
                        : <>Please check your connection and try again.</>}
                    </>
                  ) : (
                    <>
                      <strong>Reserved: {reservedJustNow.name}.</strong>{' '}
                      {reservedJustNow.reference && (
                        <>
                          Reference: <span className="font-mono">{reservedJustNow.reference}</span>.{' '}
                        </>
                      )}
                      Click &quot;My Reservations&quot; above to view or pay.
                    </>
                  )}
                </div>
                <button
                  onClick={() => setReservedJustNow(null)}
                  aria-label="Dismiss"
                  className="opacity-60 hover:opacity-100"
                >
                  ×
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <motion.div
                key={room.id}
                layout
                className="group rounded-xl overflow-hidden border border-white/10 cursor-pointer transition-all hover:border-white/20"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                onClick={() => {
                  setSelectedRoom(selectedRoom?.id === room.id ? null : room);
                  setCheckIn('');
                  setCheckOut('');
                  setGuests(1);
                }}
              >
                {room.images?.[0] && (
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img loading="lazy" decoding="async"
                      src={room.images[0]}
                      alt={room.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <span className="text-white text-sm font-bold bg-black/40 px-2 py-1 rounded">
                        Le{room.pricePerNight.toLocaleString()}
                        <span className="text-white/80 text-xs font-normal"> / night</span>
                      </span>
                    </div>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3
                      className="text-lg font-semibold"
                      style={{ fontFamily: 'var(--heading-font)', color: config.brand.textColor }}
                    >
                      {room.name}
                    </h3>
                    <div className="text-right">
                      <span className="text-base font-bold" style={{ color: accent }}>
                        Le{room.pricePerNight.toLocaleString()}
                      </span>
                      <p className="text-xs" style={{ color: config.brand.textColor, opacity: 0.5 }}>
                        ${(room.pricePerNight / 24).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm" style={{ color: config.brand.textColor, opacity: 0.7 }}>
                    <span className="flex items-center gap-1">
                      <Users size={14} /> Up to {room.maxGuests} guests
                    </span>
                    <span className="flex items-center gap-1">
                      <BedDouble size={14} /> {room.view || room.size}
                    </span>
                  </div>
                  {room.description && (
                    <p className="text-sm mt-2 line-clamp-2" style={{ color: config.brand.textColor, opacity: 0.6 }}>
                      {room.description}
                    </p>
                  )}
                </div>

                {/* Expanded booking panel */}
                <AnimatePresence>
                  {selectedRoom?.id === room.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="px-4 pb-4 border-t border-white/10 pt-4 space-y-4">
                        {/* Date pickers — required */}
                        <div className="grid grid-cols-2 gap-3">
                          <label className="flex flex-col gap-1.5">
                            <span className="text-[11px] uppercase tracking-wider opacity-60 flex items-center gap-1">
                              <Calendar size={10} /> Check-in <span style={{ color: accent }}>*</span>
                            </span>
                            <input
                              type="date"
                              required
                              value={checkIn}
                              min={todayISO()}
                              onChange={(e) => {
                                const v = e.target.value;
                                setCheckIn(v);
                                // Bump check-out to be after check-in if invalid
                                if (checkOut && v && new Date(checkOut) <= new Date(v)) {
                                  setCheckOut('');
                                }
                              }}
                              className="bg-white/5 border border-white/15 rounded-md px-2.5 py-2 text-sm focus:outline-none focus:border-white/40 [color-scheme:dark]"
                            />
                          </label>
                          <label className="flex flex-col gap-1.5">
                            <span className="text-[11px] uppercase tracking-wider opacity-60 flex items-center gap-1">
                              <Calendar size={10} /> Check-out <span style={{ color: accent }}>*</span>
                            </span>
                            <input
                              type="date"
                              required
                              value={checkOut}
                              min={checkIn || todayISO()}
                              disabled={!checkIn}
                              onChange={(e) => setCheckOut(e.target.value)}
                              className="bg-white/5 border border-white/15 rounded-md px-2.5 py-2 text-sm focus:outline-none focus:border-white/40 disabled:opacity-40 [color-scheme:dark]"
                            />
                          </label>
                        </div>

                        {/* Guests selector */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Guests</span>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setGuests(Math.max(1, guests - 1))}
                              className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:border-white/40"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-6 text-center font-semibold">{guests}</span>
                            <button
                              onClick={() => setGuests(Math.min(room.maxGuests, guests + 1))}
                              className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:border-white/40"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Total + Book Now */}
                        {(() => {
                          const computedNights = nightsBetween(checkIn, checkOut);
                          const datesValid = computedNights >= 1;
                          const total = room.pricePerNight * Math.max(1, computedNights);
                          return (
                            <div className="flex items-center justify-between pt-2 border-t border-white/10">
                              <div>
                                <span className="text-xs" style={{ color: config.brand.textColor, opacity: 0.5 }}>
                                  {datesValid ? `${computedNights} night${computedNights > 1 ? 's' : ''} · Total` : 'Pick dates to see total'}
                                </span>
                                <p className="text-lg font-bold" style={{ color: config.brand.textColor }}>
                                  Le{total.toLocaleString()}
                                </p>
                                <p className="text-xs" style={{ color: config.brand.textColor, opacity: 0.5 }}>
                                  ${(total / 24).toFixed(2)}
                                </p>
                              </div>
                              <button
                                onClick={() => openChoice(room)}
                                disabled={!datesValid}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                                style={{ backgroundColor: accent }}
                                title={datesValid ? 'Book this room' : 'Pick check-in and check-out dates first'}
                              >
                                <CalendarCheck size={16} />
                                Book Now
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Choice modal */}
      <AnimatePresence>
        {step === 'choice' && activeRoom && (
          <BookingChoiceModal
            roomName={`${activeRoom.name} · ${activeCheckIn} → ${activeCheckOut} (${activeNights} night${activeNights > 1 ? 's' : ''})`}
            total={`Le${(activeRoom.pricePerNight * activeNights).toLocaleString()}`}
            accentColor={accent}
            onReserveOnly={() => setStep('details-reserve')}
            onPayNow={() => setStep('details-pay')}
            onClose={() => {
              setStep('idle');
              setActiveRoom(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Customer details — Reserve Only */}
      <AnimatePresence>
        {step === 'details-reserve' && (
          <CustomerDetailsModal
            title="Your Details"
            subtitle="We'll hold this room for you."
            accentColor={accent}
            onSubmit={handleReserveOnly}
            onClose={() => setStep('choice')}
          />
        )}
      </AnimatePresence>

      {/* Customer details — Pay Now */}
      <AnimatePresence>
        {step === 'details-pay' && (
          <CustomerDetailsModal
            title="Your Details"
            subtitle="Almost done — complete payment to confirm."
            accentColor={accent}
            onSubmit={handlePayNow}
            onClose={() => setStep('choice')}
          />
        )}
      </AnimatePresence>

      {/* Pending bookings drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <PendingBookingsDrawer
            accentColor={accent}
            brandName={config.brand.businessName}
            siteSlug={config.slug}
            onPayNow={handlePayFromDrawer}
            onClose={() => setDrawerOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Checkout */}
      <AnimatePresence>
        {checkoutItems && checkoutItems.length > 0 && (
          <FlotCheckout
            brandName={config.brand.businessName}
            accentColor={accent}
            orderSummary={checkoutItems}
            currency="Le"
            vertical="hotel"
            onSuccess={async (result) => {
              const token = (result as { token?: string }).token ?? null;

              // Path A: paying-later for an existing pending order — PATCH and include payment fields.
              if (payDbOrderId) {
                try {
                  const res = await fetch(`/api/orders/${payDbOrderId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      status: 'confirmed',
                      paymentMethod: 'flot',
                      paymentRef: token,
                    }),
                  });
                  if (!res.ok) throw new Error(`PATCH failed: ${res.status}`);
                  // Re-fetch the order so we can show its reference on the success screen.
                  const detailRes = await fetch(`/api/orders/lookup?siteSlug=${config.slug}&email=${encodeURIComponent(payDbOrderEmail ?? '')}`);
                  const detail = detailRes.ok ? await detailRes.json() : null;
                  const matched = detail?.orders?.find((o: { id: string }) => o.id === payDbOrderId);
                  setCheckoutItems(null);
                  setPayDbOrderId(null);
                  setPayDbOrderEmail(null);
                  return { reference: matched?.reference };
                } catch (err) {
                  console.error('[hotel pay-later]', err);
                  setCheckoutItems(null);
                  setPayDbOrderId(null);
                  setPayDbOrderEmail(null);
                  return;
                }
              }

              // Path B: Reserve & Pay (new buyer-pays flow) — POST with the customer details
              // captured from CustomerDetailsModal in handlePayNow.
              if (!activeRoom || !activeCustomer) {
                setCheckoutItems(null);
                return;
              }
              try {
                const out = await postOrder({
                  siteSlug: config.slug,
                  status: 'confirmed',
                  customer: {
                    ...activeCustomer,
                    name: activeCustomer.name.trim(),
                    email: activeCustomer.email.trim().toLowerCase(),
                    phone: activeCustomer.phone.replace(/[^\d+]/g, ''),
                  },
                  items: checkoutItems.map((it) => ({
                    name: it.name,
                    description: it.description,
                    quantity: it.quantity,
                    unitPrice: it.unitPrice,
                    imageUrl: it.image,
                    variant: it.variant,
                  })),
                  subtotal: activeRoom.pricePerNight * activeNights,
                  total: activeRoom.pricePerNight * activeNights,
                  currency: 'Le',
                  paymentMethod: 'flot',
                  paymentRef: token,
                  details: {
                    checkIn: activeCheckIn,
                    checkOut: activeCheckOut,
                    nights: activeNights,
                    guests: activeGuests,
                    roomId: activeRoom.id,
                  },
                });
                if (!out.ok) throw new Error(out.error || 'order persistence failed');
                setCheckoutItems(null);
                setActiveRoom(null);
                setActiveCustomer(null);
                setCheckIn('');
                setCheckOut('');
                setGuests(1);
                return { reference: out.reference };
              } catch (err) {
                console.error('[hotel reserve & pay]', err);
                setCheckoutItems(null);
                setActiveCustomer(null);
                throw err; // bubble to FlotCheckout so it shows the failure UI
              }
            }}
            onError={() => {}}
            onClose={() => {
              setCheckoutItems(null);
              setPayDbOrderId(null);
              setPayDbOrderEmail(null);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
