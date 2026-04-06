import { create } from 'zustand';
import type { SavedPayment } from '@/lib/types';

interface PaymentState {
  savedPayment: SavedPayment | null;
  savePayment: (payment: SavedPayment) => void;
  clearPayment: () => void;
}

function loadSavedPayment(): SavedPayment | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('flot_saved_payment');
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return null;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  savedPayment: loadSavedPayment(),

  savePayment: (payment: SavedPayment) => {
    set({ savedPayment: payment });
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
