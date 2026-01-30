/**
 * Task: T066 | Spec: @specs/001-sdd-initialization/ui/pages.md §Shared Components
 * Task: T080 | Spec: @specs/001-sdd-initialization/ui/pages.md §TodoFusion Motion Design
 * Description: Navigation header with user menu and logout with spring animations
 * Purpose: Display app branding, user info, and authentication actions
 * Reference: Constitution II (JWT Bridge), Constitution VI (UI Components), spring animations
 */

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/config/constants";
import { ANIMATION_VARIANTS, SPRING_CONFIGS } from "@/config/animations";

/**
 * Header component
 *
 * Features:
 * - App logo/name (clickable link to dashboard or home)
 * - User email display when authenticated
 * - Logout button for authenticated users
 * - Login/Sign up links for unauthenticated users
 * - Responsive design with dark mode support
 *
 * Reference:
 * - UI spec: @specs/001-sdd-initialization/ui/pages.md §Shared Components
 * - Used on all pages to provide navigation
 */
export function Header() {
  const { user, isLoading, logout } = useAuth();

  return (
    <motion.header
      className="sticky top-0 z-50 border-b border-border bg-background-elevated/80 backdrop-blur-md shadow-glass"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={SPRING_CONFIGS.primary}
    >
      <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={SPRING_CONFIGS.bouncy}
          >
            <Link
              href={user ? ROUTES.DASHBOARD : ROUTES.HOME}
              className="flex items-center gap-2 group"
            >
              <span className="text-lg sm:text-xl font-bold bg-gradient-primary bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
                ✨ Todo Fusion
              </span>
            </Link>
          </motion.div>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            {isLoading ? (
              <motion.div
                className="h-8 w-20 animate-pulse bg-primary/20 rounded-lg"
                variants={ANIMATION_VARIANTS.fadeIn}
                initial="hidden"
                animate="visible"
              />
            ) : user ? (
              <>
                {/* User email */}
                <motion.div
                  className="hidden sm:block"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={SPRING_CONFIGS.gentle}
                >
                  <span className="text-sm font-medium text-text-secondary group-hover:text-white transition-colors">
                    {user.email}
                  </span>
                </motion.div>

                {/* Logout button */}
                <motion.button
                  onClick={logout}
                  className="btn-secondary inline-flex items-center gap-2 px-3 py-2 text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={SPRING_CONFIGS.primary}
                >
                  <span>Logout</span>
                </motion.button>
              </>
            ) : (
              <>
                {/* Login link */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={SPRING_CONFIGS.primary}
                >
                  <Link href={ROUTES.LOGIN} className="btn-secondary text-sm">
                    Sign In
                  </Link>
                </motion.div>

                {/* Register link */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={SPRING_CONFIGS.primary}
                >
                  <Link href={ROUTES.REGISTER} className="btn-primary text-sm">
                    Sign Up
                  </Link>
                </motion.div>
              </>
            )}
          </nav>
        </div>
      </div>
    </motion.header>
  );
}
