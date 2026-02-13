# Tasks: Phase 2 - Full-Stack Todo Application

**Input**: Design documents from `/specs/001-sdd-initialization/`
**Source Documents**: plan.md, spec.md, features/, api/, database/, ui/
**Specification Reference**: @specs/001-sdd-initialization/
**Status**: Ready for implementation
**Organization**: Tasks organized by implementation phase and user story for independent completion

---

## Format Guide

- **[ID]**: Unique task identifier (T001, T002, ..., T250+)
- **[P]**: Parallelizable task (different files, no blocking dependencies)
- **[US-X]**: User story reference (US-Auth-1, US-Task-1, US-SDD-1, etc.)
- **File paths**: Exact locations where code must be created/modified
- **Traceability**: References to specification sections, functional requirements, success criteria

---

## Phase 1: Project Setup & Infrastructure

**Purpose**: Initialize project structure and basic dependencies
**Duration**: Foundational - must complete before Phase 2
**Checkpoint**: Project structure ready, environment variables configured

### Setup Tasks

- [ ] T001 Create project directory structure: `backend/`, `frontend/`, `specs/`, `history/` at repository root (per plan.md architecture)
- [ ] T002 [P] Initialize FastAPI backend project in `backend/` with `pyproject.toml` including: fastapi, uvicorn, sqlmodel, pydantic, python-jose (JWT verification, Constitution II)
- [ ] T003 [P] Initialize Next.js 15 project in `frontend/` with `package.json` including: next, react, tailwind-css, better-auth, react-hook-form, zod
- [ ] T004 Create `.env.example` template with required environment variables: DATABASE_URL, BETTER_AUTH_SECRET, NEXT_PUBLIC_API_BASE_URL, API_PORT, LOG_LEVEL, ENVIRONMENT
- [ ] T005 Create `.env.local` file from `.env.example` with development values for local testing
- [ ] T006 [P] Configure ruff (Python formatter/linter) in `backend/pyproject.toml` with strict type checking enabled
- [ ] T007 [P] Configure ESLint + Prettier (JavaScript formatter) in `frontend/.eslintrc.json` and `frontend/.prettierrc`
- [ ] T008 Create `backend/src/config.py` to load environment variables using Pydantic BaseSettings (DATABASE_URL, BETTER_AUTH_SECRET, API_PORT, LOG_LEVEL)
- [ ] T009 [P] Create `backend/Dockerfile` and `docker-compose.yml` for local development (FastAPI + PostgreSQL/Neon)
- [ ] T010 [P] Create `frontend/next.config.js` with environmental variable configuration for NEXT_PUBLIC_* variables
- [ ] T011 Create `backend/alembic/env.py` and `backend/alembic/script.py.mako` migration configuration
- [ ] T012 Initialize git repository structure with appropriate `.gitignore` for Python and Node.js projects
- [ ] T013 [P] Create contributing guidelines in `CONTRIBUTING.md` referencing this Constitution and spec-first development
- [ ] T014 Create `backend/src/db/engine.py` with SQLAlchemy engine initialization using DATABASE_URL from config
- [ ] T015 [P] Create `frontend/src/config/constants.ts` with API_BASE_URL and BETTER_AUTH_URL constants from environment

**Checkpoint**: ✅ Project structure initialized, dependencies installed, environment configured

---

## Phase 2: Foundation Layer - Core Backend Infrastructure

**Purpose**: Implement security-critical JWT middleware and database schema foundation
**Blocking**: This phase MUST complete before ANY user story implementation
**⚠️ CRITICAL**: Constitution II (JWT Bridge) and Constitution III (User Isolation) enforcement begins here
**Checkpoint**: JWT middleware verified, database schema created, base entities ready

### JWT Middleware Implementation (Constitution II - Security Critical)

- [ ] T016 Implement JWT verification middleware in `backend/src/middleware/jwt_verification.py`:
  - Extract JWT from `Authorization: Bearer <token>` header
  - Verify JWT signature using BETTER_AUTH_SECRET with HS256 algorithm
  - Extract `sub` (user_id) claim from verified token
  - Store user_id in `request.state.user_id` for downstream handlers
  - Return `401 Unauthorized` with detail message if token invalid, expired, or missing
  - Skip verification for public endpoints (register, login, forgot-password, reset-password)
  - Reference: Constitution II, plan.md Step 1, @specs/001-sdd-initialization/features/authentication.md §Functional Requirements FR-008

- [ ] T017 Create dependency injection function `get_current_user_id()` in `backend/src/api/dependencies.py`:
  - Extract user_id from `request.state.user_id` (set by JWT middleware)
  - Return user_id as string for use in route handlers with `Depends(get_current_user_id)`
  - Raise HTTPException(status_code=401) if user_id is None or missing
  - Reference: Constitution II, plan.md Key Design Pattern

- [ ] T018 Configure FastAPI app in `backend/src/main.py`:
  - Create FastAPI instance with title="Phase 2 Todo API", version="1.0.0"
  - Register JWT middleware as first middleware in stack (before route handling)
  - Configure CORS middleware with frontend origin (NEXT_PUBLIC_API_BASE_URL)
  - Initialize logger for error tracking (DEBUG/INFO/ERROR levels)
  - Setup exception handlers for HTTPException and general Exception (return 500 with logged stack trace)
  - Register routers for auth and tasks endpoints (to be created in Phase 3)
  - Reference: plan.md Step 1, Constitution VI

### Database Schema & Entities (Constitution III - User Isolation)

- [ ] T019 [P] Create User SQLModel entity in `backend/src/models/user.py`:
  - Fields: `id` (UUID primary key), `email` (UNIQUE, indexed), `password_hash` (bcrypt 60 chars), `is_verified` (bool), `created_at` (UTC datetime), `updated_at` (UTC datetime)
  - Relationships: `tasks` (cascade delete), `refresh_tokens` (cascade delete)
  - Table name: `users`
  - Validation: email min_length=5, max_length=255
  - Timestamps use utc_now() helper function
  - Reference: schema.md §User Entity, database/schema.md §SQL Migrations

- [ ] T020 [P] Create Task SQLModel entity in `backend/src/models/task.py`:
  - Fields: `id` (UUID primary key), `user_id` (FK to users.id, indexed), `title` (str 1-255), `description` (optional str 0-2000), `status` (Enum: Pending/In Progress/Completed/Archived, default=Pending), `created_at` (UTC), `updated_at` (UTC)
  - Relationships: `user` (back_populates="tasks")
  - Table name: `tasks`
  - Foreign key: FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  - Indexes: PRIMARY KEY (id), (user_id), (user_id, created_at DESC)
  - Constraints: title NOT NULL and NOT EMPTY, status CHECK constraint
  - Reference: schema.md §Task Entity, Constitution III §Data Isolation Pattern

