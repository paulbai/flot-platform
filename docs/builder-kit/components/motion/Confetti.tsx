'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface ConfettiProps {
  accentColor?: string;
  count?: number;
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

const colors = ['var(--flot)', 'var(--hotel)', 'var(--restaurant)', 'var(--travel)', 'var(--fashion)', 'var(--success)'];

export default function Confetti({ accentColor, count = 40 }: ConfettiProps) {
  const particles = useMemo(() => {
    const allColors = accentColor ? [accentColor, ...colors] : colors;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: randomBetween(-150, 150),
      y: randomBetween(-300, -100),
      rotation: randomBetween(-360, 360),
      scale: randomBetween(0.5, 1.2),
      color: allColors[Math.floor(Math.random() * allColors.length)],
      shape: Math.random() > 0.5 ? 'circle' : 'rect',
      duration: randomBetween(0.8, 1.6),
      delay: randomBetween(0, 0.4),
    }));
  }, [accentColor, count]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {/* Radial burst */}
      <motion.div
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{ scale: 3, opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full"
        style={{ background: `radial-gradient(circle, ${accentColor || 'var(--flot)'}40, transparent)` }}
      />

      {/* Confetti particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            x: '50%',
            y: '40%',
            scale: 0,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            x: `calc(50% + ${p.x}px)`,
            y: `calc(40% + ${p.y}px)`,
            scale: p.scale,
            rotate: p.rotation,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
          }}
          className="absolute"
          style={{
            width: p.shape === 'circle' ? 8 : 6,
            height: p.shape === 'circle' ? 8 : 12,
            borderRadius: p.shape === 'circle' ? '50%' : 2,
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  );
}
