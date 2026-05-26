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
          // Explicit dark palette so brand-tinted text inheritance from the
          // SiteRenderer doesn't wash out the modal.
          style={{
            backgroundColor: '#0f0f10',
            borderColor: '#27272a',
            color: '#ffffff',
            colorScheme: 'dark',
          }}
          className="w-full max-w-md border rounded-xl p-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-1">
            <h2 className="text-lg font-semibold text-white">
              How would you like to book?
            </h2>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer ml-4 mt-0.5"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
          <p className="text-xs text-zinc-400 mb-6">{roomName} — {total}</p>

          <div className="space-y-3">
            {/* Reserve Only */}
            <button
              onClick={onReserveOnly}
              className="w-full flex items-start gap-4 p-4 rounded-lg text-left transition-colors duration-200 cursor-pointer"
              style={{ backgroundColor: '#18181b', border: '1px solid #3f3f46' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = accentColor + '99')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#3f3f46')}
            >
              <div className="mt-0.5 flex-shrink-0" style={{ color: accentColor }}>
                <CalendarCheck size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white mb-1">Reserve Only</p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Hold your room now, pay later. We&apos;ll keep your booking pending until you&apos;re ready to complete payment.
                </p>
              </div>
            </button>

            {/* Reserve & Pay Now */}
            <button
              onClick={onPayNow}
              className="w-full flex items-start gap-4 p-4 rounded-lg text-left transition-opacity hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: accentColor }}
            >
              <div className="mt-0.5 flex-shrink-0 text-black">
                <CreditCard size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-black mb-1">
                  Reserve &amp; Pay Now
                </p>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(0,0,0,0.7)' }}>
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
