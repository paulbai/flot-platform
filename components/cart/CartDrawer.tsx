'use client';

import { motion } from 'framer-motion';
import { X, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import CartItem from './CartItem';
import Button from '@/components/ui/Button';
import { leonesOf } from '@/lib/currency';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartDrawer({ isOpen, onClose, onCheckout }: CartDrawerProps) {
  const items = useCartStore((s) => s.items);
  const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="relative w-full sm:max-w-[400px] h-full bg-[var(--ink)] border-l border-[var(--ash)] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--ash)]">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-[var(--flot)]" />
            <h2 className="font-display text-[var(--text-md)] text-[var(--paper)] font-medium">
              Your Cart
            </h2>
            <span className="text-[var(--text-xs)] font-mono text-[var(--fog)]">
              ({items.length})
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--fog)] hover:text-[var(--paper)] transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag size={40} className="text-[var(--ash)] mb-4" />
              <p className="text-[var(--text-sm)] text-[var(--fog)]">Your cart is empty</p>
            </div>
          ) : (
            <div>
              {items.map((item) => (
                <CartItem key={`${item.id}-${item.variant}`} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-4 border-t border-[var(--ash)] safe-bottom">
            <div className="flex justify-between mb-4">
              <span className="text-[var(--text-sm)] font-body text-[var(--fog)]">Subtotal</span>
              <span className="font-display text-[var(--text-md)] text-[var(--paper)]" aria-live="polite" aria-atomic="true">
                ${total.toFixed(2)} <span className="text-[var(--text-xs)] text-[var(--fog)]">({leonesOf(total)})</span>
              </span>
            </div>
            <Button variant="primary" size="lg" className="w-full" onClick={onCheckout}>
              Checkout
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
