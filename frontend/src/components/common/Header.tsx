/**
 * Task: T015 | Spec: @specs/002-landing-page-ui/spec.md
 * Task: T019, T020, T021 | Spec: @specs/002-landing-page-ui/spec.md §US2 Authenticated Navigation
 * Task: T066 | Spec: @specs/001-sdd-initialization/ui/pages.md §Shared Components
 * Description: Smart header with conditional rendering for FocusHub
 * Purpose: Display FocusHub branding, smart nav for guest/auth users, landing page link, authenticated dropdown
 * Reference: User Story 1-2 (P1), Constitution II (JWT Bridge), Constitution VI (UI Components)
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/config/constants";
import { ANIMATION_VARIANTS, SPRING_CONFIGS } from "@/config/animations";
import { UserDropdown } from "@/components/UserDropdown";

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
  const { user, isLoading } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
                FocusHub
              </span>
            </Link>
          </motion.div>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            {/* Home link - always visible */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={SPRING_CONFIGS.primary}
            >
              <Link
                href={ROUTES.HOME}
                className="text-sm font-medium text-text-secondary hover:text-white transition-colors"
              >
                Home
              </Link>
            </motion.div>

            {isLoading ? (
              <motion.div
                className="h-8 w-20 animate-pulse bg-primary/20 rounded-lg"
                variants={ANIMATION_VARIANTS.fadeIn}
                initial="hidden"
                animate="visible"
              />
            ) : user ? (
              <>
                {/* T019, T020: User dropdown trigger - user email/icon button */}
                <motion.div className="relative">
                  <motion.button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-secondary hover:text-white transition-colors rounded-lg hover:bg-primary/10"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={SPRING_CONFIGS.primary}
                  >
                    <span className="hidden sm:inline">{user.email}</span>
                    <span className="sm:hidden">👤</span>
                  </motion.button>

                  {/* T018, T022, T023: User dropdown menu */}
                  <UserDropdown
                    isOpen={isDropdownOpen}
                    onClose={() => setIsDropdownOpen(false)}
                    userEmail={user.email}
                  />
                </motion.div>
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

                {/* Get Started / Register link */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={SPRING_CONFIGS.primary}
                >
                  <Link href={ROUTES.REGISTER} className="btn-primary text-sm">
                    Get Started
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
