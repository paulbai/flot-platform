'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Layers, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-50 h-14 border-b border-[#1a1a1a] bg-[#0a0a0a]/80 backdrop-blur-md flex items-center px-6">
        <Link href="/builder" className="flex items-center gap-2.5 group">
          <motion.div
            whileHover={{ rotate: 15 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Layers className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
          </motion.div>
          <span className="text-sm font-semibold tracking-tight text-white/90 group-hover:text-white transition-colors">
            Flot Builder
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-4">
          <span className="text-xs text-[#888]">{session.user?.email}</span>
          <button
            onClick={() => signOut({ callbackUrl: '/build' })}
            className="flex items-center gap-1.5 text-xs text-[#888] hover:text-white transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
          <Link
            href="/"
            className="text-xs text-[#888] hover:text-white transition-colors"
          >
            Back to Main Site
          </Link>
        </div>
      </header>

      {/* Content */}
      <main>{children}</main>
    </div>
  );
}
