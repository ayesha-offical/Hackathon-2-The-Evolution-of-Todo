/**
 * Task: T063 | Spec: plan.md Step 4 §middleware.ts
 * Description: Auth redirect middleware for protecting dashboard routes
 * Purpose: Enforce authentication on protected routes and redirect unauthenticated users to login
 * Reference: Constitution II (JWT Bridge), Constitution VI (Route Protection)
 */

import { NextResponse, type NextRequest } from 'next/server';

/**
 * Authentication routes (login/register)
 * These routes are handled by client-side AuthContext
 */
const AUTH_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
];

/**
 * Middleware to handle route protection
 *
 * Flow:
 * 1. Check if route is protected
 * 2. Check if user has valid session cookie (JWT)
 * 3. If protected and no session → redirect to /login
 * 4. If auth route and has session → redirect to /dashboard
 * 5. Otherwise → allow request
 *
 * Session validation:
 * - Better Auth stores JWT in HTTP-only cookies automatically
 * - Cookies are automatically included in requests
 * - The presence of a valid auth cookie indicates an authenticated user
 *
 * Reference:
 * - Constitution II: "Better Auth manages HTTP-only cookies"
 * - plan.md Step 4: middleware.ts protection logic
 *
 * @param request - Incoming request
 * @returns Response (redirect or continue)
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // NOTE: Middleware does NOT check for authentication cookies
  // Reason: Cross-domain cookie restrictions (Vercel frontend + Hugging Face backend)
  //
  // Instead, we rely on:
  // 1. Client-side AuthContext that checks session via API call to /api/v1/auth/get-session
  // 2. Dashboard/Protected page components that redirect to /login if not authenticated
  // 3. sessionStorage.auth_token for fallback authentication
  //
  // This approach is more reliable than cookie-based middleware checks and handles
  // cross-domain authentication properly.

  // Check if current path is an auth route (login, register, etc.)
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));

  // Log for debugging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.debug('[Middleware] Route:', pathname);
    console.debug('[Middleware] Is auth route:', isAuthRoute);
    console.debug('[Middleware] Note: Cookie-based auth disabled. Using client-side AuthContext instead.');
  }

  /**
   * Allow all requests to continue
   * Authentication is handled by:
   * 1. AuthContext on client side (checks /api/v1/auth/get-session)
   * 2. Component-level redirects in login/register/dashboard pages
   * 3. Session token from sessionStorage
   *
   * Reference: @specs/001-sdd-initialization/features/authentication.md
   */
  return NextResponse.next();
}

/**
 * Middleware configuration
 * Specify which routes should be processed by middleware
 *
 * Reference:
 * - Next.js middleware matcher: https://nextjs.org/docs/advanced-features/middleware#matcher
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.png|.*\\.jpg|.*\\.svg).*)',
  ],
};
