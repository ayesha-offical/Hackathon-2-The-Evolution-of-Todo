# JWT Bridge Verification Test Guide

**Purpose**: Manually verify that the backend correctly decodes JWTs and populates `request.state.user_id`

**Date**: 2026-01-28

---

## Prerequisites

1. **Backend running**:
   ```bash
   cd /home/ayeshafaisal/Hackaton_2/phase_2/backend
   python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Required tools**:
   - `curl` (for API calls)
   - `jq` (for JSON parsing, optional but recommended)
   - `base64` (for decoding JWT payload)

3. **Environment**:
   - Backend URL: `http://localhost:8000`
   - `BETTER_AUTH_SECRET`: `VI5oxGZKnZ7FlLmaw5fGS7t373QzjP2I`

---

## Test Variables

Set these for convenience:

```bash
export BACKEND_URL="http://localhost:8000"
export BETTER_AUTH_SECRET="VI5oxGZKnZ7FlLmaw5fGS7t373QzjP2I"
export TEST_EMAIL="test@example.com"
export TEST_PASSWORD="TestPass123!"
```

---

## Test 1: Register a Test User

**Purpose**: Create a user to test with

```bash
curl -X POST "$BACKEND_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }"
```

**Expected Response**:
```json
{
  "id": "uuid-here",
  "email": "test@example.com",
  "is_verified": false,
  "created_at": "2026-01-28T12:00:00Z"
}
```

---

## Test 2: Login to Get JWT Token

**Purpose**: Obtain a JWT token that Better Auth issued

```bash
curl -X POST "$BACKEND_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }"
```

**Expected Response**:
```json
{
  "user": {
    "id": "uuid-here",
    "email": "test@example.com",
    "is_verified": false,
    "created_at": "2026-01-28T12:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ...",
  "expires_in": 3600
}
```

**Save the token**:
```bash
export JWT_TOKEN="<paste-token-here>"
```

---

## Test 3: Decode the JWT to Verify Claims

**Purpose**: Verify that the JWT contains the correct `sub` (user_id) claim

```bash
# Extract the payload (middle part of JWT)
JWT_PAYLOAD=$(echo "$JWT_TOKEN" | cut -d'.' -f2)

# Add base64 padding if needed
PADDING=$((4 - ${#JWT_PAYLOAD} % 4))
if [ $PADDING -ne 4 ]; then
    JWT_PAYLOAD="${JWT_PAYLOAD}$(printf '%.0s=' $(seq 1 $PADDING))"
fi

# Decode from base64
echo "$JWT_PAYLOAD" | base64 -d | jq .
```

**Expected Output**:
```json
{
  "sub": "user-uuid-here",
  "iat": 1706444400,
  "exp": 1706448000
}
```

**Key Point**: The `"sub"` claim is the **user_id** that will be extracted by the backend middleware.

---

## Test 4: Test Protected Endpoint WITHOUT JWT (Should Fail)

**Purpose**: Verify that protected endpoints return 401 without a token

```bash
curl -v "$BACKEND_URL/api/v1/tasks"
```

**Expected Response**:
- **HTTP Status**: `401 Unauthorized`
- **Body**: `{"detail":"Invalid or missing Authorization header"}`

---

## Test 5: Test Protected Endpoint WITH JWT (Should Succeed)

**Purpose**: Verify that the backend accepts the JWT and populates `request.state.user_id`

```bash
curl -v \
  -H "Authorization: Bearer $JWT_TOKEN" \
  "$BACKEND_URL/api/v1/tasks"
```

**Expected Response**:
- **HTTP Status**: `200 OK`
- **Body**:
  ```json
  {
    "data": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 0
    }
  }
  ```

**What's Happening**:
1. Middleware extracts JWT from `Authorization: Bearer ...` header
2. Middleware verifies signature using `BETTER_AUTH_SECRET` + HS256
3. Middleware decodes `sub` claim → `request.state.user_id`
4. Route handler receives `user_id` via `Depends(get_current_user_id)`
5. Service layer queries: `WHERE user_id = <extracted_id>`
6. Returns only this user's tasks (empty list for new user)

---

## Test 6: Test with Invalid JWT (Should Fail)

**Purpose**: Verify that invalid JWTs are rejected

```bash
curl -v \
  -H "Authorization: Bearer invalid.jwt.token" \
  "$BACKEND_URL/api/v1/tasks"
```

**Expected Response**:
- **HTTP Status**: `401 Unauthorized`
- **Body**: `{"detail":"Invalid or expired token"}`

---

## Test 7: Create a Task (Verify User Isolation)

**Purpose**: Verify that `request.state.user_id` is correctly used for user isolation

