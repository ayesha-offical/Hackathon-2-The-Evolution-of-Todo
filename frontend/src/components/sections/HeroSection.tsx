/**
 * Task: T009 | Spec: @specs/002-landing-page-ui/spec.md
 * Description: Hero section for FocusHub landing page
 * Purpose: Create compelling first impression with FocusHub branding and value proposition
 * Reference: User Story 1 (P1), spec.md AC-1.1, AC-1.6
 */

"use client";

import { motion } from "framer-motion";
import {
  heroHeadingVariants,
  heroTaglineVariants,
  heroCTAVariants,
} from "@/lib/animations";

export function HeroSection() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 sm:py-24 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200 dark:bg-indigo-900/30 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-slate-300 dark:bg-slate-700/30 rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Main Heading - FocusHub */}
        <motion.h1
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
          style={{ fontFamily: "var(--font-heading)" }}
          variants={heroHeadingVariants}
          initial="hidden"
          animate="visible"
        >
          <span className="text-slate-900 dark:text-slate-50">Focus</span>
          <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 dark:from-indigo-400 dark:to-indigo-300 bg-clip-text text-transparent">
            Hub
          </span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 mb-8 font-medium"
          style={{ fontFamily: "var(--font-body)" }}
          variants={heroTaglineVariants}
          initial="hidden"
          animate="visible"
        >
          Professional focus management, simplified
        </motion.p>

        {/* Value Proposition */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 max-w-2xl mx-auto"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.4,
              },
            },
          }}
          initial="hidden"
          animate="visible"
        >
          {[
            { icon: "✨", title: "Smart Focus", desc: "Distraction-free task management" },
            { icon: "🔒", title: "Isolated", desc: "Your tasks are yours alone" },
            { icon: "⚡", title: "Fast", desc: "Lightning quick performance" },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="p-4 rounded-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700"
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <div className="text-3xl mb-2">{item.icon}</div>
              <h3
                className="font-semibold text-slate-900 dark:text-slate-50 mb-1"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {item.title}
              </h3>
              <p
                className="text-sm text-slate-600 dark:text-slate-400"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {item.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          variants={heroCTAVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.button
            className="px-8 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold rounded-lg hover:shadow-lg hover:from-indigo-700 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105"
            style={{ fontFamily: "var(--font-body)" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started
          </motion.button>
          <motion.button
            className="px-8 py-3 sm:py-4 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold rounded-lg border-2 border-indigo-600 dark:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all duration-300"
            style={{ fontFamily: "var(--font-body)" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Learn More
          </motion.button>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="mt-16 flex justify-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="text-slate-400 dark:text-slate-600">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
