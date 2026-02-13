// Task T028: Create AnimatedPage wrapper component (@specs/002-landing-page-ui/tasks.md §Phase 6, US4)
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { pageTransitionVariants } from '@/lib/animations';

interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * AnimatedPage Component
 * Wraps page content with Framer Motion fade-in and slide-up animation
 * Provides consistent page transitions across all routes
 * 
 * @param children - Page content to animate
 * @param className - Additional CSS classes to apply
 */
export default function AnimatedPage({ children, className = '' }: AnimatedPageProps) {
  return (
    <motion.div
      className={className}
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}
