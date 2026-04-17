'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CalendarDays, Users, ArrowRight, Trash2 } from 'lucide-react';
import { useBookingStore } from '@/store/bookingStore';
import type { OrderItem } from '@/lib/types';

interface PendingBookingsDrawerProps {
  accentColor: string;
  brandName: string;
  onPayNow: (orderItems: OrderItem[], bookingId: string) => void;
  onClose: () => void;
}

export default function PendingBookingsDrawer({
  accentColor,
  brandName,
  onPayNow,
  onClose,
}: PendingBookingsDrawerProps) {
  const { pendingBookings, removeBooking } = useBookingStore();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-[var(--ink)] border-l border-[var(--ash)] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--ash)]">
            <div>
              <h2 className="font-display text-[var(--text-lg)] text-[var(--paper)] font-medium">
                My Reservations
              </h2>
              <p className="text-[var(--text-xs)] text-[var(--fog)] font-body mt-0.5">{brandName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-[var(--fog)] hover:text-[var(--paper)] transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Bookings list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {pendingBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <CalendarDays size={32} className="mb-3" style={{ color: accentColor, opacity: 0.4 }} />
                <p className="text-[var(--text-sm)] text-[var(--fog)] font-body">No pending reservations</p>
                <p className="text-[var(--text-xs)] text-[var(--fog)] font-body mt-1 opacity-60">
                  Browse rooms and reserve to see them here
                </p>
              </div>
            ) : (
              pendingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-[var(--stone)] border border-[var(--ash)] rounded-sm overflow-hidden"
                >
                  {/* Room image */}
                  {booking.roomImage && (
                    <div className="relative aspect-[16/7] overflow-hidden">
                      <img
                        src={booking.roomImage}
                        alt={booking.roomName}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                  )}

                  <div className="p-4">
                    {/* Room name + status */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-display text-[var(--text-md)] text-[var(--paper)] font-medium">
                        {booking.roomName}
                      </h3>
                      <span
                        className="flex-shrink-0 text-[9px] font-body font-semibold uppercase tracking-wider px-2 py-0.5 rounded border"
                        style={{ color: accentColor, borderColor: accentColor + '50' }}
                      >
                        Pending
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-1.5 mb-3">
                      {(booking.checkIn || booking.checkOut) && (
                        <div className="flex items-center gap-2 text-[var(--text-xs)] text-[var(--fog)] font-body">
                          <CalendarDays size={12} style={{ color: accentColor }} />
                          {booking.checkIn || '—'} → {booking.checkOut || '—'}
                          {booking.nights > 0 && ` (${booking.nights} nights)`}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[var(--text-xs)] text-[var(--fog)] font-body">
                        <Users size={12} style={{ color: accentColor }} />
                        {booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}
                      </div>
                    </div>

                    {/* Customer + Total */}
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <p className="text-[var(--text-xs)] text-[var(--fog)] font-body">Reserved by</p>
                        <p className="text-[var(--text-sm)] text-[var(--paper)] font-body font-medium">
                          {booking.customer.name}
                        </p>
                        <p className="text-[var(--text-xs)] text-[var(--fog)] font-body">
                          {booking.customer.phone}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[var(--text-xs)] text-[var(--fog)] font-body">Total due</p>
                        <p
                          className="font-display text-[var(--text-lg)] font-bold"
                          style={{ color: accentColor }}
                        >
                          ${booking.total.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => removeBooking(booking.id)}
                        className="flex items-center justify-center w-10 h-10 rounded-sm border border-[var(--ash)] text-[var(--fog)] hover:text-[var(--error)] hover:border-[var(--error)] transition-colors cursor-pointer"
                        aria-label="Cancel reservation"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        onClick={() => onPayNow(booking.orderItems, booking.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-sm text-[var(--text-xs)] font-body font-semibold uppercase tracking-wider transition-opacity hover:opacity-90 cursor-pointer"
                        style={{ backgroundColor: accentColor, color: '#000' }}
                      >
                        Pay Now <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
