/**
 * Task: T080 | Spec: @specs/001-sdd-initialization/ui/pages.md §TodoFusion Motion Design
 * Description: Centralized animation configuration with spring physics and variants
 * Purpose: Provide reusable Framer Motion variants matching TodoFusion aesthetic
 * Reference: https://todofusion.framer.website/ (spring: stiffness 400, damping 30)
 */

/**
 * Spring Physics Configuration
 * TodoFusion Specs: stiffness 400, damping 30 for natural spring feel
 */
export const SPRING_CONFIGS = {
  /**
   * Primary spring matching TodoFusion spec exactly
   * stiffness: controls how fast the animation is
   * damping: controls how much bounce/overshoot
   */
  primary: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 30,
    mass: 1,
  },

  /**
   * Bouncy variant for playful interactions (higher stiffness, lower damping)
   * Used for button taps and checkbox interactions
   */
  bouncy: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 25,
    mass: 1,
  },

  /**
   * Smooth variant for subtle animations (lower stiffness, higher damping)
   * Used for input focus, gentle transitions
   */
  smooth: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 35,
    mass: 1,
  },

  /**
   * Gentle variant for entrance animations (lowest stiffness, highest damping)
   * Used for page load and element appearing
   */
  gentle: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 40,
    mass: 1,
  },
} as const;

/**
 * Stagger Timing Configurations
 * TodoFusion uses 300ms, 400ms, 500ms increments for staggered animations
 */
export const STAGGER_DELAYS = {
  fast: 0.1, // 100ms
  normal: 0.15, // 150ms
  slow: 0.2, // 200ms
  todoFusion: {
    first: 0.3, // 300ms
    second: 0.4, // 400ms
    third: 0.5, // 500ms
  },
} as const;

/**
 * Reusable Animation Variants for Framer Motion
 * These variants define the animation states and transitions for common components
 */
export const ANIMATION_VARIANTS = {
  /**
   * Appear Animation - TodoFusion entrance pattern
   * Combines: opacity 0→1, translateY 64px→0, scale 0.95→1
   * Creates a lifting, growing entrance effect
   */
  appear: {
    hidden: {
      opacity: 0,
      y: 64, // translateY(64px)
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: SPRING_CONFIGS.primary,
    },
  },

  /**
   * Card Hover Animation
   * Interactive cards that bounce slightly on hover
   * rest → hover on mouseEnter
   * rest → tap on tap
   */
  cardHover: {
    rest: {
      scale: 1,
      y: 0,
    },
    hover: {
      scale: 1.02,
      y: -4, // Lift effect
      transition: SPRING_CONFIGS.bouncy,
    },
    tap: {
      scale: 0.98,
      transition: SPRING_CONFIGS.primary,
    },
  },

  /**
   * Button Tap Animation
   * Simple scale-down feedback for button clicks
   */
  buttonTap: {
    rest: {
      scale: 1,
    },
    tap: {
      scale: 0.95,
      transition: SPRING_CONFIGS.primary,
    },
  },

  /**
   * Input Focus Animation
   * Subtle scale and glow effect on input focus
   */
  inputFocus: {
    blur: {
      scale: 1,
      boxShadow: '0 0 0px rgba(134, 36, 255, 0)',
    },
    focus: {
      scale: 1.01,
      boxShadow: '0 0 10px rgba(134, 36, 255, 0.2)',
      transition: SPRING_CONFIGS.smooth,
    },
  },

  /**
   * Slide In From Left
   * For drawer or panel animations entering from left
   */
  slideInFromLeft: {
    hidden: {
      x: -100,
      opacity: 0,
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: SPRING_CONFIGS.primary,
    },
  },

  /**
   * Slide In From Right
   * For drawer or panel animations entering from right
   */
  slideInFromRight: {
    hidden: {
      x: 100,
      opacity: 0,
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: SPRING_CONFIGS.primary,
    },
  },

  /**
   * Slide In From Bottom
   * For content entering from below (e.g. hero text)
   */
  slideInFromBottom: {
    hidden: {
      y: 40,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: SPRING_CONFIGS.primary,
    },
  },

  /**
   * Fade In Animation
   * Simple opacity transition without movement
   */
  fadeIn: {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
  },

  /**
   * Staggered List Container
   * Parent wrapper for lists with staggered children
   * Automatically staggers children based on stagger configuration
   */
  listContainer: {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: STAGGER_DELAYS.normal,
        delayChildren: 0.1,
      },
    },
  },

  /**
   * Staggered List Item
   * Individual list item animation
   * Used inside listContainer for coordinated entrance
   */
  listItem: {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: SPRING_CONFIGS.primary,
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.2,
      },
    },
  },

  /**
   * Scale Bounce Animation
   * For checkbox and toggle interactions
   */
  scaleBounce: {
    rest: {
      scale: 1,
    },
    active: {
      scale: 1.15,
      transition: SPRING_CONFIGS.bouncy,
    },
  },

  /**
   * Checkbox Animation
   * Combined scale and check mark animation
   */
  checkbox: {
    unchecked: {
      scale: 1,
      rotate: 0,
    },
    checked: {
      scale: 1.1,
      rotate: 360,
      transition: SPRING_CONFIGS.primary,
    },
  },

  /**
   * Button Loading Animation
   * Spinner rotation for loading states
   */
  spinner: {
    spinning: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  },

  /**
   * Error Shake Animation
   * Quick left-right shake for form errors
   */
  errorShake: {
    shake: {
      x: [-10, 10, -10, 10, 0],
      transition: {
        duration: 0.4,
      },
    },
  },

  /**
   * Status Badge Animation
   * For status changes with color transitions
   */
  statusBadge: {
    initial: {
      scale: 0,
      opacity: 0,
    },
    animate: {
      scale: 1,
      opacity: 1,
      transition: SPRING_CONFIGS.primary,
    },
  },

  /**
   * Mobile Menu Overlay
   * Simple fade for dark overlay behind menu
   */
  overlayFade: {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.2,
      },
    },
  },
} as const;

