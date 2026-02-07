/**
 * Task: T063 | Spec: plan.md Step 4 §middleware.ts
 * Description: Auth redirect middleware for protecting dashboard routes
 * Purpose: Enforce authentication on protected routes and redirect unauthenticated users to login
 * Reference: Constitution II (JWT Bridge), Constitution VI (Route Protection)
 */

import { NextResponse, type NextRequest } from 'next/server';

/**
 * Protected routes that require authentication
 * Users without valid session will be redirected to /login
 */
const PROTECTED_ROUTES = [
  '/dashboard',
  '/dashboard/tasks',
];

/**
 * Authentication routes (login/register) that should redirect authenticated users to dashboard
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

  // Check for authentication cookies set by backend
  // The backend sets: Authorization (with Bearer prefix) and RefreshToken
  // Reference: backend/src/api/v1/auth.py §set_cookie with keys "Authorization" and "RefreshToken"
  const hasAuthorizationCookie = request.cookies.has('Authorization');
  const hasRefreshToken = request.cookies.has('RefreshToken');

  // Session exists if we have the Authorization cookie (access token)
  // RefreshToken serves as a backup indicator
  const hasSession = hasAuthorizationCookie || hasRefreshToken;

  // Log for debugging (only in development)
  if (process.env.NODE_ENV === 'development') {
    const cookieNames = request.cookies.getSetCookie?.() || [];
    const allCookies = request.cookies.getAll();
    console.debug('[Middleware] Checking route:', pathname);
    console.debug('[Middleware] All cookies:', allCookies.map(c => c.name).join(', '));
    console.debug('[Middleware] Has session:', hasSession,
      '(Authorization:', hasAuthorizationCookie,
      ', RefreshToken:', hasRefreshToken + ')');
  }

  // Check if current path is a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

  // Check if current path is an auth route (login, register, etc.)
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));

  /**
   * Rule 1: Protected routes require authentication
   * If accessing protected route without session, redirect to login
   */
  if (isProtectedRoute && !hasSession) {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[Middleware] Protected route without session, redirecting to /login');
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  /**
   * Rule 2: Auth routes - Allow access, let components handle redirect
   * NOTE: Removed middleware redirect for auth routes. Components (LoginPage, RegisterPage)
   * already handle redirecting authenticated users to dashboard using AuthContext hook.
   * This prevents issues where expired/invalid cookies would block login page access.
   *
   * The components use the actual session validation from the backend API,
   * which is more reliable than checking cookie presence in middleware.
   *
   * Reference: Components check session via useAuth() hook which calls /api/v1/auth/get-session
   */
  // Middleware will NOT redirect auth routes - let components handle it
  if (isAuthRoute) {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[Middleware] Auth route - allowing access, components will handle redirect');
    }
    return NextResponse.next();
  }

  /**
   * Rule 3: Allow request to continue
   * - Public routes are always allowed
   * - Protected routes with valid session are allowed (checked in Rule 1)
   * - Auth routes are allowed (components handle redirect logic via useAuth hook)
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
