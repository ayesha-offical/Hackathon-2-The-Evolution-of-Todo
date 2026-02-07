/**
 * Task: T070 | Spec: plan.md §Error Handling
 * Description: Error boundary for catching render errors in the dashboard and child components
 * Purpose: Prevent silent crashes and display helpful error messages when components fail to render
 * Reference: Constitution VI (Error Handling), Constitution I (Robustness)
 */

"use client";

import React, { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component
 * Catches errors in child components and displays a fallback UI
 * Prevents the entire app from crashing due to errors in a specific component
 */
export class ErrorBoundary extends Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  /**
   * Update state so the next render will show the fallback UI
   */
  public static getDerivedStateFromError(error: Error): State {
    console.error("[ErrorBoundary] Error caught:", error);
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Log the error to console
   */
  public componentDidCatch(_error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] Component error details:", errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-red-50/80 dark:bg-red-950/30">
            <div className="text-center space-y-4 max-w-sm px-4">
              <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                Something went wrong
              </div>
              <p className="text-sm text-red-600/80 dark:text-red-400/80">
                An unexpected error occurred while loading the page.
              </p>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/50 rounded text-left text-xs text-red-700 dark:text-red-200 overflow-auto max-h-48">
                  <p className="font-mono break-words">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              <button
                onClick={() => window.location.reload()}
                className="inline-block mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Reload Page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
