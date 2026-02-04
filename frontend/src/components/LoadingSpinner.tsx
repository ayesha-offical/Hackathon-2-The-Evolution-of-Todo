/**
 * Task: T006 | Spec: @specs/002-landing-page-ui/spec.md
 * Description: Loading spinner component for async operations
 * Purpose: Provide visual feedback during create/delete task operations
 * Reference: User Story 5 (Loading Feedback), constitution VI (UI Components)
 */

"use client";

import { motion } from "framer-motion";
import { spinnerVariants } from "@/lib/animations";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  color?: string;
  className?: string;
}

/**
 * LoadingSpinner Component
 *
 * A reusable spinner component that displays during async operations.
 * Uses Framer Motion for smooth GPU-accelerated rotation animation.
 *
 * Props:
 *   - size: 'small' (20px), 'medium' (32px), 'large' (48px)
 *   - color: CSS color value (defaults to primary theme color)
 *   - className: Additional Tailwind classes for styling
 *
 * Usage:
 *   <LoadingSpinner size="medium" />
 *   <LoadingSpinner size="small" color="#10B981" />
 */
export function LoadingSpinner({
  size = "medium",
  color = "currentColor",
  className = "",
}: LoadingSpinnerProps) {
  const sizeMap = {
    small: "w-5 h-5",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };

  return (
    <motion.div
      className={`${sizeMap[size]} ${className}`}
      animate="animate"
      variants={spinnerVariants}
    >
      <svg
        className="w-full h-full"
        fill="none"
        viewBox="0 0 24 24"
        stroke={color}
        strokeWidth={2}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="none"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </motion.div>
  );
}

/**
 * Button with Loading Spinner
 *
 * Wrapper component for buttons that need loading state
 * Automatically hides button text and shows spinner when loading
 */
interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function LoadingButton({
  isLoading = false,
  loadingText = "Loading...",
  disabled,
  children,
  className = "",
  ...props
}: LoadingButtonProps) {
  return (
    <button
      disabled={isLoading || disabled}
      className={`relative ${className}`}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <LoadingSpinner size="small" color="currentColor" />
          <span>{loadingText}</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}
