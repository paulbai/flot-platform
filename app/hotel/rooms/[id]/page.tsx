'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ArrowLeft, Minus, Plus, Check as CheckIcon, CheckCircle } from 'lucide-react';
import NavBar from '@/components/layout/NavBar';
import Button from '@/components/ui/Button';
import BookingChoiceModal from '@/components/booking/BookingChoiceModal';
import CustomerDetailsModal from '@/components/booking/CustomerDetailsModal';
import { useHotelData } from '@/lib/hooks/useCustomizedData';
import { useBookingStore } from '@/store/bookingStore';
import { leonesOf } from '@/lib/currency';
import type { CustomerDetails } from '@/store/bookingStore';
import type { ExtraField, OrderItem } from '@/lib/types';

const FlotCheckout = dynamic(() => import('@/components/checkout/FlotCheckout'), { ssr: false });

const hotelExtraFields: ExtraField[] = [
  {
    name: 'arrivalTime',
    label: 'Estimated Arrival Time',
    type: 'select',
    required: false,
    options: ['12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM', '8:00 PM', '10:00 PM'],
  },
  {
    name: 'specialRequests',
    label: 'Special Requests',
    type: 'textarea',
    required: false,
    placeholder: 'Any special requirements for your stay...',
  },
  {
    name: 'earlyCheckin',
    label: 'Early Check-in',
    type: 'checkbox',
    required: false,
    placeholder: 'Early check-in (+$75)',
  },
];

