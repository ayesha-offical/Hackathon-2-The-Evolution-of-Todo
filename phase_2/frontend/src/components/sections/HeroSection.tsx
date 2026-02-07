// Task T009: Create HeroSection component (@specs/002-landing-page-ui/tasks.md §Phase 3, US1)
// Updated: Modern blue/cyan theme with gradient text and enhanced animations
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { fadeInVariants, staggerItemVariants } from '@/lib/animations';
import { ANIMATION_VARIANTS, SPRING_CONFIGS } from '@/config/animations';

export default function HeroSection() {
  return (
    <motion.section
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 lg:pt-36 pb-12 sm:pb-16 lg:pb-20"
      variants={fadeInVariants}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
    >
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 mb-8"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={SPRING_CONFIGS.bouncy}
        >
          <span className="text-sm font-semibold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            🚀 Welcome to FocusHub
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent"
          variants={staggerItemVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          style={{
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontWeight: 700,
          }}
        >
          Professional Focus Management, Simplified
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed"
          variants={staggerItemVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          FocusHub helps you stay organized, track your progress, and accomplish your goals with a clean, intuitive interface designed for productivity.
        </motion.p>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 max-w-2xl mx-auto"
          variants={staggerItemVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-400/20">
            <span className="text-cyan-400 text-2xl">✓</span>
            <span className="text-gray-300 text-sm sm:text-base">Smart Organization</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-400/20">
            <span className="text-cyan-400 text-2xl">✓</span>
            <span className="text-gray-300 text-sm sm:text-base">Real-time Sync</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-400/20">
            <span className="text-cyan-400 text-2xl">✓</span>
            <span className="text-gray-300 text-sm sm:text-base">Cloud Secure</span>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          variants={staggerItemVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <motion.a
            href="/register"
            className="px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-lg transition-all duration-200 shadow-lg hover:shadow-cyan-500/30"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={SPRING_CONFIGS.primary}
          >
            🚀 Get Started
          </motion.a>
          <motion.a
            href="/login"
            className="px-8 py-4 text-lg font-bold text-white bg-gray-700/40 border border-gray-600/50 hover:bg-gray-700/60 rounded-lg transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={SPRING_CONFIGS.primary}
          >
            Sign In
          </motion.a>
        </motion.div>
      </div>
    </motion.section>
  );
}
