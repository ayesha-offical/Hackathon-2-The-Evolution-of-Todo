/**
 * Task: T069 | Spec: @specs/001-sdd-initialization/ui/pages.md §Shared Components
 * Task: T080 | Spec: @specs/001-sdd-initialization/ui/pages.md §TodoFusion Motion Design
 * Description: Error and Success alert components with spring animations
 * Purpose: User feedback for form submissions and API errors with spring motion
 * Reference: plan.md Step 5 §Key Design Pattern, spring animations
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ANIMATION_VARIANTS, SPRING_CONFIGS } from '@/config/animations';

interface ErrorAlertProps {
  message: string;
  onClose: () => void;
}

interface SuccessToastProps {
  message: string;
  duration?: number;
  onClose?: () => void;
}

/**
 * ErrorAlert Component
 *
 * Displays error messages with:
 * - Red background
 * - Error icon
 * - Message text
 * - Close button
 * - Does NOT auto-dismiss (user must close)
 * - Spring entrance animation
 */
export function ErrorAlert({ message, onClose }: ErrorAlertProps) {
  return (
    <motion.div
      className="alert alert-error"
      role="alert"
      aria-live="polite"
      variants={ANIMATION_VARIANTS.slideInFromRight}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={SPRING_CONFIGS.primary}
    >
      <div className="flex gap-3 w-full">
        {/* Error Icon */}
        <motion.div
          className="flex-shrink-0"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5, repeat: 1 }}
        >
          <svg
            className="h-5 w-5 text-error-light"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </motion.div>

        {/* Message */}
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>

        {/* Close Button */}
        <motion.button
          onClick={onClose}
          className="inline-flex text-error-light hover:text-error focus:outline-none"
          aria-label="Close error message"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={SPRING_CONFIGS.primary}
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  );
}

/**
 * SuccessToast Component
 *
 * Displays success messages with:
 * - Green background
 * - Success icon with check animation
 * - Message text
 * - Auto-dismisses after duration (default 3s)
 * - Manual close button
 * - Spring entrance and exit animations
 */
export function SuccessToast({
  message,
  duration = 3000,
  onClose,
}: SuccessToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="alert alert-success"
          role="status"
          aria-live="polite"
          variants={ANIMATION_VARIANTS.slideInFromRight}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={SPRING_CONFIGS.primary}
        >
          <div className="flex gap-3 w-full">
            {/* Success Icon */}
            <motion.div
              className="flex-shrink-0"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <svg
                className="h-5 w-5 text-success-light"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.div>

            {/* Message */}
            <div className="flex-1">
              <p className="text-sm font-medium">{message}</p>
            </div>

            {/* Close Button */}
            <motion.button
              onClick={() => {
                setIsVisible(false);
                onClose?.();
              }}
              className="inline-flex text-success-light hover:text-success focus:outline-none"
              aria-label="Close success message"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={SPRING_CONFIGS.primary}
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * AlertContainer Component
 *
 * Container for positioning alerts at the top of the page
 * Fixed position, z-index managed for stacking
 * With staggered animations for multiple alerts
 */
export function AlertContainer({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="fixed top-4 right-4 max-w-sm z-50 space-y-2"
      variants={ANIMATION_VARIANTS.listContainer}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}
