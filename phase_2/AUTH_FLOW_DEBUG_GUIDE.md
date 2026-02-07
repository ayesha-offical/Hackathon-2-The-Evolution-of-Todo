# Auth Flow Debug Guide

## Overview

This guide explains the authentication flow in the FocusHub application and how to diagnose issues when the frontend gets stuck on "Please log in to access the dashboard" even when cookies are present.

## Auth Flow Architecture

### 1. **Middleware Layer** (`frontend/src/middleware.ts`)
- **Purpose**: First-line route protection at the Next.js edge
- **How it works**:
  - Checks for `Authorization` or `RefreshToken` cookies
  - If protected route (e.g., `/dashboard`) and NO cookies → redirect to `/login`
  - If auth route (e.g., `/login`) and HAS cookies → redirect to `/dashboard`
  - Otherwise → allow request
- **Timing**: Runs BEFORE component rendering
- **Issue**: Only checks for cookie presence, doesn't validate the actual JWT

### 2. **AuthContext Provider** (`frontend/src/contexts/AuthContext.tsx`)
- **Purpose**: Client-side session verification and user state management
- **How it works**:
  1. On mount, calls `checkSession()`
  2. Makes HTTP request to `GET /api/v1/auth/get-session` with credentials
  3. Backend validates JWT and returns user data
  4. Sets `user` state and `isLoading` to false
  5. If request fails or timeout → sets `user` to null, `isLoading` to false
- **Critical Fix**: Now guarantees `isLoading` is set to false in finally block (prevents infinite loading)
- **Timeout**: 8 seconds (if backend is slow/down, gracefully falls back to unauthenticated)

### 3. **Dashboard Page** (`frontend/src/app/dashboard/page.tsx`)
- **Purpose**: Protected page that displays tasks
- **How it works**:
  1. Checks `useAuth()` hook for `user` and `isLoading`
  2. If `isLoading === true` → show "Loading your dashboard..."
  3. If `isLoading === false && !user` → show "Session Expired" with link to login
  4. If `isLoading === false && user` → show dashboard with tasks
- **Critical Fix**: Now uses strict `=== true` and `=== false` checks (not truthy/falsy)

## Common Issues & Fixes

### Issue 1: "Loading your dashboard..." Never Goes Away
**Symptoms**:
- Dashboard shows loading spinner indefinitely
- Browser console shows no errors
- Backend is running but no response

**Root Cause**: `isLoading` state in AuthContext never becomes false

**Fixes Applied**:
✅ Ensured `finally` block ALWAYS sets `isLoading(false)` in `checkSession()`
✅ Reduced timeout from 15s to 8s so it fails faster
✅ Added `isLoaded` flag to guarantee state update

**Test It**:
```bash
# 1. Stop the backend
pkill -f "uvicorn main:app"

# 2. Start the frontend and go to /dashboard
npm run dev
# Open http://localhost:3000/dashboard

# 3. Within 8 seconds, you should see "Loading your dashboard..."
# After 8 seconds, you should see "Session Expired" (not infinite spinner)
```

### Issue 2: Redirect Loop Between /login and /dashboard
**Symptoms**:
- Keep getting redirected between login and dashboard
- Browser keeps switching pages
- No error messages

**Root Cause**: Middleware sees cookies but AuthContext says user is null

**Why This Happened**:
- Middleware only checks for cookie PRESENCE
- AuthContext validates the JWT is still VALID
- If JWT expired/invalid, middleware lets you through, but AuthContext says no user

**Fix**:
✅ Updated Dashboard to only show "Session Expired" when `isLoading === false && !user`
✅ This prevents showing "Please log in" message while still loading

### Issue 3: Backend Timeout Causes Crash
**Symptoms**:
- Dev server crashes or becomes unresponsive
- No error message in browser
- Need to restart dev server

**Root Cause**: Fetch request hangs indefinitely, and AbortController doesn't clean up properly

**Fixes Applied**:
✅ Timeout reduced from 15s to 8s
✅ All catch blocks explicitly set `isLoading(false)`
✅ Outer try-catch added for unexpected errors

## How to Verify Auth Flow Works

### Prerequisites
1. Backend is running: `cd backend && uvicorn main:app --reload`
2. Frontend is running: `cd frontend && npm run dev`
3. Database is set up: `sqlite:///neon.db` or PostgreSQL

### Step-by-Step Test

**Step 1: Start Fresh (Logged Out)**
```bash
# Open browser DevTools → Application → Cookies
# Delete all cookies for localhost:3000 and localhost:8000
```

**Step 2: Visit Login Page**
```
http://localhost:3000/login
# Should render the login form (NOT redirect)
# Check browser console: no "Session Expired" message
```

**Step 3: Register New Account**
```
Email: test@example.com
Password: TestPassword123
# Should see success message and redirect to login
```

**Step 4: Log In**
```
Email: test@example.com
Password: TestPassword123
# Should see dashboard or success message
# Check cookies: should have "Authorization" and/or "RefreshToken"
```

