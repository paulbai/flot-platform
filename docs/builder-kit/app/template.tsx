'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * Next.js template.tsx wraps every page and re-mounts on navigation.
 * This gives us automatic page transitions without needing AnimatePresence
 * at the layout level (which would require a client-side router wrapper).
 */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
