// Task T005: Create type definitions for auth context (@specs/002-landing-page-ui/tasks.md §Phase 2)
// Type definitions for Better Auth session and user data

/**
 * User object from Better Auth session
 */
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  emailVerified?: boolean;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Session object from Better Auth
 */
export interface AuthSession {
  user: AuthUser;
  expires: Date;
  sessionToken: string;
}

/**
 * Auth context value
 */
export interface AuthContextType {
  session?: AuthSession | null;
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated?: boolean;
  isError?: boolean;
  error?: string | null;
}

/**
 * Hook return type for useSession
 */
export interface UseSessionReturn {
  session: AuthSession | null;
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated?: boolean;
}

/**
 * Logout function type
 */
export type LogoutFunction = (options?: { redirect?: string }) => Promise<void>;

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Signup credentials
 */
export interface SignupCredentials {
  email: string;
  password: string;
  name?: string;
}

/**
 * Auth error type
 */
export interface AuthError {
  message: string;
  code?: string;
  status?: number;
}

/**
 * Better Auth Sign In Response
 */
export interface BetterAuthSignInResponse {
  data?: {
    user?: AuthUser;
    session?: AuthSession;
  };
  user?: AuthUser;
  session?: AuthSession;
  ok?: boolean;
  error?: string;
}
