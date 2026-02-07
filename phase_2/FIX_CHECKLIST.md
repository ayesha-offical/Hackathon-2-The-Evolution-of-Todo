# Signup Flow Fix - Checklist & Verification

## Changes Made ✓

### Phase 1: Configuration Files
- [x] Created `backend/.env.local`
  - Set DATABASE_URL to Neon PostgreSQL connection
  - Set BETTER_AUTH_SECRET (JWT secret for auth tokens)
  - Set API_PORT=8000, API_HOST=0.0.0.0
  - Set ENVIRONMENT=development
  - Set LOG_LEVEL=INFO (change to DEBUG for troubleshooting)

- [x] Created `frontend/.env.local`
  - Set NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
  - Set NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:8000/api/v1/auth

### Phase 2: Code Changes
- [x] Fixed `frontend/src/lib/auth.ts`
  - Changed baseURL from `process.env.NEXT_PUBLIC_API_BASE_URL`
  - To: `process.env.NEXT_PUBLIC_BETTER_AUTH_URL`
  - Now correctly points to `/api/v1/auth` instead of just `/auth`

- [x] Enhanced `backend/src/middleware/jwt_verification.py`
  - Added request_path variable for clarity
  - Added debug logging for public endpoints
  - Added debug logging for protected endpoint checks

### Phase 3: Documentation
- [x] Created `AUTH_SIGNUP_FIX.md` - Comprehensive troubleshooting guide
- [x] Created `SIGNUP_FIX_SUMMARY.md` - Quick reference
- [x] Created `FIX_CHECKLIST.md` - This file

## Verification Steps

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Verify .env.local exists
test -f .env.local && echo "✓ .env.local exists" || echo "✗ .env.local missing"

# Verify required environment variables
grep "DATABASE_URL" .env.local && echo "✓ DATABASE_URL set"
grep "BETTER_AUTH_SECRET" .env.local && echo "✓ BETTER_AUTH_SECRET set"
grep "API_PORT" .env.local && echo "✓ API_PORT set"

# Verify Python dependencies
python -m pip list | grep -E "fastapi|sqlalchemy|python-jose" | head -3
```

### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Verify .env.local exists
test -f .env.local && echo "✓ .env.local exists" || echo "✗ .env.local missing"

# Verify environment variables
grep "NEXT_PUBLIC_API_BASE_URL" .env.local && echo "✓ NEXT_PUBLIC_API_BASE_URL set"
grep "NEXT_PUBLIC_BETTER_AUTH_URL" .env.local && echo "✓ NEXT_PUBLIC_BETTER_AUTH_URL set"

# Verify auth.ts changes
grep "NEXT_PUBLIC_BETTER_AUTH_URL" src/lib/auth.ts && echo "✓ auth.ts uses correct URL"
```

### 3. Start Services

#### Terminal 1: Backend
```bash
cd backend
python -m uvicorn src.main:app --reload

# Expected output:
# ✓ INFO:     Application startup complete
# ✓ INFO:     Uvicorn running on http://0.0.0.0:8000
```

#### Terminal 2: Frontend
```bash
cd frontend
npm run dev

# Expected output:
# ✓ ▲ Next.js 15.5.12
# ✓ - Local:        http://localhost:3000
# ✓ - Environments: .env.local
```

### 4. Functional Testing

#### Test 1: Health Check
```bash
curl http://localhost:8000/health

# Expected response (200):
# {
#   "status": "healthy",
#   "service": "phase2-todo-api",
#   "environment": "development",
#   "version": "1.0.0"
# }
```

#### Test 2: Sign-Up Endpoint (Direct)
```bash
curl -X POST http://localhost:8000/api/v1/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "email":"test1@example.com",
    "password":"TestPassword123"
  }'

# Expected response (200):
# {
#   "user": {
#     "id": "...",
#     "email": "test1@example.com",
#     "name": "test1",
#     "is_verified": false,
#     "created_at": "..."
#   },
#   "url": null
# }
```

#### Test 3: Sign-Up via Frontend
1. Open http://localhost:3000/register
2. Fill in form:
   - Email: test2@example.com
   - Password: TestPassword123
   - Confirm Password: TestPassword123
   - Accept Terms
3. Click "Create Account"
4. **Expected:** Success message and redirect to /login

#### Test 4: Middleware Public Endpoint Check
1. Check backend logs for debug messages:
   ```
   [jwt_verification.py] Public endpoint accessed: /api/v1/auth/sign-up/email
   ```
2. If you don't see this, enable DEBUG logging:
   - Edit `backend/.env.local`: `LOG_LEVEL=DEBUG`
   - Restart backend
   - Try signup again

### 5. Session/Cookie Verification