type BookingStep = 'idle' | 'choice' | 'details-reserve' | 'details-pay' | 'checkout' | 'success';

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { rooms, brand } = useHotelData();
  const room = rooms.find((r) => r.id === params.id);
  const addBooking = useBookingStore((s) => s.addBooking);

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [nights, setNights] = useState(3);
  const [guests, setGuests] = useState(2);
  const [step, setStep] = useState<BookingStep>('idle');
  const [pendingCustomer, setPendingCustomer] = useState<CustomerDetails | null>(null);

  const priceBreakdown = useMemo(() => {
    if (!room) return { nightly: 0, subtotal: 0, resort: 45, tax: 0, total: 0 };
    const subtotal = room.pricePerNight * nights;
    const resort = 45;
    const tax = subtotal * 0.12;
    return { nightly: room.pricePerNight, subtotal, resort, tax, total: subtotal + resort + tax };
  }, [room, nights]);

  if (!room) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: brand.backgroundColor }}>
        <p className="text-[var(--text-md)] text-[var(--fog)]">Room not found.</p>
      </main>
    );
  }

  const orderItems: OrderItem[] = [
    {
      id: room.id,
      name: `${room.name} - ${nights} nights`,
      description: `${room.view} · ${room.size}`,
      quantity: 1,
      unitPrice: priceBreakdown.subtotal,
      image: room.images[0],
      vertical: 'hotel',
    },
  ];

  const handleReserveOnly = (customer: CustomerDetails) => {
    addBooking({
      roomId: room.id,
      roomName: room.name,
      roomImage: room.images[0],
      customer,
      checkIn,
      checkOut,
      nights,
      guests,
      total: priceBreakdown.total,
      orderItems,
    });
    setStep('success');
  };

  const handlePayNow = (customer: CustomerDetails) => {
    setPendingCustomer(customer);
    setStep('checkout');
  };

  return (
    <main id="main-content" className="min-h-screen" style={{ backgroundColor: brand.backgroundColor }}>
      <NavBar />

      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto pb-24">
        {/* Back */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => router.push('/hotel')}
          className="flex items-center gap-2 text-[var(--text-xs)] font-body font-semibold uppercase tracking-[0.15em] text-[var(--fog)] mb-8 hover:text-[var(--paper)] transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          Back to Rooms
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Image gallery — 2/3 width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-2"
          >
            <div className="relative aspect-[16/10] rounded-sm overflow-hidden mb-4">
              <Image
                src={room.images[0]}
                alt={room.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority
              />
            </div>

            {/* Room specs grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {[
                { label: 'Size', value: room.size },
                { label: 'View', value: room.view },
                { label: 'Max Guests', value: `${room.maxGuests}` },
                { label: 'Per Night', value: `$${room.pricePerNight} (${leonesOf(room.pricePerNight)})` },
              ].map((spec) => (
                <div key={spec.label} className="bg-[var(--ink)] border border-[var(--ash)]/50 rounded-sm p-4">
                  <p className="text-[var(--text-xs)] font-body uppercase tracking-wider text-[var(--fog)] mb-1">{spec.label}</p>
                  <p className="font-display text-[var(--text-md)] text-[var(--paper)]">{spec.value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {room.description && (
              <div className="mb-8">
                <h2 className="text-[var(--text-xs)] font-body font-semibold uppercase tracking-[0.15em] mb-3" style={{ color: brand.accentColor }}>
                  About this Room
                </h2>
                <p className="text-[var(--text-sm)] text-[var(--cloud)] leading-relaxed font-body">
                  {room.description}
                </p>
              </div>
            )}

            {/* Amenities */}
            <div>
              <h2 className="text-[var(--text-xs)] font-body font-semibold uppercase tracking-[0.15em] mb-3" style={{ color: brand.accentColor }}>
                Amenities
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {room.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2 text-[var(--text-sm)] text-[var(--cloud)]">
                    <CheckIcon size={14} style={{ color: brand.accentColor }} />
                    {amenity}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Booking widget — sticky sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <div className="bg-[var(--ink)] border border-[var(--ash)]/50 rounded-sm p-6">
              <h2 className="font-display text-[var(--text-lg)] text-[var(--paper)] font-medium mb-1">
                {room.name}
              </h2>
              <p className="font-display text-[var(--text-xl)] mb-1" style={{ color: brand.accentColor }}>
                ${room.pricePerNight}<span className="text-[var(--text-xs)] text-[var(--fog)] font-body"> / night</span>
              </p>
              <p className="text-[var(--text-xs)] text-[var(--fog)] font-mono mb-6">{leonesOf(room.pricePerNight)} / night</p>

              <div className="space-y-4 mb-6">
                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[var(--text-xs)] font-body text-[var(--fog)] mb-1.5 uppercase tracking-wider">Check-in</label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full bg-[var(--stone)] border border-[var(--ash)] rounded-sm px-3 py-2.5 text-[var(--text-sm)] font-body text-[var(--paper)] focus:outline-none focus:border-[var(--hotel)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--text-xs)] font-body text-[var(--fog)] mb-1.5 uppercase tracking-wider">Check-out</label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full bg-[var(--stone)] border border-[var(--ash)] rounded-sm px-3 py-2.5 text-[var(--text-sm)] font-body text-[var(--paper)] focus:outline-none focus:border-[var(--hotel)] transition-colors"
                    />
                  </div>
                </div>

                {/* Nights */}
                <div>
                  <label className="block text-[var(--text-xs)] font-body text-[var(--fog)] mb-1.5 uppercase tracking-wider">Nights</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setNights(Math.max(1, nights - 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-sm bg-[var(--stone)] border border-[var(--ash)] text-[var(--fog)] hover:text-[var(--paper)] transition-colors cursor-pointer"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="font-mono text-[var(--text-sm)] text-[var(--paper)] w-8 text-center">{nights}</span>
                    <button
                      onClick={() => setNights(nights + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-sm bg-[var(--stone)] border border-[var(--ash)] text-[var(--fog)] hover:text-[var(--paper)] transition-colors cursor-pointer"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-[var(--text-xs)] font-body text-[var(--fog)] mb-1.5 uppercase tracking-wider">Guests</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-sm bg-[var(--stone)] border border-[var(--ash)] text-[var(--fog)] hover:text-[var(--paper)] transition-colors cursor-pointer"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="font-mono text-[var(--text-sm)] text-[var(--paper)] w-8 text-center">{guests}</span>
                    <button
                      onClick={() => setGuests(Math.min(room.maxGuests, guests + 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-sm bg-[var(--stone)] border border-[var(--ash)] text-[var(--fog)] hover:text-[var(--paper)] transition-colors cursor-pointer"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="border-t border-[var(--ash)] pt-4 mb-6 space-y-2">
                <div className="flex justify-between text-[var(--text-sm)]">
                  <span className="text-[var(--fog)]">${room.pricePerNight} × {nights} nights</span>
                  <span className="font-display text-[var(--paper)]">${priceBreakdown.subtotal.toFixed(2)} <span className="text-[var(--fog)] font-mono text-[var(--text-xs)]">({leonesOf(priceBreakdown.subtotal)})</span></span>
                </div>
                <div className="flex justify-between text-[var(--text-sm)]">
                  <span className="text-[var(--fog)]">Resort fee</span>
                  <span className="font-display text-[var(--paper)]">${priceBreakdown.resort.toFixed(2)} <span className="text-[var(--fog)] font-mono text-[var(--text-xs)]">({leonesOf(priceBreakdown.resort)})</span></span>
                </div>
                <div className="flex justify-between text-[var(--text-sm)]">
                  <span className="text-[var(--fog)]">Taxes (12%)</span>
                  <span className="font-display text-[var(--paper)]">${priceBreakdown.tax.toFixed(2)} <span className="text-[var(--fog)] font-mono text-[var(--text-xs)]">({leonesOf(priceBreakdown.tax)})</span></span>
                </div>
                <div className="flex justify-between text-[var(--text-md)] pt-2 border-t border-[var(--ash)]">
                  <span className="font-body font-semibold text-[var(--paper)]">Total</span>
                  <span className="font-display font-bold" style={{ color: brand.accentColor }}>
                    ${priceBreakdown.total.toFixed(2)} <span className="text-[var(--fog)] font-mono text-[var(--text-sm)]">({leonesOf(priceBreakdown.total)})</span>
                  </span>
                </div>
              </div>

              {/* Success state */}
              <AnimatePresence mode="wait">
                {step === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center text-center py-4"
                  >
                    <CheckCircle size={32} className="mb-3" style={{ color: brand.accentColor }} />
                    <p className="font-display text-[var(--text-md)] text-[var(--paper)] font-medium mb-1">
                      Room Reserved!
                    </p>
                    <p className="text-[var(--text-xs)] text-[var(--fog)] font-body mb-4">
                      Your reservation is pending. Check &quot;My Reservations&quot; to pay when ready.
                    </p>
                    <button
                      onClick={() => setStep('idle')}
                      className="text-[var(--text-xs)] font-body underline underline-offset-4 cursor-pointer"
                      style={{ color: brand.accentColor }}
                    >
                      Reserve Another Room
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Button
                      variant="accent"
                      size="lg"
                      accentColor={brand.accentColor}
                      className="w-full"
                      onClick={() => setStep('choice')}
                      disabled={!room.available}
                    >
                      Reserve Now
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Booking Choice Modal */}
      <AnimatePresence>
        {step === 'choice' && (
          <BookingChoiceModal
            roomName={room.name}
            total={`$${priceBreakdown.total.toFixed(2)}`}
            accentColor={brand.accentColor}
            onReserveOnly={() => setStep('details-reserve')}
            onPayNow={() => setStep('details-pay')}
            onClose={() => setStep('idle')}
          />
        )}
      </AnimatePresence>

      {/* Customer Details — Reserve Only */}
      <AnimatePresence>
        {step === 'details-reserve' && (
          <CustomerDetailsModal
            title="Your Details"
            subtitle="We'll hold this room for you."
            accentColor={brand.accentColor}
            onSubmit={handleReserveOnly}
            onClose={() => setStep('choice')}
          />
        )}
      </AnimatePresence>

      {/* Customer Details — Pay Now */}
      <AnimatePresence>
        {step === 'details-pay' && (
          <CustomerDetailsModal
            title="Your Details"
            subtitle="Almost done — complete payment to confirm."
            accentColor={brand.accentColor}
            onSubmit={handlePayNow}
            onClose={() => setStep('choice')}
          />
        )}
      </AnimatePresence>

      {/* Checkout */}
      <AnimatePresence>
        {step === 'checkout' && pendingCustomer && (
          <FlotCheckout
            brandName={brand.businessName}
            accentColor={brand.accentColor}
            orderSummary={orderItems}
            currency="USD"
            vertical="hotel"
            extraFields={hotelExtraFields}
            onSuccess={() => setStep('idle')}
            onError={() => {}}
            onClose={() => setStep('idle')}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
