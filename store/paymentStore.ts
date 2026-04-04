import { create } from 'zustand';
import type { SavedPayment } from '@/lib/types';

interface PaymentState {
  savedPayment: SavedPayment | null;
  savePayment: (payment: SavedPayment) => void;
  clearPayment: () => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  savedPayment: null,

  savePayment: (payment: SavedPayment) => {
    set({ savedPayment: payment });
    // Persist to localStorage for cross-session demo
    if (typeof window !== 'undefined') {
      localStorage.setItem('flot_saved_payment', JSON.stringify(payment));
    }
  },

  clearPayment: () => {
    set({ savedPayment: null });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('flot_saved_payment');
    }
  },
}));