/**
 * Utility function to handle accessibility preferences
 * Returns animation variant with disabled transitions if user prefers reduced motion
 * WCAG 2.1 Success Criterion 2.3.3 (Animation from Interactions)
 */
export function getReducedMotionVariant(variant: any, isReduced: boolean = false) {
  if (isReduced) {
    return {
      ...variant,
      transition: { duration: 0.01 }, // Nearly instant transition
    };
  }
  return variant;
}

/**
 * Creates a custom staggered animation configuration
 * Allows fine-tuning of stagger timing per component
 */
export function createStaggerVariants(
  delayBetween: number = STAGGER_DELAYS.normal,
  itemVariant: any = ANIMATION_VARIANTS.listItem
) {
  return {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: delayBetween,
          delayChildren: 0.1,
        },
      },
    },
    item: itemVariant,
  };
}

/**
 * Creates a TodoFusion-style staggered animation with exact timing
 * Matches TodoFusion spec: 300ms, 400ms, 500ms delays
 */
export function createTodoFusionStagger(
  itemVariant: any = ANIMATION_VARIANTS.listItem
) {
  return {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1, // 100ms between each child
          delayChildren: 0.3, // Start after 300ms
        },
      },
    },
    item: itemVariant,
  };
}

/**
 * Variant for button animations matching component patterns
 * Combines hover and tap states with spring physics
 */
export const buttonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.05, transition: SPRING_CONFIGS.bouncy },
  tap: { scale: 0.95, transition: SPRING_CONFIGS.primary },
};

/**
 * Variant for input fields with focus glow effect
 */
export const inputVariants = {
  blur: {
    scale: 1,
    boxShadow: '0 0 0px rgba(134, 36, 255, 0)',
  },
  focus: {
    scale: 1.01,
    boxShadow: '0 0 10px rgba(134, 36, 255, 0.2)',
    transition: SPRING_CONFIGS.smooth,
  },
};

/**
 * Page transition variant for full-page content
 * Used on main layout areas
 */
export const pageTransitionVariants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
};

/**
 * Export all animations as a namespace for convenient access
 * Usage: ANIMATIONS.appear, ANIMATIONS.cardHover, etc.
 */
export const ANIMATIONS = {
  variants: ANIMATION_VARIANTS,
  springs: SPRING_CONFIGS,
  stagger: STAGGER_DELAYS,
  helpers: {
    getReducedMotionVariant,
    createStaggerVariants,
    createTodoFusionStagger,
  },
} as const;

/**
 * Default export for convenience
 */
export default ANIMATION_VARIANTS;
