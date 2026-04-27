'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Utensils, ShoppingBag, Bike } from 'lucide-react';

export type RestaurantOrderType = 'dine-in' | 'takeaway' | 'delivery';

interface OrderTypeModalProps {
  brandName: string;
  accentColor: string;
  onSelect: (type: RestaurantOrderType) => void;
  onClose: () => void;
}

interface Choice {
  type: RestaurantOrderType;
  label: string;
  blurb: string;
  Icon: typeof Utensils;
}

const CHOICES: Choice[] = [
  {
    type: 'dine-in',
    label: 'Dine In',
    blurb: "I'll eat at the restaurant.",
    Icon: Utensils,
  },
  {
    type: 'takeaway',
    label: 'Takeaway',
    blurb: "I'll come pick it up.",
    Icon: ShoppingBag,
  },
  {
    type: 'delivery',
    label: 'Delivery',
    blurb: 'Send it to my address.',
    Icon: Bike,
  },
];

export default function OrderTypeModal({
  brandName,
  accentColor,
  onSelect,
  onClose,
}: OrderTypeModalProps) {
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
          // Explicit dark palette — see CustomerDetailsModal for the rationale.
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
              How would you like your order?
            </h2>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer ml-4 mt-0.5"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
          <p className="text-xs text-zinc-400 mb-6">From {brandName}</p>

          <div className="space-y-3">
            {CHOICES.map(({ type, label, blurb, Icon }) => (
              <button
                key={type}
                onClick={() => onSelect(type)}
                className="w-full flex items-start gap-4 p-4 rounded-lg text-left transition-colors duration-200 cursor-pointer"
                style={{ backgroundColor: '#18181b', border: '1px solid #3f3f46' }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = accentColor + '99')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#3f3f46')}
              >
                <div className="mt-0.5 flex-shrink-0" style={{ color: accentColor }}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">{label}</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">{blurb}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
