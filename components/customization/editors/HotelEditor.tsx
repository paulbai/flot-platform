'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useCustomizationStore } from '@/store/customizationStore';
import ImageUploader from '../ImageUploader';
import type { Room } from '@/lib/types';

const inputClass =
  'bg-[#111] border border-[#333] rounded px-3 py-2 text-sm text-white focus:border-[#666] outline-none w-full';

function RoomCard({
  room,
  onUpdate,
  onDelete,
}: {
  room: Room;
  onUpdate: (data: Partial<Room>) => void;
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
          <span className="font-medium">{room.name || 'Untitled Room'}</span>
          <span className="text-gray-500 text-xs">${room.pricePerNight}/night</span>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-[#333] pt-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Name</label>
              <input
                className={inputClass}
                value={room.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Size</label>
              <input
                className={inputClass}
                value={room.size}
                onChange={(e) => onUpdate({ size: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">View</label>
              <input
                className={inputClass}
                value={room.view}
                onChange={(e) => onUpdate({ view: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Price/Night</label>
              <input
                type="number"
                className={inputClass}
                value={room.pricePerNight}
                onChange={(e) => onUpdate({ pricePerNight: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Max Guests</label>
              <input
                type="number"
                className={inputClass}
                value={room.maxGuests}
                onChange={(e) => onUpdate({ maxGuests: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Description</label>
            <textarea
              className={`${inputClass} resize-none`}
              rows={2}
              value={room.description || ''}
              onChange={(e) => onUpdate({ description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Image URL</label>
            <input
              className={inputClass}
              value={room.images[0] || ''}
              onChange={(e) => onUpdate({ images: [e.target.value, ...room.images.slice(1)] })}
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Amenities (comma separated)</label>
            <input
              className={inputClass}
              value={room.amenities.join(', ')}
              onChange={(e) =>
                onUpdate({ amenities: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })
              }
            />
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
                Delete Room
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function HotelEditor() {
  const hotel = useCustomizationStore((s) => s.hotel);
  const updateHotel = useCustomizationStore((s) => s.updateHotel);

  const updateRoom = (index: number, data: Partial<Room>) => {
    const rooms = [...hotel.rooms];
    rooms[index] = { ...rooms[index], ...data };
    updateHotel({ rooms });
  };

  const deleteRoom = (index: number) => {
    const rooms = hotel.rooms.filter((_, i) => i !== index);
    updateHotel({ rooms });
  };

  const addRoom = () => {
    const newRoom: Room = {
      id: Date.now().toString(36),
      name: 'New Room',
      size: '30m²',
      view: 'City View',
      pricePerNight: 200,
      maxGuests: 2,
      amenities: ['Wi-Fi', 'Air Conditioning'],
      images: [],
      available: true,
      description: '',
    };
    updateHotel({ rooms: [...hotel.rooms, newRoom] });
  };

  const updateService = (index: number, data: Partial<{ name: string; desc: string; iconName: string }>) => {
    const services = [...hotel.services];
    services[index] = { ...services[index], ...data };
    updateHotel({ services });
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Hero Section
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Headline</label>
            <input
              className={inputClass}
              value={hotel.heroHeadline}
              onChange={(e) => updateHotel({ heroHeadline: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Subline</label>
            <input
              className={inputClass}
              value={hotel.heroSubline}
              onChange={(e) => updateHotel({ heroSubline: e.target.value })}
            />
          </div>
        </div>
        <ImageUploader
          label="Hero Image"
          value={hotel.heroImage}
          onChange={(dataUrl) => updateHotel({ heroImage: dataUrl })}
        />
      </div>

      {/* Rooms */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Rooms ({hotel.rooms.length})
        </h3>
        <div className="space-y-2">
          {hotel.rooms.map((room, i) => (
            <RoomCard
              key={room.id}
              room={room}
              onUpdate={(data) => updateRoom(i, data)}
              onDelete={() => deleteRoom(i)}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={addRoom}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-sm text-gray-400 hover:text-white hover:border-[#555] transition-colors w-full justify-center"
        >
          <Plus size={14} />
          Add Room
        </button>
      </div>

      {/* Services */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Services ({hotel.services.length})
        </h3>
        <div className="space-y-2">
          {hotel.services.map((service, i) => (
            <div key={i} className="bg-[#1a1a1a] border border-[#333] rounded-lg p-3 space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Name</label>
                  <input
                    className={inputClass}
                    value={service.name}
                    onChange={(e) => updateService(i, { name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Description</label>
                  <input
                    className={inputClass}
                    value={service.desc}
                    onChange={(e) => updateService(i, { desc: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
