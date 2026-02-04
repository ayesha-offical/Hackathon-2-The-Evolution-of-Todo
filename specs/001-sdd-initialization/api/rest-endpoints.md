# API Specification: REST Endpoints with Bearer Token Authentication

**Feature Branch**: `001-sdd-initialization`
**API Path**: `@specs/001-sdd-initialization/api/rest-endpoints.md`
**Created**: 2026-01-22
**Status**: Draft

---

## Overview

This specification defines the REST API contract for the application. All endpoints use Bearer token (JWT) authentication, include proper HTTP status codes, and enforce user_id-based data isolation through request scoping.

---

## Authentication & Authorization

### Bearer Token Pattern

All authenticated endpoints require the `Authorization` header:

```
Authorization: Bearer <JWT_TOKEN>
```

The JWT token contains:
- `sub` (subject): user_id
- `email`: user's email address
- `iat`: issued at timestamp
- `exp`: expiration timestamp (typically 1 hour)

### Authorization Strategy

- **Public Endpoints**: No authentication required (registration, login, password reset)
- **Protected Endpoints**: Authorization header required; user_id extracted from token
- **User-Scoped Endpoints**: User can only access resources where `user_id` matches their token

### Error Responses

| Status Code | Scenario | Response Body |
|---|---|---|
| 401 Unauthorized | Missing/invalid token | `{ "error": "Unauthorized", "message": "Invalid or missing Authorization header" }` |
| 403 Forbidden | Authenticated but insufficient permissions (accessing other user's data) | `{ "error": "Forbidden", "message": "You do not have permission to access this resource" }` |
| 404 Not Found | Resource not found | `{ "error": "Not Found", "message": "Resource with id {id} not found" }` |

---

## Authentication Endpoints

### POST /api/auth/register

Register a new user account.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response** (201 Created):
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "is_verified": false,
  "created_at": "2026-01-22T10:30:00Z"
}
```

**Errors**:
- 400 Bad Request: Invalid email format or weak password
- 409 Conflict: Email already registered

**Notes**:
- Verification email sent automatically
- Password must be 8+ characters with mixed case and numbers
- No token issued until email is verified

---

### POST /api/auth/login

Authenticate user and return JWT token.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response** (200 OK):
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600
}
```

**Cookies Set**:
- `Authorization`: HTTP-only cookie containing JWT token (1 hour expiration)
- `RefreshToken`: HTTP-only cookie containing refresh token (30 day expiration)

**Errors**:
- 401 Unauthorized: Invalid email or password

**Notes**:
- Tokens stored in HTTP-only cookies (not returned in response body)
- Access token: 1 hour expiration
- Refresh token: 30 day expiration

---

### POST /api/auth/logout

Logout current user and invalidate session.

**Request**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Response** (200 OK):
```json
{
  "message": "Logged out successfully"
}
```

**Cookies Cleared**:
- Authorization cookie removed
- RefreshToken cookie removed

**Errors**:
- 401 Unauthorized: Invalid or missing token

---

### POST /api/auth/refresh

Refresh access token using refresh token.

**Request**:
```
Authorization: Bearer <REFRESH_TOKEN>
```

**Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600
}
```

**Errors**:
- 401 Unauthorized: Invalid or expired refresh token

**Notes**:
- Called automatically by frontend before token expiration
- Returns new access token with fresh expiration

---

### POST /api/auth/forgot-password

Request password reset email.

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200 OK):
```json
{
  "message": "Password reset email sent"
}
```

**Notes**:
- Always returns 200 (even if email not found) for security
- Reset link valid for 24 hours
- Link contains single-use token

---

### POST /api/auth/reset-password

Reset password using reset token from email.

**Request**:
```json
{
  "reset_token": "token_from_email",
  "new_password": "NewSecurePassword123"
}
```

**Response** (200 OK):
```json
{
  "message": "Password reset successfully"
}
```

**Errors**:
- 400 Bad Request: Invalid or expired reset token
- 400 Bad Request: Weak password

---

## Task Endpoints

### POST /api/tasks

Create a new task (authenticated).

**Request**:
```
Authorization: Bearer <JWT_TOKEN>

{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "status": "Pending"
}
```

**Response** (201 Created):
```json
{
  "id": "task_123",
  "user_id": "user_456",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "status": "Pending",
  "created_at": "2026-01-22T10:30:00Z",
  "updated_at": "2026-01-22T10:30:00Z"
}
```

**Errors**:
- 400 Bad Request: Missing required fields
- 401 Unauthorized: Missing/invalid token

**Notes**:
- user_id automatically set from token (not from request)
- Status defaults to "Pending" if not provided

---

### GET /api/tasks

List all tasks for authenticated user (paginated).

**Request**:
```
Authorization: Bearer <JWT_TOKEN>

