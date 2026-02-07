# Authentication Signup Flow Fix

## Problem Summary
Users were getting "Failed to fetch" or "401 Unauthorized" errors when trying to sign up, indicating that:
1. The frontend couldn't connect to the backend
2. The backend was rejecting requests due to missing auth headers

## Root Causes Identified & Fixed

### 1. Missing Environment Configuration
**Problem**: Frontend and backend had no `.env.local` files with proper configuration.

**Solution**: Created configuration files:
- `backend/.env.local` - Backend service configuration
- `frontend/.env.local` - Frontend API endpoint configuration

### 2. Incorrect Better Auth Client Configuration
**Problem**: The frontend auth client was using the wrong baseURL:
```javascript
// WRONG: Points to backend root, but Better Auth adds /auth
baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
```

This meant the client was trying to call `http://localhost:8000/auth/sign-up/email` instead of `http://localhost:8000/api/v1/auth/sign-up/email`.

**Solution**: Updated auth client to use the correct URL:
```javascript
// CORRECT: Points directly to the auth service
baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:8000/api/v1/auth"
```

### 3. Inadequate Logging in JWT Middleware
**Problem**: The JWT middleware wasn't logging which endpoints were being checked, making debugging difficult.

**Solution**: Added better debug logging to show:
- Public endpoints that are being accessed
- Protected endpoints that fail the public endpoint check

## Files Changed

### Backend Changes
1. **`backend/.env.local`** (NEW)
   - Created with DATABASE_URL, BETTER_AUTH_SECRET, and API configuration
   - NOTE: These values are from `.env.example` - update with your actual Neon DB credentials

2. **`backend/src/middleware/jwt_verification.py`**
   - Added debug logging to help troubleshoot public endpoint detection
   - Added explicit logging for path checking

### Frontend Changes
1. **`frontend/.env.local`** (NEW)
   - Created with NEXT_PUBLIC_API_BASE_URL and NEXT_PUBLIC_BETTER_AUTH_URL
   - Must be recreated after starting the frontend for hot-reload to pick up changes

2. **`frontend/src/lib/auth.ts`**
   - Updated authClient baseURL to use NEXT_PUBLIC_BETTER_AUTH_URL
   - Now correctly points to the auth service endpoint

## How to Test

### Prerequisites
1. **Backend Requirements**
   - Python 3.8+
   - PostgreSQL database (Neon serverless or local)
   - Dependencies: `pip install -r requirements.txt`

2. **Frontend Requirements**
   - Node.js 18+
   - Dependencies: `npm install` (already done)

### Step-by-Step Testing

1. **Start the Backend**
   ```bash
   cd backend
   python -m uvicorn src.main:app --reload
   ```
   You should see:
   ```
   INFO:     Uvicorn running on http://0.0.0.0:8000
   ```

2. **Start the Frontend** (in another terminal)
   ```bash
   cd frontend
   npm run dev
   ```
   You should see:
   ```
   ▲ Next.js 15.5.12
   - Local:        http://localhost:3000
   ```

3. **Test Signup Flow**
   - Navigate to http://localhost:3000/register
   - Fill in the form:
     - Email: test@example.com
     - Password: TestPassword123
     - Confirm Password: TestPassword123
     - Accept Terms & Conditions
   - Click "Create Account"

