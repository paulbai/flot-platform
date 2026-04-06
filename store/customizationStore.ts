'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CustomizationState,
  HotelConfig,
  RestaurantConfig,
  StoreConfig,
  TravelConfig,
  BrandConfig,
  Vertical,
} from '@/lib/types/customization';
import { rooms } from '@/lib/dummy-data/hotel';
import { menu } from '@/lib/dummy-data/restaurant';
import { products } from '@/lib/dummy-data/store';
import { airports, flights } from '@/lib/dummy-data/travel';

/* ── Default configs (pulled from existing dummy data) ── */

const defaultHotel: HotelConfig = {
  brand: {
    businessName: 'Flot Hotel',
    tagline: 'Where rest becomes ritual.',
    logoUrl: null,
    accentColor: '#d4a96a',
    backgroundColor: '#0f0e0d',
    textColor: '#ffffff',
    headingFont: 'Playfair Display',
    bodyFont: 'Lato',
  },
  heroImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80',
  heroHeadline: 'Where rest',
  heroSubline: 'becomes ritual.',
  rooms: JSON.parse(JSON.stringify(rooms)),
  services: [
    { name: 'Spa & Wellness', desc: 'Rejuvenate with our signature treatments', iconName: 'Sparkles' },
    { name: 'Fine Dining', desc: 'Michelin-starred cuisine at your table', iconName: 'UtensilsCrossed' },
    { name: 'Concierge', desc: 'Your every wish, around the clock', iconName: 'Bell' },
  ],
};

const defaultRestaurant: RestaurantConfig = {
  brand: {
    businessName: 'Osteria Flot',
    tagline: 'Taste first. Pay after.',
    logoUrl: null,
    accentColor: '#e85d3a',
    backgroundColor: '#0d0a08',
    textColor: '#ffffff',
    headingFont: 'Cormorant Garamond',
    bodyFont: 'Syne',
  },
  heroImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80',
  heroHeadline: 'Taste first.',
  heroSubline: 'Pay after.',
  heroDescription: 'Scan the QR at your table, browse the menu, order, and pay. All from your phone.',
  categories: JSON.parse(JSON.stringify(menu.categories)),
};

const defaultStore: StoreConfig = {
  brand: {
    businessName: 'Flot Store',
    tagline: 'Curated fashion & art.',
    logoUrl: null,
    accentColor: '#8b5cf6',
    backgroundColor: '#faf9f7',
    textColor: '#111111',
    headingFont: 'Inter',
    bodyFont: 'Inter',
  },
  heroLabel: 'Fashion & Art',
  products: JSON.parse(JSON.stringify(products)),
};

const defaultTravel: TravelConfig = {
  brand: {
    businessName: 'Flot Travel',
    tagline: 'The world is closer than you think.',
    logoUrl: null,
    accentColor: '#4a9eff',
    backgroundColor: '#080d14',
    textColor: '#ffffff',
    headingFont: 'Space Grotesk',
    bodyFont: 'DM Sans',
  },
  heroHeadline: 'The world is',
  heroSubline: 'closer than you think.',
  heroDescription: 'Search flights, pick your seat, and book in under a minute.',
  airports: JSON.parse(JSON.stringify(airports)),
  flights: JSON.parse(JSON.stringify(flights)),
};

function getDefaults(vertical: Vertical) {
  switch (vertical) {
    case 'hotel': return JSON.parse(JSON.stringify(defaultHotel));
    case 'restaurant': return JSON.parse(JSON.stringify(defaultRestaurant));
    case 'store': return JSON.parse(JSON.stringify(defaultStore));
    case 'travel': return JSON.parse(JSON.stringify(defaultTravel));
  }
}

export const useCustomizationStore = create<CustomizationState>()(
  persist(
    (set) => ({
      hotel: JSON.parse(JSON.stringify(defaultHotel)),
      restaurant: JSON.parse(JSON.stringify(defaultRestaurant)),
      store: JSON.parse(JSON.stringify(defaultStore)),
      travel: JSON.parse(JSON.stringify(defaultTravel)),

      updateHotelBrand: (brand: Partial<BrandConfig>) =>
        set((s) => ({ hotel: { ...s.hotel, brand: { ...s.hotel.brand, ...brand } } })),
      updateRestaurantBrand: (brand: Partial<BrandConfig>) =>
        set((s) => ({ restaurant: { ...s.restaurant, brand: { ...s.restaurant.brand, ...brand } } })),
      updateStoreBrand: (brand: Partial<BrandConfig>) =>
        set((s) => ({ store: { ...s.store, brand: { ...s.store.brand, ...brand } } })),
      updateTravelBrand: (brand: Partial<BrandConfig>) =>
        set((s) => ({ travel: { ...s.travel, brand: { ...s.travel.brand, ...brand } } })),

      updateHotel: (data) =>
        set((s) => ({ hotel: { ...s.hotel, ...data } })),
      updateRestaurant: (data) =>
        set((s) => ({ restaurant: { ...s.restaurant, ...data } })),
      updateStore: (data) =>
        set((s) => ({ store: { ...s.store, ...data } })),
      updateTravel: (data) =>
        set((s) => ({ travel: { ...s.travel, ...data } })),

      resetVertical: (vertical: Vertical) =>
        set(() => ({ [vertical]: getDefaults(vertical) })),
      resetAll: () =>
        set(() => ({
          hotel: getDefaults('hotel'),
          restaurant: getDefaults('restaurant'),
          store: getDefaults('store'),
          travel: getDefaults('travel'),
        })),
    }),
    {
      name: 'flot-customization',
      partialize: (state) => ({
        hotel: state.hotel,
        restaurant: state.restaurant,
        store: state.store,
        travel: state.travel,
      }),
    }
  )
);

export { defaultHotel, defaultRestaurant, defaultStore, defaultTravel };
