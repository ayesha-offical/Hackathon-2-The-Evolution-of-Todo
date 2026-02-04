# JWT Verification - Complete Testing Package

**Date**: 2026-01-28
**Status**: ✅ Ready for Manual Testing
**Purpose**: Verify JWT Bridge implementation before Phase 6

---

## What to Test

The JWT Bridge has **3 critical components** that must work together:

```
┌─────────────────────────────────────────────────────────────────┐
│ COMPONENT 1: Frontend JWT Issuance                              │
├─────────────────────────────────────────────────────────────────┤
│ • Better Auth client calls POST /api/v1/auth/login              │
│ • Backend returns JWT in response with 'sub' claim              │
│ • JWT stored in HTTP-only cookie                                │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ COMPONENT 2: Bearer Token Injection                             │
├─────────────────────────────────────────────────────────────────┤
│ • Frontend Fetch API wrapper extracts JWT from cookie           │
│ • Injects into Authorization header: Bearer <JWT>              │
│ • ALL requests to /api/v1/tasks/** include token               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ COMPONENT 3: Backend JWT Verification                           │
├─────────────────────────────────────────────────────────────────┤
│ • Middleware extracts token from Authorization header           │
│ • Verifies signature with BETTER_AUTH_SECRET + HS256           │
│ • Decodes 'sub' claim → user_id                                │
│ • Stores in request.state.user_id                              │
│ • Route handler passes to service → queries filter by user_id  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Testing Options

### Option A: Automated Testing (Recommended for first run)

```bash
bash /tmp/test_jwt_bridge.sh
```

This script:
- ✅ Registers a test user
- ✅ Obtains JWT token
- ✅ Decodes JWT to verify claims
- ✅ Tests protected endpoints with/without token
- ✅ Tests invalid token rejection
- ✅ Creates a task and verifies user_id
- ✅ Verifies user isolation (filtering)

**Expected Output**:
```
==================================================
JWT Bridge Verification Test Suite
==================================================

STEP 1: Checking backend health...
✅ Backend is running

STEP 2: Register test user...
Response: { "id": "...", "email": "test@example.com", ... }

STEP 3: Login to get JWT token...
✅ JWT Token obtained (first 50 chars): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

STEP 4: Decoding JWT to verify claims...
Decoded JWT Payload:
{
  "sub": "user-id-from-jwt",
  "iat": 1706444400,
  "exp": 1706448000
}

STEP 5: Testing protected endpoint WITHOUT JWT...
HTTP Status: 401
✅ Correctly returned 401 Unauthorized

STEP 6: Testing protected endpoint WITH JWT...
HTTP Status: 200
✅ Correctly returned 200 OK with JWT

STEP 7: Testing protected endpoint with INVALID JWT...
HTTP Status: 401
✅ Correctly returned 401 for invalid JWT

STEP 8: Creating a task with authenticated user...
✅ Task created successfully
   Task ID: task-uuid
   Task user_id: user-id-from-jwt
   JWT user_id: user-id-from-jwt
✅ Task user_id matches JWT user_id (CORRECT!)

==================================================
JWT Bridge Verification Summary
==================================================

✅ All tests passed:
   1. Backend is running
   2. User registration successful
   3. JWT token issued with 'sub' claim
   4. Protected endpoints require JWT (401 without token)
   5. Protected endpoints work with valid JWT (200 with token)
   6. Invalid JWTs are rejected (401 with invalid token)
   7. User isolation working (task.user_id == jwt.sub)

✅ JWT Bridge is working correctly!
✅ Request.state.user_id is being populated properly!

Ready for Phase 6 implementation!
```

---

### Option B: Manual Testing (For detailed debugging)

See `JWT_BRIDGE_TEST_GUIDE.md` for step-by-step instructions with individual curl commands.

**8 manual tests**:
1. Register user
2. Login & get JWT
3. Decode JWT payload
4. Test without JWT (401)
5. Test with JWT (200)
6. Test with invalid JWT (401)
7. Create task (verify user_id)
8. List tasks (verify filtering)

---

## How to Verify `request.state.user_id` is Populated

The backend populates `request.state.user_id` in the middleware. Here's how to verify:

### Method 1: Check Task Response
When you create a task via authenticated request:

```bash
curl -X POST "http://localhost:8000/api/v1/tasks" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","status":"Pending"}'
```

The response includes `user_id`:
```json
{
  "id": "task-id",
  "user_id": "user-id-matches-jwt-sub",  ← This should match JWT 'sub' claim
  "title": "Test",
  ...
}
```

**What this proves**:
- ✅ Middleware extracted user_id from JWT
- ✅ Stored in request.state.user_id
- ✅ Route handler received it via Depends()
- ✅ Service layer got it and used it for task creation

### Method 2: Check Backend Logs
Start backend with debug logging:

```bash
cd /home/ayeshafaisal/Hackaton_2/phase_2/backend
LOGLEVEL=DEBUG python -m uvicorn src.main:app --reload
```

You should see:
```
DEBUG: JWT verified for user: user-id-here
```

This is logged in `middleware/jwt_verification.py` line 94.

### Method 3: Compare JWT 'sub' with Task 'user_id'

From test output:
```
JWT 'sub' claim (user_id): abc123def456

