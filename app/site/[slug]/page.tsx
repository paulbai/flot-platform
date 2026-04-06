'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSiteBuilderStore } from '@/store/siteBuilderStore';
import SiteRenderer from '@/components/site/SiteRenderer';

export default function PublishedSitePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [hydrated, setHydrated] = useState(false);

  // Wait for Zustand to hydrate from localStorage before rendering
  useEffect(() => {
    setHydrated(true);
  }, []);

  const site = useSiteBuilderStore((s) => s.getSiteBySlug(slug));

  useEffect(() => {
    if (hydrated && site?.seo?.metaTitle) {
      document.title = site.seo.metaTitle;
    }
  }, [hydrated, site?.seo?.metaTitle]);

  // Show loading skeleton until store hydrates
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!site || site.status !== 'published') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-3">404</h1>
          <p className="text-[#888] text-sm">Site not found or not yet published.</p>
          <a
            href="/builder"
            className="inline-block mt-6 text-xs text-white/60 hover:text-white transition-colors underline underline-offset-4"
          >
            Go to Builder
          </a>
        </div>
      </div>
    );
  }

  return <SiteRenderer config={site} />;
}
