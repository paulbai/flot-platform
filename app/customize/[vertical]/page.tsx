'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { ExternalLink, RotateCcw, Eye, Paintbrush } from 'lucide-react';
import { useCustomizationStore } from '@/store/customizationStore';
import BrandEditor from '@/components/customization/BrandEditor';
import HotelEditor from '@/components/customization/editors/HotelEditor';
import RestaurantEditor from '@/components/customization/editors/RestaurantEditor';
import StoreEditor from '@/components/customization/editors/StoreEditor';
import TravelEditor from '@/components/customization/editors/TravelEditor';
import type { Vertical } from '@/lib/types/customization';

const verticalLabels: Record<string, string> = {
  hotel: 'Hotel',
  restaurant: 'Restaurant',
  store: 'Store',
  travel: 'Travel',
};

export default function VerticalCustomizePage() {
  const params = useParams();
  const vertical = params.vertical as Vertical;
  const [tab, setTab] = useState<'brand' | 'content'>('brand');
  const resetVertical = useCustomizationStore((s) => s.resetVertical);
  const brand = useCustomizationStore((s) => s[vertical]?.brand);

  if (!verticalLabels[vertical]) {
    return (
      <div className="p-10 text-center text-[#888]">
        <p>Unknown vertical: {vertical}</p>
        <Link href="/customize" className="text-white underline mt-2 inline-block">Back to dashboard</Link>
      </div>
    );
  }

  const ContentEditor = () => {
    switch (vertical) {
      case 'hotel': return <HotelEditor />;
      case 'restaurant': return <RestaurantEditor />;
      case 'store': return <StoreEditor />;
      case 'travel': return <TravelEditor />;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f1f1f] bg-[#0a0a0a] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: brand?.accentColor || '#888' }}
          />
          <h2 className="text-base font-semibold">{verticalLabels[vertical]}</h2>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/${vertical}`}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#888] hover:text-white border border-[#333] rounded-lg hover:border-[#555] transition-colors"
          >
            <ExternalLink size={12} />
            Preview
          </Link>
          <button
            onClick={() => {
              if (confirm(`Reset ${verticalLabels[vertical]} to defaults?`)) resetVertical(vertical);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 border border-red-900/50 rounded-lg hover:border-red-700 transition-colors cursor-pointer"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex border-b border-[#1f1f1f] bg-[#0f0f0f] flex-shrink-0">
        <button
          onClick={() => setTab('brand')}
          className={`flex items-center gap-2 px-6 py-3 text-sm border-b-2 transition-colors cursor-pointer ${
            tab === 'brand'
              ? 'border-white text-white'
              : 'border-transparent text-[#666] hover:text-[#999]'
          }`}
        >
          <Paintbrush size={14} />
          Brand
        </button>
        <button
          onClick={() => setTab('content')}
          className={`flex items-center gap-2 px-6 py-3 text-sm border-b-2 transition-colors cursor-pointer ${
            tab === 'content'
              ? 'border-white text-white'
              : 'border-transparent text-[#666] hover:text-[#999]'
          }`}
        >
          <Eye size={14} />
          Content
        </button>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-6">
          {tab === 'brand' ? (
            <BrandEditor vertical={vertical} />
          ) : (
            <ContentEditor />
          )}
        </div>
      </div>
    </div>
  );
}
