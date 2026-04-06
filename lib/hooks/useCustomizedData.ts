'use client';

import { useCustomizationStore } from '@/store/customizationStore';
import type { HotelConfig, RestaurantConfig, StoreConfig, TravelConfig } from '@/lib/types/customization';

export function useHotelData(): HotelConfig {
  return useCustomizationStore((s) => s.hotel);
}

export function useRestaurantData(): RestaurantConfig {
  return useCustomizationStore((s) => s.restaurant);
}

export function useStoreData(): StoreConfig {
  return useCustomizationStore((s) => s.store);
}

export function useTravelData(): TravelConfig {
  return useCustomizationStore((s) => s.travel);
}
