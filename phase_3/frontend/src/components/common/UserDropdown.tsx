/**
 * Task: T018 | Spec: @specs/002-landing-page-ui/spec.md §User Story 2
 * Description: Dropdown menu for authenticated users with Dashboard and Logout options
 * Purpose: Provide quick access to user profile actions
 * Reference: plan.md §User Dropdown Component, Constitution II (JWT Bridge)
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/config/constants";
import { SPRING_CONFIGS } from "@/config/animations";

interface UserDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserDropdown({ isOpen, onClose }: UserDropdownProps) {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
      router.push(ROUTES.LOGIN);
    } catch (error) {
      console.error("[UserDropdown] Logout failed:", error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute right-0 mt-2 w-48 bg-background-elevated/95 backdrop-blur-md border border-border rounded-lg shadow-lg z-50 overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={SPRING_CONFIGS.primary}
        >
          <motion.div
            className="py-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
          >
            {/* Dashboard Link */}
            <Link
              href={ROUTES.DASHBOARD}
              onClick={onClose}
              className="block px-4 py-3 text-sm text-text-primary hover:bg-primary/10 transition-colors duration-150 border-b border-border/50"
            >
              Dashboard
            </Link>

            {/* Logout Button */}
            <motion.button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-sm text-error hover:bg-error/10 transition-colors duration-150 font-medium"
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              Logout
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
