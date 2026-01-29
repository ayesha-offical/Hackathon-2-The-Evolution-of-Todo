/**
 * Task: T076 | Spec: @specs/001-sdd-initialization/ui/pages.md §Responsive Design
 * Description: Responsive navigation component with mobile hamburger menu
 * Purpose: Provide adaptive navigation that collapses to hamburger on mobile (<768px)
 * Reference: plan.md Step 5, Constitution VI (Code Quality)
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/config/constants";
import { MobileOnly, DesktopUp } from "./Responsive";

/**
 * Navigation Component
 *
 * Features:
 * - Desktop: Full horizontal navigation bar
 * - Mobile (<768px): Hamburger menu with slide-out drawer
 * - Tablet (768px-1023px): Compact horizontal navigation
 * - Desktop (1024px+): Full featured navigation bar
 *
 * Mobile behavior:
 * - Hamburger icon appears on screens < 768px
 * - Menu drawer slides in from left
 * - Closes when item clicked or overlay clicked
 * - Smooth animations
 *
 * Reference:
 * - UI spec: @specs/001-sdd-initialization/ui/pages.md §Responsive Design
 * - Uses Tailwind breakpoints: md: 768px
 */
export function Navigation() {
  const { user, isLoading, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background-elevated/80 backdrop-blur-md shadow-glass">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link
            href={user ? ROUTES.DASHBOARD : ROUTES.HOME}
            className="flex items-center gap-2 flex-shrink-0 group"
          >
            <span className="text-lg sm:text-xl font-bold bg-gradient-primary bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
              ✨ Todo Fusion
            </span>
          </Link>

          {/* Desktop Navigation */}
          <DesktopUp>
            <div className="flex items-center gap-6">
              {isLoading ? (
                <div className="h-8 w-20 animate-pulse bg-primary/20 rounded-lg" />
              ) : user ? (
                <>
                  <span className="text-sm font-medium text-text-secondary group-hover:text-white transition-colors">
                    {user.email}
                  </span>
                  <button
                    onClick={logout}
                    className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href={ROUTES.LOGIN} className="btn-secondary text-sm">
                    Sign In
                  </Link>
                  <Link href={ROUTES.REGISTER} className="btn-primary text-sm">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </DesktopUp>

          {/* Mobile Menu Button */}
          <MobileOnly>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/10 transition-colors"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                // Close icon (X)
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                // Hamburger icon
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </MobileOnly>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 sm:hidden"
            onClick={handleMenuClose}
          />

          {/* Menu */}
          <div className="sm:hidden border-t border-border bg-background-elevated/90 backdrop-blur-md shadow-glass">
            <div className="px-4 py-4 space-y-3">
              {isLoading ? (
                <div className="h-8 w-20 animate-pulse bg-primary/20 rounded-lg" />
              ) : user ? (
                <>
                  <div className="px-4 py-2 text-sm font-medium text-text-secondary">
                    {user.email}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn-secondary w-full text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href={ROUTES.LOGIN}
                    className="btn-secondary block w-full text-center"
                    onClick={handleMenuClose}
                  >
                    Sign In
                  </Link>
                  <Link
                    href={ROUTES.REGISTER}
                    className="btn-primary block w-full text-center"
                    onClick={handleMenuClose}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
