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
import type { User, AuthContextType, BetterAuthSessionResponse } from "@/types/auth";

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
  const [user, setUser] = useState<User | null>(null);
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
   * Uses direct API call to ensure JWT token is properly sent with credentials
   */
  async function checkSession() {
    try {
      const response = await apiCall("/api/v1/auth/get-session");

      if (!response.ok) {
        setUser(null);
        setIsError(false);
        setError(null);
        return;
      }

      const sessionData = (await response.json()) as unknown as BetterAuthSessionResponse;
      const session = sessionData?.data || sessionData;

      if (session?.user) {
        // User is authenticated
        setUser(session.user as User);
        setIsError(false);
        setError(null);
      } else {
        // User is not authenticated
        setUser(null);
      }
    } catch {
      // Session check failed (network error, etc.) - this is okay, user is just not authenticated
      setIsError(false);
      setError(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Logout function
   * Clears session and redirects to login
   */
  async function logout() {
    try {
      // Clear sessionStorage token
      if (typeof window !== "undefined") {
        sessionStorage.removeItem('auth_token');
      }

      // Call logout endpoint
      try {
        await apiCall("/api/v1/auth/logout", { method: "POST" });
      } catch {
        // Logout endpoint error is not critical - user token is already cleared
      }

      // Clear user state
      setUser(null);
      setIsError(false);
      setError(null);

      // Redirect to login
      router.push(ROUTES.LOGIN);
    } catch (err) {
      console.error("Logout error:", err);
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
