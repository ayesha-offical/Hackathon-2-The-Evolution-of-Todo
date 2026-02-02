/**
 * Task: T059 | Spec: @specs/001-sdd-initialization/ui/pages.md §Login Page
 * Description: User login page with form validation
 * Purpose: Allow registered users to authenticate and receive JWT tokens
 * Reference: Constitution II (JWT Bridge), rest-endpoints.md §POST /api/v1/auth/login
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { authClient } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES, ERROR_MESSAGES, EMAIL_REGEX } from "@/config/constants";
import { PasswordInput } from "@/components/common/PasswordInput";
import { ANIMATION_VARIANTS, SPRING_CONFIGS } from "@/config/animations";
import type { BetterAuthSignInResponse } from "@/types/auth";

/**
 * Login form validation schema
 * Reference: @specs/001-sdd-initialization/features/authentication.md §FR-005
 */
const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .regex(EMAIL_REGEX, "Invalid email format"),
  password: z
    .string()
    .min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Login page component
 *
 * Features:
 * - Email and password inputs with validation
 * - Real-time validation with react-hook-form
 * - Submit to `/api/v1/auth/login` endpoint
 * - Display error messages for invalid credentials
 * - Redirect to dashboard on successful login
 * - Show links to registration and password reset
 * - Responsive design (mobile to desktop)
 *
 * Reference:
 * - UI spec: @specs/001-sdd-initialization/ui/pages.md §Login Page
 * - API spec: rest-endpoints.md §POST /api/v1/auth/login
 * - Auth flow: plan.md Step 4 §Frontend Authentication
 */
export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, refreshSession } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  /**
   * Redirect if already authenticated
   * Use useEffect instead of render-time logic to avoid React warnings
   */
  useEffect(() => {
    if (!authLoading && user) {
      router.push(ROUTES.DASHBOARD);
    }
  }, [authLoading, user, router]);

  /**
   * Handle form submission
   * Call Better Auth signIn method with email and password
   * Constitution II: JWT tokens are set as HTTP-only cookies by the backend,
   * and then retrieved via the /get-session endpoint on subsequent requests
   */
  async function onSubmit(data: LoginFormData) {
    try {
      setSubmitError(null);
      setIsSubmitting(true);

      console.debug('[Login] Attempting login for:', data.email);
      console.debug('[Login] API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
      console.debug('[Login] Better Auth URL:', process.env.NEXT_PUBLIC_BETTER_AUTH_URL);

      // Use Better Auth to sign in
      // This sends request to /api/v1/auth/sign-in/email and the backend sets JWT in HTTP-only cookie
      console.debug('[Login] Calling authClient.signIn.email...');
      const result = (await authClient.signIn.email({
        email: data.email,
        password: data.password,
      })) as unknown as BetterAuthSignInResponse;

      console.debug('[Login] Login response:', result);

      if (result && (result.user || result.data?.user)) {
        // Login successful - HTTP-only cookies are now set by the backend
        console.debug('[Login] Login successful, refreshing session');

        // Refresh session to update AuthContext with user data
        // This uses credentials: 'include' to automatically send the HTTP-only cookies
        await refreshSession();

        // Small delay ensures the browser processes the HTTP-only cookie and state updates
        console.debug('[Login] Redirecting to dashboard');
        setTimeout(() => {
          router.push(ROUTES.DASHBOARD);
        }, 500); // Increased from 300ms to ensure state propagates
      } else {
        console.error('[Login] Login failed - no user in response:', result);
        setSubmitError(ERROR_MESSAGES.INVALID_CREDENTIALS);
      }
    } catch (error) {
      console.error("[Login] Login failed:", error);
      console.error("[Login] Error type:", error?.constructor?.name);
      console.error("[Login] Error message:", error instanceof Error ? error.message : String(error));
      console.error("[Login] Full error object:", error);

      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.INVALID_CREDENTIALS;

      if (errorMessage.includes("Failed to fetch")) {
        setSubmitError("Cannot connect to backend. Make sure:\n1. Backend is running on http://localhost:8000\n2. You restarted frontend after changing env vars");
      } else {
        setSubmitError(errorMessage);
      }
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
            Sign in to your account
          </motion.h2>
          <motion.p
            className="mt-2 text-sm text-gray-600 dark:text-gray-400"
            variants={ANIMATION_VARIANTS.listItem}
          >
            Or{" "}
            <Link
              href={ROUTES.REGISTER}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
            </Link>
          </motion.p>
        </motion.div>

        {/* Form */}
        <motion.form
          className="mt-8 space-y-6"
          onSubmit={handleSubmit(onSubmit)}
          variants={ANIMATION_VARIANTS.listContainer}
          initial="hidden"
          animate="visible"
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
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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

          {/* Password field */}
          <motion.div variants={ANIMATION_VARIANTS.listItem}>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              disabled={isSubmitting}
              {...register("password")}
              className="mt-1"
            />
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
            {isSubmitting ? "Signing in..." : "Sign in"}
          </motion.button>
        </motion.form>

        {/* Footer links */}
        <motion.div className="text-center space-y-2" variants={ANIMATION_VARIANTS.listItem}>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Forgot your password?{" "}
            <Link
              href={ROUTES.FORGOT_PASSWORD}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Reset it here
            </Link>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            By signing in, you agree to our Terms & Conditions
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
