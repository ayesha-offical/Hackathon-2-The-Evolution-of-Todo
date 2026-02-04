/**
 * Task: T028 | Spec: @specs/002-landing-page-ui/spec.md §US4 Page Transitions
 * Description: Wrapper component for smooth page transition animations
 * Purpose: Provide consistent fade-in + slide-up animation across all pages
 * Reference: User Story 4 (P2), spec.md AC-4.1, AC-4.2
 */

'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { pageTransitionVariants, pageTransitionConfig } from '@/lib/animations';

interface AnimatedPageProps {
  children: ReactNode;
}

/**
 * AnimatedPage Component
 *
 * Wraps page content with smooth fade-in + slide-up animation on mount
 * Animation: Opacity 0→1, Y position 20px→0 over 300ms (ease-in-out)
 * GPU-accelerated using transform/opacity (no layout-changing properties)
 *
 * Usage:
 *   export default function LoginPage() {
 *     return (
 *       <AnimatedPage>
 *         <YourPageContent />
 *       </AnimatedPage>
 *     );
 *   }
 *
 * Performance:
 * - Uses only opacity and transform (GPU accelerated)
 * - 60 FPS animation on modern devices
 * - Respects prefers-reduced-motion for accessibility
 */
export function AnimatedPage({ children }: AnimatedPageProps) {
  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransitionConfig}
    >
      {children}
    </motion.div>
  );
}
