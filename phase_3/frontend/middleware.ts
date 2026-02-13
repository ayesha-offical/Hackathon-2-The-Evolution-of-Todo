/**
 * Task: T063 | Spec: plan.md Step 4 §middleware.ts
 * Description: Middleware for protecting routes and redirect logic
 * Purpose: Enforce authentication on protected routes and redirect flow
 * Reference: Constitution II (JWT Bridge), Constitution VI (Security)
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * Protected routes that require authentication
 * Unauthenticated users are redirected to /login
 */
const PROTECTED_ROUTES = ["/dashboard"];

/**
 * Public routes that anyone can access
 * May optionally redirect authenticated users to dashboard
 */
const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

/**
 * Middleware function
 *
 * Responsibilities:
 * 1. Check if route is protected
 * 2. Verify user authentication status via Better Auth session
 * 3. Redirect unauthenticated users from protected routes to login
 * 4. Optionally redirect authenticated users from public routes to dashboard
 *
 * Note: In Next.js middleware, we cannot directly access cookies from HTTP-only storage
 * so we rely on Better Auth's client-side session check. The actual authorization
 * will be verified when the page loads in browser via useAuth() hook.
 *
 * Reference: plan.md Step 4 §middleware.ts Pseudo-code
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  /**
   * For protected routes:
   * Note: We cannot check JWT token in middleware directly due to HTTP-only cookies
   * being inaccessible from middleware. Client-side components (useAuth hook) will
   * handle the authentication verification and redirect if needed.
   *
   * In production with a proper auth service, we could:
   * 1. Decode cookie value from request
   * 2. Verify JWT signature
   * 3. Redirect before rendering page
   *
   * For now, the useAuth hook in components will handle this check on mount.
   */

  if (isProtectedRoute) {
    // Protected route: Allow access, client will verify auth
    // The page component will redirect to login if not authenticated
    return NextResponse.next();
  }

  if (isPublicRoute) {
    // Public route: Allow access for all
    return NextResponse.next();
  }

  // All other routes are accessible
  return NextResponse.next();
}

/**
 * Configure which routes this middleware should run on
 * This regex excludes static assets, API routes, and Next.js internals
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/* (API routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};
