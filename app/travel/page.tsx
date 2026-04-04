'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Plane } from 'lucide-react';
import NavBar from '@/components/layout/NavBar';
import Button from '@/components/ui/Button';
import { airports } from '@/lib/dummy-data/travel';

type FlightClass = 'economy' | 'business' | 'first';

export default function TravelPage() {
  const router = useRouter();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departure, setDeparture] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [oneWay, setOneWay] = useState(false);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [flightClass, setFlightClass] = useState<FlightClass>('economy');
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams({
      from: from || 'LHR',
      to: to || 'JFK',
      class: flightClass,
      adults: adults.toString(),
      children: children.toString(),
    });
    if (departure) params.set('dep', departure);
    if (returnDate && !oneWay) params.set('ret', returnDate);
    router.push(`/travel/results?${params.toString()}`);
  };

  const filteredAirports = (query: string) =>
    airports.filter(
      (a) =>
        a.code.toLowerCase().includes(query.toLowerCase()) ||
        a.city.toLowerCase().includes(query.toLowerCase()) ||
        a.name.toLowerCase().includes(query.toLowerCase())
    );

  const inputClass =
    'w-full bg-[var(--stone)] border border-[var(--ash)] rounded-sm px-4 py-3 text-[var(--text-sm)] font-body text-[var(--paper)] placeholder:text-[var(--fog)] focus:outline-none focus:border-[var(--travel)] transition-colors';

  return (
    <main id="main-content" className="min-h-screen" style={{ backgroundColor: '#080d14' }}>
      <NavBar />

      {/* Hero with animated flight path */}
      <section className="relative min-h-[85vh] flex flex-col justify-center items-center pt-16 px-4">
        {/* Flight path SVG */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
            {/* Dots */}
            <circle cx="200" cy="350" r="4" fill="var(--travel)" opacity="0.6" />
            <circle cx="1000" cy="250" r="4" fill="var(--travel)" opacity="0.6" />
            {/* Flight arc */}
            <motion.path
              d="M 200 350 Q 600 50 1000 250"
              fill="none"
              stroke="var(--travel)"
              strokeWidth="1"
              strokeDasharray="6 4"
              opacity="0.3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.5, ease: 'easeInOut', delay: 0.5 }}
            />
            {/* Plane icon on path */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5 }}
            >
              <circle cx="600" cy="120" r="3" fill="var(--travel)" />
            </motion.g>
          </svg>
        </div>

        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'linear-gradient(var(--travel) 1px, transparent 1px), linear-gradient(90deg, var(--travel) 1px, transparent 1px)',
          backgroundSize: '100px 100px',
        }} />

        <div className="relative z-10 w-full max-w-[800px] text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="w-12 h-[2px] mx-auto mb-6" style={{ backgroundColor: 'var(--travel)' }} />
            <h1 className="font-display text-[var(--text-hero)] font-medium leading-[0.9] tracking-tight text-[var(--paper)] mb-4">
              The world is<br />
              <span className="italic font-light" style={{ color: 'var(--travel)' }}>closer than you think.</span>
            </h1>
            <p className="text-[var(--text-md)] text-[var(--cloud)] font-body max-w-md mx-auto mb-12">
              Search flights, pick your seat, and book in under a minute.
            </p>
          </motion.div>

          {/* Search Widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[var(--ink)] border border-[var(--ash)]/50 rounded-sm p-6 text-left"
          >
            {/* From / To */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="relative">
                <label className="block text-[var(--text-xs)] font-body text-[var(--fog)] mb-1.5 uppercase tracking-wider">From</label>
                <input
                  type="text"
                  placeholder="City or airport"
                  value={from}
                  onChange={(e) => { setFrom(e.target.value); setFromOpen(true); }}
                  onFocus={() => setFromOpen(true)}
                  onBlur={() => setTimeout(() => setFromOpen(false), 150)}
                  className={inputClass}
                />
                {fromOpen && from.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-[var(--stone)] border border-[var(--ash)] rounded-sm max-h-48 overflow-y-auto">
                    {filteredAirports(from).map((a) => (
                      <button
                        key={a.code}
                        onMouseDown={() => { setFrom(`${a.city} (${a.code})`); setFromOpen(false); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-[var(--ash)]/30 transition-colors cursor-pointer"
                      >
                        <span className="text-[var(--text-sm)] text-[var(--paper)] font-body">{a.city}</span>
                        <span className="text-[var(--text-xs)] text-[var(--fog)] ml-2 font-mono">{a.code}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="block text-[var(--text-xs)] font-body text-[var(--fog)] mb-1.5 uppercase tracking-wider">To</label>
                <input
                  type="text"
                  placeholder="City or airport"
                  value={to}
                  onChange={(e) => { setTo(e.target.value); setToOpen(true); }}
                  onFocus={() => setToOpen(true)}
                  onBlur={() => setTimeout(() => setToOpen(false), 150)}
                  className={inputClass}
                />
                {toOpen && to.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-[var(--stone)] border border-[var(--ash)] rounded-sm max-h-48 overflow-y-auto">
                    {filteredAirports(to).map((a) => (
                      <button
                        key={a.code}
                        onMouseDown={() => { setTo(`${a.city} (${a.code})`); setToOpen(false); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-[var(--ash)]/30 transition-colors cursor-pointer"
                      >
                        <span className="text-[var(--text-sm)] text-[var(--paper)] font-body">{a.city}</span>
                        <span className="text-[var(--text-xs)] text-[var(--fog)] ml-2 font-mono">{a.code}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[var(--text-xs)] font-body text-[var(--fog)] mb-1.5 uppercase tracking-wider">Departure</label>
                <input type="date" value={departure} onChange={(e) => setDeparture(e.target.value)} className={inputClass} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[var(--text-xs)] font-body text-[var(--fog)] uppercase tracking-wider">Return</label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={oneWay}
                      onChange={(e) => setOneWay(e.target.checked)}
                      className="w-3 h-3 rounded accent-current"
                      style={{ accentColor: 'var(--travel)' }}
                    />
                    <span className="text-[10px] font-body text-[var(--fog)] uppercase tracking-wider">One-way</span>
                  </label>
                </div>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  disabled={oneWay}
                  className={`${inputClass} ${oneWay ? 'opacity-40' : ''}`}
                />
              </div>
            </div>

            {/* Passengers + Class */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-[var(--text-xs)] font-body text-[var(--fog)] mb-1.5 uppercase tracking-wider">Adults</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setAdults(Math.max(1, adults - 1))} className="w-8 h-8 flex items-center justify-center rounded-sm bg-[var(--stone)] border border-[var(--ash)] text-[var(--fog)] hover:text-[var(--paper)] transition-colors cursor-pointer"><Minus size={12} /></button>
                  <span className="font-mono text-[var(--text-sm)] text-[var(--paper)] w-6 text-center">{adults}</span>
                  <button onClick={() => setAdults(adults + 1)} className="w-8 h-8 flex items-center justify-center rounded-sm bg-[var(--stone)] border border-[var(--ash)] text-[var(--fog)] hover:text-[var(--paper)] transition-colors cursor-pointer"><Plus size={12} /></button>
                </div>
              </div>
              <div>
                <label className="block text-[var(--text-xs)] font-body text-[var(--fog)] mb-1.5 uppercase tracking-wider">Children</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setChildren(Math.max(0, children - 1))} className="w-8 h-8 flex items-center justify-center rounded-sm bg-[var(--stone)] border border-[var(--ash)] text-[var(--fog)] hover:text-[var(--paper)] transition-colors cursor-pointer"><Minus size={12} /></button>
                  <span className="font-mono text-[var(--text-sm)] text-[var(--paper)] w-6 text-center">{children}</span>
                  <button onClick={() => setChildren(children + 1)} className="w-8 h-8 flex items-center justify-center rounded-sm bg-[var(--stone)] border border-[var(--ash)] text-[var(--fog)] hover:text-[var(--paper)] transition-colors cursor-pointer"><Plus size={12} /></button>
                </div>
              </div>
              <div>
                <label className="block text-[var(--text-xs)] font-body text-[var(--fog)] mb-1.5 uppercase tracking-wider">Class</label>
                <div className="flex gap-1">
                  {(['economy', 'business', 'first'] as FlightClass[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setFlightClass(c)}
                      className="flex-1 px-2 py-2 text-[10px] font-body font-semibold uppercase tracking-wider rounded-sm border transition-all cursor-pointer"
                      style={{
                        borderColor: flightClass === c ? 'var(--travel)' : 'var(--ash)',
                        backgroundColor: flightClass === c ? 'var(--travel)' : 'transparent',
                        color: flightClass === c ? '#080d14' : 'var(--fog)',
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button variant="accent" size="lg" accentColor="#4a9eff" className="w-full" onClick={handleSearch}>
              <Plane size={16} className="mr-1" />
              Search Flights
            </Button>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
