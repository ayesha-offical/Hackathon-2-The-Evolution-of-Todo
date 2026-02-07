// Task T006: Create LoadingSpinner component (@specs/002-landing-page-ui/tasks.md §Phase 2)
'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
}

/**
 * LoadingSpinner Component
 * Renders a smooth rotating loading spinner using Framer Motion
 * 
 * @param size - Size of spinner: 'small' (16px), 'medium' (24px), 'large' (32px)
 * @param color - Color of spinner (default: currentColor)
 * @param className - Additional CSS classes
 */
export default function LoadingSpinner({
  size = 'medium',
  color = 'currentColor',
  className = '',
}: LoadingSpinnerProps) {
  const sizeMap = {
    small: 16,
    medium: 24,
    large: 32,
  };

  const dimension = sizeMap[size];

  return (
    <motion.div
      className={`inline-flex items-center justify-center ${className}`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{
        width: dimension,
        height: dimension,
      }}
      aria-label="Loading"
    >
      <svg
        width={dimension}
        height={dimension}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" opacity="0.2" />
        <circle
          cx="12"
          cy="12"
          r="10"
          strokeDasharray="60"
          strokeDashoffset="0"
          style={{
            strokeOpacity: 1,
            transition: 'stroke-dashoffset 0.3s ease-in-out',
          }}
        />
        <defs>
          <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}
