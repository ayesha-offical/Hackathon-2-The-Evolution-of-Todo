// Task T008: Create LandingPage component (@specs/002-landing-page-ui/tasks.md §Phase 3, US1)
// Updated: Modern blue/cyan theme with glassmorphism and atmospheric effects
'use client';

import React from 'react';
import HeroSection from './sections/HeroSection';
import AboutSection from './sections/AboutSection';
import FeaturesSection from './sections/FeaturesSection';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 relative">
      {/* Atmospheric background blur orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Content with relative positioning to appear above background orbs */}
      <div className="relative z-10">
        <HeroSection />
        <AboutSection />
        <FeaturesSection />
      </div>
    </main>
  );
}
