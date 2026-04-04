'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Users, Sparkles, UtensilsCrossed, Bell } from 'lucide-react';
import NavBar from '@/components/layout/NavBar';
import Badge from '@/components/ui/Badge';
import { rooms } from '@/lib/dummy-data/hotel';
import { leonesOf } from '@/lib/currency';

const services = [
  { name: 'Spa & Wellness', icon: <Sparkles size={20} />, desc: 'Rejuvenate with our signature treatments' },
  { name: 'Fine Dining', icon: <UtensilsCrossed size={20} />, desc: 'Michelin-starred cuisine at your table' },
  { name: 'Concierge', icon: <Bell size={20} />, desc: 'Your every wish, around the clock' },
];

export default function HotelPage() {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  return (
    <main id="main-content" className="min-h-screen" style={{ backgroundColor: '#0f0e0d' }}>
      <NavBar />

      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-end">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80"
            alt="Luxury hotel exterior"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0e0d] via-[#0f0e0d]/60 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="w-12 h-[2px] mb-6" style={{ backgroundColor: 'var(--hotel)' }} />
            <h1 className="font-display text-[var(--text-hero)] font-medium leading-[0.9] tracking-tight text-[var(--paper)] mb-4">
              Where rest<br />
              <span className="italic font-light" style={{ color: 'var(--hotel)' }}>becomes ritual.</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Booking Bar — glassmorphism floating */}
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
                <Calendar size={12} className="inline mr-1.5" style={{ color: 'var(--hotel)' }} />
                Check-in
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-[var(--stone)] border border-[var(--ash)] rounded-sm px-3 py-2.5 text-[var(--text-sm)] font-body text-[var(--paper)] focus:outline-none focus:border-[var(--hotel)] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[var(--text-xs)] font-body font-semibold uppercase tracking-wider text-[var(--fog)] mb-2">
                <Calendar size={12} className="inline mr-1.5" style={{ color: 'var(--hotel)' }} />
                Check-out
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-[var(--stone)] border border-[var(--ash)] rounded-sm px-3 py-2.5 text-[var(--text-sm)] font-body text-[var(--paper)] focus:outline-none focus:border-[var(--hotel)] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[var(--text-xs)] font-body font-semibold uppercase tracking-wider text-[var(--fog)] mb-2">
                <Users size={12} className="inline mr-1.5" style={{ color: 'var(--hotel)' }} />
                Guests
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full bg-[var(--stone)] border border-[var(--ash)] rounded-sm px-3 py-2.5 text-[var(--text-sm)] font-body text-[var(--paper)] focus:outline-none focus:border-[var(--hotel)] transition-colors"
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                ))}
              </select>
            </div>
            <Link
              href="#rooms"
              className="flex items-center justify-center px-6 py-2.5 rounded-sm text-[var(--text-sm)] font-body font-semibold uppercase tracking-wider text-[#0f0e0d] transition-colors hover:opacity-90"
              style={{ backgroundColor: 'var(--hotel)' }}
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
          <span className="text-[var(--text-xs)] font-body font-semibold uppercase tracking-[0.25em]" style={{ color: 'var(--hotel)' }}>
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
                    <p className="font-display text-[var(--text-md)]" style={{ color: 'var(--hotel)' }}>
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
          <span className="text-[var(--text-xs)] font-body font-semibold uppercase tracking-[0.25em]" style={{ color: 'var(--hotel)' }}>
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
              className="bg-[var(--ink)] border border-[var(--ash)]/50 rounded-sm p-6 hover:border-[var(--hotel)]/30 transition-colors"
            >
              <div className="mb-4" style={{ color: 'var(--hotel)' }}>
                {service.icon}
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
    </main>
  );
}