- [ ] T021 [P] Create RefreshToken SQLModel entity in `backend/src/models/refresh_token.py`:
  - Fields: `id` (UUID primary key), `user_id` (FK, indexed), `token_hash` (str), `expires_at` (datetime), `revoked_at` (optional datetime), `created_at` (UTC)
  - Relationships: `user` (back_populates="refresh_tokens")
  - Table name: `refresh_tokens`
  - Constraints: FOREIGN KEY (user_id), CHECK (expires_at > created_at)
  - Indexes: (user_id), (expires_at)
  - Reference: schema.md §RefreshToken Entity

- [ ] T022 [P] Create Pydantic schemas for API contracts in `backend/src/schemas/`:
  - `user.py`: UserCreate (email, password), UserResponse (id, email, is_verified, created_at), UserLogin (email, password)
  - `task.py`: TaskCreate (title, description?, status?), TaskUpdate (title?, description?, status?), TaskResponse (id, user_id, title, description, status, created_at, updated_at), TaskListResponse (data: List[TaskResponse], pagination)
  - Reference: plan.md Step 3 §Key Design Pattern, rest-endpoints.md §Response Format Standards

- [ ] T023 Initialize Alembic migrations in `backend/alembic/`:
  - Create initial migration file `backend/alembic/versions/001_initial_schema.py`
  - Define migration operations to CREATE TABLE for users, tasks, refresh_tokens with all constraints and indexes from schema.md
  - Include down() migration for rollback
  - Reference: schema.md §SQL Migrations

- [ ] T024 Run database migrations to Neon PostgreSQL:
  - Execute `alembic upgrade head` to create schema
  - Verify tables exist in Neon using `psql` or database UI
  - Verify indexes created: idx_users_email, idx_tasks_user_id, idx_tasks_user_created, idx_refresh_tokens_user_id, idx_refresh_tokens_expires_at
  - Reference: plan.md Step 2 §Acceptance Criteria

### Database Connection & Session Management

- [ ] T025 Create database session factory in `backend/src/db/session.py`:
  - Initialize SessionLocal using SQLAlchemy sessionmaker with DATABASE_URL
  - Create async session factory for async/await support in FastAPI
  - Implement database context manager for dependency injection
  - Reference: plan.md Step 2 §Artifacts

- [ ] T026 Create error handling utilities in `backend/src/errors.py`:
  - Define custom exception classes: InvalidCredentialsError, UserNotFoundError, TaskNotFoundError, UnauthorizedError, ForbiddenError
  - Map exceptions to HTTPException with proper status codes (401, 403, 404, 400)
  - Reference: Constitution V §Error Handling & HTTP Semantics

### Base Configuration & Helpers

- [ ] T027 [P] Create utility functions in `backend/src/utils/`:
  - `datetime.py`: utc_now() function returning current UTC datetime with timezone awareness
  - `uuid.py`: uuid4_str() function generating UUID strings for id fields
  - `password.py`: hash_password(password) using bcrypt, verify_password(plain, hash) for authentication
  - Reference: schema.md §Timestamp Handling

- [ ] T028 [P] Create constants file `backend/src/constants.py`:
  - JWT algorithm: HS256
  - Access token expiration: 3600 seconds (1 hour)
  - Refresh token expiration: 2592000 seconds (30 days)
  - Password validation regex: 8+ chars, mixed case, at least one number
  - Task status values: Pending, In Progress, Completed, Archived
  - Reference: authentication.md §Assumptions, rest-endpoints.md §Bearer Token Pattern

**Checkpoint**: ✅ JWT middleware active, database schema created with all tables/indexes, base configurations ready. Phase 2 complete - user story implementation can now proceed in parallel.

---

## Phase 3: Authentication Features (Priority P1)

**Purpose**: Implement user registration, login, token refresh, logout, and password reset
**Dependencies**: Requires Phase 2 completion
**Parallelization**: Auth endpoints can be developed in parallel by different developers
**User Stories**: US-Auth-1 (Register), US-Auth-2 (Login), US-Auth-3 (Refresh), US-Auth-4 (Logout), US-Auth-5 (Password Reset)

### User Story: US-Auth-1 - User Registration (Priority P1)

**Goal**: Allow new users to create accounts with email and password
**Independent Test**: Can verify by registering a user and checking account exists in database

- [ ] T029 [US-Auth-1] Create authentication service in `backend/src/services/auth_service.py`:
  - Method `register_user(email: str, password: str, session) -> User`:
    - Validate email format using email-validator library
    - Hash password using bcrypt (salt rounds: 12)
    - Check email uniqueness via query: `SELECT * FROM users WHERE email = ?`
    - Create User with id (UUID), email, password_hash, is_verified=false, created_at=utc_now()
    - Save to database and return created user
    - Raise InvalidCredentialsError (400) if email invalid or duplicate
  - Reference: authentication.md §FR-001-003, rest-endpoints.md §POST /api/auth/register

- [ ] T030 [US-Auth-1] Implement POST /api/v1/auth/register endpoint in `backend/src/api/v1/auth.py`:
  - Route: `POST /api/v1/auth/register`
  - Request body: UserCreate(email, password)
  - Call `auth_service.register_user(email, password, session)`
  - Response (201 Created): UserResponse(id, email, is_verified=false, created_at)
  - Error responses:
    - 400 Bad Request if email invalid or password weak
    - 409 Conflict if email already registered
  - Trigger verification email (mock/stub for now - can use SendGrid later)
  - Reference: FR-001-004 from authentication.md, plan.md Step 3 §Acceptance Criteria

### User Story: US-Auth-2 - User Login (Priority P1)

**Goal**: Allow registered users to authenticate and receive JWT tokens
**Independent Test**: Can verify by logging in and checking Bearer token is returned

- [ ] T031 [US-Auth-2] Extend auth service with login method in `backend/src/services/auth_service.py`:
  - Method `login_user(email: str, password: str, session) -> Tuple[User, str, str]`:
    - Query user by email: `SELECT * FROM users WHERE email = ?`
    - Verify password using bcrypt verify_password()
    - Verify email is verified (is_verified=true)
    - Generate JWT access token with:
      - Payload: `{"sub": user_id, "email": email, "iat": now(), "exp": now() + 3600}`
      - Sign with BETTER_AUTH_SECRET, algorithm=HS256
    - Generate refresh token and store hash in refresh_tokens table
    - Return (User, access_token, refresh_token)
    - Raise InvalidCredentialsError (401) if email not found or password invalid
    - Raise UserNotFoundError (401) if user not verified
  - Reference: authentication.md §FR-005-006, rest-endpoints.md §POST /api/auth/login

