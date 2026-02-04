/**
 * Task: T058 | Spec: @specs/001-sdd-initialization/features/authentication.md
 * Description: Authentication type definitions
 * Purpose: Provide TypeScript interfaces for auth state, requests, and responses
 * Reference: Constitution VI (Type Safety), plan.md Step 4
 */

/**
 * User object from backend
 * Maps to User entity in database schema
 */
export interface User {
  id: string;
  email: string;
  is_verified: boolean;
  created_at: string;
}

/**
 * Authentication context type
 * Provides user state and loading/error information to entire app
 */
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
}

/**
 * Login request form data
 * Reference: @specs/001-sdd-initialization/ui/pages.md §Login Page
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Registration request form data
 * Reference: @specs/001-sdd-initialization/ui/pages.md §Registration Page
 */
export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * Authentication response from backend
 * Reference: @specs/001-sdd-initialization/api/rest-endpoints.md
 */
export interface AuthResponse {
  user: User;
  token: string;
  expires_in: number;
}

/**
 * Session object from Better Auth
 * Contains user and token information
 */
export interface Session {
  user: User | null;
  token?: string;
}

/**
 * Better Auth sign-in response
 * Handles both response formats from different Better Auth versions
 */
export interface BetterAuthSignInResponse {
  user?: User;
  data?: {
    user?: User;
    session?: {
      token?: string;
    };
  };
  token?: string;
  session?: {
    token?: string;
  };
}

/**
 * Better Auth session response
 * Handles session data with nested user object
 */
export interface BetterAuthSessionResponse {
  user?: User;
  data?: {
    user?: User;
    session?: {
      token?: string;
    };
  };
}
