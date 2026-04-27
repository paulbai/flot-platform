'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useOrderNotifications } from '@/lib/hooks/useOrderNotifications';

interface BuilderTabsProps {
  siteId: string;
}

export default function BuilderTabs({ siteId }: BuilderTabsProps) {
  const pathname = usePathname();
  const editorHref = `/builder/${siteId}`;
  const ordersHref = `/builder/${siteId}/orders`;

  // The editor route is exactly /builder/[id]; the orders route is anything under /orders.
  const isEditor = pathname === editorHref;
  const isOrders = pathname.startsWith(ordersHref);

  // Polls /api/orders for this site every 30s so the badge stays fresh while
  // the merchant is on either the Editor or Orders tab. The Orders list page
  // itself calls `markOrdersSeen(siteId)` on mount which zeroes out this count.
  const { newCount } = useOrderNotifications(siteId);

  return (
    <div className="flex gap-2 border-b border-white/10 px-4 sm:px-6">
      <Link
        href={editorHref}
        className="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
        style={{
          borderColor: isEditor ? 'currentColor' : 'transparent',
          opacity: isEditor ? 1 : 0.5,
        }}
      >
        Editor
      </Link>
      <Link
        href={ordersHref}
        className="px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2"
        style={{
          borderColor: isOrders ? 'currentColor' : 'transparent',
          opacity: isOrders ? 1 : 0.5,
        }}
      >
        Orders
        {newCount > 0 && (
          <span
            className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[10px] font-bold bg-orange-500 text-white"
            aria-label={`${newCount} new order${newCount === 1 ? '' : 's'}`}
          >
            {newCount > 99 ? '99+' : newCount}
          </span>
        )}
      </Link>
    </div>
  );
}
