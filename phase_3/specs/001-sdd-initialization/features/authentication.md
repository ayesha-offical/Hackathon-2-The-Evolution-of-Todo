# Feature Specification: Authentication with Better Auth JWT Bridge

**Feature Branch**: `001-sdd-initialization`
**Feature Path**: `@specs/001-sdd-initialization/features/authentication.md`
**Created**: 2026-01-22
**Status**: Draft

---

## Overview

This specification defines the authentication system using Better Auth with JWT (JSON Web Token) as the bearer token pattern. Users log in with email and password, receive a JWT token, and use that token to authenticate subsequent API requests.

---

## User Scenarios & Testing

### User Story 1 - User Registration (Priority: P1)

As a new user, I need to create an account with email and password so that I can access the application.

**Why this priority**: User registration is the entry point for new users. Without this, no one can use the system.

**Independent Test**: Can be fully tested by registering a new user and verifying an account is created in the system.

**Acceptance Scenarios**:

1. **Given** I provide a valid email and password, **When** I submit the registration form, **Then** my account is created and I receive a confirmation
2. **Given** I register with an email already in use, **When** I submit the form, **Then** the system rejects the request with a "Email already registered" error
3. **Given** I register with a weak password, **When** I submit the form, **Then** the system requires a stronger password (minimum 8 characters, mixed case, numbers)
4. **Given** my account is created, **When** I check my email, **Then** I receive a verification email with a confirmation link

---

### User Story 2 - User Login (Priority: P1)

As a registered user, I need to log in with my email and password so that I can access my data and perform authenticated operations.

**Why this priority**: Login is essential for authenticated operations. Users must be able to authenticate their requests.

**Independent Test**: Can be fully tested by logging in and verifying a valid JWT token is returned.

**Acceptance Scenarios**:

1. **Given** I provide correct email and password, **When** I submit the login form, **Then** I receive a JWT token in an HTTP-only cookie
2. **Given** I provide an incorrect password, **When** I submit the login form, **Then** the system returns 401 Unauthorized with error message "Invalid credentials"
3. **Given** I provide an email that does not exist, **When** I submit the login form, **Then** the system returns 401 Unauthorized
4. **Given** I log in, **When** I make an API request with the Bearer token, **Then** the token is validated and the request succeeds

---

### User Story 3 - Token Refresh (Priority: P1)

As an authenticated user, I need my access token to automatically refresh before expiration so that my session remains valid.

**Why this priority**: Token refresh prevents unexpected logouts. Without refresh, users are logged out after token expiration.

**Independent Test**: Can be fully tested by waiting for token expiration and verifying a new token is issued automatically.

**Acceptance Scenarios**:

1. **Given** my access token is near expiration (within 5 minutes), **When** I make an API request, **Then** the system automatically issues a new token
2. **Given** my access token has expired, **When** I make an API request with the expired token, **Then** the system returns 401 Unauthorized with "Token expired" error
3. **Given** I have a valid refresh token, **When** I call the refresh endpoint, **Then** I receive a new access token
4. **Given** my refresh token has expired, **When** I attempt to refresh, **Then** the system returns 401 and requires re-authentication

---

### User Story 4 - User Logout (Priority: P1)

As a logged-in user, I need to log out so that I can end my session and prevent unauthorized access to my account.

**Why this priority**: Logout is essential for security, especially on shared devices.

**Independent Test**: Can be fully tested by logging out and verifying the token is invalidated.

**Acceptance Scenarios**:

1. **Given** I am logged in, **When** I click the logout button, **Then** my session is terminated
2. **Given** I have logged out, **When** I attempt to make an authenticated request with my old token, **Then** the system returns 401 Unauthorized
3. **Given** I log out, **When** I check the browser cookies, **Then** the authentication cookie is cleared
4. **Given** I log out, **When** I am redirected to the login page, **Then** I am not automatically logged back in

---

### User Story 5 - Password Reset (Priority: P2)

As a user, I need to reset my password if I forgot it so that I can regain access to my account.

**Why this priority**: Password reset is important for account recovery but not as critical as login/registration.

**Independent Test**: Can be fully tested by requesting a password reset, clicking the reset link, and logging in with the new password.

**Acceptance Scenarios**:

1. **Given** I forgot my password, **When** I click "Forgot Password" and provide my email, **Then** I receive a reset email with a secure link
2. **Given** I have the reset link, **When** I click it and set a new password, **Then** my password is updated
3. **Given** the reset link is 24 hours old, **When** I attempt to use it, **Then** the system rejects it with "Link expired"
4. **Given** I reset my password, **When** I log in with the new password, **Then** I successfully authenticate

