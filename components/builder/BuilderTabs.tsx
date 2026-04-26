'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

  const tab = (href: string, label: string, active: boolean) => (
    <Link
      href={href}
      className="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
      style={{
        borderColor: active ? 'currentColor' : 'transparent',
        opacity: active ? 1 : 0.5,
      }}
    >
      {label}
    </Link>
  );

  return (
    <div className="flex gap-2 border-b border-white/10 px-4 sm:px-6">
      {tab(editorHref, 'Editor', isEditor)}
      {tab(ordersHref, 'Orders', isOrders)}
    </div>
  );
}
