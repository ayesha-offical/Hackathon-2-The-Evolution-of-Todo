/**
 * Task: T024 | Spec: @specs/002-landing-page-ui/spec.md §User Story 3
 * Description: Celebratory confetti animation on successful authentication
 * Purpose: Provide positive visual feedback for successful login or signup
 * Reference: plan.md §Confetti Animation Component, tasks.md §Phase 5
 */

"use client";

import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { motion } from "framer-motion";

interface ConfettiAnimationProps {
  isActive: boolean;
  onComplete: () => void;
  duration?: number; // Duration in milliseconds, default 2000 (2 seconds)
}

export function ConfettiAnimation({
  isActive,
  onComplete,
  duration = 2000,
}: ConfettiAnimationProps) {
  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    // Set window dimensions on mount
    setWindowDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // Handle window resize
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isActive) return;

    // Auto-complete after duration
    const timer = setTimeout(() => {
      try {
        onComplete();
      } catch (error) {
        console.error("[ConfettiAnimation] Error calling onComplete:", error);
        // Fallback: still redirect even if error occurs
        onComplete();
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [isActive, duration, onComplete]);

  if (!isActive || windowDimensions.width === 0) {
    return null;
  }

  return (
    <motion.div
      className="fixed inset-0 z-[1000] pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Confetti
        width={windowDimensions.width}
        height={windowDimensions.height}
        numberOfPieces={200}
        recycle={false}
        gravity={0.3}
        confettiSource={{
          x: windowDimensions.width / 2,
          y: -10,
          w: 10,
          h: 10,
        }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />

      {/* Optional celebratory message */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <motion.div
          className="text-center"
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: 1,
            ease: "easeInOut",
          }}
        >
          <h2 className="text-4xl font-bold text-white mb-2">🎉</h2>
          <p className="text-xl font-semibold text-white">Welcome to FocusHub!</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
