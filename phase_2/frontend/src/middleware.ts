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

  // Get session cookies
  // Backend sets 'Authorization' cookie with JWT token
  // Better Auth may also use other cookie names (auth.*, session, etc.)
  const hasSession = request.cookies.has('Authorization') ||
                     request.cookies.has('RefreshToken') ||
                     request.cookies.has('better-auth.session_token') ||
                     request.cookies.has('auth.session');

  // Check if current path is a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

  // Check if current path is an auth route (login, register, etc.)
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));

  /**
   * Rule 1: Protected routes require authentication
   * If accessing protected route without session, redirect to login
   */
  if (isProtectedRoute && !hasSession) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  /**
   * Rule 2: Auth routes redirect to dashboard if already authenticated
   * This prevents already-logged-in users from seeing login/register pages
   */
  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  /**
   * Rule 3: Allow request to continue
   * - Public routes are always allowed
   * - Protected routes with valid session are allowed
   * - Auth routes without session are allowed
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
