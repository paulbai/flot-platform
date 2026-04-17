'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CalendarCheck, CreditCard } from 'lucide-react';

interface BookingChoiceModalProps {
  roomName: string;
  total: string;
  accentColor: string;
  onReserveOnly: () => void;
  onPayNow: () => void;
  onClose: () => void;
}

export default function BookingChoiceModal({
  roomName,
  total,
  accentColor,
  onReserveOnly,
  onPayNow,
  onClose,
}: BookingChoiceModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md bg-[var(--ink)] border border-[var(--ash)] rounded-sm p-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-1">
            <h2 className="font-display text-[var(--text-lg)] text-[var(--paper)] font-medium">
              How would you like to book?
            </h2>
            <button
              onClick={onClose}
              className="text-[var(--fog)] hover:text-[var(--paper)] transition-colors cursor-pointer ml-4 mt-0.5"
            >
              <X size={18} />
            </button>
          </div>
          <p className="text-[var(--text-xs)] text-[var(--fog)] font-body mb-6">
            {roomName} — {total}
          </p>

          <div className="space-y-3">
            {/* Reserve Only */}
            <button
              onClick={onReserveOnly}
              className="w-full flex items-start gap-4 p-4 bg-[var(--stone)] border border-[var(--ash)] rounded-sm text-left transition-all duration-mid cursor-pointer"
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = accentColor + '60')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--ash)')}
            >
              <div className="mt-0.5 flex-shrink-0" style={{ color: accentColor }}>
                <CalendarCheck size={20} />
              </div>
              <div>
                <p className="font-display text-[var(--text-md)] text-[var(--paper)] font-medium mb-1">
                  Reserve Only
                </p>
                <p className="text-[var(--text-xs)] text-[var(--fog)] font-body leading-relaxed">
                  Hold your room now, pay later. We&apos;ll keep your booking pending until you&apos;re ready to complete payment.
                </p>
              </div>
            </button>

            {/* Reserve & Pay Now */}
            <button
              onClick={onPayNow}
              className="w-full flex items-start gap-4 p-4 rounded-sm text-left transition-opacity hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: accentColor }}
            >
              <div className="mt-0.5 flex-shrink-0 text-black">
                <CreditCard size={20} />
              </div>
              <div>
                <p className="font-display text-[var(--text-md)] text-black font-medium mb-1">
                  Reserve &amp; Pay Now
                </p>
                <p className="text-[var(--text-xs)] font-body leading-relaxed" style={{ color: 'rgba(0,0,0,0.6)' }}>
                  Secure your booking immediately with full payment.
                </p>
              </div>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
