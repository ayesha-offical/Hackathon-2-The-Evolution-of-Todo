/**
 * Task: T012 | Spec: @specs/002-landing-page-ui/spec.md
 * Description: Contact section with CTA and contact information
 * Purpose: Provide contact information and call-to-action for engaged users
 * Reference: User Story 1 (P1), spec.md AC-1.6
 */

"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { sectionScrollVariants } from "@/lib/animations";

export function ContactSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section
      ref={ref}
      className="w-full px-4 sm:px-6 lg:px-8 py-20 sm:py-24 bg-gradient-to-br from-indigo-600 to-indigo-700 dark:from-indigo-900 dark:to-indigo-950"
    >
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          variants={sectionScrollVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {/* Section Title */}
          <h2
            className="text-4xl sm:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Ready to Focus?
          </h2>

          <p
            className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Join thousands of professionals managing their focus with FocusHub. Start your journey to better productivity today.
          </p>

          {/* Contact Methods */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12 max-w-2xl mx-auto">
            <motion.div
              className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 hover:bg-white/20 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-3xl mb-3">📧</div>
              <h3
                className="font-semibold text-white mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Email
              </h3>
              <a
                href="mailto:hello@focushub.app"
                className="text-indigo-100 hover:text-white transition-colors"
                style={{ fontFamily: "var(--font-body)" }}
              >
                hello@focushub.app
              </a>
            </motion.div>

            <motion.div
              className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 hover:bg-white/20 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-3xl mb-3">🌐</div>
              <h3
                className="font-semibold text-white mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Website
              </h3>
              <a
                href="https://focushub.app"
                className="text-indigo-100 hover:text-white transition-colors"
                style={{ fontFamily: "var(--font-body)" }}
              >
                focushub.app
              </a>
            </motion.div>
          </div>

          {/* Primary CTA */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            whileHover={{ scale: 1.02 }}
          >
            <button
              className="px-10 py-4 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-all duration-300 shadow-lg hover:shadow-xl"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Get Started Free
            </button>
            <button
              className="px-10 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Schedule Demo
            </button>
          </motion.div>

          {/* Footer note */}
          <p
            className="text-sm text-indigo-100"
            style={{ fontFamily: "var(--font-body)" }}
          >
            No credit card required. Start managing your focus in minutes.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
