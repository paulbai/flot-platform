import { create } from 'zustand';
import type { CartState, OrderItem, Vertical } from '@/lib/types';

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (item: OrderItem) => {
    set((state) => {
      const existing = state.items.find(
        (i) => i.id === item.id && i.variant === item.variant
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === item.id && i.variant === item.variant
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        };
      }
      return { items: [...state.items, item] };
    });
  },

  removeItem: (id: string) => {
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    }));
  },

  updateQuantity: (id: string, quantity: number) => {
    set((state) => ({
      items:
        quantity <= 0
          ? state.items.filter((i) => i.id !== id)
          : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
    }));
  },

  clearCart: () => set({ items: [] }),

  clearVertical: (vertical: Vertical) => {
    set((state) => ({
      items: state.items.filter((i) => i.vertical !== vertical),
    }));
  },

  getTotal: () => {
    return get().items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
  },

  getVerticalItems: (vertical: Vertical) => {
    return get().items.filter((i) => i.vertical === vertical);
  },

  clearSite: (siteSlug: string) => {
    set((state) => ({
      items: state.items.filter((i) => i.siteSlug !== siteSlug),
    }));
  },

  getSiteItems: (siteSlug: string) => {
    return get().items.filter((i) => i.siteSlug === siteSlug);
  },

  getSiteTotal: (siteSlug: string) => {
    return get().items
      .filter((i) => i.siteSlug === siteSlug)
      .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  },

  getVerticals: () => {
    const verticals = new Set(get().items.map((i) => i.vertical));
    return Array.from(verticals);
  },
}));
