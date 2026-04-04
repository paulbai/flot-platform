'use client';

import { useRouter } from 'next/navigation';
import NavBar from '@/components/layout/NavBar';

export default function TravelCheckoutPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#080d14' }}>
      <NavBar />
      <div className="pt-32 text-center">
        <p className="text-[var(--text-md)] text-[var(--fog)]">
          Please search and select a flight first.
        </p>
        <button
          onClick={() => router.push('/travel')}
          className="mt-4 text-[var(--text-sm)] font-body underline cursor-pointer"
          style={{ color: 'var(--travel)' }}
        >
          Search flights
        </button>
      </div>
    </main>
  );
}
