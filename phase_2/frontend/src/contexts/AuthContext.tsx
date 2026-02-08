/**
 * Task: T057 | Spec: plan.md Step 4 §contexts/AuthContext.tsx
 * Description: AuthContext provider for session state management
 * Purpose: Manage authenticated user state across entire application
 * Reference: Constitution II (JWT Bridge), Constitution VI (Context State)
 */

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiCall } from "@/lib/api";
import { ROUTES } from "@/config/constants";
import type { AuthUser, AuthContextType, BetterAuthSignInResponse } from "@/types/auth";

/**
 * AuthContext for storing authentication state
 * Available to all components wrapped in AuthProvider
 */
export interface AuthContextValue extends AuthContextType {
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * AuthProvider component
 *
 * Responsibilities:
 * 1. Check session on mount using Better Auth
 * 2. Set user state if logged in
 * 3. Handle loading and error states
 * 4. Provide user state to all children
 *
 * Usage:
 * ```tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 *
 * Then use `const { user, isLoading } = useAuth()` in child components
 *
 * Reference: Constitution II - User identity comes from JWT session
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check session on component mount
   * This verifies if user is already logged in (from HTTP-only cookie)
   */
  useEffect(() => {
    checkSession();
  }, []);

  /**
   * Verify current session status
   * Called on mount and can be called manually to refresh
   * Uses direct API call to ensure JWT token is properly sent with credentials (HTTP-only cookies included via credentials: 'include')
   * Constitution II: JWT tokens are stored in HTTP-only cookies and automatically sent by fetch API
   *
   * Error handling:
   * - Network errors: Assume unauthenticated (token may have expired)
   * - Non-200 response: User not authenticated
   * - Valid response with no user: User not authenticated
   * - Valid response with user: User authenticated
   *
   * CRITICAL: Always sets isLoading to false in finally block to prevent infinite loading state
   */
  async function checkSession() {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      console.debug('[Auth] Checking Better Auth session from:', `${apiUrl}/api/v1/auth/get-session`);

      // Create abort controller to prevent hanging indefinitely
      const controller = new AbortController();
      // Timeout after 8 seconds - allows sufficient time but prevents forever hanging
      const timeoutId = setTimeout(() => {
        console.warn('[Auth] Session check timeout after 8s - backend may be slow/down');
        controller.abort();
      }, 8000);

      try {
        // Call get-session endpoint with credentials to include HTTP-only cookies (Better Auth)
        const response = await fetch(`${apiUrl}/api/v1/auth/get-session`, {
          method: 'GET',
          credentials: 'include', // CRITICAL: Include HTTP-only cookies (Better Auth session) in request
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        console.debug('[Auth] Session check response status:', response.status);

        if (!response.ok) {
          console.debug('[Auth] Session check failed with status:', response.status);
          setUser(null);
          setIsError(false);
          setError(null);
          return;
        }

        const sessionData = (await response.json()) as unknown as BetterAuthSignInResponse;
        console.debug('[Auth] Session data received:', sessionData);

        // Check for user in response - handle both direct and nested structures
        const user = sessionData?.user || sessionData?.data?.user;

        if (user && user.id) {
          // User is authenticated - set user data
          console.debug('[Auth] User authenticated:', user.email);
          setUser(user as AuthUser);
          setIsError(false);
          setError(null);
        } else {
          // User is not authenticated - no user in response
          console.debug('[Auth] No user in session response');
          setUser(null);
          setIsError(false);
          setError(null);
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);

        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          console.warn('[Auth] Session check timeout - backend may be unresponsive or overloaded');
          // On timeout, assume not authenticated but log the issue
        } else if (fetchError instanceof Error) {
          console.warn('[Auth] Session check network error:', fetchError.message);
        } else {
          console.warn('[Auth] Session check error:', fetchError);
        }

        // Network error or timeout - assume unauthenticated but don't set error flag
        // This prevents the "error loading session" state and allows graceful fallback to login
        setUser(null);
        setIsError(false);
        setError(null);
      }
    } catch (error) {
      // Outer catch for any unexpected errors
      console.error('[Auth] Unexpected error in checkSession:', error);
      setUser(null);
      setIsError(false);
      setError(null);
    } finally {
      // CRITICAL: Always set loading to false, even if isLoaded wasn't set
      // This prevents the dashboard from stuck in infinite loading state
      setIsLoading(false);
    }
  }

  /**
   * Logout function
   * Clears session, localStorage, and redirects to login
   * Constitution II: Clear all authentication tokens when user logs out
   */
  async function logout() {
    try {
      // Call logout endpoint to clear HTTP-only cookies and revoke refresh tokens
      try {
        console.debug('[Auth] Calling logout endpoint to clear Better Auth cookies');
        await apiCall("/api/v1/auth/logout", { method: "POST" });
      } catch (err) {
        // Logout endpoint error is not critical - Better Auth will clear on next check
        console.debug('[Auth] Logout endpoint error (non-critical):', err);
      }

      // Clear user state
      setUser(null);
      setIsError(false);
      setError(null);
      console.debug('[Auth] User state cleared');

      // Add small delay to ensure Set-Cookie response is processed by browser
      await new Promise(resolve => setTimeout(resolve, 100));

      // Redirect to login
      console.debug('[Auth] Redirecting to login');
      router.push(ROUTES.LOGIN);
    } catch (err) {
      console.error("[Auth] Logout error:", err);
      // Still redirect even if there's an error
      setUser(null);
      router.push(ROUTES.LOGIN);
    }
  }

  /**
   * Context value provided to children
   * Reference: @specs/001-sdd-initialization/types/auth.ts §AuthContextType
   */
  const value: AuthContextValue = {
    user,
    isLoading,
    isError,
    error,
    refreshSession: checkSession,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to consume AuthContext
 *
 * Usage in components:
 * ```tsx
 * "use client";
 * import { useAuth } from "@/contexts/AuthContext";
 *
 * export function MyComponent() {
 *   const { user, isLoading, refreshSession, logout } = useAuth();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (!user) return <div>Not authenticated</div>;
 *
 *   return (
 *     <div>
 *       Welcome {user.email}
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @throws Error if used outside of AuthProvider
 * @returns AuthContextValue with user, loading, error state, and session functions
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
