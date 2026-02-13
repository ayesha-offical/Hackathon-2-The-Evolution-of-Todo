/**
 * Task: T009 | Spec: @specs/003-modern-ui-improvements/spec.md §US2
 * Task: User Request | Contact Page Enhancement
 * Description: Dedicated contact page for user inquiries with API integration
 * Purpose: Provide a dedicated contact form and information page
 * Reference: @specs/003-modern-ui-improvements/spec.md, @specs/002-landing-page-ui/spec.md
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ROUTES } from "@/config/constants";
import { ANIMATION_VARIANTS, SPRING_CONFIGS } from "@/config/animations";
import { submitContactForm } from "@/lib/api";

/**
 * Contact form validation schema
 */
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

/**
 * Contact Page component
 *
 * Features:
 * - Contact form with validation
 * - Contact information display
 * - Smooth animations with Framer Motion
 * - Responsive design for all devices
 * - Success message after submission
 */
export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onChange",
  });

  /**
   * Handle form submission to backend API
   * Task: T009, T012 - Submit to POST /api/v1/messages/contact
   */
  async function onSubmit(data: ContactFormData) {
    try {
      setSubmitError(null);
      setIsSubmitting(true);

      // Submit contact form to backend
      await submitContactForm(data);

      setSuccessMessage(
        "Thank you for reaching out! We'll get back to you soon."
      );
      reset();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Contact form submission failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to send message";
      setSubmitError(errorMessage || "Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section */}
      <motion.section
        className="pt-16 sm:pt-20 lg:pt-28 pb-12 sm:pb-16 relative z-10"
        variants={ANIMATION_VARIANTS.appear}
        initial="hidden"
        animate="visible"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center space-y-4"
            variants={ANIMATION_VARIANTS.slideInFromBottom}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            <motion.div
              className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                📬 We're Here to Help
              </span>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Get in Touch
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Have questions about FocusHub? We'd love to hear from you. Send us
              a message and we'll respond as soon as possible.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Contact Content Section */}
      <section className="py-16 sm:py-20 lg:py-24 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <motion.div
              variants={ANIMATION_VARIANTS.slideInFromLeft}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                  Contact Information
                </h2>
                <p className="text-lg text-gray-400 mb-6">
                  Reach out to us through any of the following channels:
                </p>
              </div>

              {/* Contact Methods */}
              <div className="space-y-6">
                {/* Email */}
                <motion.div
                  className="flex items-start gap-4 p-4 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-colors duration-300 border border-gray-700/30"
                  whileHover={{ x: 8, y: -2 }}
                  transition={SPRING_CONFIGS.gentle}
                >
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border border-blue-400/30">
                      <svg
                        className="h-6 w-6 text-cyan-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      📧 Email
                    </h3>
                    <p className="mt-2 text-gray-300">
                      <a
                        href="mailto:ayeshamughal2513@gmail.com"
                        className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                        >
                          FocusHub@gmail.com
                      </a>
                    </p>
                  </div>
                </motion.div>

                {/* Response Time */}
                <motion.div
                  className="flex items-start gap-4 p-4 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-colors duration-300 border border-gray-700/30"
                  whileHover={{ x: 8, y: -2 }}
                  transition={SPRING_CONFIGS.gentle}
                >
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border border-blue-400/30">
                      <svg
                        className="h-6 w-6 text-cyan-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      ⏱️ Response Time
                    </h3>
                    <p className="mt-2 text-gray-300">
                      We typically respond within 24 hours during business days.
                    </p>
                  </div>
                </motion.div>

                {/* Support Hours */}
                <motion.div
                  className="flex items-start gap-4 p-4 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-colors duration-300 border border-gray-700/30"
                  whileHover={{ x: 8, y: -2 }}
                  transition={SPRING_CONFIGS.gentle}
                >
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border border-blue-400/30">
                      <svg
                        className="h-6 w-6 text-cyan-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5.581m0 0H9m5.581 0a2 2 0 110-4h.581m0 0a2 2 0 110 4h.581m0 0H9"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      🕐 Support Hours
                    </h3>
                    <p className="mt-2 text-gray-300">
                      Monday to Friday, 9:00 AM - 6:00 PM (UTC)
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              variants={ANIMATION_VARIANTS.slideInFromRight}
              initial="hidden"
              animate="visible"
              className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 sm:p-10 shadow-2xl hover:border-gray-600/50 transition-all duration-300"
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Success Message */}
                {successMessage && (
                  <motion.div
                    className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <p className="text-green-800 dark:text-green-200 text-sm">
                      {successMessage}
                    </p>
                  </motion.div>
                )}

                {/* Error Message */}
                {submitError && (
                  <motion.div
                    className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <p className="text-red-800 dark:text-red-200 text-sm">
                      {submitError}
                    </p>
                  </motion.div>
                )}

                {/* Name Field */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-white mb-3"
                  >
                    👤 Your Name
                  </label>
                  <input
                    {...register("name")}
                    type="text"
                    id="name"
                    placeholder="Enter your full name"
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded-lg bg-gray-700/40 border border-gray-600/50 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 disabled:opacity-50"
                  />
                  {errors.name && (
                    <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                      <span>⚠️</span> {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-white mb-3"
                  >
                    📧 Email Address
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    id="email"
                    placeholder="your@email.com"
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded-lg bg-gray-700/40 border border-gray-600/50 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 disabled:opacity-50"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                      <span>⚠️</span> {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Subject Field */}
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-semibold text-white mb-3"
                  >
                    💬 Subject
                  </label>
                  <input
                    {...register("subject")}
                    type="text"
                    id="subject"
                    placeholder="What is this about?"
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded-lg bg-gray-700/40 border border-gray-600/50 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 disabled:opacity-50"
                  />
                  {errors.subject && (
                    <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                      <span>⚠️</span> {errors.subject.message}
                    </p>
                  )}
                </div>

                {/* Message Field */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-white mb-3"
                  >
                    ✍️ Your Message
                  </label>
                  <textarea
                    {...register("message")}
                    id="message"
                    placeholder="Tell us more details..."
                    rows={5}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded-lg bg-gray-700/40 border border-gray-600/50 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 disabled:opacity-50 resize-none"
                  />
                  {errors.message && (
                    <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                      <span>⚠️</span> {errors.message.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  className="w-full px-6 py-3 text-white font-bold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-600 disabled:to-gray-700 rounded-lg transition-all duration-200 shadow-lg hover:shadow-cyan-500/30 disabled:shadow-none disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Sending...
                    </span>
                  ) : (
                    "🚀 Send Message"
                  )}
                </motion.button>

                {/* Back to Home */}
                <div className="text-center pt-4 border-t border-gray-700/50">
                  <Link
                    href={ROUTES.HOME}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
                  >
                    <span>←</span> Back to home
                  </Link>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
