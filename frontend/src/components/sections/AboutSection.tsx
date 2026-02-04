/**
 * Task: T010 | Spec: @specs/002-landing-page-ui/spec.md
 * Description: About section for FocusHub landing page
 * Purpose: Explain FocusHub's mission and key value points
 * Reference: User Story 1 (P1), spec.md AC-1.6
 */

"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { sectionScrollVariants } from "@/lib/animations";

export function AboutSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section
      ref={ref}
      className="w-full px-4 sm:px-6 lg:px-8 py-20 sm:py-24 bg-white dark:bg-slate-900"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          variants={sectionScrollVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {/* Section Title */}
          <h2
            className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-50 mb-8 text-center"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            About FocusHub
          </h2>

          {/* About Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Left: Description */}
            <div>
              <p
                className="text-lg text-slate-600 dark:text-slate-300 mb-6 leading-relaxed"
                style={{ fontFamily: "var(--font-body)" }}
              >
                FocusHub is a mission-driven task management platform designed for professionals who demand both simplicity and power. We believe productivity shouldn't be complicated.
              </p>
              <p
                className="text-lg text-slate-600 dark:text-slate-300 mb-6 leading-relaxed"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Built with modern principles of user isolation and data persistence, FocusHub ensures your focus stays where it matters—on your work, not on tool complexity.
              </p>
            </div>

            {/* Right: Key Points */}
            <div className="space-y-4">
              {[
                {
                  title: "Why FocusHub?",
                  items: [
                    "Clean, intuitive interface",
                    "Your tasks, your privacy",
                    "Enterprise-grade performance",
                    "Built for teams and individuals",
                  ],
                },
              ].map((section, idx) => (
                <div key={idx}>
                  <h3
                    className="font-semibold text-indigo-600 dark:text-indigo-400 mb-3 text-lg"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {section.title}
                  </h3>
                  <ul className="space-y-2">
                    {section.items.map((item, itemIdx) => (
                      <li
                        key={itemIdx}
                        className="flex items-start gap-3 text-slate-600 dark:text-slate-400"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        <span className="text-indigo-600 dark:text-indigo-400 mt-1">
                          ✓
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Stats or Callout */}
          <div className="bg-gradient-to-r from-indigo-50 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl p-8 border border-indigo-200 dark:border-slate-700">
            <p
              className="text-center text-slate-700 dark:text-slate-300 text-lg"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Join thousands of focused professionals and teams already using FocusHub to manage their work with confidence.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