```bash
curl -X POST "$BACKEND_URL/api/v1/tasks" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Test Task\",
    \"description\": \"This is a test task\",
    \"status\": \"Pending\"
  }"
```

**Expected Response**:
```json
{
  "id": "task-uuid-here",
  "user_id": "same-as-jwt-sub-claim",
  "title": "Test Task",
  "description": "This is a test task",
  "status": "Pending",
  "created_at": "2026-01-28T12:00:00Z",
  "updated_at": "2026-01-28T12:00:00Z"
}
```

**Verification**:
- Extract `user_id` from JWT `sub` claim (from Test 3)
- Compare with `user_id` in task response
- They **MUST be identical** ✅

**This proves**:
- ✅ JWT middleware extracted user_id correctly
- ✅ `request.state.user_id` was populated correctly
- ✅ Service layer received the user_id and used it to create the task

---

## Test 8: List Tasks (Verify Filtering)

**Purpose**: Verify that user can only see their own tasks

```bash
curl -H "Authorization: Bearer $JWT_TOKEN" \
  "$BACKEND_URL/api/v1/tasks"
```

**Expected Response**:
```json
{
  "data": [
    {
      "id": "task-uuid-from-test-7",
      "user_id": "same-as-jwt-sub",
      "title": "Test Task",
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```

**Verification**:
- Only tasks with `user_id` matching the JWT's `sub` claim are returned
- Other users' tasks are NOT visible
- ✅ User isolation is working

---

## Automated Test Script

Instead of running tests manually, run the automated script:

```bash
bash /tmp/test_jwt_bridge.sh
```

This script runs all tests above in sequence and reports results.

---

## Debugging Checklist

If any test fails, check:

### JWT Not Being Issued
- [ ] Login endpoint is working: `POST /api/v1/auth/login` returns status 200
- [ ] Response contains `"token"` field
- [ ] Token is not empty

### JWT Not Being Verified
- [ ] Middleware is registered first in FastAPI app: `src/main.py` line 1
- [ ] Middleware uses correct algorithm: `jwt.decode(..., algorithms=["HS256"])`
- [ ] Middleware uses correct secret: `settings.better_auth_secret`
- [ ] Check backend logs for `JWTError` or decode failures

### `request.state.user_id` Not Being Populated
- [ ] Middleware stores it: `request.state.user_id = user_id` (line 93)
- [ ] Dependency receives it: `def get_current_user_id(request: Request)` (line X in dependencies.py)
- [ ] Route handlers receive it: `user_id: str = Depends(get_current_user_id)` (in tasks.py)

### User Isolation Not Working
- [ ] Service method receives user_id: `async def get_user_tasks(self, user_id: str, ...)`
- [ ] Query filters by user_id: `WHERE Task.user_id == user_id`
- [ ] Task creation receives user_id: `new_task.user_id = user_id`

---

## Expected Flow Diagram

```
Frontend (Better Auth)
    ↓ POST /login
    ├─ Issue JWT with 'sub' claim
    ├─ Store in HTTP-only cookie
    └─ Return token in response

Test Client (curl)
    ↓ GET /api/v1/tasks
    ├─ Header: Authorization: Bearer <JWT>
    └─ Send request

Backend (FastAPI)
    ↓ Middleware: JWTVerificationMiddleware
    ├─ Extract token from Bearer header
    ├─ Verify signature with BETTER_AUTH_SECRET
    ├─ Decode payload
    ├─ Extract 'sub' claim (user_id)
    └─ Store in request.state.user_id

    ↓ Route Handler: list_tasks
    ├─ Receive user_id: str = Depends(get_current_user_id)
    └─ Pass to service layer

    ↓ Service Layer: TaskService.get_user_tasks(user_id)
    ├─ Query: SELECT * FROM tasks WHERE user_id = ?
    └─ Return filtered results

    ↓ Response to client
    └─ {"data": [...], "pagination": {...}}
```

---

## Success Criteria

All 8 tests must pass:

- ✅ Test 1: User registered successfully
- ✅ Test 2: JWT token issued by login endpoint
- ✅ Test 3: JWT contains correct `sub` claim
- ✅ Test 4: Protected endpoint returns 401 without token
- ✅ Test 5: Protected endpoint returns 200 with valid token
- ✅ Test 6: Protected endpoint returns 401 with invalid token
- ✅ Test 7: Task created with correct user_id
- ✅ Test 8: Tasks are filtered by authenticated user_id

**If all tests pass**, you can confidently proceed to Phase 6.

---

## Next Steps

Once all tests pass:

1. ✅ Confirm in the response that `request.state.user_id` is correctly populated
2. ✅ Document any findings or issues
3. ✅ Proceed to Phase 6 implementation

---

**Created**: 2026-01-28
**Updated**: 2026-01-28
**Status**: Ready for manual testing
