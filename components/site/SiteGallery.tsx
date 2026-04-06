'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { SiteConfig } from '@/lib/types/customization';

function isDataUrl(url: string) {
  return url.startsWith('data:');
}

export default function SiteGallery({ config }: { config: SiteConfig }) {
  const { brand, gallery } = config;
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  if (!gallery.enabled) return null;

  const images = gallery.images ?? [];
  if (images.length === 0) return null;

  // Masonry-style: alternate between tall and wide aspect ratios
  const getSpanClass = (index: number) => {
    const pattern = index % 6;
    if (pattern === 0) return 'row-span-2'; // tall
    if (pattern === 3) return 'col-span-2'; // wide
    return '';
  };

  function goPrev() {
    setLightboxIdx((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1));
  }
  function goNext() {
    setLightboxIdx((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : 0));
  }

  return (
    <>
      <section
        id="gallery"
        className="py-20 sm:py-28"
        style={{ backgroundColor: brand.backgroundColor, color: brand.textColor }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            className="mx-auto mb-16 max-w-3xl text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            {gallery.title && (
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ fontFamily: 'var(--heading-font)' }}>
                {gallery.title}
              </h2>
            )}
            {gallery.subtitle && (
              <p className="mt-4 text-base leading-relaxed sm:text-lg" style={{ opacity: 0.7 }}>
                {gallery.subtitle}
              </p>
            )}
          </motion.div>

          {/* Grid */}
          <div className="grid auto-rows-[220px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((img, idx) => (
              <motion.div
                key={idx}
                className={`group relative cursor-pointer overflow-hidden rounded-xl ${getSpanClass(idx)}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => setLightboxIdx(idx)}
              >
                {isDataUrl(img.url) ? (
                  <img
                    src={img.url}
                    alt={img.caption || ''}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <Image
                    src={img.url}
                    alt={img.caption || ''}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                )}

                {/* Caption Overlay */}
                <div
                  className={`absolute inset-0 flex items-end transition-opacity duration-300 ${
                    hoveredIdx === idx ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    background:
                      'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
                  }}
                >
                  {img.caption && (
                    <p className="p-4 text-sm font-medium text-white">
                      {img.caption}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={() => setLightboxIdx(null)}
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxIdx(null)}
              className="absolute top-4 right-4 z-10 text-white/70 hover:text-white transition-colors p-2"
            >
              <X size={24} />
            </button>

            {/* Prev button */}
            {images.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-4 z-10 text-white/70 hover:text-white transition-colors p-2"
              >
                <ChevronLeft size={32} />
              </button>
            )}

            {/* Image */}
            <motion.div
              key={lightboxIdx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-[90vw] max-h-[85vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {isDataUrl(images[lightboxIdx].url) ? (
                <img
                  src={images[lightboxIdx].url}
                  alt={images[lightboxIdx].caption || ''}
                  className="max-w-full max-h-[80vh] object-contain rounded-lg"
                />
              ) : (
                <div className="relative w-[80vw] h-[75vh]">
                  <Image
                    src={images[lightboxIdx].url}
                    alt={images[lightboxIdx].caption || ''}
                    fill
                    className="object-contain rounded-lg"
                    sizes="80vw"
                  />
                </div>
              )}
              {images[lightboxIdx].caption && (
                <p className="mt-4 text-white/80 text-sm text-center max-w-lg">
                  {images[lightboxIdx].caption}
                </p>
              )}
              <p className="mt-2 text-white/40 text-xs">
                {lightboxIdx + 1} / {images.length}
              </p>
            </motion.div>

            {/* Next button */}
            {images.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-4 z-10 text-white/70 hover:text-white transition-colors p-2"
              >
                <ChevronRight size={32} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
