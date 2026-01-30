/**
 * Task: T062 | Spec: @specs/001-sdd-initialization/ui/pages.md §Reset Password Page
 * Description: Reset password page with new password form
 * Purpose: Allow users to reset their password using a reset token
 * Reference: Constitution II (JWT Bridge), rest-endpoints.md §POST /api/v1/auth/reset-password
 */

"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ROUTES, ERROR_MESSAGES, PASSWORD_REQUIREMENTS } from "@/config/constants";
import { ANIMATION_VARIANTS, SPRING_CONFIGS } from "@/config/animations";
import { PasswordInput } from "@/components/common/PasswordInput";
import { apiPost } from "@/lib/api";

/**
 * Reset password form validation schema
 */
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(
        PASSWORD_REQUIREMENTS.MIN_LENGTH,
        `Password must be at least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters`
      )
      .regex(
        PASSWORD_REQUIREMENTS.REGEX,
        "Password must include uppercase letter, lowercase letter, and number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: ERROR_MESSAGES.PASSWORDS_DO_NOT_MATCH,
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * Calculate password strength (0-100)
 */
function calculatePasswordStrength(password: string): number {
  let strength = 0;
  strength += Math.min(password.length * 3, 30);
  if (/[A-Z]/.test(password)) strength += 10;
  if (/[a-z]/.test(password)) strength += 10;
  if (/\d/.test(password)) strength += 10;
  if (/[@$!%*?&]/.test(password)) strength += 30;
  return Math.min(strength, 100);
}

/**
 * Get password strength label and color
 */
function getPasswordStrengthLabel(
  strength: number
): { label: string; color: string } {
  if (strength < 20) return { label: "Very Weak", color: "bg-red-500" };
  if (strength < 40) return { label: "Weak", color: "bg-orange-500" };
  if (strength < 60) return { label: "Fair", color: "bg-yellow-500" };
  if (strength < 80) return { label: "Good", color: "bg-green-500" };
  return { label: "Strong", color: "bg-green-600" };
}

/**
 * Reset Password page component
 *
 * Features:
 * - Password and confirm password inputs
 * - Password strength indicator
 * - Real-time validation with react-hook-form
 * - Submit to `/api/v1/auth/reset-password` endpoint
 * - Redirect to login after successful reset
 * - Responsive design
 *
 * Reference:
 * - UI spec: @specs/001-sdd-initialization/ui/pages.md §Reset Password Page
 * - API spec: rest-endpoints.md §POST /api/v1/auth/reset-password
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  });

  const passwordValue = watch("password");
  const strength = calculatePasswordStrength(passwordValue || "");
  const strengthLabel = getPasswordStrengthLabel(strength);

  /**
   * Handle form submission
   * Reset password using token
   */
  async function onSubmit(data: ResetPasswordFormData) {
    try {
      setSubmitError(null);
      setIsSubmitting(true);

      const response = await apiPost("/api/v1/auth/reset-password", {
        reset_token: token,
        new_password: data.password,
      });

      if (response.ok) {
        setSuccessMessage(
          "Password reset successfully! Redirecting to login..."
        );
        setTimeout(() => {
          router.push(ROUTES.LOGIN);
        }, 3000);
      }
    } catch (error) {
      console.error("Password reset failed:", error);
      setSubmitError(
        error instanceof Error ? error.message : "Password reset failed"
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
            Set new password
          </motion.h2>
          <motion.p
            className="mt-2 text-sm text-gray-600 dark:text-gray-400"
            variants={ANIMATION_VARIANTS.listItem}
          >
            Enter your new password below.
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

              {/* Password field */}
              <motion.div variants={ANIMATION_VARIANTS.listItem}>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  New Password
                </label>
                <PasswordInput
                  id="password"
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  {...register("password")}
                  className="mt-1"
                />

                {/* Password strength indicator */}
                <AnimatePresence mode="wait">
                  {passwordValue && (
                    <motion.div
                      className="mt-2"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={SPRING_CONFIGS.smooth}
                    >
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span>Password strength:</span>
                        <span className={strengthLabel.color.replace("bg-", "text-")}>
                          {strengthLabel.label}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <motion.div
                          className={`${strengthLabel.color} h-2 rounded-full`}
                          animate={{ width: `${strength}%` }}
                          transition={SPRING_CONFIGS.smooth}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {errors.password && (
                  <motion.p
                    className="mt-1 text-sm text-red-600 dark:text-red-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={SPRING_CONFIGS.gentle}
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </motion.div>

              {/* Confirm password field */}
              <motion.div variants={ANIMATION_VARIANTS.listItem}>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Confirm Password
                </label>
                <PasswordInput
                  id="confirmPassword"
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  {...register("confirmPassword")}
                  className="mt-1"
                />
                {errors.confirmPassword && (
                  <motion.p
                    className="mt-1 text-sm text-red-600 dark:text-red-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={SPRING_CONFIGS.gentle}
                  >
                    {errors.confirmPassword.message}
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
                {isSubmitting ? "Resetting..." : "Reset password"}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Footer links */}
        <AnimatePresence>
          {!successMessage && (
            <motion.div
              className="text-center"
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
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