### Expected Success Behavior
1. Frontend makes request to `http://localhost:8000/api/v1/auth/sign-up/email`
2. Backend middleware allows the request (it's in PUBLIC_ENDPOINTS)
3. Backend creates the user in the database
4. Backend auto-logs-in the user by creating JWT tokens
5. Backend sets HTTP-only cookies for the tokens
6. Frontend receives the response and redirects to `/login` or `/dashboard`

### Common Issues & Solutions

#### Issue: "Failed to fetch"
**Causes:**
- Backend is not running (check terminal where you started backend)
- Frontend `.env.local` file is not loaded (restart `npm run dev` after creating/editing `.env.local`)
- CORS blocking the request (check browser console Network tab)

**Solution:**
1. Verify backend is running: `curl http://localhost:8000/health`
2. Restart frontend after creating/editing `.env.local`
3. Check browser Network tab for actual error details

#### Issue: "401 Unauthorized" with "Missing or malformed Authorization header"
**Causes:**
- Request path doesn't match PUBLIC_ENDPOINTS exactly
- JWT middleware is not recognizing public endpoint paths

**Solution:**
1. Check backend logs - look for: `[jwt_verification.py] Public endpoint accessed: /api/v1/auth/sign-up/email`
2. If not seeing that log, the path check is failing
3. Enable DEBUG logging in `.env.local`: `LOG_LEVEL=DEBUG`

#### Issue: "User with this email already exists" (409 Conflict)
**Solution:**
- Use a different email address or delete the user from the database first
- This is expected if you've already created that account

#### Issue: "Password must include uppercase, lowercase, and number"
**Solution:**
- Frontend validation requires: 8+ characters, 1 uppercase, 1 lowercase, 1 number
- Example good password: `TestPass123`
- Example bad password: `testpass123` (no uppercase)

## Architecture Overview

### Signup Request Flow
```
Frontend (register/page.tsx)
  ↓
authClient.signUp.email()
  ↓
HTTP POST to http://localhost:8000/api/v1/auth/sign-up/email
  ↓
CORS Middleware (allows request from localhost:3000)
  ↓
JWT Verification Middleware (skips for public endpoints)
  ↓
FastAPI Route Handler (better_auth_sign_up)
  ↓
AuthService.register_user() (creates user in DB)
  ↓
AuthService.login_user() (creates JWT tokens)
  ↓
Response with user data + Set-Cookie headers
  ↓
Frontend receives response, redirects to /login
```

### Authentication Configuration
- **JWT Secret**: Both frontend and backend use BETTER_AUTH_SECRET
  - Backend: Signs and verifies tokens (src/config.py)
  - Frontend: Passes to Better Auth library
  - These MUST match!

- **Token Storage**: HTTP-only cookies
  - Backend sets: `Authorization` cookie (with `Bearer ` prefix)
  - Backend sets: `RefreshToken` cookie (for refresh token)
  - Frontend middleware (middleware.ts) checks for these cookies

- **CORS Configuration**:
  - Allowed origins: localhost:3000, localhost:3001, 127.0.0.1:3000, 127.0.0.1:3001
  - Credentials: Allowed (needed for cookies)
  - Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
  - Exposed headers: Content-Type, Authorization, Set-Cookie

## Next Steps

1. **Verify Signup Works**
   - Run the backend and frontend
   - Test signup flow from register page

2. **Test Session Persistence**
   - After signup, you should be redirected to /login
   - Session should persist across page refreshes
   - Check that middleware.ts is correctly detecting the session cookie

3. **Test Dashboard Access**
   - Login and navigate to /dashboard
   - Middleware should allow access (session cookie present)
   - Logout and navigate to /dashboard - should redirect to /login

4. **Enable UI Overhaul** (your next goal)
   - Once authentication is stable, you can focus on the UI redesign
   - The FocusHub branding and landing page improvements

## Debug Commands

### Test Backend Health
```bash
curl http://localhost:8000/health
```

### Test Public Signup Endpoint (manual)
```bash
curl -X POST http://localhost:8000/api/v1/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'
```

### Check Environment Variables
```bash
# Backend
cat backend/.env.local

# Frontend
cat frontend/.env.local
```

### Enable Debug Logging
Edit `backend/.env.local` and change:
```
LOG_LEVEL=DEBUG
```
Then restart the backend.

## References
- Constitution II: JWT Bridge (auth architecture)
- Auth endpoints specification: `specs/001-sdd-initialization/features/authentication.md`
- JWT middleware: `backend/src/middleware/jwt_verification.py`
- Auth routes: `backend/src/api/v1/auth.py`
- Better Auth client: `frontend/src/lib/auth.ts`
- Middleware protection: `frontend/src/middleware.ts`
