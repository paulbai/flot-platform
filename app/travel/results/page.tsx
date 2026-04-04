'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Clock, Plane, ChevronUp } from 'lucide-react';
import dynamic from 'next/dynamic';
import NavBar from '@/components/layout/NavBar';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { flights } from '@/lib/dummy-data/travel';
import { leonesOf } from '@/lib/currency';

const FlotCheckout = dynamic(() => import('@/components/checkout/FlotCheckout'), { ssr: false });
import type { Flight, ExtraField, OrderItem } from '@/lib/types';

type FlightClass = 'economy' | 'business' | 'first';

// Seat grid for micro-step
const ROWS = 6;
const COLS = 6;
const TAKEN_SEATS = new Set(['1A', '1F', '2C', '2D', '3B', '4A', '4E', '5C', '5D', '6F']);
const seatLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

const travelExtraFields: ExtraField[] = [
  { name: 'passengerTitle', label: 'Title', type: 'select', required: true, options: ['Mr', 'Mrs', 'Ms', 'Dr'] },
  { name: 'passengerName', label: 'Full Name (as on passport)', type: 'text', required: true, placeholder: 'Full legal name' },
  { name: 'passengerDob', label: 'Date of Birth', type: 'text', required: true, placeholder: 'DD/MM/YYYY' },
  { name: 'passportNumber', label: 'Passport Number', type: 'text', required: true, placeholder: 'Passport number' },
  { name: 'holdLuggage', label: 'Hold Luggage (1 × 23kg)', type: 'checkbox', required: false, placeholder: 'Add hold luggage (+$45)' },
  { name: 'extraLegroom', label: 'Extra Legroom', type: 'checkbox', required: false, placeholder: 'Add extra legroom (+$30)' },
];

