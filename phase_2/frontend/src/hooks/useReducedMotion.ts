/**
 * Task: T080 | Spec: @specs/001-sdd-initialization/ui/pages.md §TodoFusion Motion Design
 * Description: React hook to detect user's motion preference
 * Purpose: Ensure animations respect prefers-reduced-motion for accessibility
 * Reference: WCAG 2.1 Success Criterion 2.3.3 (Animation from Interactions)
 */

import { useEffect, useState } from 'react';

/**
 * useReducedMotion Hook
 *
 * Detects whether the user has enabled "prefers-reduced-motion" in their OS settings
 * Returns a boolean that can be used to disable or minimize animations
 *
 * Usage:
 * ```typescript
 * const prefersReducedMotion = useReducedMotion();
 *
 * <motion.div
 *   variants={prefersReducedMotion ? minimalVariant : fullVariant}
 * >
 *   Content
 * </motion.div>
 * ```
 *
 * Accessible to users on:
 * - macOS: System Preferences → Accessibility → Display → Reduce motion
 * - Windows: Settings → Ease of Access → Display → Show animations
 * - Linux: GNOME Settings → Universal Access → Reduce Animation
 * - iOS: Settings → Accessibility → Motion → Reduce Motion
 * - Android: Settings → Accessibility → Remove animations
 *
 * @returns {boolean} true if user prefers reduced motion, false otherwise
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check initial preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes to the preference
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Use addEventListener for better browser compatibility
    // (addListener is deprecated)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    // Fallback for older browsers
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook to get spring configuration respecting reduced motion
 * Returns minimal or full spring config based on user preference
 *
 * Usage:
 * ```typescript
 * const springConfig = useSpringConfig();
 *
 * <motion.div transition={springConfig}>
 *   Content
 * </motion.div>
 * ```
 *
 * @returns {object} Spring configuration object
 */
export function useSpringConfig() {
  const prefersReducedMotion = useReducedMotion();

  return prefersReducedMotion
    ? { duration: 0.01 } // Nearly instant
    : { type: 'spring' as const, stiffness: 400, damping: 30 };
}

/**
 * Hook to conditionally apply animation variants based on reduced motion preference
 * Simplifies the pattern of checking prefersReducedMotion in components
 *
 * Usage:
 * ```typescript
 * const variants = useAnimationVariants(fullVariant, reducedVariant);
 *
 * <motion.div variants={variants}>
 *   Content
 * </motion.div>
 * ```
 *
 * @param fullVariant - Framer Motion variant object for normal animations
 * @param reducedVariant - Framer Motion variant object for reduced motion (optional)
 * @returns {object} Appropriate variant object based on user preference
 */
export function useAnimationVariants(fullVariant: any, reducedVariant?: any) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion && reducedVariant) {
    return reducedVariant;
  }

  if (prefersReducedMotion && !reducedVariant) {
    // Return variant with instant transitions if no reduced variant provided
    return {
      ...fullVariant,
      transition: { duration: 0.01 },
    };
  }

  return fullVariant;
}

/**
 * Hook to get animation duration respecting reduced motion
 * Returns either a minimal duration or full duration
 *
 * Usage:
 * ```typescript
 * const duration = useAnimationDuration(0.3);
 *
 * <motion.div
 *   initial={{ opacity: 0 }}
 *   animate={{ opacity: 1 }}
 *   transition={{ duration }}
 * >
 *   Content
 * </motion.div>
 * ```
 *
 * @param fullDuration - Duration in seconds for normal animations
 * @returns {number} Appropriate duration based on user preference
 */
export function useAnimationDuration(fullDuration: number): number {
  const prefersReducedMotion = useReducedMotion();
  return prefersReducedMotion ? 0.01 : fullDuration;
}

/**
 * Hook to get stagger configuration respecting reduced motion
 * Returns either minimal stagger or full stagger timing
 *
 * Usage:
 * ```typescript
 * const stagger = useStaggerDelay(0.15);
 *
 * <motion.div
 *   variants={listContainer}
 *   transition={{
 *     staggerChildren: stagger,
 *   }}
 * >
 *   {items.map(item => ...)}
 * </motion.div>
 * ```
 *
 * @param fullStagger - Stagger delay in seconds for normal animations
 * @returns {number} Appropriate stagger delay based on user preference
 */
export function useStaggerDelay(fullStagger: number): number {
  const prefersReducedMotion = useReducedMotion();
  return prefersReducedMotion ? 0 : fullStagger;
}

export default useReducedMotion;
