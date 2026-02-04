/**
 * Task: T018, T022, T023 | Spec: @specs/002-landing-page-ui/spec.md §US2 Authenticated Navigation
 * Description: User dropdown menu with Dashboard and Logout options
 * Purpose: Provide authenticated user quick navigation to dashboard and logout functionality
 * Reference: User Story 2 (P1), spec.md AC-2.4, AC-2.5, AC-2.6, AC-2.7
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { authClient } from '@/lib/auth';
import { ROUTES } from '@/config/constants';
import { SPRING_CONFIGS } from '@/config/animations';

interface UserDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

/**
 * UserDropdown Component (T018, T022, T023)
 *
 * Renders a dropdown menu with:
 * - Dashboard link (navigates to /dashboard)
 * - Logout button (signs out and redirects to /login)
 * - Loading state handling on logout
 * - Smooth Framer Motion animations
 * - Professional styling with Tailwind CSS
 *
 * Props:
 *   - isOpen: Whether dropdown is visible
 *   - onClose: Callback to close dropdown
 *   - userEmail: Optional email display in dropdown header
 *
 * Usage:
 *   const [isOpen, setIsOpen] = useState(false);
 *   <UserDropdown isOpen={isOpen} onClose={() => setIsOpen(false)} userEmail={user.email} />
 */
export function UserDropdown({ isOpen, onClose, userEmail }: UserDropdownProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /**
   * Handle logout - T023: Loading state handling
   */
  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      console.debug('[UserDropdown] Logout initiated');

      // Call Better Auth logout
      await authClient.signOut();

      console.debug('[UserDropdown] Logout successful');

      // Close dropdown and redirect to login
      onClose();
      router.push(ROUTES.LOGIN);
    } catch (error) {
      console.error('[UserDropdown] Logout failed:', error);
      setIsLoggingOut(false);
    }
  }

  /**
   * Handle dashboard navigation
   */
  function handleDashboard() {
    console.debug('[UserDropdown] Navigating to dashboard');
    onClose();
    router.push(ROUTES.DASHBOARD);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop to close dropdown on click-outside */}
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-label="Close dropdown"
          />

          {/* T018, T022: Dropdown menu with smooth animation */}
          <motion.div
            className="absolute top-full right-0 mt-2 w-48 bg-surface border border-border rounded-lg shadow-lg z-50"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={SPRING_CONFIGS.primary}
          >
            {/* Header with email (optional) */}
            {userEmail && (
              <div className="px-4 py-3 border-b border-border">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                  Account
                </p>
                <p className="text-sm font-medium text-text-primary truncate mt-1">
                  {userEmail}
                </p>
              </div>
            )}

            {/* Menu items */}
            <div className="py-2">
              {/* Dashboard link */}
              <motion.button
                onClick={handleDashboard}
                disabled={isLoggingOut}
                className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                whileHover={{ backgroundColor: 'rgba(79, 70, 229, 0.1)' }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="font-medium">📊 Dashboard</span>
              </motion.button>

              {/* Divider */}
              <div className="h-px bg-border my-2" />

              {/* Logout button - T023: Loading state */}
              <motion.button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="font-medium">
                  {isLoggingOut ? '🔄 Logging out...' : '🚪 Logout'}
                </span>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
