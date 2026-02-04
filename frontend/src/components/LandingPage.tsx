/**
 * Task: T008 | Spec: @specs/002-landing-page-ui/spec.md
 * Description: Main landing page component for FocusHub
 * Purpose: Orchestrate hero, about, features, and contact sections
 * Reference: User Story 1 (P1), spec.md AC-1.6
 */

"use client";

import { HeroSection } from "./sections/HeroSection";
import { AboutSection } from "./sections/AboutSection";
import { FeaturesSection } from "./sections/FeaturesSection";
import { ContactSection } from "./sections/ContactSection";

/**
 * LandingPage Component
 *
 * Renders the complete FocusHub landing page with:
 * - Hero section with branding and value prop
 * - About section explaining FocusHub mission
 * - Features section highlighting key capabilities
 * - Contact section with CTAs
 *
 * All sections use Framer Motion for smooth scroll animations
 * Responsive design optimized for mobile, tablet, and desktop
 */
export function LandingPage() {
  return (
    <main className="w-full overflow-hidden">
      {/* Hero Section */}
      <HeroSection />

      {/* About Section */}
      <AboutSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Contact Section */}
      <ContactSection />
    </main>
  );
}
