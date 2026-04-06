'use client';

import { useState, useContext, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { SiteConfig } from '@/lib/types/customization';
import { TemplateContext } from './SiteRenderer';
import { getBorderRadius, getSectionPadding, getItemDelay } from '@/lib/templates/animations';

function isDataUrl(url: string) {
  return url.startsWith('data:');
}

/** Depth-scroll 3D effect wrapper for individual items */
function DepthScrollItem({
  children,
  index,
  intensity,
}: {
  children: React.ReactNode;
  index: number;
  intensity: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const zOffset = (index % 3 - 1) * 30 * (intensity / 100);
  const translateZ = useTransform(scrollYProgress, [0, 0.5, 1], [zOffset * -1, 0, zOffset]);

  return (
    <motion.div ref={ref} style={{ translateZ, willChange: 'transform' }}>
      {children}
    </motion.div>
  );
}

export default function SiteGallery({ config }: { config: SiteConfig }) {
  const { brand, gallery } = config;
  const template = useContext(TemplateContext);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [heroIdx, setHeroIdx] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const filmstripRef = useRef<HTMLDivElement>(null);

  const layout = template.galleryLayout;
  const threeDGallery = template.threeDEffects.gallery;
  const intensity = template.threeDEffects.intensity;
  const borderRadius = getBorderRadius(template.sectionStyles.borderRadius);
  const sectionPadding = getSectionPadding(template.sectionStyles.sectionSpacing);


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

  function scrollCarousel(direction: 'left' | 'right') {
    const el = carouselRef.current;
    if (!el) return;
    const scrollAmount = direction === 'left' ? -400 : 400;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }

  /** Compute rotateY for perspective-grid 3D effect based on column position */
  function getPerspectiveRotateY(index: number, cols: number): number {
    if (threeDGallery !== 'perspective-grid') return 0;
    const col = index % cols;
    const center = (cols - 1) / 2;
    const offset = col - center;
    const maxAngle = 6 * (intensity / 100);
    return -(offset / center) * maxAngle;
  }

  /** Compute filmstrip rotateY based on position relative to center */
  function getFilmstripRotateY(index: number, total: number): number {
    const center = (total - 1) / 2;
    const offset = index - center;
    const maxAngle = 15;
    return (offset / Math.max(center, 1)) * maxAngle;
  }

  /** Wrap item in depth-scroll wrapper if needed */
  function maybeWrapDepthScroll(node: React.ReactNode, index: number): React.ReactNode {
    if (threeDGallery !== 'depth-scroll') return node;
    return (
      <DepthScrollItem key={`depth-${index}`} index={index} intensity={intensity}>
        {node}
      </DepthScrollItem>
    );
  }

  /** Shared caption overlay */
  function CaptionOverlay({ idx, caption }: { idx: number; caption?: string }) {
    return (
      <div
        className={`absolute inset-0 flex items-end transition-opacity duration-300 ${
          hoveredIdx === idx ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
        }}
      >
        {caption && (
          <p className="p-4 text-sm font-medium text-white">{caption}</p>
        )}
      </div>
    );
  }

  /** Render grid content based on layout variant */
  function renderGalleryContent() {
    switch (layout) {
      case 'carousel':
        return renderCarousel();
      case 'grid-uniform':
        return renderGridUniform();
      case 'lightbox-focus':
        return renderLightboxFocus();
      case 'filmstrip':
        return renderFilmstrip();
      case 'masonry':
      default:
        return renderMasonry();
    }
  }

  function renderMasonry() {
    const perspectiveStyle: React.CSSProperties =
      threeDGallery === 'perspective-grid' ? { perspective: '800px' } : {};

    return (
      <div
        className="grid auto-rows-[220px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        style={perspectiveStyle}
      >
        {images.map((img, idx) => {
          // Determine responsive cols for perspective calc (approximate: use 3 as max)
          const rotateY = getPerspectiveRotateY(idx, 3);
          const itemTransform: React.CSSProperties =
            threeDGallery === 'perspective-grid'
              ? { transform: `perspective(800px) rotateY(${rotateY}deg)`, transition: 'transform 0.4s ease' }
              : {};

          const card = (
            <motion.div
              key={idx}
              className={`site-card group relative cursor-pointer overflow-hidden ${borderRadius} ${getSpanClass(idx)}`}
              style={itemTransform}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: getItemDelay(template.animationPreset, idx) }}
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
              <CaptionOverlay idx={idx} caption={img.caption} />
            </motion.div>
          );

          return maybeWrapDepthScroll(card, idx);
        })}
      </div>
    );
  }

  function renderCarousel() {
    return (
      <div className="relative">
        {/* Left arrow */}
        <button
          onClick={() => scrollCarousel('left')}
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white/80 hover:bg-black/60 hover:text-white transition-colors backdrop-blur-sm"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Scrollable container */}
        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto hide-scrollbar scroll-smooth snap-x snap-mandatory px-10"
          style={threeDGallery === 'perspective-grid' ? { perspective: '800px' } : {}}
        >
          {images.map((img, idx) => {
            const rotateY = threeDGallery === 'perspective-grid' ? getPerspectiveRotateY(idx, images.length) : 0;
            const itemStyle: React.CSSProperties = {
              ...(threeDGallery === 'perspective-grid'
                ? { transform: `perspective(800px) rotateY(${rotateY}deg)`, transition: 'transform 0.4s ease' }
                : {}),
            };

            const card = (
              <motion.div
                key={idx}
                className={`site-card group relative flex-shrink-0 cursor-pointer overflow-hidden snap-start ${borderRadius}`}
                style={{
                  width: 'clamp(300px, 40vw, 400px)',
                  height: '300px',
                  ...itemStyle,
                }}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: getItemDelay(template.animationPreset, idx) }}
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
                    sizes="400px"
                  />
                )}
                <CaptionOverlay idx={idx} caption={img.caption} />
              </motion.div>
            );

            return maybeWrapDepthScroll(card, idx);
          })}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scrollCarousel('right')}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white/80 hover:bg-black/60 hover:text-white transition-colors backdrop-blur-sm"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    );
  }

  function renderGridUniform() {
    const perspectiveStyle: React.CSSProperties =
      threeDGallery === 'perspective-grid' ? { perspective: '800px' } : {};

    return (
      <div
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        style={perspectiveStyle}
      >
        {images.map((img, idx) => {
          const rotateY = getPerspectiveRotateY(idx, 4);
          const itemStyle: React.CSSProperties =
            threeDGallery === 'perspective-grid'
              ? { transform: `perspective(800px) rotateY(${rotateY}deg)`, transition: 'transform 0.4s ease' }
              : {};

          const card = (
            <motion.div
              key={idx}
              className={`site-card group relative cursor-pointer overflow-hidden ${borderRadius}`}
              style={{ aspectRatio: '4/3', ...itemStyle }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: getItemDelay(template.animationPreset, idx) }}
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
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              )}
              <CaptionOverlay idx={idx} caption={img.caption} />
            </motion.div>
          );

          return maybeWrapDepthScroll(card, idx);
        })}
      </div>
    );
  }

  function renderLightboxFocus() {
    const heroImage = images[heroIdx];
    const thumbnails = images.filter((_, i) => i !== heroIdx);

    return (
      <div className="space-y-4">
        {/* Hero image */}
        <motion.div
          className={`site-card group relative cursor-pointer overflow-hidden ${borderRadius}`}
          style={{
            width: '100%',
            aspectRatio: '16/9',
            ...(threeDGallery === 'perspective-grid'
              ? { perspective: '800px' }
              : {}),
          }}
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          onMouseEnter={() => setHoveredIdx(heroIdx)}
          onMouseLeave={() => setHoveredIdx(null)}
          onClick={() => setLightboxIdx(heroIdx)}
        >
          {isDataUrl(heroImage.url) ? (
            <img
              src={heroImage.url}
              alt={heroImage.caption || ''}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <Image
              src={heroImage.url}
              alt={heroImage.caption || ''}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="100vw"
            />
          )}
          <CaptionOverlay idx={heroIdx} caption={heroImage.caption} />
        </motion.div>

        {/* Thumbnails */}
        <div
          className="flex gap-3 overflow-x-auto hide-scrollbar pb-2"
          style={threeDGallery === 'perspective-grid' ? { perspective: '800px' } : {}}
        >
          {thumbnails.map((img, tIdx) => {
            // Map thumbnail index back to original image index
            const originalIdx = tIdx >= heroIdx ? tIdx + 1 : tIdx;
            const rotateY =
              threeDGallery === 'perspective-grid'
                ? getPerspectiveRotateY(tIdx, thumbnails.length)
                : 0;
            const itemStyle: React.CSSProperties =
              threeDGallery === 'perspective-grid'
                ? { transform: `perspective(800px) rotateY(${rotateY}deg)`, transition: 'transform 0.4s ease' }
                : {};

            const card = (
              <motion.div
                key={originalIdx}
                className={`site-card group relative flex-shrink-0 cursor-pointer overflow-hidden ${borderRadius} ring-2 ${
                  originalIdx === heroIdx ? 'ring-white/60' : 'ring-transparent'
                } hover:ring-white/40 transition-all`}
                style={{ width: '120px', height: '80px', ...itemStyle }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: getItemDelay(template.animationPreset, tIdx) }}
                onMouseEnter={() => setHoveredIdx(originalIdx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => setHeroIdx(originalIdx)}
              >
                {isDataUrl(img.url) ? (
                  <img
                    src={img.url}
                    alt={img.caption || ''}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <Image
                    src={img.url}
                    alt={img.caption || ''}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="120px"
                  />
                )}
              </motion.div>
            );

            return maybeWrapDepthScroll(card, originalIdx);
          })}
        </div>
      </div>
    );
  }

  function renderFilmstrip() {
    return (
      <div className="relative">
        <div
          ref={filmstripRef}
          className="flex gap-4 overflow-x-auto hide-scrollbar scroll-smooth snap-x snap-mandatory py-8 px-8"
          style={{ perspective: '1000px' }}
        >
          {images.map((img, idx) => {
            const rotateY = getFilmstripRotateY(idx, images.length);

            const card = (
              <motion.div
                key={idx}
                className={`site-card group relative flex-shrink-0 cursor-pointer overflow-hidden snap-center ${borderRadius}`}
                style={{
                  width: 'clamp(260px, 30vw, 360px)',
                  height: '280px',
                  transform: `rotateY(${rotateY}deg)`,
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.5s ease',
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: getItemDelay(template.animationPreset, idx) }}
                whileHover={{ rotateY: 0, scale: 1.05 }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => setLightboxIdx(idx)}
              >
                {isDataUrl(img.url) ? (
                  <img
                    src={img.url}
                    alt={img.caption || ''}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Image
                    src={img.url}
                    alt={img.caption || ''}
                    fill
                    className="object-cover"
                    sizes="360px"
                  />
                )}
                <CaptionOverlay idx={idx} caption={img.caption} />
              </motion.div>
            );

            return maybeWrapDepthScroll(card, idx);
          })}
        </div>
      </div>
    );
  }

  return (
    <>
      <section
        id="gallery"
        className={`site-section ${sectionPadding}`}
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

          {/* Gallery Content */}
          {renderGalleryContent()}
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
