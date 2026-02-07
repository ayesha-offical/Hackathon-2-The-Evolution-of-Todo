"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#030712] pt-10 pb-6 overflow-hidden border-t border-white/5">
      {/* Subtle background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[100px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center border-b border-white/10 pb-8">
          
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center font-black text-white italic text-sm shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                F
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
                FocusHub
              </span>
            </div>
            <p className="text-gray-500 text-xs max-w-xs mx-auto md:mx-0">
              The evolution of productivity. Build habits, crush tasks, and stay focused in style.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex justify-center gap-6 text-xs font-medium text-gray-400">
            <Link href="#" className="hover:text-cyan-400 transition-colors">Features</Link>
            <Link href="#" className="hover:text-cyan-400 transition-colors">Home</Link>
            <Link href="#" className="hover:text-cyan-400 transition-colors">About</Link>
            <Link href="/contact" className="hover:text-cyan-400 transition-colors">Contact</Link>
          </div>

          {/* Social/Status */}
          <div className="flex justify-center md:justify-end">
            <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Systems Operational</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-600 uppercase tracking-[0.2em]">
          <p>© {currentYear} FocusHub AI. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-gray-400 cursor-pointer">Twitter</span>
            <span className="hover:text-gray-400 cursor-pointer">GitHub</span>
          </div>
        </div>
      </div>
    </footer>
  );
}