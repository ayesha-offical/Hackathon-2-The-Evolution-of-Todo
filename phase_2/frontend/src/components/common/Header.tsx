// /**
//  * Task: T066 | Spec: @specs/001-sdd-initialization/ui/pages.md §Shared Components
//  * Task: T080 | Spec: @specs/001-sdd-initialization/ui/pages.md §FocusHub Motion Design
//  * Task: T019 | Spec: @specs/002-landing-page-ui/spec.md §User Story 2
//  * Task: T021 | Spec: @specs/002-landing-page-ui/spec.md §User Story 2
//  * Description: Navigation header with user dropdown menu, Home link, and conditional rendering
//  * Purpose: Display app branding, user info, and authentication actions with enhanced navigation
//  * Reference: Constitution II (JWT Bridge), Constitution VI (UI Components), spring animations
//  */

// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { motion } from "framer-motion";
// import { useAuth } from "@/contexts/AuthContext";
// import { ROUTES } from "@/config/constants";
// import { ANIMATION_VARIANTS, SPRING_CONFIGS } from "@/config/animations";
// import { UserDropdown } from "./UserDropdown";

// /**
//  * Header component
//  *
//  * Features:
//  * - App logo/name (clickable link to dashboard or home)
//  * - User email display when authenticated
//  * - Logout button for authenticated users
//  * - Login/Sign up links for unauthenticated users
//  * - Responsive design with dark mode support
//  *
//  * Reference:
//  * - UI spec: @specs/001-sdd-initialization/ui/pages.md §Shared Components
//  * - Used on all pages to provide navigation
//  */
// export function Header() {
//   const { user, isLoading } = useAuth();
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   return (
//     <motion.header
//       className="sticky top-0 z-50 border-b border-border/40 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 backdrop-blur-xl shadow-2xl"
//       initial={{ y: -100, opacity: 0 }}
//       animate={{ y: 0, opacity: 1 }}
//       transition={SPRING_CONFIGS.primary}
//     >
//       <div className="container mx-auto px-4 py-3 sm:px-6 lg:px-8">
//         <div className="flex items-center justify-between">
//           {/* Logo/Brand - Enhanced */}
//           <motion.div
//             whileHover={{ scale: 1.08 }}
//             whileTap={{ scale: 0.95 }}
//             transition={SPRING_CONFIGS.bouncy}
//             className="flex items-center gap-3"
//           >
//             <Link
//               href={user ? ROUTES.DASHBOARD : ROUTES.HOME}
//               className="flex items-center gap-3 group"
//             >
//               {/* Icon */}
//               <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:shadow-blue-500/50 transition-shadow">
//                 <span className="text-white font-bold text-lg">F</span>
//               </div>
//               {/* Text */}
//               <div className="flex flex-col">
//                 <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:via-cyan-300 group-hover:to-blue-400 transition-all">
//                   FocusHub
//                 </span>
//                 <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">Productivity Hub</span>
//               </div>
//             </Link>
//           </motion.div>

//           {/* Navigation - Desktop */}
//           <nav className="hidden md:flex items-center gap-8">
//             {/* Home Link - Always Visible */}
//             <motion.div
//               whileHover={{ scale: 1.08 }}
//               whileTap={{ scale: 0.95 }}
//               transition={SPRING_CONFIGS.primary}
//             >
//               <Link
//                 href={ROUTES.HOME}
//                 className="relative text-sm font-semibold text-gray-300 hover:text-white transition-colors duration-200 group"
//               >
//                 🏠 Home
//                 <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:w-full transition-all duration-300"></span>
//               </Link>
//             </motion.div>

//             {isLoading ? (
//               <motion.div
//                 className="h-8 w-24 animate-pulse bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg"
//                 variants={ANIMATION_VARIANTS.fadeIn}
//                 initial="hidden"
//                 animate="visible"
//               />
//             ) : user ? (
//               <div className="flex items-center gap-6">
//                 {/* Contact Link */}
//                 <motion.div
//                   whileHover={{ scale: 1.08 }}
//                   whileTap={{ scale: 0.95 }}
//                   transition={SPRING_CONFIGS.primary}
//                 >
//                   <Link
//                     href={ROUTES.CONTACT}
//                     className="relative text-sm font-semibold text-gray-300 hover:text-white transition-colors duration-200 group"
//                   >
//                     ✉️ Contact
//                     <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:w-full transition-all duration-300"></span>
//                   </Link>
//                 </motion.div>

//                 {/* Dashboard Link */}
//                 <motion.div
//                   whileHover={{ scale: 1.08 }}
//                   whileTap={{ scale: 0.95 }}
//                   transition={SPRING_CONFIGS.primary}
//                 >
//                   <Link
//                     href={ROUTES.DASHBOARD}
//                     className="relative text-sm font-semibold text-gray-300 hover:text-white transition-colors duration-200 group"
//                   >
//                     📊 Dashboard
//                     <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:w-full transition-all duration-300"></span>
//                   </Link>
//                 </motion.div>

//                 {/* Profile Icon with dropdown trigger */}
//                 <motion.button
//                   onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//                   className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 hover:from-blue-500/50 hover:to-cyan-500/50 transition-all duration-200 text-white relative border border-blue-400/30 hover:border-blue-400/60 shadow-lg hover:shadow-blue-500/30"
//                   whileHover={{ scale: 1.15 }}
//                   whileTap={{ scale: 0.9 }}
//                   title={user?.email || 'User'}
//                 >
//                   <svg
//                     className="w-5 h-5"
//                     fill="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
//                   </svg>
//                 </motion.button>

//                 {/* User Dropdown */}
//                 <div className="relative">
//                   <UserDropdown isOpen={isDropdownOpen} onClose={() => setIsDropdownOpen(false)} />
//                 </div>
//               </div>
//             ) : (
//               <div className="flex items-center gap-4">
//                 {/* Contact Link */}
//                 <motion.div
//                   whileHover={{ scale: 1.08 }}
//                   whileTap={{ scale: 0.95 }}
//                   transition={SPRING_CONFIGS.primary}
//                 >
//                   <Link
//                     href={ROUTES.CONTACT}
//                     className="relative text-sm font-semibold text-gray-300 hover:text-white transition-colors duration-200 group"
//                   >
//                     ✉️ Contact
//                     <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:w-full transition-all duration-300"></span>
//                   </Link>
//                 </motion.div>

//                 {/* Login link */}
//                 <motion.div
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   transition={SPRING_CONFIGS.primary}
//                 >
//                   <Link
//                     href={ROUTES.LOGIN}
//                     className="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 rounded-lg transition-all duration-200"
//                   >
//                     Sign In
//                   </Link>
//                 </motion.div>

//                 {/* Register link */}
//                 <motion.div
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   transition={SPRING_CONFIGS.primary}
//                 >
//                   <Link
//                     href={ROUTES.REGISTER}
//                     className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-blue-500/50"
//                   >
//                     Get Started
//                   </Link>
//                 </motion.div>
//               </div>
//             )}
//           </nav>

//           {/* Mobile Menu Button */}
//           <motion.button
//             onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//             className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
//             whileHover={{ scale: 1.1 }}
//             whileTap={{ scale: 0.9 }}
//           >
//             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
//             </svg>
//           </motion.button>
//         </div>

//         {/* Mobile Menu */}
//         <motion.div
//           initial={{ opacity: 0, height: 0 }}
//           animate={{ opacity: isMobileMenuOpen ? 1 : 0, height: isMobileMenuOpen ? "auto" : 0 }}
//           className="md:hidden overflow-hidden"
//         >
//           <div className="pt-4 pb-3 space-y-3 border-t border-gray-700 mt-4">
//             {/* Home Link Mobile */}
//             <Link
//               href={ROUTES.HOME}
//               className="block px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
//               onClick={() => setIsMobileMenuOpen(false)}
//             >
//               🏠 Home
//             </Link>

//             {/* Contact Link Mobile */}
//             <Link
//               href={ROUTES.CONTACT}
//               className="block px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
//               onClick={() => setIsMobileMenuOpen(false)}
//             >
//               ✉️ Contact
//             </Link>

//             {user && (
//               <>
//                 {/* Dashboard Link Mobile */}
//                 <Link
//                   href={ROUTES.DASHBOARD}
//                   className="block px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
//                   onClick={() => setIsMobileMenuOpen(false)}
//                 >
//                   📊 Dashboard
//                 </Link>
//               </>
//             )}

//             {!user && !isLoading && (
//               <>
//                 {/* Login Mobile */}
//                 <Link
//                   href={ROUTES.LOGIN}
//                   className="block px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
//                   onClick={() => setIsMobileMenuOpen(false)}
//                 >
//                   Sign In
//                 </Link>

//                 {/* Register Mobile */}
//                 <Link
//                   href={ROUTES.REGISTER}
//                   className="block px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-colors text-center"
//                   onClick={() => setIsMobileMenuOpen(false)}
//                 >
//                   Get Started
//                 </Link>
//               </>
//             )}
//           </div>
//         </motion.div>
//       </div>
//     </motion.header>

//   );
// }





/**
 * Task: T019, T021, T080 | Modernized Header
 * Theme: Glassmorphic Floating Header with Blue/Cyan Accents
 */




/**
 * Task: T019, T021, T080 | Modernized Header (No External Icon Library)
 * Theme: Glassmorphic Floating Header with Blue/Cyan Accents
 */

/**
 * Unified Modern Header Component
 * Combines branding, desktop nav, and responsive mobile logic.
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/config/constants";
import { SPRING_CONFIGS } from "@/config/animations";
import { UserDropdown } from "./UserDropdown";

export function Header() {
  const { user, isLoading, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll logic for glass effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "/contact" },
    
  ];

  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 border-b ${
        scrolled 
          ? "bg-black/80 backdrop-blur-lg border-white/10 py-3 shadow-2xl" 
          : "bg-transparent border-transparent py-5"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={SPRING_CONFIGS.primary}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* --- Brand Logo --- */}
          <motion.div whileHover={{ scale: 1.05 }} transition={SPRING_CONFIGS.bouncy}>
            <Link href={ROUTES.HOME} className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                <span className="text-white font-black text-xl italic">F</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-blue-100 to-cyan-400 bg-clip-text text-transparent">
                  FocusHub
                </span>
                <span className="text-[10px] uppercase tracking-widest text-cyan-500 font-bold leading-none">Modern Tool</span>
              </div>
            </Link>
          </motion.div>

          {/* --- Desktop Navigation (Hidden on Mobile) --- */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-all hover:bg-white/5 rounded-full relative group"
              >
                {link.label}
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-cyan-500 group-hover:w-1/2 transition-all duration-300 rounded-full" />
              </Link>
            ))}
            
            <div className="h-4 w-[1px] bg-white/10 mx-4" />

            {isLoading ? (
              <div className="h-8 w-20 bg-white/5 rounded-full animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-4">
                
                <Link href={ROUTES.DASHBOARD} className="text-sm font-medium text-cyan-400 hover:text-cyan-300">
                  Dashboard
                </Link>
                <div className="relative">
                  <motion.button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 p-[1px]"
                    whileHover={{ scale: 1.1 }}
                  >
                    <div className="w-full h-full rounded-full bg-[#030712] flex items-center justify-center text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </motion.button>
                  <UserDropdown isOpen={isDropdownOpen} onClose={() => setIsDropdownOpen(false)} />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href={ROUTES.LOGIN} className="px-5 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link 
                  href={ROUTES.REGISTER} 
                  className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </nav>

          {/* --- Mobile Menu Button (Visible only on Mobile) --- */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white z-[110]"
          >
            <div className="w-6 h-5 relative flex flex-col justify-between">
              <span className={`h-0.5 w-full bg-white transition-all duration-300 ${isMobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`h-0.5 w-full bg-white transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : ""}`} />
              <span className={`h-0.5 w-full bg-white transition-all duration-300 ${isMobileMenuOpen ? "-rotate-45 -translate-y-2.5" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {/* --- Mobile Drawer Menu --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[105] bg-[#030712] flex flex-col p-8 md:hidden"
          >
            <div className="mt-16 flex flex-col gap-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.label} 
                  href={link.href} 
                  onClick={handleMobileLinkClick}
                  className="text-4xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent"
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="h-[1px] bg-white/10 w-full my-4" />
              
              {user ? (
                <div className="flex flex-col gap-6">
                  <p className="text-gray-500">{user.email}</p>
                  <Link href={ROUTES.HOME} onClick={handleMobileLinkClick} className="text-2xl font-semibold text-white">Home</Link>
                  <Link href={ROUTES.DASHBOARD} onClick={handleMobileLinkClick} className="text-2xl font-semibold text-cyan-400">Dashboard</Link>
                  <button onClick={() => { logout(); handleMobileLinkClick(); }} className="text-left text-2xl font-semibold text-red-400">Logout</button>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <Link href={ROUTES.LOGIN} onClick={handleMobileLinkClick} className="text-2xl font-semibold text-white">Sign In</Link>
                  <Link href={ROUTES.REGISTER} onClick={handleMobileLinkClick} className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl text-center font-bold text-white text-xl">
                    Get Started Free
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}