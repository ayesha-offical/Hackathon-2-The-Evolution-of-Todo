/**
 * Task: T024 | Spec: @specs/002-landing-page-ui/spec.md
 * Description: Celebratory confetti animation on auth success
 * Purpose: Provide positive visual feedback when user logs in or signs up
 * Reference: User Story 3 (P2), spec.md AC-3.1, AC-3.2, AC-3.3, AC-3.4
 */

"use client";

import { useEffect, useState } from "react";
import Confetti from "react-confetti";

// Fallback for useWindowSize if react-use is not available
function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    setSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

interface ConfettiAnimationProps {
  isActive: boolean;
  onComplete: () => void;
  duration?: number;
}

/**
 * ConfettiAnimation Component
 *
 * Renders celebratory confetti for 2.5 seconds (default) on login/signup success.
 * Non-blocking: allows page interactions during animation.
 * Gracefully handles errors with fallback to instant completion.
 *
 * Props:
 *   - isActive: Whether to show confetti
 *   - onComplete: Callback when animation finishes (auto-redirects to dashboard)
 *   - duration: Animation duration in ms (default 2500)
 *
 * Usage:
 *   const [showConfetti, setShowConfetti] = useState(false);
 *   <ConfettiAnimation isActive={showConfetti} onComplete={() => router.push('/dashboard')} />
 */
export function ConfettiAnimation({
  isActive,
  onComplete,
  duration = 2500,
}: ConfettiAnimationProps) {
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    try {
      setShowConfetti(true);

      // Auto-complete after duration
      const timer = setTimeout(() => {
        setShowConfetti(false);
        onComplete();
      }, duration);

      return () => clearTimeout(timer);
    } catch (error) {
      console.error("[Confetti] Animation error:", error);
      // Graceful fallback: redirect immediately on error
      onComplete();
    }
  }, [isActive, duration, onComplete]);

  if (!showConfetti) {
    return null;
  }

  try {
    return (
      <Confetti
        width={width}
        height={height}
        numberOfPieces={150}
        gravity={0.5}
        recycle={false}
        colors={["#4F46E5", "#818CF8", "#10B981", "#F59E0B", "#E87BF8"]}
        initialVelocityX={{ min: -5, max: 5 }}
        initialVelocityY={{ min: 5, max: 15 }}
      />
    );
  } catch (error) {
    console.error("[Confetti] Render error:", error);
    // Fallback: still complete even if confetti fails to render
    onComplete();
    return null;
  }
}

/**
 * Hook to easily use confetti animation in other components
 */
export function useConfetti(onComplete: () => void) {
  const [showConfetti, setShowConfetti] = useState(false);

  const triggerConfetti = () => {
    setShowConfetti(true);
  };

  const handleConfettiComplete = () => {
    setShowConfetti(false);
    onComplete();
  };

  return {
    showConfetti,
    triggerConfetti,
    handleConfettiComplete,
  };
}
