/**
 * Task: T011 | Spec: @specs/002-landing-page-ui/spec.md
 * Description: Features section displaying FocusHub capabilities
 * Purpose: Highlight core value propositions with feature cards
 * Reference: User Story 1 (P1), spec.md AC-1.6
 */

"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { containerVariants, featureCardVariants } from "@/lib/animations";

const features = [
  {
    icon: "🎯",
    title: "Focus Management",
    description: "Distraction-free task management to help you stay on target",
  },
  {
    icon: "🔒",
    title: "User Isolation",
    description: "Your data is completely isolated and secure",
  },
  {
    icon: "💾",
    title: "Data Persistence",
    description: "All your work is automatically saved and backed up",
  },
  {
    icon: "⚡",
    title: "Smooth Experience",
    description: "Lightning-fast performance with beautiful animations",
  },
];

export function FeaturesSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section
      ref={ref}
      className="w-full px-4 sm:px-6 lg:px-8 py-20 sm:py-24 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <motion.h2
          className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-50 mb-4 text-center"
          style={{ fontFamily: "var(--font-heading)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          Powerful Features
        </motion.h2>

        <motion.p
          className="text-center text-lg text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto"
          style={{ fontFamily: "var(--font-body)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Everything you need to manage your focus and productivity in one elegant platform
        </motion.p>

        {/* Feature Cards Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={featureCardVariants}
              className="group p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1"
            >
              {/* Icon */}
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>

              {/* Title */}
              <h3
                className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-3"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {feature.title}
              </h3>

              {/* Description */}
              <p
                className="text-slate-600 dark:text-slate-400 leading-relaxed"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {feature.description}
              </p>

              {/* Border accent on hover */}
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p
                  className="text-sm text-indigo-600 dark:text-indigo-400 font-medium"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Learn more →
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <button
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Explore All Features
          </button>
        </motion.div>
      </div>
    </section>
  );
}
