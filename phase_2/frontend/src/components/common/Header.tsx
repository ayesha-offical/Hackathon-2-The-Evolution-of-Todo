/**
 * Task: T019, T021, T080 | Modernized Header (No External Icon Library)
 * Theme: Glassmorphic Floating Header with Blue/Cyan Accents
 */

/**
 * Unified Modern Header Component
 * Combines branding, desktop nav, and responsive mobile logic.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/config/constants";

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/70 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center font-black text-white italic text-sm shadow-lg group-hover:shadow-cyan-500/20 transition-all">
            F
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            FocusHub
          </span>
        </Link>

        {/* Navigation - Hidden on Mobile, Visible on Desktop */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <Link href="#" className="hover:text-cyan-400 transition-colors">Features</Link>
          <Link href="#" className="hover:text-cyan-400 transition-colors">About</Link>
          <Link href="/contact" className="hover:text-cyan-400 transition-colors">Contact</Link>
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              {/* Profile Icon Button */}
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-[10px] text-white font-bold">
                  {user.email?.[0].toUpperCase()}
                </div>
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-48 bg-[#0b0f1a] border border-white/10 rounded-2xl shadow-2xl p-2 z-[60]"
                  >
                    <div className="px-4 py-2 border-b border-white/5 mb-1">
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Account</p>
                      <p className="text-xs text-gray-300 truncate">{user.email}</p>
                    </div>


                    <Link href={ROUTES.DASHBOARD} onClick={() => setIsProfileOpen(false)}>
                      <div className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <span></span> Dashboard
                      </div>
                    </Link>

                    <button 
                      onClick={() => { logout(); setIsProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all mt-1"
                    >
                      <span></span> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link href={ROUTES.LOGIN} className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold hover:bg-white/10 transition-all">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}