/**
 * Task: T060 | Spec: @specs/001-sdd-initialization/ui/pages.md §Registration Page
 * Task: T026 | Spec: @specs/002-landing-page-ui/spec.md §User Story 3
 * Description: User registration page with form validation and celebratory animation
 * Purpose: Allow new users to create accounts with email and password with celebratory feedback
 * Reference: Constitution II (JWT Bridge), rest-endpoints.md §POST /api/v1/auth/register
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
import {
  ROUTES,
  ERROR_MESSAGES,
  PASSWORD_REQUIREMENTS,
  EMAIL_REGEX,
} from "@/config/constants";
import { ConfettiAnimation } from "@/components/ConfettiAnimation";
import { PasswordInput } from "@/components/common/PasswordInput";

/**
 * Registration form validation schema
 * Reference: @specs/001-sdd-initialization/features/authentication.md §FR-001-003
 */
const registerSchema = z
  .object({
    email: z
      .string()
      .email("Invalid email address")
      .regex(EMAIL_REGEX, "Invalid email format"),
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
    terms: z
      .boolean()
      .refine((val) => val === true, "You must accept the terms and conditions"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: ERROR_MESSAGES.PASSWORDS_DO_NOT_MATCH,
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Calculate password strength (0-100)
 * Used for strength indicator
 */
function calculatePasswordStrength(password: string): number {
  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (/[A-Z]/.test(password)) strength += 25;
  if (/[0-9]/.test(password)) strength += 25;
  if (/[^A-Za-z0-9]/.test(password)) strength += 25;
  return strength;
}

/**
 * Registration page component
 * Styling: Modern Neon Dark Theme
 */
export default function RegisterPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, refreshSession } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const passwordValue = watch("password") || "";
  const strength = calculatePasswordStrength(passwordValue);

  /**
   * Redirect authenticated users to dashboard
   * Prevents already-logged-in users from seeing registration page
   */
  useEffect(() => {
    if (!authLoading && user) {
      router.push(ROUTES.DASHBOARD);
    }
  }, [authLoading, user, router]);

  /**
   * Show loading screen while checking if user is authenticated
   */
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 blur-xl bg-cyan-500/20 animate-pulse"></div>
        </div>
      </div>
    );
  }

  /**
   * Handle form submission
   * Call Better Auth signUp method with email and password
   */
  async function onSubmit(data: RegisterFormData) {
    try {
      setSubmitError(null);
      setIsSubmitting(true);

      const result = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.email.split("@")[0],
      });

      if (result) {
        await refreshSession();
        setShowConfetti(true);
      }
    } catch (error: any) {
      setSubmitError(error.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {/* Confetti Animation */}
      {showConfetti && (
        <ConfettiAnimation
          isActive={showConfetti}
          onComplete={() => router.push(ROUTES.DASHBOARD)}
          duration={2000}
        />
      )}

      <div className="min-h-screen flex items-center justify-center bg-[#030712] relative overflow-hidden px-4 pt-20 pb-10">
        {/* Decorative Background Glows */}
        <div className="absolute top-[-5%] right-[-5%] w-[30%] h-[30%] bg-blue-600/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-cyan-600/10 blur-[100px] rounded-full" />

        <motion.div 
          className="w-full max-w-[400px] relative z-10" 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="p-6 sm:p-8 rounded-[2rem] bg-white/[0.02] border border-white/10 backdrop-blur-3xl shadow-2xl">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center font-black text-white italic mx-auto mb-3 shadow-lg">
                F
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-white to-cyan-400 bg-clip-text text-transparent">
                Create Account
              </h1>
              <p className="text-gray-500 text-[11px] mt-1 uppercase tracking-[0.2em]">
                Join the focus hub
              </p>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {submitError && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] text-center font-medium"
                >
                  {submitError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Registration Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email field */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
                  Email Address
                </label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-cyan-500/50 transition-all placeholder:text-gray-700"
                  disabled={isSubmitting}
                />
                {errors.email && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.email.message}</p>}
              </div>

              {/* Password field */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
                  Password
                </label>
                <PasswordInput
                  id="password"
                  {...register("password")}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-cyan-500/50 transition-all"
                  disabled={isSubmitting}
                />
                {/* Strength Meter */}
                {passwordValue && (
                  <div className="mt-2 px-1">
                    <div className="flex justify-between text-[9px] mb-1 uppercase tracking-tighter">
                      <span className="text-gray-500">Security Strength</span>
                      <span className={strength > 50 ? "text-cyan-400" : "text-orange-400"}>{strength}%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400" 
                        initial={{ width: 0 }} 
                        animate={{ width: `${strength}%` }}
                      />
                    </div>
                  </div>
                )}
                {errors.password && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.password.message}</p>}
              </div>

              {/* Confirm Password field */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
                  Confirm Password
                </label>
                <PasswordInput
                  id="confirmPassword"
                  {...register("confirmPassword")}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-cyan-500/50 transition-all"
                  disabled={isSubmitting}
                />
                {errors.confirmPassword && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.confirmPassword.message}</p>}
              </div>

              {/* Terms checkbox */}
              <div className="flex items-start gap-2 ml-1 mt-2">
                <input 
                  {...register("terms")} 
                  type="checkbox" 
                  className="mt-0.5 w-3.5 h-3.5 rounded border-white/10 bg-white/5 text-cyan-500 focus:ring-0 focus:ring-offset-0 transition-all cursor-pointer" 
                />
                <label className="text-[10px] text-gray-500 leading-tight">
                  I agree to the <span className="text-gray-300 underline cursor-pointer">Terms & Conditions</span> and Privacy Policy
                </label>
              </div>
              {errors.terms && <p className="text-red-500 text-[10px] ml-1">{errors.terms.message}</p>}

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={!isValid || isSubmitting}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl text-white text-sm font-bold shadow-lg shadow-cyan-900/20 mt-2 disabled:opacity-40 transition-all"
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </motion.button>
            </form>

            {/* Footer link */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Already a member?{" "}
                <Link href={ROUTES.LOGIN} className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}