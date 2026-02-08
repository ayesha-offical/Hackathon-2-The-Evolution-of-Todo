// Task T003: Create animation utilities file (@specs/002-landing-page-ui/tasks.md §Phase 1)
// Framer Motion configurations for consistent animations across the app

import { Variants } from 'framer-motion';

// Page transition animation
export const pageTransitionVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
};

// Fade-in animation
export const fadeInVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeInOut',
    },
  },
};

// Staggered container for multiple items
export const staggerContainerVariants: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Staggered item (child of stagger container)
export const staggerItemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

// Slide-in from left
export const slideInLeftVariants: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

// Slide-in from right
export const slideInRightVariants: Variants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

// Scale-in animation
export const scaleInVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
};

// Dropdown animation
export const dropdownVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: -10,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.15,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: {
      duration: 0.1,
      ease: 'easeIn',
    },
  },
};

// Spinner rotation animation
export const spinnerVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Respects prefers-reduced-motion preference
export const getReducedMotionVariants = (variants: Variants): Variants => {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    return variants;
  }

  // Return instant transitions
  return Object.entries(variants).reduce(
    (acc, [key, value]) => {
      if (typeof value === 'object' && value !== null) {
        acc[key] = {
          ...value,
          transition: {
            duration: 0,
          },
        };
      } else {
        acc[key] = value;
      }
      return acc;
    },
    {} as Variants
  );
};

// Scroll-triggered fade-in (for sections)
export const scrollFadeInVariants: Variants = {
  offscreen: {
    opacity: 0,
    y: 50,
  },
  onscreen: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export default {
  pageTransitionVariants,
  fadeInVariants,
  staggerContainerVariants,
  staggerItemVariants,
  slideInLeftVariants,
  slideInRightVariants,
  scaleInVariants,
  dropdownVariants,
  spinnerVariants,
  getReducedMotionVariants,
  scrollFadeInVariants,
};
