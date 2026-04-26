'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, BedDouble, Minus, Plus, CalendarCheck, BookMarked } from 'lucide-react';
import type { SiteConfig } from '@/lib/types/customization';
import type { Room, OrderItem } from '@/lib/types';
import FlotCheckout from '@/components/checkout/FlotCheckout';
import BookingChoiceModal from '@/components/booking/BookingChoiceModal';
import CustomerDetailsModal from '@/components/booking/CustomerDetailsModal';
import PendingBookingsDrawer from '@/components/booking/PendingBookingsDrawer';
import { useBookingStore, type CustomerDetails } from '@/store/bookingStore';

type FlowStep = 'idle' | 'choice' | 'details-reserve' | 'details-pay';

export default function SiteShopHotel({ config }: { config: SiteConfig }) {
  const rooms = config.hotelContent?.rooms ?? [];
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [nights, setNights] = useState(1);
  const [guests, setGuests] = useState(1);
  const [step, setStep] = useState<FlowStep>('idle');
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [activeNights, setActiveNights] = useState(1);
  const [activeGuests, setActiveGuests] = useState(1);
  const [checkoutItems, setCheckoutItems] = useState<OrderItem[] | null>(null);
  const [payBookingId, setPayBookingId] = useState<string | null>(null);
  const [payDbOrderId, setPayDbOrderId] = useState<string | null>(null);
  const [payDbOrderEmail, setPayDbOrderEmail] = useState<string | null>(null);
  const [activeCustomer, setActiveCustomer] = useState<CustomerDetails | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [reservedJustNow, setReservedJustNow] = useState<string | null>(null);

  const pendingBookings = useBookingStore((s) => s.pendingBookings);
  const addBooking = useBookingStore((s) => s.addBooking);
  const removeBooking = useBookingStore((s) => s.removeBooking);

  const sitePendingBookings = pendingBookings.filter(
    (b) => b.orderItems[0]?.siteSlug === config.slug
  );

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
    setActiveRoom(room);
    setActiveNights(nights);
    setActiveGuests(guests);
    setSelectedRoom(null);
    setStep('choice');
  }

  async function handleReserveOnly(customer: CustomerDetails) {
    if (!activeRoom) return;
    const items = buildOrderItems(activeRoom, activeNights, activeGuests);
    const subtotal = activeRoom.pricePerNight * activeNights;

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteSlug: config.slug,
          status: 'pending',
          customer,
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
            checkIn: '',
            checkOut: '',
            nights: activeNights,
            guests: activeGuests,
            roomId: activeRoom.id,
          },
        }),
      });
      if (!res.ok) throw new Error(`reserve failed: ${res.status}`);
      const data = (await res.json()) as { reference?: string };
      setReservedJustNow(`${activeRoom.name}${data.reference ? ` (${data.reference})` : ''}`);
    } catch (err) {
      console.error('[hotel reserve only]', err);
      setReservedJustNow(`${activeRoom.name} — could not save, please try again.`);
    } finally {
      setStep('idle');
      setActiveRoom(null);
      setTimeout(() => setReservedJustNow(null), 6000);
    }
  }

  function handlePayNow(customer: CustomerDetails) {
    if (!activeRoom) return;
    const items = buildOrderItems(activeRoom, activeNights, activeGuests);
    setCheckoutItems(items);
    setPayDbOrderId(null);
    setPayDbOrderEmail(null);
    setActiveCustomer(customer);
    setPayBookingId(null);
    setStep('idle');
  }

  function handlePayFromDrawer(orderItems: OrderItem[], bookingId: string) {
    setCheckoutItems(orderItems);
    setPayBookingId(bookingId);
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
          {sitePendingBookings.length > 0 && (
            <div className="flex justify-center mb-8">
              <button
                onClick={() => setDrawerOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold uppercase tracking-wider transition-colors"
                style={{ borderColor: accent + '60', color: accent }}
              >
                <BookMarked size={14} />
                My Reservations
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ backgroundColor: accent }}
                >
                  {sitePendingBookings.length}
                </span>
              </button>
            </div>
          )}

          {/* Reserved-confirmation toast */}
          <AnimatePresence>
            {reservedJustNow && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 text-center text-sm"
                style={{ color: accent }}
              >
                Reserved: {reservedJustNow}. Check &quot;My Reservations&quot; to pay when ready.
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
                  setNights(1);
                  setGuests(1);
                }}
              >
                {room.images?.[0] && (
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
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
                        {/* Nights selector */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Nights</span>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setNights(Math.max(1, nights - 1))}
                              className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:border-white/40"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-6 text-center font-semibold">{nights}</span>
                            <button
                              onClick={() => setNights(Math.min(14, nights + 1))}
                              className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:border-white/40"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
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
                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                          <div>
                            <span className="text-xs" style={{ color: config.brand.textColor, opacity: 0.5 }}>Total</span>
                            <p className="text-lg font-bold" style={{ color: config.brand.textColor }}>
                              Le{(room.pricePerNight * nights).toLocaleString()}
                            </p>
                            <p className="text-xs" style={{ color: config.brand.textColor, opacity: 0.5 }}>
                              ${((room.pricePerNight * nights) / 24).toFixed(2)}
                            </p>
                          </div>
                          <button
                            onClick={() => openChoice(room)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-transform hover:scale-105"
                            style={{ backgroundColor: accent }}
                          >
                            <CalendarCheck size={16} />
                            Book Now
                          </button>
                        </div>
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
            roomName={activeRoom.name}
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
                const res = await fetch('/api/orders', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    siteSlug: config.slug,
                    status: 'confirmed',
                    customer: activeCustomer,
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
                      checkIn: '',
                      checkOut: '',
                      nights: activeNights,
                      guests: activeGuests,
                      roomId: activeRoom.id,
                    },
                  }),
                });
                const data = res.ok ? ((await res.json()) as { reference?: string }) : {};
                setCheckoutItems(null);
                setActiveRoom(null);
                setActiveCustomer(null);
                setNights(1);
                setGuests(1);
                return { reference: data.reference };
              } catch (err) {
                console.error('[hotel reserve & pay]', err);
                setCheckoutItems(null);
                setActiveCustomer(null);
                return;
              }
            }}
            onError={() => {}}
            onClose={() => {
              setCheckoutItems(null);
              setPayDbOrderId(null);
              setPayDbOrderEmail(null);
              setPayBookingId(null);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
