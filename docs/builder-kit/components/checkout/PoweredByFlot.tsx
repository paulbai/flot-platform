'use client';

import { Lock } from 'lucide-react';

export default function PoweredByFlot() {
  return (
    <div className="flex flex-col items-center gap-2 pt-6 pb-2">
      <div className="flex items-center gap-1.5 text-[var(--text-xs)] font-mono text-[var(--fog)]">
        <Lock size={10} />
        <span>256-bit SSL &middot; PCI DSS Level 1</span>
      </div>
      <div className="flex items-center gap-1 text-[var(--text-xs)] font-mono text-[var(--fog)]">
        <span className="text-[var(--fog)]/60">⚡</span>
        <span>
          Powered by{' '}
          <span className="text-[var(--flot)] font-medium">Flot</span>
        </span>
      </div>
    </div>
  );
}
