import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OrderItem } from '@/lib/types';

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address?: string;
}

export interface PendingBooking {
  id: string;
  roomId: string;
  roomName: string;
  roomImage: string;
  customer: CustomerDetails;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  total: number;
  createdAt: string;
  orderItems: OrderItem[];
}

interface BookingStore {
  pendingBookings: PendingBooking[];
  addBooking: (booking: Omit<PendingBooking, 'id' | 'createdAt'>) => void;
  removeBooking: (id: string) => void;
  clearBookings: () => void;
}

export const useBookingStore = create<BookingStore>()(
  persist(
    (set) => ({
      pendingBookings: [],
      addBooking: (booking) =>
        set((state) => ({
          pendingBookings: [
            ...state.pendingBookings,
            {
              ...booking,
              id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      removeBooking: (id) =>
        set((state) => ({
          pendingBookings: state.pendingBookings.filter((b) => b.id !== id),
        })),
      clearBookings: () => set({ pendingBookings: [] }),
    }),
    { name: 'flot-pending-bookings' }
  )
);
