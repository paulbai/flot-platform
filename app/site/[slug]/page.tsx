'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import SiteRenderer from '@/components/site/SiteRenderer';
import type { SiteConfig } from '@/lib/types/customization';

export default function PublishedSitePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [site, setSite] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/sites/public/${slug}`)
      .then((res) => {
        if (!res.ok) {
          setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setSite(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (site?.seo?.metaTitle) {
      document.title = site.seo.metaTitle;
    }
  }, [site?.seo?.metaTitle]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !site) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">404</h1>
          <p className="text-gray-400">This site does not exist or is not published.</p>
          <Link
            href="/builder"
            className="inline-block mt-6 text-xs text-white/60 hover:text-white transition-colors underline underline-offset-4"
          >
            Go to Builder
          </Link>
        </div>
      </div>
    );
  }

  return <SiteRenderer config={site} />;
}