#### Check 1: Cookies Set After Signup
1. Open browser DevTools → Application → Cookies → localhost:8000
2. Look for:
   - [ ] `Authorization` cookie (should contain Bearer token)
   - [ ] `RefreshToken` cookie (should contain refresh token)
   - Both should have `httponly` flag enabled

#### Check 2: Middleware Session Detection
1. After signup, go to http://localhost:3000/dashboard
2. You should:
   - [ ] Be allowed to access dashboard (middleware found session cookie)
   - [ ] See your user info from authentication
3. Refresh the page:
   - [ ] Session should persist (middleware detects cookie on refresh)
4. Click logout:
   - [ ] Cookies should be cleared
   - [ ] Next attempt to access /dashboard should redirect to /login

## Troubleshooting Checklist

### If you get "Failed to fetch":
- [ ] Backend is running: `curl http://localhost:8000/health`
- [ ] Frontend `.env.local` file exists: `ls frontend/.env.local`
- [ ] Frontend was restarted after creating `.env.local`: `npm run dev` in fresh terminal
- [ ] CORS is not blocking (check browser Network tab for CORS errors)
- [ ] Database connection works (check backend logs for DB errors)

### If you get "401 Unauthorized":
- [ ] Backend logs show path being checked: Search backend console for the endpoint path
- [ ] Enable DEBUG logging: `LOG_LEVEL=DEBUG` in `backend/.env.local`
- [ ] Check PUBLIC_ENDPOINTS list includes the path: `grep -A 15 "PUBLIC_ENDPOINTS" backend/src/constants.py`
- [ ] Verify middleware is skipping public endpoints: `grep -A 3 "request_path in self.PUBLIC_ENDPOINTS" backend/src/middleware/jwt_verification.py`

### If "Email already registered" (409):
- [ ] This is expected! Use a different email for testing
- [ ] Or delete the user from database and try again

### If "Password must include..."
- [ ] Frontend validates: 8+ chars, uppercase, lowercase, number
- [ ] Valid example: `TestPassword123`
- [ ] Invalid example: `testpass123` (missing uppercase)

## Success Indicators

You'll know it's working when:

1. **Backend logs show:**
   ```
   [jwt_verification.py] Public endpoint accessed: /api/v1/auth/sign-up/email
   Sign up error: User...  # or success creation
   ```

2. **Frontend shows:**
   - Form submission succeeds
   - Success message appears
   - Redirect to /login happens

3. **Browser shows:**
   - Authorization and RefreshToken cookies set in DevTools
   - Cookies are httponly (can't be accessed via JavaScript)
   - Cookies have samesite=lax attribute

4. **Subsequent requests work:**
   - Middleware correctly detects session
   - Can access protected routes like /dashboard
   - Logout clears cookies

## Next Steps After Signup Works

1. **Test complete auth flow:**
   - [ ] Sign up works
   - [ ] Login works
   - [ ] Session persists across page refreshes
   - [ ] Logout clears session
   - [ ] Protected routes redirect unauthenticated users to /login

2. **UI Overhaul (your goal):**
   - [ ] Begin FocusHub branding
   - [ ] Update landing page design
   - [ ] Implement UI improvements from your plan

3. **Edge Cases:**
   - [ ] Test with weak passwords
   - [ ] Test with invalid emails
   - [ ] Test with duplicate emails
   - [ ] Test token expiration/refresh flow

## Important Notes

### Environment File Security
- ⚠️ `.env.local` files contain secrets - NEVER commit to git
- ✓ Already in `.gitignore` but double-check
- ✓ Update DATABASE_URL and BETTER_AUTH_SECRET with your actual values for production

### BETTER_AUTH_SECRET
- Must be the same on frontend and backend
- Frontend: Better Auth library uses it
- Backend: Signs and verifies JWT tokens
- If mismatched, tokens won't verify and you'll get 401 errors

### Development vs Production
- Current setup is for **development only** (localhost)
- For production:
  - Change `ENVIRONMENT=production`
  - Set `secure=True` in cookie configuration
  - Use HTTPS URLs instead of HTTP
  - Update CORS allowed origins
  - Use stronger BETTER_AUTH_SECRET

## Support Resources

- `AUTH_SIGNUP_FIX.md` - Comprehensive guide with architecture details
- `SIGNUP_FIX_SUMMARY.md` - Quick reference of changes
- `backend/src/api/v1/auth.py` - Auth endpoint implementations
- `frontend/src/lib/auth.ts` - Frontend auth client setup
- `frontend/src/middleware.ts` - Session detection and route protection
- `backend/src/middleware/jwt_verification.py` - JWT token verification
- `backend/src/config.py` - Settings and configuration loading
