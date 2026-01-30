/**
 * Task: T061 | Spec: @specs/001-sdd-initialization/ui/pages.md §Forgot Password Page
 * Description: Forgot password page with email input for password reset
 * Purpose: Allow users to request password reset email
 * Reference: Constitution II (JWT Bridge), rest-endpoints.md §POST /api/v1/auth/forgot-password
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ROUTES, EMAIL_REGEX } from "@/config/constants";
import { ANIMATION_VARIANTS, SPRING_CONFIGS } from "@/config/animations";
import { apiPost } from "@/lib/api";

/**
 * Forgot password form validation schema
 */
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .regex(EMAIL_REGEX, "Invalid email format"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Forgot Password page component
 *
 * Features:
 * - Email input for requesting password reset
 * - Real-time validation with react-hook-form
 * - Submit to `/api/v1/auth/forgot-password` endpoint
 * - Display success message after request
 * - Link back to login
 * - Responsive design
 *
 * Reference:
 * - UI spec: @specs/001-sdd-initialization/ui/pages.md §Forgot Password Page
 * - API spec: rest-endpoints.md §POST /api/v1/auth/forgot-password
 */
export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
  });

  /**
   * Handle form submission
   * Request password reset email
   */
  async function onSubmit(data: ForgotPasswordFormData) {
    try {
      setSubmitError(null);
      setIsSubmitting(true);

      const response = await apiPost("/api/v1/auth/forgot-password", {
        email: data.email,
      });

      if (response.ok) {
        // Always show success for security reasons
        setSuccessMessage(
          "If this email exists in our system, you will receive a password reset link shortly."
        );
      }
    } catch (error) {
      console.error("Forgot password failed:", error);
      // For security, always show the same message regardless of whether email exists
      setSuccessMessage(
        "If this email exists in our system, you will receive a password reset link shortly."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8"
      variants={ANIMATION_VARIANTS.appear}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="w-full max-w-md space-y-8"
        variants={ANIMATION_VARIANTS.listContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="text-center" variants={ANIMATION_VARIANTS.listItem}>
          <motion.h1
            className="text-3xl font-bold text-gray-900 dark:text-white"
            variants={ANIMATION_VARIANTS.listItem}
          >
            Phase 2 Todo App
          </motion.h1>
          <motion.h2
            className="mt-6 text-2xl font-bold text-gray-900 dark:text-white"
            variants={ANIMATION_VARIANTS.listItem}
          >
            Reset your password
          </motion.h2>
          <motion.p
            className="mt-2 text-sm text-gray-600 dark:text-gray-400"
            variants={ANIMATION_VARIANTS.listItem}
          >
            Enter your email address and we&apos;ll send you a link to reset your password.
          </motion.p>
        </motion.div>

        {/* Success message */}
        <AnimatePresence mode="wait">
          {successMessage && (
            <motion.div
              className="rounded-md bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800"
              variants={ANIMATION_VARIANTS.slideInFromRight}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                {successMessage}
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                Back to{" "}
                <Link
                  href={ROUTES.LOGIN}
                  className="font-medium text-green-600 dark:text-green-400 hover:underline"
                >
                  sign in
                </Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <AnimatePresence mode="wait">
          {!successMessage && (
            <motion.form
              className="mt-8 space-y-6"
              onSubmit={handleSubmit(onSubmit)}
              variants={ANIMATION_VARIANTS.listContainer}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {/* Error alert */}
              <AnimatePresence mode="wait">
                {submitError && (
                  <motion.div
                    className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800"
                    variants={ANIMATION_VARIANTS.slideInFromRight}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      {submitError}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email field */}
              <motion.div variants={ANIMATION_VARIANTS.listItem}>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className="input mt-1"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <motion.p
                    className="mt-1 text-sm text-red-600 dark:text-red-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={SPRING_CONFIGS.gentle}
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </motion.div>

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="btn-primary w-full mt-4"
                variants={ANIMATION_VARIANTS.buttonTap}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={SPRING_CONFIGS.primary}
              >
                {isSubmitting ? "Sending..." : "Send reset link"}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Footer links */}
        <AnimatePresence>
          {!successMessage && (
            <motion.div
              className="text-center space-y-2"
              variants={ANIMATION_VARIANTS.listItem}
              initial="hidden"
              animate="visible"
            >
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Remember your password?{" "}
                <Link
                  href={ROUTES.LOGIN}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign in
                </Link>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don&apos;t have an account?{" "}
                <Link
                  href={ROUTES.REGISTER}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign up
                </Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