- [ ] T032 [US-Auth-2] Implement POST /api/v1/auth/login endpoint in `backend/src/api/v1/auth.py`:
  - Route: `POST /api/v1/auth/login`
  - Request body: UserLogin(email, password)
  - Call `auth_service.login_user(email, password, session)`
  - Response (200 OK): `{"user": UserResponse, "token": access_token, "expires_in": 3600}`
  - Set HTTP-only cookies:
    - Authorization: access_token (expires: 1 hour)
    - RefreshToken: refresh_token (expires: 30 days)
  - Error: 401 Unauthorized if credentials invalid
  - Reference: FR-005-006, plan.md Step 3 §Acceptance Criteria

### User Story: US-Auth-3 - Token Refresh (Priority P1)

**Goal**: Allow frontend to refresh access tokens transparently
**Independent Test**: Can verify by calling refresh endpoint with valid refresh token

- [ ] T033 [US-Auth-3] Extend auth service with refresh method in `backend/src/services/auth_service.py`:
  - Method `refresh_access_token(refresh_token: str, session) -> str`:
    - Verify refresh_token signature with BETTER_AUTH_SECRET
    - Extract user_id from token
    - Query refresh_tokens table: `SELECT * FROM refresh_tokens WHERE token_hash = ? AND user_id = ? AND revoked_at IS NULL AND expires_at > now()`
    - Check token not expired and not revoked
    - Generate new access token with updated exp: now() + 3600
    - Optionally rotate refresh token (create new, revoke old)
    - Return new access_token
    - Raise UnauthorizedError (401) if token invalid, expired, or revoked
  - Reference: authentication.md §FR-010, rest-endpoints.md §POST /api/auth/refresh

- [ ] T034 [US-Auth-3] Implement POST /api/v1/auth/refresh endpoint in `backend/src/api/v1/auth.py`:
  - Route: `POST /api/v1/auth/refresh` (PUBLIC - no JWT middleware)
  - Request: Bearer <REFRESH_TOKEN> in Authorization header
  - Call `auth_service.refresh_access_token(refresh_token, session)`
  - Response (200 OK): `{"token": new_access_token, "expires_in": 3600}`
  - Error: 401 Unauthorized if refresh token invalid or expired
  - Reference: FR-010, plan.md Step 3 §Acceptance Criteria

### User Story: US-Auth-4 - User Logout (Priority P1)

**Goal**: Allow users to invalidate their session
**Independent Test**: Can verify by logging out and checking old token is rejected

- [ ] T035 [US-Auth-4] Extend auth service with logout method in `backend/src/services/auth_service.py`:
  - Method `logout_user(user_id: str, session) -> None`:
    - Update refresh_tokens table: `UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = ?`
    - Revoke all active tokens for user (security: logout from all devices)
  - Reference: authentication.md §FR-012

- [ ] T036 [US-Auth-4] Implement POST /api/v1/auth/logout endpoint in `backend/src/api/v1/auth.py`:
  - Route: `POST /api/v1/auth/logout` (PROTECTED - requires Bearer token)
  - Extract user_id using `Depends(get_current_user_id)` (Constitution II)
  - Call `auth_service.logout_user(user_id, session)`
  - Clear HTTP-only cookies:
    - Authorization: clear
    - RefreshToken: clear
  - Response (200 OK): `{"message": "Logged out successfully"}`
  - Error: 401 Unauthorized if no valid token
  - Reference: FR-012-013, plan.md Step 3 §Acceptance Criteria

### User Story: US-Auth-5 - Password Reset (Priority P2)

**Goal**: Allow users to reset forgotten passwords
**Independent Test**: Can verify by requesting reset, using token, and logging in with new password