Query Parameters:
- page=1 (default: 1)
- limit=20 (default: 20, max: 100)
- status=Pending (optional filter)
```

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "task_123",
      "user_id": "user_456",
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "status": "Pending",
      "created_at": "2026-01-22T10:30:00Z",
      "updated_at": "2026-01-22T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

**Errors**:
- 401 Unauthorized: Missing/invalid token

**Notes**:
- Returns only tasks where user_id matches authenticated user
- Implements user_id-based data isolation
- Supports pagination for large task lists

---

### GET /api/tasks/{id}

Retrieve a specific task by ID.

**Request**:
```
Authorization: Bearer <JWT_TOKEN>
GET /api/tasks/task_123
```

**Response** (200 OK):
```json
{
  "id": "task_123",
  "user_id": "user_456",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "status": "Pending",
  "created_at": "2026-01-22T10:30:00Z",
  "updated_at": "2026-01-22T10:30:00Z"
}
```

**Errors**:
- 401 Unauthorized: Missing/invalid token
- 403 Forbidden: Task belongs to another user
- 404 Not Found: Task does not exist

**Notes**:
- Verifies user_id matches before returning task
- Returns 403 if task belongs to different user (not 404)

---

### PATCH /api/tasks/{id}

Update an existing task.

**Request**:
```
Authorization: Bearer <JWT_TOKEN>

{
  "title": "Buy groceries (Priority)",
  "status": "In Progress"
}
```

**Response** (200 OK):
```json
{
  "id": "task_123",
  "user_id": "user_456",
  "title": "Buy groceries (Priority)",
  "description": "Milk, eggs, bread",
  "status": "In Progress",
  "created_at": "2026-01-22T10:30:00Z",
  "updated_at": "2026-01-22T10:35:00Z"
}
```

**Errors**:
- 401 Unauthorized: Missing/invalid token
- 403 Forbidden: Task belongs to another user
- 404 Not Found: Task does not exist
- 400 Bad Request: Invalid field values

**Notes**:
- Only authenticated user can update their own tasks
- updated_at timestamp automatically set to current time

---

### DELETE /api/tasks/{id}

Delete a task.

**Request**:
```
Authorization: Bearer <JWT_TOKEN>
DELETE /api/tasks/task_123
```

**Response** (204 No Content):
```
(empty body)
```

**Errors**:
- 401 Unauthorized: Missing/invalid token
- 403 Forbidden: Task belongs to another user
- 404 Not Found: Task does not exist

**Notes**:
- Hard delete (permanent removal)
- No recovery available after deletion
- Returns 204 (no content response body)

---

## Response Format Standards

### Success Response (200/201):
```json
{
  "data": { /* resource data */ },
  "meta": {
    "timestamp": "2026-01-22T10:30:00Z"
  }
}
```

For endpoints without body (204 No Content), no response body is sent.

### Error Response:
```json
{
  "error": "ErrorType",
  "message": "Human-readable error message",
  "details": {
    "field": "error details about specific field"
  }
}
```

---

## HTTP Status Codes

| Code | Usage |
|---|---|
| 200 OK | Successful GET or PATCH request |
| 201 Created | Successful POST request creating a resource |
| 204 No Content | Successful DELETE request |
| 400 Bad Request | Invalid request data, missing required fields |
| 401 Unauthorized | Missing or invalid authentication token |
| 403 Forbidden | Authenticated but insufficient permissions |
| 404 Not Found | Resource does not exist |
| 409 Conflict | Resource already exists (e.g., duplicate email on registration) |
| 500 Internal Server Error | Unexpected server error |

---

## Cross-References

- **Authentication**: `@specs/001-sdd-initialization/features/authentication.md` - Token generation and validation
- **Task CRUD**: `@specs/001-sdd-initialization/features/task-crud.md` - Task business logic
- **Database Schema**: `@specs/001-sdd-initialization/database/schema.md` - Data models and relationships

---

## Notes

Every endpoint strictly enforces:
1. **Authentication**: Token required (Bearer scheme)
2. **User Isolation**: user_id extracted from token and used for data scoping
3. **Proper HTTP Status**: 401 for auth failures, 403 for permission failures, 404 for missing resources
4. **Consistent Responses**: All responses follow the standard JSON format
5. **HTTP-only Cookies**: Tokens never exposed to JavaScript (security best practice)
