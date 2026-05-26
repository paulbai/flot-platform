'use client';

import type { SiteConfig } from '@/lib/types/customization';
import SiteShopHotel from './SiteShopHotel';
import SiteShopRestaurant from './SiteShopRestaurant';
import SiteShopStore from './SiteShopStore';

export default function SiteShop({ config }: { config: SiteConfig }) {
  switch (config.vertical) {
    case 'hotel':
      return <SiteShopHotel config={config} />;
    case 'restaurant':
      return <SiteShopRestaurant config={config} />;
    case 'store':
      return <SiteShopStore config={config} />;
    case 'travel':
      return (
        <section id="shop" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span
              className="text-xs font-semibold uppercase tracking-[0.25em]"
              style={{ color: config.brand.accentColor }}
            >
              Flights
            </span>
            <h2
              className="text-3xl font-bold mt-3 mb-4"
              style={{ fontFamily: 'var(--heading-font)' }}
            >
              Flight Booking
            </h2>
            <p className="opacity-50">
              Flight search and booking coming soon. Stay tuned!
            </p>
          </div>
        </section>
      );
    default:
      return null;
  }
}
