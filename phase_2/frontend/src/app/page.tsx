/**
 * Task: T013 | Spec: @specs/002-landing-page-ui/spec.md §User Story 1
 * Description: Professional landing page with Hero, About, Features, and Contact sections
 * Purpose: Provide engaging entry point for new users with FocusHub branding
 * Reference: plan.md §Landing Page Component, tasks.md §Phase 3
 */

import { Metadata } from 'next';
import LandingPage from '@/components/LandingPage';
import AnimatedPage from '@/components/AnimatedPage';

export const metadata: Metadata = {
  title: 'FocusHub - Professional Focus Management, Simplified',
  description: 'Professional focus management platform for staying organized and productive. Streamline your workflow with intelligent task management.',
  keywords: 'focus, task management, productivity, organization, FocusHub',
};

export default function Home() {
  return (
    <AnimatedPage>
      <LandingPage />
    </AnimatedPage>
  );
}
