'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { Hotel, UtensilsCrossed, Plane, ShoppingBag, RotateCcw, Download, Upload } from 'lucide-react';
import { useCustomizationStore } from '@/store/customizationStore';

const verticals = [
  {
    key: 'hotel' as const,
    label: 'Hotel',
    icon: Hotel,
    href: '/customize/hotel',
    preview: '/hotel',
  },
  {
    key: 'restaurant' as const,
    label: 'Restaurant',
    icon: UtensilsCrossed,
    href: '/customize/restaurant',
    preview: '/restaurant',
  },
  {
    key: 'store' as const,
    label: 'Store',
    icon: ShoppingBag,
    href: '/customize/store',
    preview: '/store',
  },
  {
    key: 'travel' as const,
    label: 'Travel',
    icon: Plane,
    href: '/customize/travel',
    preview: '/travel',
  },
];

export default function CustomizeDashboard() {
  const store = useCustomizationStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = {
      hotel: store.hotel,
      restaurant: store.restaurant,
      store: store.store,
      travel: store.travel,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flot-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (data.hotel) store.updateHotel({ ...data.hotel });
        if (data.hotel?.brand) store.updateHotelBrand(data.hotel.brand);
        if (data.restaurant) store.updateRestaurant({ ...data.restaurant });
        if (data.restaurant?.brand) store.updateRestaurantBrand(data.restaurant.brand);
        if (data.store) store.updateStore({ ...data.store });
        if (data.store?.brand) store.updateStoreBrand(data.store.brand);
        if (data.travel) store.updateTravel({ ...data.travel });
        if (data.travel?.brand) store.updateTravelBrand(data.travel.brand);
      } catch {
        alert('Invalid config file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight mb-1">Template Dashboard</h1>
          <p className="text-sm text-[#888]">
            Customize each vertical&apos;s brand, content, and appearance. Changes are saved automatically.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-[#888] hover:text-white border border-[#333] rounded-lg hover:border-[#555] transition-colors cursor-pointer"
          >
            <Download size={13} />
            Export
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-[#888] hover:text-white border border-[#333] rounded-lg hover:border-[#555] transition-colors cursor-pointer"
          >
            <Upload size={13} />
            Import
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          <button
            onClick={() => {
              if (confirm('Reset all templates to defaults?')) store.resetAll();
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-red-400 hover:text-red-300 border border-red-900/50 rounded-lg hover:border-red-700 transition-colors cursor-pointer"
          >
            <RotateCcw size={13} />
            Reset All
          </button>
        </div>
      </div>

      {/* Vertical Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {verticals.map((v) => {
          const config = store[v.key];
          const brand = config.brand;
          const Icon = v.icon;
          const itemCount =
            v.key === 'hotel'
              ? (config as typeof store.hotel).rooms.length
              : v.key === 'restaurant'
              ? (config as typeof store.restaurant).categories.reduce((sum: number, c: { items: unknown[] }) => sum + c.items.length, 0)
              : v.key === 'store'
              ? (config as typeof store.store).products.length
              : (config as typeof store.travel).flights.length;
          const itemLabel =
            v.key === 'hotel' ? 'rooms' : v.key === 'restaurant' ? 'menu items' : v.key === 'store' ? 'products' : 'flights';

          return (
            <Link
              key={v.key}
              href={v.href}
              className="group block bg-[#141414] border border-[#222] rounded-xl p-6 hover:border-[#444] transition-all hover:bg-[#181818]"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: brand.accentColor + '20', color: brand.accentColor }}
                >
                  <Icon size={20} />
                </div>
                <div
                  className="w-5 h-5 rounded-full border-2 border-[#333]"
                  style={{ backgroundColor: brand.accentColor }}
                  title={brand.accentColor}
                />
              </div>

              <h3 className="text-base font-semibold mb-0.5 group-hover:text-white transition-colors">
                {brand.businessName}
              </h3>
              <p className="text-xs text-[#666] mb-4">{brand.tagline}</p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#555]">
                  {itemCount} {itemLabel}
                </span>
                <span className="text-xs text-[#555] group-hover:text-white transition-colors">
                  Edit &rarr;
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick links */}
      <div className="mt-10 border-t border-[#1f1f1f] pt-8">
        <h2 className="text-sm font-semibold mb-4 text-[#888]">Quick Preview</h2>
        <div className="flex flex-wrap gap-2">
          {verticals.map((v) => (
            <Link
              key={v.key}
              href={v.preview}
              target="_blank"
              className="px-4 py-2 text-xs text-[#888] border border-[#222] rounded-lg hover:border-[#444] hover:text-white transition-colors"
            >
              View {v.label} &rarr;
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
