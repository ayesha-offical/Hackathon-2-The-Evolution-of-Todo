/**
 * Task: T013 | Spec: @specs/002-landing-page-ui/spec.md
 * Description: Landing page route for FocusHub
 * Purpose: Serve the professional landing page as the home page
 * Reference: User Story 1 (P1), spec.md AC-1.1, AC-1.2
 */

/**
 * Task: T029 | Spec: @specs/002-landing-page-ui/spec.md §US4 Page Transitions
 * Description: Wrap landing page with AnimatedPage transition component
 * Purpose: Add smooth fade-in + slide-up animation to landing page on load
 * Reference: User Story 4 (P2), spec.md AC-4.1
 */

import { Metadata } from "next";
import { LandingPage } from "@/components/LandingPage";
import { AnimatedPage } from "@/components/AnimatedPage";

export const metadata: Metadata = {
  title: "FocusHub - Professional Focus Management, Simplified",
  description:
    "Manage your focus and productivity with FocusHub. Distraction-free task management with user isolation and lightning-fast performance.",
  keywords: [
    "task management",
    "productivity",
    "focus",
    "todos",
    "project management",
  ],
  openGraph: {
    title: "FocusHub",
    description: "Professional focus management, simplified",
    type: "website",
  },
};

export default function Home() {
  return (
    <AnimatedPage>
      <LandingPage />
    </AnimatedPage>
  );
}