---

### Edge Cases

- What happens when a user registers with a very long email address?
- How does the system handle concurrent login attempts from the same user?
- What occurs if a user logs in from two devices simultaneously?
- How are tokens revoked if a user's account is compromised?

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST allow users to register with email and password
- **FR-002**: System MUST validate email format and uniqueness (no duplicate accounts per email)
- **FR-003**: System MUST enforce password strength requirements (minimum 8 characters, mixed case, at least one number)
- **FR-004**: System MUST send a verification email on registration with a confirmation link
- **FR-005**: System MUST allow verified users to log in with email and password
- **FR-006**: System MUST issue a JWT token upon successful login
- **FR-007**: System MUST store JWT tokens in HTTP-only cookies (not accessible to JavaScript)
- **FR-008**: System MUST validate JWT tokens on every authenticated API request
- **FR-009**: System MUST extract user_id from the JWT token for request scoping
- **FR-010**: System MUST automatically refresh access tokens before expiration (sliding window pattern)
- **FR-011**: System MUST return 401 Unauthorized for invalid or expired tokens
- **FR-012**: System MUST allow users to log out and invalidate their session
- **FR-013**: System MUST clear authentication cookies on logout
- **FR-014**: System MUST provide a password reset flow via email
- **FR-015**: System MUST require new email verification if user changes their email address
- **FR-016**: System MUST use HTTPS for all authentication flows

### Key Entities

- **User Account**: Represents a registered user with:
  - `id`: Unique user identifier (used as user_id for data scoping)
  - `email`: User's email address (unique, required)
  - `password_hash`: Securely hashed password (never store plaintext)
  - `is_verified`: Boolean indicating email verification status
  - `created_at`: ISO 8601 timestamp

- **JWT Token**: Contains:
  - `user_id`: Subject claim identifying the user
  - `email`: User's email (for reference)
  - `iat` (issued at): Token creation time
  - `exp` (expiration): Token expiration time
  - `refresh_token_id`: Reference to refresh token (optional)

- **Refresh Token**: Server-side token with:
  - `id`: Unique identifier
  - `user_id`: Associated user
  - `expires_at`: Expiration timestamp
  - `revoked_at`: Revocation timestamp (if revoked)

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: New user registration completes in under 2 seconds (excluding email delivery)
- **SC-002**: Login succeeds in under 500ms on successful credential match
- **SC-003**: Failed login attempts (wrong password/email) return proper 401 response in under 500ms
- **SC-004**: Token refresh happens transparently without user interruption
- **SC-005**: JWT token validation happens in under 50ms for each request
- **SC-006**: 100% of authenticated requests include user_id extracted from token
- **SC-007**: No JWT tokens are stored in browser's localStorage (HTTP-only cookies only)
- **SC-008**: Password reset emails are delivered within 5 minutes of request
- **SC-009**: All authentication flows require HTTPS (never HTTP)
- **SC-010**: Token expiration is set to 1 hour; refresh token valid for 30 days

---

## Assumptions

1. **Better Auth** is configured and running as an authentication service
2. Email delivery service is available and configured (SMTP or third-party)
3. Password hashing uses bcrypt with salt (industry standard)
4. JWT signing uses HS256 (HMAC with SHA-256) or RS256 (RSA) algorithm
5. Access tokens expire after 1 hour; refresh tokens expire after 30 days
6. HTTP-only cookies are supported by the frontend environment
7. HTTPS is enforced for all authentication endpoints
8. Email verification is required before account activation
9. No multi-factor authentication (MFA) is required in this phase
10. Account lockout after failed login attempts is handled by Better Auth defaults

---

## Cross-References

- **Task CRUD**: `@specs/001-sdd-initialization/features/task-crud.md` - User isolation via user_id extracted from tokens
- **REST API**: `@specs/001-sdd-initialization/api/rest-endpoints.md` - Authentication header and Bearer token usage
- **Database Schema**: `@specs/001-sdd-initialization/database/schema.md` - User and RefreshToken entity definitions
- **Login Page**: `@specs/001-sdd-initialization/ui/pages.md` - Login and registration form UI

---

## Notes

The authentication system is the foundation for user_id-based data isolation across the entire application. Every authenticated request must:

1. Present a valid JWT token in the Authorization header (Bearer scheme)
2. Have the token validated (signature, expiration, user_id)
3. Extract the user_id for data scoping (tasks, resources, etc.)

This ensures that users cannot access data belonging to other users, providing the core security model for multi-tenant data isolation.
