'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Users, Sparkles, UtensilsCrossed, Bell, BookMarked } from 'lucide-react';
import NavBar from '@/components/layout/NavBar';
import Badge from '@/components/ui/Badge';
import { useHotelData } from '@/lib/hooks/useCustomizedData';
import { leonesOf } from '@/lib/currency';
import type { OrderItem } from '@/lib/types';

const PendingBookingsDrawer = dynamic(() => import('@/components/booking/PendingBookingsDrawer'), { ssr: false });
const FlotCheckout = dynamic(() => import('@/components/checkout/FlotCheckout'), { ssr: false });

const iconMap: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles size={20} />,
  UtensilsCrossed: <UtensilsCrossed size={20} />,
  Bell: <Bell size={20} />,
};

export default function HotelPage() {
  const { brand, heroImage, heroHeadline, heroSubline, rooms, services } = useHotelData();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [payItems, setPayItems] = useState<OrderItem[]>([]);

  // Template demo only — `args.orderId` is not used because this page does not
  // actually persist orders (the merchant-site path in /[slug] does that).
  const handlePayNow = (args: { orderId: string; customerEmail: string; orderItems: OrderItem[] }) => {
    setPayItems(args.orderItems);
    setDrawerOpen(false);
    setCheckoutOpen(true);
  };

  return (
    <main id="main-content" className="min-h-screen" style={{ backgroundColor: brand.backgroundColor }}>
      <NavBar />

      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-end">
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt={brand.businessName}
            fill
            className="object-cover"
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, ${brand.backgroundColor}, ${brand.backgroundColor}99 40%, transparent)`,
            }}
          />
        </div>

        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {/* My Reservations button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-sm border text-[var(--text-xs)] font-body font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              style={{ borderColor: brand.accentColor + '60', color: brand.accentColor }}
            >
              <BookMarked size={14} />
              My Reservations
            </button>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            {brand.logoUrl && (
              <img src={brand.logoUrl} alt={brand.businessName} className="h-12 mb-4 object-contain" />
            )}
            <div className="w-12 h-[2px] mb-6" style={{ backgroundColor: brand.accentColor }} />
            <h1 className="font-display text-[var(--text-hero)] font-medium leading-[0.9] tracking-tight text-[var(--paper)] mb-4">
              {heroHeadline}<br />
              <span className="italic font-light" style={{ color: brand.accentColor }}>{heroSubline}</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Booking Bar */}
      <section className="relative z-20 -mt-12 px-4 sm:px-6 lg:px-8 max-w-[1000px] mx-auto mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-sm border border-[var(--ash)]/50 p-6"
          style={{ backgroundColor: 'rgba(30, 30, 30, 0.8)', backdropFilter: 'blur(20px)' }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-[var(--text-xs)] font-body font-semibold uppercase tracking-wider text-[var(--fog)] mb-2">
                <Calendar size={12} className="inline mr-1.5" style={{ color: brand.accentColor }} />
                Check-in
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-[var(--stone)] border border-[var(--ash)] rounded-sm px-3 py-2.5 text-[var(--text-sm)] font-body text-[var(--paper)] focus:outline-none transition-colors"
                style={{ '--tw-ring-color': brand.accentColor } as React.CSSProperties}
              />
            </div>
            <div>
              <label className="block text-[var(--text-xs)] font-body font-semibold uppercase tracking-wider text-[var(--fog)] mb-2">
                <Calendar size={12} className="inline mr-1.5" style={{ color: brand.accentColor }} />
                Check-out
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-[var(--stone)] border border-[var(--ash)] rounded-sm px-3 py-2.5 text-[var(--text-sm)] font-body text-[var(--paper)] focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[var(--text-xs)] font-body font-semibold uppercase tracking-wider text-[var(--fog)] mb-2">
                <Users size={12} className="inline mr-1.5" style={{ color: brand.accentColor }} />
                Guests
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full bg-[var(--stone)] border border-[var(--ash)] rounded-sm px-3 py-2.5 text-[var(--text-sm)] font-body text-[var(--paper)] focus:outline-none transition-colors"
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                ))}
              </select>
            </div>
            <Link
              href="#rooms"
              className="flex items-center justify-center px-6 py-2.5 rounded-sm text-[var(--text-sm)] font-body font-semibold uppercase tracking-wider transition-colors hover:opacity-90"
              style={{ backgroundColor: brand.accentColor, color: brand.backgroundColor }}
            >
              Search
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Rooms Grid */}
      <section id="rooms" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[var(--ash)]" />
          <span className="text-[var(--text-xs)] font-body font-semibold uppercase tracking-[0.25em]" style={{ color: brand.accentColor }}>
            Our Rooms
          </span>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[var(--ash)]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rooms.map((room, i) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href={`/hotel/rooms/${room.id}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-sm mb-4">
                  <Image
                    src={room.images[0]}
                    alt={room.name}
                    fill
                    className="object-cover transition-transform duration-slow ease-out-expo group-hover:scale-[1.04]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-mid" />
                  {!room.available && (
                    <div className="absolute top-3 right-3">
                      <Badge color="var(--error)">Sold Out</Badge>
                    </div>
                  )}
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-[var(--text-md)] text-[var(--paper)] font-medium group-hover:opacity-80 transition-opacity">
                      {room.name}
                    </h3>
                    <p className="text-[var(--text-xs)] text-[var(--fog)] font-body mt-1">
                      {room.size} &middot; {room.view} &middot; Up to {room.maxGuests} guests
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-display text-[var(--text-md)]" style={{ color: brand.accentColor }}>
                      ${room.pricePerNight}
                    </p>
                    <p className="text-[var(--text-xs)] text-[var(--fog)] font-mono">{leonesOf(room.pricePerNight)}</p>
                    <p className="text-[var(--text-xs)] text-[var(--fog)] font-body">per night</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[var(--ash)]" />
          <span className="text-[var(--text-xs)] font-body font-semibold uppercase tracking-[0.25em]" style={{ color: brand.accentColor }}>
            Services
          </span>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[var(--ash)]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {services.map((service, i) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="border border-[var(--ash)]/50 rounded-sm p-6 transition-colors"
              style={{ backgroundColor: 'var(--ink)' }}
            >
              <div className="mb-4" style={{ color: brand.accentColor }}>
                {iconMap[service.iconName] || <Sparkles size={20} />}
              </div>
              <h3 className="font-display text-[var(--text-md)] text-[var(--paper)] font-medium mb-2">
                {service.name}
              </h3>
              <p className="text-[var(--text-xs)] text-[var(--fog)] leading-relaxed">
                {service.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
      {/* Pending Bookings Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <PendingBookingsDrawer
            accentColor={brand.accentColor}
            brandName={brand.businessName}
            siteSlug="demo"
            onPayNow={handlePayNow}
            onClose={() => setDrawerOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Pay Now Checkout */}
      <AnimatePresence>
        {checkoutOpen && payItems.length > 0 && (
          <FlotCheckout
            brandName={brand.businessName}
            accentColor={brand.accentColor}
            orderSummary={payItems}
            currency="USD"
            vertical="hotel"
            onSuccess={() => {
              setCheckoutOpen(false);
            }}
            onError={() => {}}
            onClose={() => { setCheckoutOpen(false); }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
