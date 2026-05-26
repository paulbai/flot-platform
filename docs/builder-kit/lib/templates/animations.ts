'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Variants } from 'framer-motion';
import type { AnimationPreset, ThreeDEffect } from './types';

/* ── Framer Motion Variants ── */

export function getSectionVariants(preset: AnimationPreset): Variants {
  switch (preset) {
    case 'fade-up':
      return {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
      };
    case 'fade-in':
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5 } },
      };
    case 'slide-in':
      return {
        hidden: { opacity: 0, x: -40 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
      };
    case 'scale-up':
      return {
        hidden: { opacity: 0, scale: 0.92 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
      };
    case 'stagger-cascade':
      return {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
      };
    case 'none':
    default:
      return {
        hidden: { opacity: 1 },
        visible: { opacity: 1 },
      };
  }
}

export function getItemDelay(preset: AnimationPreset, index: number): number {
  switch (preset) {
    case 'stagger-cascade': return index * 0.15;
    case 'fade-up': return index * 0.1;
    case 'slide-in': return index * 0.1;
    case 'scale-up': return index * 0.08;
    default: return index * 0.08;
  }
}

/* ── 3D Tilt Effect (mouse-driven) ── */

interface TiltState {
  rotateX: number;
  rotateY: number;
  scale: number;
}

export function useTiltEffect(intensity: number = 50) {
  const [tilt, setTilt] = useState<TiltState>({ rotateX: 0, rotateY: 0, scale: 1 });
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const maxDeg = (intensity / 100) * 12; // max 12deg at intensity 100

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion.current || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rotateX: -y * maxDeg,
      rotateY: x * maxDeg,
      scale: 1.02,
    });
  }, [maxDeg]);

  const onMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0, scale: 1 });
  }, []);

  const style: React.CSSProperties = {
    transform: `perspective(600px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${tilt.scale})`,
    transition: 'transform 0.2s ease-out',
    willChange: 'transform',
  };

  return { ref, onMouseMove, onMouseLeave, style };
}

/* ── CSS class helpers ── */

export function get3DCardClass(effect: ThreeDEffect): string {
  switch (effect) {
    case 'float': return 'animate-float';
    case 'tilt-cards': return 'perspective-container';
    default: return '';
  }
}

export function getBorderRadius(radius: 'none' | 'sm' | 'md' | 'lg' | 'full'): string {
  switch (radius) {
    case 'none': return 'rounded-none';
    case 'sm': return 'rounded-lg';
    case 'md': return 'rounded-xl';
    case 'lg': return 'rounded-2xl';
    case 'full': return 'rounded-3xl';
  }
}

export function getSectionPadding(spacing: 'compact' | 'normal' | 'spacious'): string {
  switch (spacing) {
    case 'compact': return 'py-14 sm:py-20';
    case 'normal': return 'py-20 sm:py-28';
    case 'spacious': return 'py-28 sm:py-36';
  }
}

export function getCardStyles(
  cardStyle: 'flat' | 'elevated' | 'outlined' | 'glass',
  accentColor: string,
  bgColor: string
): React.CSSProperties {
  switch (cardStyle) {
    case 'flat':
      return {
        backgroundColor: `color-mix(in srgb, ${bgColor} 90%, ${accentColor})`,
      };
    case 'elevated':
      return {
        backgroundColor: `color-mix(in srgb, ${bgColor} 90%, ${accentColor})`,
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
      };
    case 'outlined':
      return {
        backgroundColor: 'transparent',
        border: `1px solid color-mix(in srgb, ${accentColor} 30%, transparent)`,
      };
    case 'glass':
      return {
        backgroundColor: `color-mix(in srgb, ${bgColor} 70%, transparent)`,
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.1)',
      };
  }
}
