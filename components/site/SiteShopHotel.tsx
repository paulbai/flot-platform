'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, BedDouble, Minus, Plus, CalendarCheck } from 'lucide-react';
import type { SiteConfig } from '@/lib/types/customization';
import type { Room } from '@/lib/types';
import type { OrderItem } from '@/lib/types';
import FlotCheckout from '@/components/checkout/FlotCheckout';

export default function SiteShopHotel({ config }: { config: SiteConfig }) {
  const rooms = config.hotelContent?.rooms ?? [];
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [nights, setNights] = useState(1);
  const [guests, setGuests] = useState(1);
  const [checkoutItem, setCheckoutItem] = useState<OrderItem | null>(null);
  const accent = config.brand.accentColor;

  if (rooms.length === 0) return null;

  function handleBookNow(room: Room) {
    const item: OrderItem = {
      id: `${config.slug}-room-${room.id}-${Date.now()}`,
      name: `${room.name} (${nights} night${nights > 1 ? 's' : ''})`,
      description: `${guests} guest${guests > 1 ? 's' : ''} · ${room.view || room.size}`,
      quantity: 1,
      unitPrice: room.pricePerNight * nights,
      image: room.images?.[0],
      vertical: 'hotel',
      siteSlug: config.slug,
    };
    setCheckoutItem(item);
    setSelectedRoom(null);
  }

  return (
    <>
      <section id="shop" className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: config.brand.backgroundColor, color: config.brand.textColor }}>
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
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
                      <p className="text-xs" style={{ color: config.brand.textColor, opacity: 0.5 }}>${(room.pricePerNight / 24).toFixed(2)}</p>
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
                    <p className="text-sm mt-2 line-clamp-2" style={{ color: config.brand.textColor, opacity: 0.6 }}>{room.description}</p>
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
                            <p className="text-xs" style={{ color: config.brand.textColor, opacity: 0.5 }}>${((room.pricePerNight * nights) / 24).toFixed(2)}</p>
                          </div>
                          <button
                            onClick={() => handleBookNow(room)}
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

      {/* Direct checkout modal for hotel bookings */}
      <AnimatePresence>
        {checkoutItem && (
          <FlotCheckout
            brandName={config.brand.businessName}
            accentColor={accent}
            orderSummary={[checkoutItem]}
            currency="Le"
            vertical="hotel"
            onSuccess={() => {}}
            onError={() => {}}
            onClose={() => {
              setCheckoutItem(null);
              setNights(1);
              setGuests(1);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
