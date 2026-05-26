'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import type { OrderItem } from '@/lib/types';
import { useCartStore } from '@/store/cartStore';
import { leonesOf } from '@/lib/currency';

interface CartItemProps {
  item: OrderItem;
}

export default function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  return (
    <div className="flex items-center gap-3 py-3 border-b border-[var(--ash)]/30">
      {item.image && (
        <div
          className="w-14 h-14 rounded-sm bg-cover bg-center flex-shrink-0"
          style={{ backgroundImage: `url(${item.image})` }}
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[var(--text-sm)] font-body text-[var(--paper)] truncate">
          {item.name}
        </p>
        {item.variant && (
          <p className="text-[var(--text-xs)] text-[var(--fog)]">{item.variant}</p>
        )}
        <p className="font-display text-[var(--text-sm)] text-[var(--paper)] mt-0.5">
          ${item.unitPrice.toFixed(2)} <span className="text-[var(--text-xs)] text-[var(--fog)]">({leonesOf(item.unitPrice)})</span>
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="w-6 h-6 flex items-center justify-center rounded-sm bg-[var(--stone)] text-[var(--fog)] hover:text-[var(--paper)] transition-colors cursor-pointer"
          aria-label="Decrease quantity"
        >
          {item.quantity === 1 ? <Trash2 size={11} /> : <Minus size={11} />}
        </button>
        <span className="text-[var(--text-xs)] font-mono text-[var(--paper)] w-4 text-center">
          {item.quantity}
        </span>
        <button
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="w-6 h-6 flex items-center justify-center rounded-sm bg-[var(--stone)] text-[var(--fog)] hover:text-[var(--paper)] transition-colors cursor-pointer"
          aria-label="Increase quantity"
        >
          <Plus size={11} />
        </button>
      </div>
    </div>
  );
}
