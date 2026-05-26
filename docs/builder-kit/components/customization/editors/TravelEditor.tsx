'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useCustomizationStore } from '@/store/customizationStore';
import type { Airport, Flight } from '@/lib/types';

const inputClass =
  'bg-[#111] border border-[#333] rounded px-3 py-2 text-sm text-white focus:border-[#666] outline-none w-full';

function FlightCard({
  flight,
  onUpdate,
  onDelete,
}: {
  flight: Flight;
  onUpdate: (data: Partial<Flight>) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#222] transition-colors"
      >
        <div className="flex items-center gap-2 text-sm text-white">
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <span className="font-medium">{flight.airline} {flight.flightNumber}</span>
          <span className="text-gray-500 text-xs">
            {flight.from.code} &rarr; {flight.to.code}
          </span>
        </div>
        <span className="text-xs text-gray-500">${flight.price.economy}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-[#333] pt-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Airline</label>
              <input
                className={inputClass}
                value={flight.airline}
                onChange={(e) => onUpdate({ airline: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Flight Number</label>
              <input
                className={inputClass}
                value={flight.flightNumber}
                onChange={(e) => onUpdate({ flightNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">From Code</label>
              <input
                className={inputClass}
                value={flight.from.code}
                onChange={(e) => onUpdate({ from: { ...flight.from, code: e.target.value } })}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">From Time</label>
              <input
                className={inputClass}
                value={flight.from.time}
                onChange={(e) => onUpdate({ from: { ...flight.from, time: e.target.value } })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">To Code</label>
              <input
                className={inputClass}
                value={flight.to.code}
                onChange={(e) => onUpdate({ to: { ...flight.to, code: e.target.value } })}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">To Time</label>
              <input
                className={inputClass}
                value={flight.to.time}
                onChange={(e) => onUpdate({ to: { ...flight.to, time: e.target.value } })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Duration</label>
              <input
                className={inputClass}
                value={flight.duration}
                onChange={(e) => onUpdate({ duration: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Stops</label>
              <input
                type="number"
                className={inputClass}
                value={flight.stops}
                onChange={(e) => onUpdate({ stops: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Seats Left</label>
              <input
                type="number"
                className={inputClass}
                value={flight.seatsLeft}
                onChange={(e) => onUpdate({ seatsLeft: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Economy Price</label>
              <input
                type="number"
                className={inputClass}
                value={flight.price.economy}
                onChange={(e) =>
                  onUpdate({ price: { ...flight.price, economy: Number(e.target.value) } })
                }
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Business Price</label>
              <input
                type="number"
                className={inputClass}
                value={flight.price.business}
                onChange={(e) =>
                  onUpdate({ price: { ...flight.price, business: Number(e.target.value) } })
                }
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">First Class Price</label>
              <input
                type="number"
                className={inputClass}
                value={flight.price.first ?? ''}
                placeholder="N/A"
                onChange={(e) => {
                  const val = e.target.value;
                  onUpdate({
                    price: { ...flight.price, first: val ? Number(val) : null },
                  });
                }}
              />
            </div>
          </div>

          <div className="pt-2">
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-400">Are you sure?</span>
                <button
                  type="button"
                  onClick={onDelete}
                  className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded hover:bg-red-500/30 transition-colors"
                >
                  Yes, delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1 bg-[#333] text-gray-400 text-xs rounded hover:bg-[#444] transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 size={12} />
                Delete Flight
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TravelEditor() {
  const travel = useCustomizationStore((s) => s.travel);
  const updateTravel = useCustomizationStore((s) => s.updateTravel);

  /* ── Airports ── */
  const updateAirport = (index: number, data: Partial<Airport>) => {
    const airports = [...travel.airports];
    airports[index] = { ...airports[index], ...data };
    updateTravel({ airports });
  };

  const deleteAirport = (index: number) => {
    updateTravel({ airports: travel.airports.filter((_, i) => i !== index) });
  };

  const addAirport = () => {
    const newAirport: Airport = {
      code: 'XXX',
      name: 'New Airport',
      city: 'City',
      country: 'Country',
    };
    updateTravel({ airports: [...travel.airports, newAirport] });
  };

  /* ── Flights ── */
  const updateFlight = (index: number, data: Partial<Flight>) => {
    const flights = [...travel.flights];
    flights[index] = { ...flights[index], ...data };
    updateTravel({ flights });
  };

  const deleteFlight = (index: number) => {
    updateTravel({ flights: travel.flights.filter((_, i) => i !== index) });
  };

  const addFlight = () => {
    const newFlight: Flight = {
      id: Date.now().toString(36),
      airline: 'Airline',
      flightNumber: 'FL000',
      from: { code: 'XXX', time: '08:00' },
      to: { code: 'YYY', time: '12:00' },
      duration: '4h 00m',
      stops: 0,
      price: { economy: 200, business: 500, first: null },
      seatsLeft: 50,
    };
    updateTravel({ flights: [...travel.flights, newFlight] });
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Hero Section
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Headline</label>
            <input
              className={inputClass}
              value={travel.heroHeadline}
              onChange={(e) => updateTravel({ heroHeadline: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Subline</label>
            <input
              className={inputClass}
              value={travel.heroSubline}
              onChange={(e) => updateTravel({ heroSubline: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Description</label>
          <textarea
            className={`${inputClass} resize-none`}
            rows={2}
            value={travel.heroDescription}
            onChange={(e) => updateTravel({ heroDescription: e.target.value })}
          />
        </div>
      </div>

      {/* Airports */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Airports ({travel.airports.length})
        </h3>
        <div className="space-y-2">
          {travel.airports.map((airport, i) => (
            <div
              key={`${airport.code}-${i}`}
              className="bg-[#1a1a1a] border border-[#333] rounded-lg p-3"
            >
              <div className="grid grid-cols-5 gap-2 items-end">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Code</label>
                  <input
                    className={inputClass}
                    value={airport.code}
                    onChange={(e) => updateAirport(i, { code: e.target.value.toUpperCase() })}
                    maxLength={4}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Name</label>
                  <input
                    className={inputClass}
                    value={airport.name}
                    onChange={(e) => updateAirport(i, { name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">City</label>
                  <input
                    className={inputClass}
                    value={airport.city}
                    onChange={(e) => updateAirport(i, { city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Country</label>
                  <input
                    className={inputClass}
                    value={airport.country}
                    onChange={(e) => updateAirport(i, { country: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => deleteAirport(i)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors self-end"
                  title="Delete airport"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addAirport}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-sm text-gray-400 hover:text-white hover:border-[#555] transition-colors w-full justify-center"
        >
          <Plus size={14} />
          Add Airport
        </button>
      </div>

      {/* Flights */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Flights ({travel.flights.length})
        </h3>
        <div className="space-y-2">
          {travel.flights.map((flight, i) => (
            <FlightCard
              key={flight.id}
              flight={flight}
              onUpdate={(data) => updateFlight(i, data)}
              onDelete={() => deleteFlight(i)}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={addFlight}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-sm text-gray-400 hover:text-white hover:border-[#555] transition-colors w-full justify-center"
        >
          <Plus size={14} />
          Add Flight
        </button>
      </div>
    </div>
  );
}
