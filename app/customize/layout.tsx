'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Hotel, UtensilsCrossed, Plane, ShoppingBag, LayoutDashboard, ArrowLeft } from 'lucide-react';

const navItems = [
  { href: '/customize', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/customize/hotel', label: 'Hotel', icon: Hotel },
  { href: '/customize/restaurant', label: 'Restaurant', icon: UtensilsCrossed },
  { href: '/customize/store', label: 'Store', icon: ShoppingBag },
  { href: '/customize/travel', label: 'Travel', icon: Plane },
];

export default function CustomizeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-[#1f1f1f] bg-[#0f0f0f] flex-shrink-0">
        <div className="p-6 border-b border-[#1f1f1f]">
          <Link href="/" className="flex items-center gap-2 text-[#888] hover:text-white transition-colors text-sm mb-4">
            <ArrowLeft size={14} />
            Back to site
          </Link>
          <h1 className="text-lg font-semibold tracking-tight">Customize</h1>
          <p className="text-xs text-[#666] mt-1">Edit your storefront templates</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-[#888] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#1f1f1f]">
          <p className="text-[10px] text-[#555] uppercase tracking-wider">Flot Platform</p>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0f0f0f] border-b border-[#1f1f1f] px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <Link href="/" className="text-[#888] hover:text-white transition-colors text-sm flex items-center gap-1">
            <ArrowLeft size={14} />
            Site
          </Link>
          <span className="text-sm font-semibold">Customize</span>
          <div className="w-12" />
        </div>
        <div className="flex gap-1 overflow-x-auto hide-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-[#888] hover:text-white'
                }`}
              >
                <Icon size={12} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pt-24 md:pt-0">
        {children}
      </main>
    </div>
  );
}
