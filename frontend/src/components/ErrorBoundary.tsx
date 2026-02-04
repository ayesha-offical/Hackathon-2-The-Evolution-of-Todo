/**
 * Task: T027 | Spec: @specs/002-landing-page-ui/spec.md §US3 Error Handling
 * Description: React Error Boundary for confetti animation failure handling
 * Purpose: Gracefully handle errors in ConfettiAnimation without crashing the page
 * Reference: User Story 3 (P2), spec.md AC-3.4
 */

'use client';

import React, { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 *
 * Wraps children and catches any React rendering errors
 * Provides graceful fallback UI when errors occur
 * Used to prevent confetti animation failures from breaking the page
 *
 * Usage:
 *   <ErrorBoundary onError={(error) => console.error('Animation error:', error)}>
 *     <ConfettiAnimation isActive={true} onComplete={() => {}} />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('[ErrorBoundary] Caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Error caught:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      console.warn('[ErrorBoundary] Rendering fallback UI');
      return this.props.fallback || null;
    }

    return this.props.children;
  }
}