function FlightCard({ flight, flightClass, onSelect }: { flight: Flight; flightClass: FlightClass; onSelect: (f: Flight) => void }) {
  const price = flight.price[flightClass];
  if (price === null) return null;

  const initials = flight.airline.split(' ').map((w) => w[0]).join('');

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[var(--ink)] border border-[var(--ash)]/50 rounded-sm p-5 hover:border-[var(--travel)]/30 transition-colors"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Airline */}
        <div className="flex items-center gap-3 sm:w-40 flex-shrink-0">
          <div
            className="w-10 h-10 rounded-sm flex items-center justify-center text-xs font-mono font-bold"
            style={{ backgroundColor: 'var(--travel)', color: '#080d14', opacity: 0.9 }}
          >
            {initials}
          </div>
          <div>
            <p className="text-[var(--text-sm)] font-body text-[var(--paper)]">{flight.airline}</p>
            <p className="text-[var(--text-xs)] font-mono text-[var(--fog)]">{flight.flightNumber}</p>
          </div>
        </div>

        {/* Route */}
        <div className="flex-1 flex items-center gap-4">
          <div className="text-center">
            <p className="font-display text-[var(--text-lg)] text-[var(--paper)]">{flight.from.time}</p>
            <p className="text-[var(--text-xs)] font-mono text-[var(--fog)]">{flight.from.code}</p>
          </div>

          <div className="flex-1 flex flex-col items-center gap-1">
            <div className="flex items-center gap-1 text-[var(--text-xs)] text-[var(--fog)]">
              <Clock size={10} />
              {flight.duration}
            </div>
            <div className="w-full flex items-center">
              <div className="h-[1px] flex-1" style={{ backgroundColor: 'var(--travel)', opacity: 0.3 }} />
              <Plane size={12} style={{ color: 'var(--travel)' }} className="mx-1" />
              <div className="h-[1px] flex-1" style={{ backgroundColor: 'var(--travel)', opacity: 0.3 }} />
            </div>
            <Badge color={flight.stops === 0 ? 'var(--success)' : 'var(--warning)'}>
              {flight.stops === 0 ? 'Non-stop' : `${flight.stops} Stop`}
            </Badge>
          </div>

          <div className="text-center">
            <p className="font-display text-[var(--text-lg)] text-[var(--paper)]">{flight.to.time}</p>
            <p className="text-[var(--text-xs)] font-mono text-[var(--fog)]">{flight.to.code}</p>
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 flex-shrink-0">
          <div className="text-right">
            <p className="font-display text-[var(--text-xl)]" style={{ color: 'var(--travel)' }}>
              ${price}
            </p>
            <p className="text-[var(--text-xs)] text-[var(--fog)] font-mono">{leonesOf(price)}</p>
            <p className="text-[var(--text-xs)] text-[var(--fog)] font-body">per person</p>
          </div>
          {flight.seatsLeft <= 5 && (
            <p className="text-[var(--text-xs)] font-body" style={{ color: 'var(--error)' }}>
              {flight.seatsLeft} seats left
            </p>
          )}
          <Button variant="accent" size="sm" accentColor="#4a9eff" onClick={() => onSelect(flight)}>
            Select
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function SeatMap({ onSeatSelect, selectedSeat }: { onSeatSelect: (seat: string) => void; selectedSeat: string | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-[var(--ink)] border border-[var(--ash)]/50 rounded-sm p-6 mt-4 overflow-hidden"
    >
      <h3 className="text-[var(--text-xs)] font-body font-semibold uppercase tracking-[0.15em] mb-4" style={{ color: 'var(--travel)' }}>
        Select Your Seat
      </h3>
      <div className="flex flex-col items-center gap-1.5 max-w-xs mx-auto">
        {/* Column labels */}
        <div className="flex gap-1.5">
          {seatLabels.map((l, i) => (
            <div key={l} className={`w-8 h-6 flex items-center justify-center text-[10px] font-mono text-[var(--fog)] ${i === 2 ? 'mr-4' : ''} ${i === 3 ? 'ml-4' : ''}`}>
              {l}
            </div>
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: ROWS }, (_, row) => (
          <div key={row} className="flex gap-1.5 items-center">
            {Array.from({ length: COLS }, (_, col) => {
              const seatId = `${row + 1}${seatLabels[col]}`;
              const taken = TAKEN_SEATS.has(seatId);
              const selected = selectedSeat === seatId;
              return (
                <button
                  key={seatId}
                  disabled={taken}
                  onClick={() => onSeatSelect(seatId)}
                  className={`w-8 h-8 rounded-sm text-[10px] font-mono transition-all cursor-pointer disabled:cursor-not-allowed
                    ${col === 2 ? 'mr-4' : ''} ${col === 3 ? 'ml-4' : ''}`}
                  style={{
                    backgroundColor: taken ? 'var(--ash)' : selected ? 'var(--flot)' : 'var(--travel)',
                    color: taken ? 'var(--fog)' : selected ? 'var(--void)' : '#080d14',
                    opacity: taken ? 0.3 : selected ? 1 : 0.6,
                  }}
                  aria-label={`Seat ${seatId}${taken ? ' (taken)' : ''}`}
                >
                  {!taken && seatId}
                </button>
              );
            })}
            <span className="text-[10px] font-mono text-[var(--fog)] w-4 text-center ml-1">{row + 1}</span>
          </div>
        ))}
        {/* Legend */}
        <div className="flex gap-4 mt-3">
          {[
            { label: 'Available', color: 'var(--travel)', opacity: 0.6 },
            { label: 'Selected', color: 'var(--flot)', opacity: 1 },
            { label: 'Taken', color: 'var(--ash)', opacity: 0.3 },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: l.color, opacity: l.opacity }} />
              <span className="text-[10px] font-body text-[var(--fog)]">{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const flightClass = (searchParams.get('class') || 'economy') as FlightClass;
  const passengers = Number(searchParams.get('adults') || 1) + Number(searchParams.get('children') || 0);

  const [stopFilter, setStopFilter] = useState<'any' | 0 | 1>('any');
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [showSeatMap, setShowSeatMap] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const filtered = useMemo(() => {
    return flights.filter((f) => {
      if (f.price[flightClass] === null) return false;
      if (stopFilter !== 'any' && f.stops !== stopFilter) return false;
      return true;
    });
  }, [flightClass, stopFilter]);

  const handleSelectFlight = (flight: Flight) => {
    setSelectedFlight(flight);
    setShowSeatMap(true);
    setSelectedSeat(null);
  };

  const handleProceedToCheckout = () => {
    setCheckoutOpen(true);
  };

  const orderItems: OrderItem[] = selectedFlight
    ? [
        {
          id: selectedFlight.id,
          name: `${selectedFlight.airline} ${selectedFlight.flightNumber}`,
          description: `${selectedFlight.from.code} → ${selectedFlight.to.code} · ${flightClass}${selectedSeat ? ` · Seat ${selectedSeat}` : ''}`,
          quantity: passengers,
          unitPrice: selectedFlight.price[flightClass] || 0,
          vertical: 'travel',
        },
      ]
    : [];

  return (
    <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8"
      >
        <span className="text-[var(--text-xs)] font-body font-extrabold uppercase tracking-[0.25em]" style={{ color: 'var(--travel)' }}>
          Flight Results
        </span>
        <h1 className="font-display text-[var(--text-xl)] text-[var(--paper)] font-medium mt-2 flex items-center gap-3">
          {searchParams.get('from')?.match(/\((\w+)\)/)?.[1] || 'LHR'}
          <ArrowRight size={20} style={{ color: 'var(--travel)' }} />
          {searchParams.get('to')?.match(/\((\w+)\)/)?.[1] || 'JFK'}
        </h1>
        <p className="text-[var(--text-sm)] text-[var(--fog)] font-body mt-1">
          {passengers} {passengers === 1 ? 'passenger' : 'passengers'} &middot; {flightClass}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-1"
        >
          <div className="bg-[var(--ink)] border border-[var(--ash)]/50 rounded-sm p-5 sticky top-24">
            <h3 className="text-[var(--text-xs)] font-body font-semibold uppercase tracking-[0.15em] mb-4" style={{ color: 'var(--travel)' }}>
              Filters
            </h3>

            {/* Stops */}
            <div className="mb-6">
              <label className="block text-[var(--text-xs)] font-body text-[var(--fog)] mb-2 uppercase tracking-wider">Stops</label>
              <div className="space-y-1.5">
                {([['any', 'Any'] as const, [0, 'Non-stop'] as const, [1, '1 Stop'] as const]).map(([val, label]) => (
                  <button
                    key={String(val)}
                    onClick={() => setStopFilter(val)}
                    className="w-full text-left px-3 py-2 rounded-sm text-[var(--text-xs)] font-body transition-colors cursor-pointer"
                    style={{
                      backgroundColor: stopFilter === val ? 'var(--travel)' : 'transparent',
                      color: stopFilter === val ? '#080d14' : 'var(--cloud)',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[var(--text-xs)] text-[var(--fog)]">
              {filtered.length} {filtered.length === 1 ? 'flight' : 'flights'} found
            </p>
          </div>
        </motion.div>

        {/* Results List */}
        <div className="lg:col-span-3 space-y-3">
          {filtered.map((flight, i) => (
            <motion.div
              key={flight.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <FlightCard flight={flight} flightClass={flightClass} onSelect={handleSelectFlight} />

              {/* Seat map for selected flight */}
              <AnimatePresence>
                {selectedFlight?.id === flight.id && showSeatMap && (
                  <div>
                    <SeatMap
                      onSeatSelect={(seat) => setSelectedSeat(seat)}
                      selectedSeat={selectedSeat}
                    />
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-between mt-3 px-2"
                    >
                      <button
                        onClick={() => setShowSeatMap(false)}
                        className="text-[var(--text-xs)] font-body text-[var(--fog)] hover:text-[var(--paper)] transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <ChevronUp size={12} /> Hide seat map
                      </button>
                      <Button
                        variant="accent"
                        size="sm"
                        accentColor="#4a9eff"
                        onClick={handleProceedToCheckout}
                      >
                        {selectedSeat ? `Continue with Seat ${selectedSeat}` : 'Continue without seat'}
                      </Button>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-[var(--text-md)] text-[var(--fog)]">No flights match your filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Checkout */}
      <AnimatePresence>
        {checkoutOpen && orderItems.length > 0 && (
          <FlotCheckout
            brandName="Flot Travel"
            accentColor="#4a9eff"
            orderSummary={orderItems}
            currency="USD"
            vertical="travel"
            extraFields={travelExtraFields}
            onSuccess={() => {}}
            onError={() => {}}
            onClose={() => setCheckoutOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TravelResultsPage() {
  return (
    <main id="main-content" className="min-h-screen" style={{ backgroundColor: '#080d14' }}>
      <NavBar />
      <Suspense fallback={
        <div className="pt-32 text-center">
          <p className="text-[var(--text-md)] text-[var(--fog)]">Loading flights...</p>
        </div>
      }>
        <ResultsContent />
      </Suspense>
    </main>
  );
}
