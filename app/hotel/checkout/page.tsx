'use client';

import { useRouter } from 'next/navigation';
import NavBar from '@/components/layout/NavBar';

export default function HotelCheckoutPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#0f0e0d' }}>
      <NavBar />
      <div className="pt-32 text-center">
        <p className="text-[var(--text-md)] text-[var(--fog)]">
          Please select a room to begin your reservation.
        </p>
        <button
          onClick={() => router.push('/hotel')}
          className="mt-4 text-[var(--text-sm)] font-body underline cursor-pointer"
          style={{ color: 'var(--hotel)' }}
        >
          Browse rooms
        </button>
      </div>
    </main>
  );
}
