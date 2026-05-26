'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import SiteRenderer from '@/components/site/SiteRenderer';
import type { SiteConfig } from '@/lib/types/customization';

/**
 * Owner-only full-page preview. Renders the site exactly as buyers will see
 * it once published — same fonts, hero, sections, checkout flow — but works
 * for DRAFT sites too (which the public /site/[slug] route doesn't), so
 * merchants can show stakeholders / themselves the look without needing to
 * publish first.
 *
 * Auth is enforced by the middleware (/preview/* requires a session). The
 * authenticated GET /api/sites/[id] endpoint already does ownership checking,
 * so a signed-in user can only preview their own sites.
 */
export default function PreviewPage() {
  const { id } = useParams<{ id: string }>();
  const [site, setSite] = useState<SiteConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/sites/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error('Site not found or you don’t have access.');
          if (res.status === 401) throw new Error('Sign in to preview your site.');
          throw new Error(`Failed to load (${res.status})`);
        }
        return res.json();
      })
      .then(setSite)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'));
  }, [id]);

  if (error) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        <p className="text-sm text-red-400 mb-4">{error}</p>
        <Link href="/builder" className="text-xs text-white/60 hover:text-white underline underline-offset-4">
          ← Back to your sites
        </Link>
      </main>
    );
  }

  if (!site) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <>
      {/* Floating "Back to editor" pill — only on the preview page so the
          merchant has a one-click way out. Doesn't appear on the live
          /site/[slug] route. */}
      <Link
        href={`/builder/${id}`}
        className="fixed top-4 left-4 z-[1000] inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/80 backdrop-blur-sm border border-white/20 text-white text-xs font-medium hover:bg-black transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to editor
      </Link>

      {site.status === 'draft' && (
        <div className="fixed top-4 right-4 z-[1000] inline-flex items-center gap-2 px-3 py-2 rounded-full bg-amber-500/15 backdrop-blur-sm border border-amber-500/30 text-amber-300 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Preview · not yet published
        </div>
      )}

      <SiteRenderer config={site} />
    </>
  );
}