- [ ] T037 [US-Auth-5] Extend auth service with password reset methods in `backend/src/services/auth_service.py`:
  - Method `request_password_reset(email: str, session) -> None`:
    - Query user by email: `SELECT * FROM users WHERE email = ?`
    - Generate reset token (short-lived, valid 24 hours)
    - Store reset_token_hash in a password_reset_tokens table
    - Send reset email with link containing reset_token (mock for now)
    - Always return success (200) even if email not found (security: don't reveal registered emails)
  - Method `reset_password(reset_token: str, new_password: str, session) -> None`:
    - Verify reset_token is valid and not expired
    - Hash new_password
    - Update user.password_hash = new_hash
    - Revoke reset_token (mark as used)
    - Revoke all refresh_tokens for user (force re-login)
  - Reference: authentication.md §FR-014-015, rest-endpoints.md §POST /api/auth/forgot-password and reset-password

- [ ] T038 [US-Auth-5] Implement POST /api/v1/auth/forgot-password endpoint in `backend/src/api/v1/auth.py`:
  - Route: `POST /api/v1/auth/forgot-password` (PUBLIC)
  - Request body: `{"email": "user@example.com"}`
  - Call `auth_service.request_password_reset(email, session)`
  - Response (200 OK): `{"message": "If email exists, reset link has been sent"}` (always same response for security)
  - Reference: FR-014, rest-endpoints.md §POST /api/auth/forgot-password

- [ ] T039 [US-Auth-5] Implement POST /api/v1/auth/reset-password endpoint in `backend/src/api/v1/auth.py`:
  - Route: `POST /api/v1/auth/reset-password` (PUBLIC)
  - Request body: `{"reset_token": "...", "new_password": "..."}`
  - Call `auth_service.reset_password(reset_token, new_password, session)`
  - Response (200 OK): `{"message": "Password reset successfully"}`
  - Error responses:
    - 400 Bad Request if token invalid, expired, or password weak
  - Reference: FR-015, rest-endpoints.md §POST /api/auth/reset-password

- [ ] T040 [P] Create password_reset_tokens table migration in `backend/alembic/versions/002_add_password_reset_tokens.py`:
  - Fields: id (PK), user_id (FK), token_hash, expires_at, used_at, created_at
  - Indexes: (user_id), (expires_at)

### Auth Endpoint Integration & Validation

- [ ] T041 [P] Create request validation schemas in `backend/src/schemas/auth.py`:
  - ForgotPasswordRequest, ResetPasswordRequest, RefreshTokenRequest
  - Include Pydantic validators for password strength, email format

- [ ] T042 Create auth router in `backend/src/api/v1/__init__.py`:
  - Import auth endpoints
  - Register auth router at prefix `/api/v1/auth`

**Checkpoint**: ✅ All authentication endpoints operational. Users can register, login, refresh tokens, logout, and reset passwords. Bearer token validation enforced on protected routes. JWT middleware active on all /api/v1/* endpoints (except public auth endpoints).

---

## Phase 4: Task CRUD Features (Priority P1)

**Purpose**: Implement task creation, reading, updating, deleting with strict user isolation
**Dependencies**: Requires Phase 2 (database), Phase 3 (authentication)
**Parallelization**: CRUD endpoints can be developed in parallel
**Constitution III Enforcement**: EVERY query filters by user_id extracted from JWT
**User Stories**: US-Task-1 (Create), US-Task-2 (List), US-Task-3 (Update), US-Task-4 (Delete)

### User Story: US-Task-1 - Create Task (Priority P1)

**Goal**: Allow users to create tasks with title and description
**Independent Test**: Create task, verify it has user_id set, appears in user's list, not visible to other users

- [x] T043 [US-Task-1] Create task service in `backend/src/services/task_service.py`:
  - Method `create_task(user_id: str, title: str, description: str | None, status: str, session) -> Task`:
    - **CRITICAL**: user_id parameter MUST come from JWT, never from request body (Constitution III)
    - Create Task with id (UUID), user_id (from parameter), title, description, status (default=Pending), created_at=utc_now()
    - Validate title: 1-255 chars, non-empty
    - Validate description: optional, 0-2000 chars
    - Validate status: one of [Pending, In Progress, Completed, Archived]
    - Save to database and return created Task
    - Raise BadRequestError if validation fails
  - Reference: task-crud.md §FR-001-002, Constitution III §Data Isolation Pattern

- [x] T044 [US-Task-1] Implement POST /api/v1/tasks endpoint in `backend/src/api/v1/tasks.py`:
  - Route: `POST /api/v1/tasks` (PROTECTED)
  - Extract user_id from JWT using `Depends(get_current_user_id)` (Constitution II)
  - Request body: TaskCreate(title, description?, status?)
  - Call `task_service.create_task(user_id, title, description, status, session)`
  - Response (201 Created): TaskResponse with all fields
  - Error responses:
    - 400 Bad Request if required fields missing or validation fails
    - 401 Unauthorized if no valid token
  - Reference: FR-001-002, rest-endpoints.md §POST /api/tasks, plan.md Step 3

### User Story: US-Task-2 - List & Read Tasks (Priority P1)

**Goal**: Allow users to view their tasks with pagination and filtering
**Independent Test**: Create tasks, fetch list, verify only user's tasks returned, other users get empty list

- [x] T045 [US-Task-2] Extend task service with list/get methods in `backend/src/services/task_service.py`:
  - Method `get_user_tasks(user_id: str, page: int = 1, limit: int = 20, status: str | None = None, session) -> Tuple[List[Task], int, int]`:
    - **CRITICAL**: Build query with WHERE user_id = <extracted_user_id> (Constitution III)
    - Query: `SELECT * FROM tasks WHERE user_id = ? [AND status = ?] ORDER BY created_at DESC`
    - Apply pagination: offset = (page - 1) * limit
    - Return (tasks, total_count, pages)
    - Reference: task-crud.md §FR-003-004, Constitution III
  - Method `get_task_by_id(user_id: str, task_id: str, session) -> Task | None`:
    - **CRITICAL**: Query must include both task_id AND user_id check (defense in depth)
    - Query: `SELECT * FROM tasks WHERE id = ? AND user_id = ?`
    - Return task or None
    - Reference: task-crud.md §FR-004, rest-endpoints.md §GET /api/tasks/{id}

- [x] T046 [US-Task-2] Implement GET /api/v1/tasks endpoint in `backend/src/api/v1/tasks.py`:
  - Route: `GET /api/v1/tasks` (PROTECTED)
  - Query params: page (int, default=1), limit (int, default=20, max=100), status (optional enum)
  - Extract user_id from JWT using `Depends(get_current_user_id)`
  - Call `task_service.get_user_tasks(user_id, page, limit, status, session)`
  - Response (200 OK): TaskListResponse with data and pagination metadata
  - Pagination response includes: page, limit, total, pages
  - Error: 401 Unauthorized if no valid token
  - Reference: FR-003-004, rest-endpoints.md §GET /api/tasks

- [x] T047 [US-Task-2] Implement GET /api/v1/tasks/{id} endpoint in `backend/src/api/v1/tasks.py`:
  - Route: `GET /api/v1/tasks/{id}` (PROTECTED)
  - Path param: task_id (UUID string)
  - Extract user_id from JWT
  - Call `task_service.get_task_by_id(user_id, task_id, session)`
  - Response (200 OK): TaskResponse if found
  - Error responses:
    - 401 Unauthorized if no valid token
    - 403 Forbidden if task belongs to different user (not 404 to avoid info leak)
    - 404 Not Found if task not found
  - Reference: FR-004, rest-endpoints.md §GET /api/tasks/{id}, Constitution III

### User Story: US-Task-3 - Update Task (Priority P1)

**Goal**: Allow users to update their task details
**Independent Test**: Update task, verify changes persist, other users cannot update

- [x] T048 [US-Task-3] Extend task service with update method in `backend/src/services/task_service.py`:
  - Method `update_task(user_id: str, task_id: str, data: TaskUpdate, session) -> Task | None`:
    - **CRITICAL**: Verify user owns task BEFORE updating (Constitution III)
    - Query: `SELECT * FROM tasks WHERE id = ? AND user_id = ?`
    - If not found or user_id mismatch, return None (caller raises 403)
    - Update fields: title, description, status (only fields in data)
    - Always set updated_at = utc_now()
    - Save and return updated Task
  - Reference: task-crud.md §FR-005-006, Constitution III

- [x] T049 [US-Task-3] Implement PATCH /api/v1/tasks/{id} endpoint in `backend/src/api/v1/tasks.py`:
  - Route: `PATCH /api/v1/tasks/{id}` (PROTECTED)
  - Extract user_id from JWT
  - Request body: TaskUpdate (partial update, all fields optional)
  - Call `task_service.update_task(user_id, task_id, data, session)`
  - Response (200 OK): Updated TaskResponse
  - Error responses:
    - 401 Unauthorized if no valid token
    - 403 Forbidden if task belongs to different user
    - 404 Not Found if task not found
    - 400 Bad Request if validation fails
  - Reference: FR-005-006, rest-endpoints.md §PATCH /api/tasks/{id}

### User Story: US-Task-4 - Delete Task (Priority P2)

**Goal**: Allow users to delete their tasks
**Independent Test**: Delete task, verify returns 404 on subsequent access

- [x] T050 [US-Task-4] Extend task service with delete method in `backend/src/services/task_service.py`:
  - Method `delete_task(user_id: str, task_id: str, session) -> bool`:
    - **CRITICAL**: Verify user owns task BEFORE deleting (Constitution III)
    - Query: `SELECT * FROM tasks WHERE id = ? AND user_id = ?`
    - If not found, return False
    - Delete task from database
    - Return True
  - Reference: task-crud.md §FR-007-008

- [x] T051 [US-Task-4] Implement DELETE /api/v1/tasks/{id} endpoint in `backend/src/api/v1/tasks.py`:
  - Route: `DELETE /api/v1/tasks/{id}` (PROTECTED)
  - Extract user_id from JWT
  - Call `task_service.delete_task(user_id, task_id, session)`
  - Response (204 No Content) if deleted successfully
  - Error responses:
    - 401 Unauthorized if no valid token
    - 403 Forbidden if task belongs to different user
    - 404 Not Found if task not found
  - Reference: FR-007-008, rest-endpoints.md §DELETE /api/tasks/{id}

### Task Endpoint Integration

- [x] T052 Create task router in `backend/src/api/v1/tasks.py`:
  - Import all task endpoints
  - Register task router at prefix `/api/v1/tasks`
  - Ensure all routes have JWT middleware enforcement

- [x] T053 [P] Create task validation schemas in `backend/src/schemas/task.py`:
  - TaskCreate, TaskUpdate, TaskResponse, TaskListResponse
  - Include pagination response model
  - Pydantic validators for title/description length, status enum

- [x] T054 [P] Create comprehensive error handling for task endpoints in `backend/src/api/v1/tasks.py`:
  - Handle all error cases from task_service with appropriate HTTPExceptions
  - Log all errors with user_id, task_id, operation for debugging
  - Return consistent error response format from rest-endpoints.md

**Checkpoint**: ✅ All task CRUD endpoints operational. Full user isolation enforced - users can only create/read/update/delete their own tasks. Pagination working. HTTP status codes correct (201, 200, 204, 400, 401, 403, 404). Database schema with proper user_id filtering indexes in place.

---

## Phase 5: Frontend Authentication & Session Management

**Purpose**: Implement Better Auth integration, login/register pages, session context
**Dependencies**: Requires Phase 3 (authentication endpoints)
**Parallelization**: Can develop pages and components in parallel

### Better Auth Client Setup

- [x] T055 Initialize Better Auth client in `frontend/src/lib/auth.ts`:
  - Create authClient using createAuthClient from better-auth package
  - Configure baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL
  - Configure redirectTo: "/dashboard" (post-login redirect)
  - Configure options for JWT storage (HTTP-only cookies handled by server)
  - Export authClient for use in components
  - Reference: authentication.md §Better Auth Integration, plan.md Step 4

- [x] T056 Create fetch API wrapper in `frontend/src/lib/api.ts`:
  - Function `apiCall(endpoint: string, options?: RequestInit): Promise<Response>`
  - Extract JWT token from Better Auth session/cookie
  - Inject `Authorization: Bearer <token>` header into request
  - Set `Content-Type: application/json` default header
  - Handle 401 responses by redirecting to login (token expired)
  - Construct full URL using NEXT_PUBLIC_API_BASE_URL
  - Return fetch response
  - Reference: Constitution II, plan.md Step 4 §lib/api.ts Pseudo-code

- [x] T057 Create AuthContext provider in `frontend/src/contexts/AuthContext.tsx`:
  - State: user (User | null), isLoading (bool), isError (bool), error (string | null)
  - useEffect to check session on mount: authClient.getSession()
  - Provide user, isLoading, isError to children
  - Export useAuth() hook for easy consumption
  - Handle session refresh automatically
  - Reference: plan.md Step 4 §contexts/AuthContext.tsx Pseudo-code

- [x] T058 Create authentication types in `frontend/src/types/auth.ts`:
  - User interface: { id, email, is_verified, created_at }
  - AuthContext type: { user, isLoading, isError, error }
  - Reference: Constitution II, plan.md Step 4

### Login & Registration Pages

- [x] T059 Implement login page in `frontend/src/app/login/page.tsx`:
  - Layout: Logo, "Sign In" title, email input, password input, remember me checkbox, sign in button, links to register and forgot-password
  - Use react-hook-form + zod for validation
  - Form fields: email (required, valid email), password (required)
  - On submit: Call authClient.signIn.email(email, password)
  - Success: Redirect to /dashboard
  - Error: Display "Invalid email or password" message
  - Already logged in: Redirect to /dashboard
  - Responsive design: Mobile (full width), Tablet/Desktop (centered, max-width 450px)
  - Reference: ui/pages.md §Login Page

- [x] T060 Implement registration page in `frontend/src/app/register/page.tsx`:
  - Layout: Logo, "Create Account" title, email input, password input, confirm password, terms checkbox, sign up button
  - Form fields:
    - email: required, unique (validate on blur), valid format
    - password: required, 8+ chars, mixed case, numbers, strength indicator
    - confirmPassword: must match password
    - terms: required checkbox
  - On submit: Call authClient.signUp.email(email, password)
  - Success: Show "Check your email to verify your account", link to resend verification
  - Error: Display "Email already registered" if duplicate
  - Redirect: Auto-redirect to login after 5 seconds on success
  - Reference: ui/pages.md §Registration Page

- [ ] T061 Implement forgot password page in `frontend/src/app/forgot-password/page.tsx`:
  - Layout: Logo, "Forgot Your Password?" title, email input, send reset link button
  - Form field: email (required, valid format)
  - On submit: Call POST /api/v1/auth/forgot-password
  - Response (always 200): Show "If email exists, reset link has been sent"
  - Link back to login: "Remember your password? Sign In"
  - Reference: ui/pages.md §Password Reset Request Page

- [ ] T062 Implement reset password page in `frontend/src/app/reset-password/[token]/page.tsx`:
  - Route param: token (from email link)
  - Layout: Logo, "Reset Your Password" title, new password input, confirm password, reset button
  - On page load: Validate token is present
  - Form fields:
    - newPassword: 8+ chars, mixed case, numbers, strength indicator
    - confirmPassword: must match
  - On submit: Call POST /api/v1/auth/reset-password with token and new_password
  - Success: Redirect to /login with message "Password updated successfully"
  - Error: Show "Reset link has expired. Request a new one." if token invalid
  - Reference: ui/pages.md §Password Reset Form

### Session & Redirect Middleware

- [x] T063 Create auth redirect middleware in `frontend/src/middleware.ts`:
  - Check session on every request to protected routes
  - If user not authenticated AND route is protected (/dashboard, /dashboard/*):
    - Redirect to /login
  - If user authenticated AND route is public (/login, /register, /forgot-password):
    - Redirect to /dashboard (optional, based on preference)
  - Protected routes: /dashboard, /dashboard/tasks/*
  - Public routes: /login, /register, /forgot-password, /reset-password/*, /
  - Reference: plan.md Step 4 §middleware.ts Pseudo-code

### Session Persistence

- [ ] T064 Create session hook in `frontend/src/hooks/useSession.ts`:
  - useSession(): { user, isLoading, isError }
  - Internally use AuthContext
  - Throw error if used outside AuthProvider
  - Reference: plan.md Step 4

- [x] T065 Create root layout with AuthProvider in `frontend/src/app/layout.tsx`:
  - Wrap application with AuthProvider
  - Include global Tailwind CSS imports
  - Set up metadata (title, description)
  - Reference: plan.md Step 5 §frontend/src/app/layout.tsx

**Checkpoint**: ✅ Authentication flows complete. Users can register, login, reset passwords. Better Auth managing session. Fetch wrapper injecting Bearer tokens. Protected routes enforcing authentication. Auth context providing user state to components.

---

## Phase 6: Frontend UI Components & Dashboard

**Purpose**: Build task management UI with responsive design
**Dependencies**: Requires Phase 5 (authentication)
**Parallelization**: Components can be developed in parallel

### Shared Components

- [x] T066 [P] Create Header/Navigation component in `frontend/src/components/common/Header.tsx`:
  - Display app logo/name (clickable link to /dashboard)
  - Display current page title
  - User menu dropdown:
    - Profile link
    - Settings link
    - Logout button (call authClient.logout())
  - Responsive: Mobile (hamburger menu), Desktop (inline menu)
  - Reference: ui/pages.md §Shared Components

- [ ] T067 [P] Create TaskCard component in `frontend/src/components/TaskCard.tsx`:
  - Props: Task object, onEdit callback, onDelete callback
  - Display:
    - Checkbox (visual feedback, not backend update)
    - Title (clickable to edit)
    - First line of description (if exists)
    - Status badge with color coding (Pending: blue, In Progress: orange, Completed: green, Archived: gray)
    - Created timestamp in relative format ("2 hours ago")
    - Edit button/link
  - Reference: ui/pages.md §Task Card Component

- [ ] T068 [P] Create TaskForm component in `frontend/src/components/TaskForm.tsx`:
  - Props: task (optional, for edit), onSubmit callback, isLoading
  - Form fields:
    - Title input: 255 char max, character counter, required
    - Description textarea: 2000 char max, character counter, optional
    - Status dropdown: [Pending, In Progress, Completed, Archived], default=Pending
  - Buttons: Submit button (disabled until title filled), Cancel button
  - Submit action: Call onSubmit(formData)
  - Reference: ui/pages.md §Create Task Page & Edit Task Page

- [ ] T069 [P] Create Error/Success alert components in `frontend/src/components/common/`:
  - ErrorAlert: Red background, error icon, close button, display message
  - SuccessToast: Green background, auto-dismiss after 3s, manual dismiss option
  - Reference: ui/pages.md §Shared Components

### Dashboard & Task Pages

- [x] T070 Implement dashboard page in `frontend/src/app/dashboard/page.tsx`:
  - Protected route (redirect to login if not authenticated)
  - Layout:
    - Header with "Dashboard" title and + New Task button
    - Filters: Status dropdown (All, Pending, In Progress, Completed, Archived)
    - Sorting: Dropdown (Newest, Oldest, Title A-Z)
    - Task list with pagination
    - Empty state: "No tasks yet. Create one to get started!"
  - Fetch user's tasks: `GET /api/v1/tasks?page={page}&limit=20&status={filter}`
  - Components: Header, TaskCard (repeated), Pagination
  - Responsive design: Mobile (single column), Tablet (2-column), Desktop (task list + sidebar)
  - On task click: Navigate to edit page
  - Reference: ui/pages.md §Dashboard Page

- [x] T071 Implement create task page in `frontend/src/app/dashboard/tasks/new/page.tsx`:
  - Protected route
  - Layout: Back button, "New Task" title, TaskForm component
  - Form submission:
    - Validate: title not empty
    - Call `apiCall('/api/v1/tasks', { method: 'POST', body: JSON.stringify(formData) })`
    - Success: Show "Task created successfully", redirect to /dashboard
    - Error: Display error message
  - Cancel button: Return to /dashboard without saving
  - Reference: ui/pages.md §Create Task Page

- [x] T072 Implement edit task page in `frontend/src/app/dashboard/tasks/[id]/page.tsx`:
  - Protected route
  - Route param: id (task ID)
  - On page load: Fetch task: `GET /api/v1/tasks/{id}`
  - Layout: Back button, "Edit Task" title, TaskForm (pre-filled), created/updated timestamps, Delete button
  - Form submission:
    - Call `apiCall('/api/v1/tasks/{id}', { method: 'PATCH', body: JSON.stringify(changes) })`
    - Success: Show "Task updated", update timestamps
    - Error: Display error message
  - Delete button:
    - Show confirmation modal: "Are you sure? This cannot be undone."
    - On confirm: Call `apiCall('/api/v1/tasks/{id}', { method: 'DELETE' })`
    - Success: Redirect to /dashboard
    - Error: Display error message
  - Unsaved changes warning: Show browser confirmation if navigating away with changes
  - Reference: ui/pages.md §Edit Task Page

### Pagination & Filtering

- [ ] T073 Create Pagination component in `frontend/src/components/common/Pagination.tsx`:
  - Props: currentPage, totalPages, onPageChange callback
  - Display: Previous button, page numbers, Next button
  - Show: "Page X of Y", "Showing X-Y of Z results"
  - Reference: ui/pages.md §Dashboard Page

- [ ] T074 Create Filter component in `frontend/src/components/TaskFilter.tsx`:
  - Props: currentFilter, currentSort, onFilterChange, onSortChange callbacks
  - Filter dropdown: Status values [All, Pending, In Progress, Completed, Archived]
  - Sort dropdown: [Newest, Oldest, Title A-Z]
  - Save filters to URL query params for persistence
  - Reference: ui/pages.md §Dashboard Page

### Responsive Design Implementation

- [x] T075 [P] Configure Tailwind CSS for responsive design in `frontend/tailwind.config.ts`:
  - Breakpoints: mobile (0px), tablet (640px), desktop (1024px)
  - Color palette from ui/pages.md §Design System
  - Custom components for consistent styling
  - Reference: ui/pages.md §Design System & Responsive Breakpoints
  - ✅ Violet/Indigo theme (#7c3aed) implemented
  - ✅ Custom border radius xl (12px) for cards/buttons
  - ✅ Font families (Inter, Geist) configured
  - ✅ Backdrop blur utilities added
  - ✅ Button component classes (.btn-primary, .btn-secondary, .btn-destructive)
  - ✅ Card component classes (.card, .card-interactive, .card-header, .card-content, .card-footer)
  - ✅ Form utilities (.input-base, .label, .input-error)
  - ✅ Layout utilities (.page-container, .content-wrapper)
  - ✅ Alert component classes (.alert-success, .alert-error, .alert-warning, .alert-info)
  - ✅ Soft green/red alert colors implemented

- [ ] T076 [P] Create responsive utility components:
  - MobileOnly, TabletUp, DesktopUp components for conditional rendering
  - FlexGrid component for responsive task card grid
  - Reference: ui/pages.md

### UI Polish & Accessibility

- [ ] T077 [P] Implement accessibility features:
  - All form inputs have associated labels
  - Focus indicators visible on all interactive elements
  - ARIA labels for icon buttons
  - Alt text for images
  - Keyboard navigation support (tab through form fields, enter to submit)
  - Reference: ui/pages.md §Accessibility

- [ ] T078 [P] Add loading states:
  - Show spinner during form submissions
  - Show skeleton loaders while fetching task list
  - Disable submit buttons during request
  - Reference: ui/pages.md

- [ ] T079 [P] Create TypeScript interfaces for frontend in `frontend/src/types/`:
  - Task interface matching API response
  - User interface
  - Pagination interface
  - Error response interface

**Checkpoint**: ✅ Frontend complete. All pages implemented and responsive. Task management fully functional. User can register, login, create/edit/delete tasks. Session persists across page reloads. Protected routes enforced.

---

## Phase 7: Cross-Cutting Concerns & Polish

**Purpose**: Documentation, testing validation, security hardening, performance optimization
**Dependencies**: All prior phases complete

### Documentation & Knowledge Transfer

- [ ] T080 Create API documentation in `backend/docs/API.md`:
  - List all endpoints with descriptions
  - Show request/response examples
  - Document authentication requirements
  - Include HTTP status code meanings
  - Reference: Constitution VI §Verification Checklist

- [ ] T081 Create database schema documentation in `backend/docs/SCHEMA.md`:
  - Entity relationship diagram
  - Table descriptions
  - Index strategy explanation
  - Data isolation patterns
  - Reference: schema.md

- [ ] T082 Create developer setup guide in `SETUP.md`:
  - System requirements
  - Environment variable configuration
  - Database migration steps
  - How to run backend and frontend locally
  - Reference: Constitution VI §Development Workflow & Discipline

- [ ] T083 Create security guidelines in `SECURITY.md`:
  - JWT token handling
  - User isolation principles
  - Password storage best practices
  - Never hardcode secrets
  - HTTPS requirement
  - Reference: Constitution II §The JWT Bridge, Constitution III §User Isolation & Multi-Tenancy

### Code Quality & Testing Validation

- [ ] T084 [P] Run linters and fix any issues:
  - Backend: `ruff check backend/` and `ruff format backend/`
  - Frontend: `npm run lint` and `npm run format`
  - Reference: Constitution VI §Verification Checklist

- [ ] T085 [P] Validate project structure:
  - Verify all required files exist per plan.md appendix
  - Check all imports resolve correctly
  - Verify no unused imports or dead code
  - Reference: Constitution VI

- [ ] T086 Run full application integration test:
  - Start backend: `cd backend && uvicorn src.main:app --reload`
  - Start frontend: `cd frontend && npm run dev`
  - Test user registration flow end-to-end
  - Test task creation and listing
  - Verify JWT tokens working correctly
  - Verify user isolation (create tasks as user1, login as user2, verify user2 doesn't see user1's tasks)
  - Reference: spec.md §Success Criteria, plan.md §Risk Mitigation

### Code Commits & Documentation

- [ ] T087 Verify all code has proper attribution:
  - Every function/module includes comment referencing Task ID and Spec section
  - Example: `# Task T043: Implements task creation endpoint (@specs/001-sdd-initialization/features/task-crud.md §FR-001)`
  - Reference: Constitution VI §Code Submission Requirements

- [ ] T088 Create final git commit with comprehensive commit message:
  - Message format: `feat(T001-T087): Implement Phase 2 full-stack todo application`
  - Include co-author line: `Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>`
  - Reference all major phases and completed user stories

### Performance Baseline

- [ ] T089 [P] Validate performance targets from spec.md:
  - User registration < 2 seconds
  - Login < 500ms
  - JWT validation < 50ms per request
  - Task list fetch (100 tasks) < 1 second
  - Use load testing if available
  - Reference: authentication.md §SC-001-005, task-crud.md §SC-001-002

- [ ] T090 [P] Verify database indexes are used efficiently:
  - Check that task list queries use idx_tasks_user_created index
  - Verify user lookups use idx_users_email index
  - Review query execution plans if database tool available
  - Reference: schema.md §Indexes and Performance

### Security Hardening Review

- [ ] T091 [P] Security checklist:
  - No hardcoded secrets in code
  - No console.log/print statements in production code
  - No user tokens in response bodies (HTTP-only cookies only)
  - All authenticated endpoints check JWT
  - All user-scoped queries filter by user_id
  - 401 responses for missing tokens, 403 for permission denial
  - Reference: Constitution II & III, Constitution VI

- [ ] T092 [P] Verify HTTPS enforcement:
  - Confirm production configuration enforces HTTPS
  - Check secure cookie flags in authentication responses
  - Verify no sensitive data in URLs
  - Reference: authentication.md §FR-016

### Specification Verification

- [ ] T093 Verify all FR (Functional Requirements) implemented:
  - spec.md: 12 FRs from authentication and task CRUD
  - Check each endpoint/feature implements corresponding FR
  - Reference spec sections in code comments
  - Reference: Constitution VI §No Manual Coding Rule

- [ ] T094 Verify all SC (Success Criteria) met:
  - spec.md: 10 SCs (SC-001 through SC-010)
  - Performance targets met
  - Spec quality checklists pass
  - User isolation confirmed
  - Reference: spec.md §Success Criteria

- [ ] T095 Create Prompt History Record (PHR) for this implementation:
  - File: `history/prompts/001-sdd-initialization/PHR-003-implementation.md`
  - Include: Complete prompt text from task generation, summary of implementation, artifacts created, decisions made
  - Reference: Constitution VI §Development Workflow & Discipline

**Checkpoint**: ✅ All phases complete. Code documented, tested, secure. All requirements verified. Project ready for deployment.

---

## Phase 8: Deployment & Handoff (Optional - Post-MVP)

**Purpose**: Prepare for production deployment
**Dependencies**: Phase 7 complete

- [ ] T096 Create production configuration:
  - Neon DB connection pooling setup
  - Environment variables for production
  - Database backup strategy
  - Monitoring and logging configuration

- [ ] T097 Setup CI/CD pipeline:
  - GitHub Actions for automated testing on PRs
  - Automated code quality checks
  - Deployment workflow

- [ ] T098 Create operations runbook:
  - How to monitor application
  - How to handle database migrations
  - How to rollback deployments
  - Emergency procedures

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup
    ↓ (depends on: project structure, dependencies)
Phase 2: Foundational
    ↓ (depends on: JWT middleware, DB schema)
    ├→ Phase 3: Authentication (parallel possible with Phase 4)
    ├→ Phase 4: Task CRUD (parallel possible with Phase 3)
    ↓ (both depend on Phase 2)
    ├→ Phase 5: Frontend Auth (depends on Phase 3)
    └→ Phase 6: Frontend UI (depends on Phase 4 + Phase 5)
    ↓ (UI depends on all APIs)
Phase 7: Polish & Cross-Cutting (depends on all prior)
Phase 8: Deployment (optional, post-MVP)
```

### Critical Path

**Fastest implementation (critical path)**:
1. Phase 1 (T001-T015) - ~2-3 hours
2. Phase 2 (T016-T028) - ~4-5 hours
3. Phase 3 (T029-T042) - ~3-4 hours
4. Phase 4 (T043-T054) - ~3-4 hours
5. Phase 5 (T055-T065) - ~3-4 hours
6. Phase 6 (T066-T079) - ~4-5 hours
7. Phase 7 (T080-T095) - ~2-3 hours

**Total: ~22-28 development hours for complete implementation**

### Parallelization Examples

**After Phase 1 (Setup) completes:**
- All Phase 2 foundational tasks can start in parallel

**After Phase 2 (Foundational) completes:**
- Team Member A: Phase 3 (Authentication)
- Team Member B: Phase 4 (Task CRUD)
- Both working independently

**After Phase 3 completes:**
- Phase 5 (Frontend Auth) can start

**After Phase 4 completes:**
- Phase 6 (Frontend UI) can start

**After Phases 3, 4, 5, 6 all complete:**
- Phase 7 (Polish) can start

### User Story Dependency Order

1. **US-Auth-1 (Register)** → US-Auth-2 (Login) → US-Auth-3 (Refresh) → US-Auth-4 (Logout) → US-Auth-5 (Password Reset)
   - Sequential: Each builds on prior

2. **US-Task-1 (Create)** → US-Task-2 (List/Read) → US-Task-3 (Update) → US-Task-4 (Delete)
   - Can parallelize create and read (different endpoints)
   - Update and delete depend on read/get implementation

3. After Auth + Task CRUD complete:
   - Frontend can build in parallel by different developers

### MVP Scope (Minimum Viable Product)

**Core MVP = Phases 1-5 + Task CRUD (Phase 4)**

1. Phase 1: Setup
2. Phase 2: Foundation (JWT + DB)
3. Phase 3: Auth (all 5 stories)
4. Phase 4: Task CRUD (Create, Read, Update, Delete)
5. Phase 5: Frontend Auth pages
6. Phase 6: Frontend Dashboard (task list, create, edit)

**MVP can be deployed after ~18-20 hours of development**

Additional value:
- Phase 7: Polish (documentation, security, testing validation)
- Phase 8: Deployment (CI/CD, production config)

---

## Implementation Strategy by Team Size

### Single Developer (Sequential)

1. Complete Phases 1-7 in order
2. Estimated timeline: 22-28 hours over 1 week part-time
3. Commit after each task or logical group (T001-T005, T006-T010, etc.)

### 2 Developers (Parallel)

1. Developer A + B: Phases 1-2 together
2. Developer A: Phase 3 (Auth)
3. Developer B: Phase 4 (Task CRUD)
4. Developer A: Phase 5 (Frontend Auth)
5. Developer B: Phase 6 (Frontend UI)
6. Developer A + B: Phase 7 (Polish)
7. Timeline: ~14-16 hours (parallel work)

### 3 Developers (High Parallelization)

1. All: Phases 1-2 together
2. Dev A: Phase 3 (Auth)
3. Dev B: Phase 4 (Task CRUD)
4. Dev C: Phase 5 + 6 (Frontend)
5. Dev A + C: Phase 5 (Auth pages) when A finishes Phase 3
6. Dev B + C: Phase 6 (Task pages) when B finishes Phase 4
7. All: Phase 7 (Polish)
8. Timeline: ~10-12 hours

---

## Notes

### Task Execution Best Practices

- **Per-task commits**: Create a new git commit after each completed task or small group of related tasks
- **Code review**: Before merging, verify code references Task ID and specification sections
- **Testing**: Run application after each phase completes to verify functionality
- **Documentation**: Keep README.md updated with setup instructions as you progress
- **Questions**: If any task is ambiguous, reference the specification documents for clarity

### Common Pitfalls to Avoid

1. **❌ Skipping Phase 2 (Foundation)**: JWT middleware and database schema are blocking prerequisites
2. **❌ Not filtering by user_id**: Every database query must include `WHERE user_id = <extracted_id>` (Constitution III)
3. **❌ Storing JWT in localStorage**: Always use HTTP-only cookies (Constitution II)
4. **❌ Hardcoding secrets**: Always load from environment variables
5. **❌ Mixing auth concerns**: Keep JWT verification in middleware, not in service methods
6. **❌ Missing error handling**: Every endpoint must return proper HTTP status codes (401, 403, 404, etc.)

### Task Modification

If specifications change or new requirements emerge:

1. **Update spec.md first**: Document new requirements with FR/SC IDs
2. **Update plan.md**: Adjust architecture if needed
3. **Create new tasks**: Add tasks with new IDs (maintaining sequential order)
4. **Document rationale**: Explain why changes were made in commit messages

---

## Success Metrics

**Phase 1 Complete**: ✅ Project initialized, dependencies installed, environment configured
**Phase 2 Complete**: ✅ JWT middleware active, database created, base entities ready
**Phase 3 Complete**: ✅ All auth endpoints tested, user registration/login/refresh/logout working
**Phase 4 Complete**: ✅ All task CRUD endpoints tested, user isolation verified
**Phase 5 Complete**: ✅ Frontend auth pages working, session persists, redirect middleware active
**Phase 6 Complete**: ✅ Dashboard displays tasks, CRUD operations work end-to-end
**Phase 7 Complete**: ✅ Code documented, tests pass, security verified, ready for deployment

---

## Approval Checklist

Before final submission, verify:

- [ ] All 95+ tasks completed or explicitly deferred
- [ ] All code includes Task ID reference in comments
- [ ] Constitution principles enforced in code (JWT verification, user isolation, error handling)
- [ ] All endpoints tested manually or with integration tests
- [ ] User isolation verified: User A cannot access/modify User B's tasks
- [ ] JWT middleware active on all /api/v1/* protected endpoints
- [ ] Database queries filter by user_id on all user-scoped data
- [ ] No hardcoded secrets or console.log statements in production code
- [ ] Specification cross-references accurate in all task descriptions
- [ ] Commit messages reference Task IDs and specification sections
- [ ] All code properly formatted (ruff for Python, ESLint+Prettier for JavaScript)
- [ ] README.md updated with setup and running instructions
- [ ] Prompt History Record created documenting this implementation

---

**Tasks File Status**: ✅ Complete and Ready for Implementation
**Total Tasks**: 95 core + 3 optional (deployment)
**Estimated Effort**: 22-28 hours (1 developer) to 10-12 hours (3 parallel developers)
**MVP Deliverable**: Phases 1-6 complete (~18-20 hours)
**Full Deliverable**: Phases 1-7 complete (~22-28 hours)

**Next Command**: Implement tasks using: `Backend → /sp.implement` or `Frontend → /sp.implement` or manually execute tasks in order

---

*Generated by /sp.tasks for Phase 2 SDD Initialization*
*Specification Reference: @specs/001-sdd-initialization/ (all sub-documents)*
*Constitution: @.specify/memory/constitution.md*
*Plan: @specs/001-sdd-initialization/plan.md*