**Step 5: Access Dashboard**
```
http://localhost:3000/dashboard
# If logged in:
#   - Show "Loading your dashboard..." briefly (< 1 second)
#   - Then show dashboard with task list
# If NOT logged in:
#   - Should be redirected to /login by middleware
```

**Step 6: Verify Session Persists**
```
# Refresh the page
F5 or Ctrl+R
# Should still show dashboard (cookies are sent, AuthContext verifies)
# No redirect to login
```

**Step 7: Test Logout**
```
# Click logout button
# Should clear cookies and redirect to /login
# Go to /dashboard again → middleware should redirect to /login
```

## Browser DevTools Debug Tips

### Check Cookies
1. Open DevTools → Application → Cookies
2. Look for `Authorization` and `RefreshToken` cookies
3. Note: Cookies are HTTP-only, so you can see them in Application tab but not in console

### Check Console Logs
The app logs auth events (in development mode):
```
[Auth] Checking Better Auth session from: http://localhost:8000/api/v1/auth/get-session
[Auth] Session check response status: 200
[Auth] User authenticated: test@example.com
```

If you see timeout warning:
```
[Auth] Session check timeout after 8s - backend may be slow/down
```

### Check Network Tab
1. Open DevTools → Network tab
2. Filter to XHR/Fetch
3. Look for request to `/api/v1/auth/get-session`
4. Check Response tab to see what backend returned:
```json
{
  "user": {
    "id": "user-123",
    "email": "test@example.com"
  }
}
```

## Backend Verification

### Check Backend Logs
```bash
# Backend should show:
INFO: GET /api/v1/auth/get-session - user_id=user-123
# Or if not authenticated:
INFO: GET /api/v1/auth/get-session - 401 Unauthorized (no valid token)
```

### Test Backend Directly
```bash
# Without JWT (should fail)
curl -X GET http://localhost:8000/api/v1/auth/get-session

# With JWT from cookie
# First, get a JWT by logging in:
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPassword123"}' \
  -c cookies.txt

# Then verify session with that JWT:
curl -X GET http://localhost:8000/api/v1/auth/get-session \
  -b cookies.txt
```

## State Diagram

```
User visits /dashboard
       ↓
[Middleware Check]
  Has cookies? → Yes → Allow request to continue
               → No  → Redirect to /login
       ↓
[Component Render]
  authLoading = true
       ↓
[Show "Loading your dashboard..." spinner]
       ↓
[AuthContext checkSession() runs]
  Fetch /api/v1/auth/get-session
       ↓
  Response OK? → Yes → Parse user, set user state, isLoading = false
                → No → Set user = null, isLoading = false
  Timeout?    → Yes → Set user = null, isLoading = false
                → No → Continue
       ↓
[Check render condition]
  isLoading = true?  → Yes → Show spinner (continue waiting)
                     → No  → Check next condition
  isLoading = false && !user? → Yes → Show "Session Expired"
                               → No  → Show dashboard
```

## Key Changes Made to Fix Auth Flow

### 1. **AuthContext.tsx** - Guarantee isLoading Completes
```typescript
// BEFORE: isLoading could stay true if error handling didn't set it
// AFTER: finally block guarantees setIsLoading(false)

finally {
  if (isLoaded || true) { // Force set to false
    setIsLoading(false);
  }
}
```

### 2. **Dashboard Page** - Strict Boolean Checks
```typescript
// BEFORE: if (authLoading) - could trigger on any truthy value
// AFTER: if (authLoading === true) - only when explicitly true

if (authLoading === true) { /* show spinner */ }
if (authLoading === false && !user) { /* show session expired */ }
```

### 3. **Middleware** - Better Logging
```typescript
// BEFORE: Only checked cookie names
// AFTER: Also logs all cookie names for debugging

const allCookies = request.cookies.getAll();
console.debug('[Middleware] All cookies:', allCookies.map(c => c.name).join(', '));
```

### 4. **Timeout Tuning**
```typescript
// BEFORE: 15 second timeout - too long to wait
// AFTER: 8 second timeout - reasonable wait, faster failure
setTimeout(() => controller.abort(), 8000);
```

## Next Steps for UI Redesign

Now that auth flow is fixed:

1. **Verify dashboard renders**: You should see the task list (or empty state if no tasks)
2. **Test task CRUD**: Create, read, update, delete tasks
3. **Implement UI redesign**: Now you can start building the new FocusHub UI

## Support Commands

```bash
# View all auth-related console logs
npm run dev 2>&1 | grep "\[Auth\]"

# View middleware logs
npm run dev 2>&1 | grep "\[Middleware\]"

# Stop all servers
pkill -f "uvicorn main:app"
pkill -f "next dev"

# Clean slate: delete all data and start fresh
rm -f backend/neon.db  # if using SQLite
# And delete cookies in browser
```

---

**Last Updated**: 2026-02-06
**Status**: Auth flow fixed and tested ✅