Task Response:
  "user_id": "abc123def456"

✅ They match! request.state.user_id was correctly populated and used
```

---

## Debugging Utilities

### Debug JWT Token Contents

Python utility included: `backend/src/debug/jwt_debugger.py`

Use in Python:
```python
from src.debug.jwt_debugger import print_jwt_debug

token = "eyJhbGc..."
secret = "VI5oxGZKnZ7FlLmaw5fGS7t373QzjP2I"

print_jwt_debug(token, secret)
```

Output:
```
======================================================================
JWT DEBUG INFORMATION
======================================================================

✅ Overall Status: SUCCESS

Token Structure:
  Header:    eyJhbGciOiJIUzI1NiIsInR5...
  Payload:   eyJzdWIiOiJ1c2VyLWlkLWFi...
  Signature: TJVA95OrM7E2cBab30RMHrHDcE...

Signature Verification:
  Algorithm:       HS256
  Secret:          VI5oxGZ...
  ✅ Valid:        True

Claims (3 total):
  sub: user-id-abc123
  iat: 1706444400
  exp: 1706448000

✅ User ID ('sub' claim):
   user-id-abc123

   ↳ This will be stored in request.state.user_id

Expiration Status:
  ✅ Expired:       False
  Exp Timestamp:   1706448000
  Exp DateTime:    2026-01-28T13:00:00
  Time Remaining:  3600 seconds

======================================================================
```

---

## Files Provided

1. **`/tmp/test_jwt_bridge.sh`** ← Automated test script
   - Run all 8 tests in sequence
   - Generates detailed output
   - Perfect for first verification

2. **`JWT_BRIDGE_TEST_GUIDE.md`** ← Manual testing guide
   - Individual curl commands for each test
   - Debugging checklist
   - Expected responses for each test

3. **`backend/src/debug/jwt_debugger.py`** ← Debug utility
   - Decode and inspect JWT tokens
   - Verify claims and signatures
   - Check token expiration

---

## Expected Verification Results

| Test | Expected Result | Verification |
|------|-----------------|---------------|
| User registration | 201 Created | User ID returned |
| JWT issuance | 200 OK with token | Token contains `sub` claim |
| JWT decode | Payload shows claims | `"sub"` claim = user_id |
| No JWT (protected) | 401 Unauthorized | Middleware rejects |
| Valid JWT (protected) | 200 OK | Middleware accepts |
| Invalid JWT | 401 Unauthorized | Signature verification fails |
| Task creation | 201 Created | Task.user_id = JWT.sub |
| Task filtering | 200 OK with 1 task | Only authenticated user's task |

**If all tests pass with expected results**:
- ✅ JWT Bridge is working
- ✅ request.state.user_id is correctly populated
- ✅ User isolation is enforced
- ✅ Ready for Phase 6

---

## Pre-Phase-6 Checklist

Before starting Phase 6, confirm:

- [ ] Run `/tmp/test_jwt_bridge.sh` and all tests pass
- [ ] JWT tokens are issued with correct `sub` claim
- [ ] Backend correctly verifies JWT signature
- [ ] Protected endpoints return 401 without token
- [ ] Protected endpoints return 200 with valid token
- [ ] Invalid tokens are rejected
- [ ] Tasks are created with correct user_id from JWT
- [ ] Tasks are filtered by authenticated user_id
- [ ] Cross-user access is prevented (403 or filtered)

**If all checks pass**: ✅ **Proceed to Phase 6**

---

## Getting Help

If tests fail, check:

1. **Backend not running?**
   ```bash
   cd /home/ayeshafaisal/Hackaton_2/phase_2/backend
   python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **JWT not issued?**
   - Check login endpoint returns `"token"` field
   - Verify `BETTER_AUTH_SECRET` is in backend `.env.local`
   - Check auth service is using correct secret

3. **Middleware not verifying?**
   - Check middleware is registered: `src/main.py` line 1
   - Verify algorithm is HS256: `src/middleware/jwt_verification.py` line 79
   - Check secret matches: both use `settings.better_auth_secret`

4. **User_id not populated?**
   - Check middleware stores it: line 93
   - Check dependency reads it: `src/api/dependencies.py`
   - Check route handlers request it: `Depends(get_current_user_id)`

5. **User isolation not working?**
   - Check service filters: `WHERE Task.user_id == user_id`
   - Verify user_id is passed to service from route handler
   - Check database has user_id foreign key

---

## Next Steps

Once verification is complete:

1. ✅ Document results in a test report
2. ✅ Note any deviations from expected behavior
3. ✅ Fix any issues found
4. ✅ Re-run tests to confirm fixes
5. ✅ Proceed to Phase 6 implementation

---

**Status**: ✅ Testing Package Complete and Ready

**Document Created**: 2026-01-28
**Last Updated**: 2026-01-28
**Version**: 1.0
