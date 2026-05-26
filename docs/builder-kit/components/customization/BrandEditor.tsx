'use client';

import { useCustomizationStore } from '@/store/customizationStore';
import type { BrandConfig } from '@/lib/types/customization';
import ImageUploader from './ImageUploader';
import ColorPicker from './ColorPicker';

interface BrandEditorProps {
  vertical: 'hotel' | 'restaurant' | 'store' | 'travel';
}

const inputClass =
  'bg-[#111] border border-[#333] rounded px-3 py-2 text-sm text-white focus:border-[#666] outline-none w-full';

export default function BrandEditor({ vertical }: BrandEditorProps) {
  const brand = useCustomizationStore((s) => s[vertical].brand);

  const updateBrandActions = {
    hotel: useCustomizationStore((s) => s.updateHotelBrand),
    restaurant: useCustomizationStore((s) => s.updateRestaurantBrand),
    store: useCustomizationStore((s) => s.updateStoreBrand),
    travel: useCustomizationStore((s) => s.updateTravelBrand),
  };

  const updateBrand = (data: Partial<BrandConfig>) => {
    updateBrandActions[vertical](data);
  };

  return (
    <div className="space-y-5">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        Brand Identity
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
            Business Name
          </label>
          <input
            type="text"
            value={brand.businessName}
            onChange={(e) => updateBrand({ businessName: e.target.value })}
            className={inputClass}
            placeholder="Business name"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
            Tagline
          </label>
          <input
            type="text"
            value={brand.tagline}
            onChange={(e) => updateBrand({ tagline: e.target.value })}
            className={inputClass}
            placeholder="A short tagline"
          />
        </div>

        <ImageUploader
          label="Logo"
          value={brand.logoUrl}
          onChange={(dataUrl) => updateBrand({ logoUrl: dataUrl || null })}
          aspectRatio="3/1"
        />

        <div className="grid grid-cols-2 gap-4">
          <ColorPicker
            label="Accent Color"
            value={brand.accentColor}
            onChange={(hex) => updateBrand({ accentColor: hex })}
          />
          <ColorPicker
            label="Background Color"
            value={brand.backgroundColor}
            onChange={(hex) => updateBrand({ backgroundColor: hex })}
          />
        </div>
      </div>
    </div>
  );
}
