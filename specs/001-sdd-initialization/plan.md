# Implementation Plan: Phase 2 - Full-Stack Web Application

**Feature Branch**: `001-sdd-initialization`
**Plan Created**: 2026-01-22
**Status**: Architecture & Implementation Roadmap
**Specification Reference**: `@specs/001-sdd-initialization/spec.md`

---

## Executive Summary

This document outlines the complete architectural design and implementation roadmap for Phase 2 of the SDD project. The plan enforces the three critical principles from the Constitution:

1. **The JWT Bridge** (Security Critical): Better Auth frontend → JWT middleware on FastAPI
2. **User Isolation**: Every query filtered by `user_id` from JWT claims
3. **Spec-Driven Implementation**: No code without Task ID; every task traces to specifications

The plan is organized into 5 sequential implementation steps, each producing actionable tasks for Phase 3. Every step includes traceability to Success Criteria from the specifications.

---

## Technical Context & Assumptions

### Technology Stack Alignment

**Backend**:
- ✅ FastAPI (Python 3.11+) with async/await support
- ✅ SQLModel (SQLAlchemy + Pydantic) for ORM and validation
- ✅ Neon DB (PostgreSQL) for persistent data storage
- ✅ Better Auth integration via JWT verification middleware
- ✅ Pydantic models for request/response contracts

**Frontend**:
- ✅ Next.js 16+ (App Router) with TypeScript
- ✅ Better Auth client library for authentication
- ✅ React Hook Form + Zod for form validation
- ✅ Fetch API with Bearer token injection
- ✅ Tailwind CSS for responsive design (from UI spec)

**Shared**:
- ✅ JWT as the single source of truth (from Constitution II)
- ✅ `user_id` extracted from JWT claims for all data isolation
- ✅ HTTP-only cookies for token storage (security best practice)
- ✅ Standard REST API with proper HTTP status codes

### Architecture Principles (From Constitution)

| Principle | Implementation |
|-----------|-----------------|
| **SDD Lifecycle** | Specify (✅ Done) → Plan (This Doc) → Tasks (Next) → Implement (After) |
| **The JWT Bridge** | Better Auth frontend + FastAPI JWT middleware = authoritative identity chain |
| **User Isolation** | All `/api/**` routes enforce `WHERE user_id = <extracted_id>` |
| **Stateless Backend** | No session state; all identity from JWT; horizontally scalable |
| **Error Handling** | FastAPI HTTPException with proper status codes (401, 403, 404, etc.) |
| **No Manual Coding** | Every code file references Task ID and spec section |

---

## Architecture Overview

### System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 16)                       │
│  ┌────────────┬──────────────┬──────────────┬──────────────┐    │
│  │Login/Register│Dashboard │CreateTask │EditTask      │    │
│  └────────────┴──────────────┴──────────────┴──────────────┘    │
│                                │                                 │
│  Better Auth Client ← Stores JWT in HTTP-only Cookie            │
│  Fetch API with Bearer Header: Authorization: Bearer <JWT>      │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTPS
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│              Backend API (FastAPI)                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Middleware: JWT Verification (Constitution II)          │    │
│  │ - Extract JWT from Authorization header                │    │
│  │ - Verify with BETTER_AUTH_SECRET                       │    │
│  │ - Extract user_id claim → request.state.user_id        │    │
│  │ - Return 401 if invalid/expired                        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                          ↓                                       │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Route Handlers (Step 3 Implementation)                  │    │
│  │ - POST   /api/v1/auth/register                          │    │
│  │ - POST   /api/v1/auth/login                             │    │
│  │ - POST   /api/v1/auth/logout                            │    │
│  │ - POST   /api/v1/auth/refresh                           │    │
│  │ - POST   /api/v1/tasks          (protected)             │    │
│  │ - GET    /api/v1/tasks          (protected)             │    │
│  │ - GET    /api/v1/tasks/{id}     (protected)             │    │
│  │ - PATCH  /api/v1/tasks/{id}     (protected)             │    │
│  │ - DELETE /api/v1/tasks/{id}     (protected)             │    │
│  └─────────────────────────────────────────────────────────┘    │
│                          ↓                                       │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Service Layer (Business Logic)                          │    │
│  │ - All methods receive user_id as parameter              │    │
│  │ - All database queries filter by user_id               │    │
│  │ - user_id is NEVER trusted from request body           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                          ↓                                       │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ SQLModel ORM (Step 2 Implementation)                    │    │
│  │ - User entity with password_hash                        │    │
│  │ - Task entity with user_id FK                          │    │
│  │ - RefreshToken entity with user_id FK                  │    │
│  └─────────────────────────────────────────────────────────┘    │
└────────────────────────────┬─────────────────────────────────────┘
                             │ Query
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│              Neon DB (PostgreSQL)                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐      │
│  │ users        │  │ tasks        │  │ refresh_tokens   │      │
│  │──────────────│  │──────────────│  │──────────────────│      │
│  │id (PK)       │  │id (PK)       │  │id (PK)           │      │
│  │email (UNIQ)  │  │user_id (FK)←─┼──├→user_id (FK)      │      │
│  │password_hash │  │title         │  │token_hash        │      │
│  │is_verified   │  │description   │  │expires_at        │      │
│  │created_at    │  │status        │  │revoked_at        │      │
│  │updated_at    │  │created_at    │  │created_at        │      │
│  │              │  │updated_at    │  │                  │      │
│  └──────────────┘  └──────────────┘  └──────────────────┘      │
│                                                                 │
│  Indexes:                                                       │
│  - users(email)                                                 │
│  - tasks(user_id)                                               │
│  - tasks(user_id, created_at DESC)                              │
│  - refresh_tokens(user_id)                                      │
│  - refresh_tokens(expires_at)                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow: JWT → user_id → Query Filtering

```
Request arrives at FastAPI
         ↓
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
         ↓
JWT Middleware (Constitution II):
  1. Extract token from header
  2. Verify with BETTER_AUTH_SECRET
  3. Extract claims (user_id, email, iat, exp)
  4. Store user_id in request.state.user_id
  5. Pass request to route handler
         ↓
Route Handler (e.g., GET /api/v1/tasks):
  1. Receive request.state.user_id (authoritative identity)
  2. Call service.get_user_tasks(user_id=request.state.user_id)
         ↓
Service Layer (Business Logic):
  1. Query tasks filtered by user_id:
     SELECT * FROM tasks WHERE user_id = ? AND user_id = request.state.user_id
  2. Return only tasks belonging to authenticated user
         ↓
Response:
  {
    "data": [
      {"id": "task_123", "user_id": "user_456", "title": "...", ...}
    ],
    "pagination": {...}
  }
```

---

## Constitution Check ✅

**All principles verified for alignment:**

| Principle | Status | Implementation Plan |
|-----------|--------|----------------------|
| **I. SDD Lifecycle** | ✅ | This plan breaks into atomic tasks; each task links to spec |
| **II. JWT Bridge** | ✅ | Step 1 designs JWT middleware; FastAPI verifies with BETTER_AUTH_SECRET |
| **III. User Isolation** | ✅ | Every service method receives user_id; all queries filter by user_id |
| **IV. Stateless Backend** | ✅ | No session objects; identity from JWT claims only |
| **V. Error Handling** | ✅ | All endpoints use HTTPException with proper status codes |
| **VI. No Manual Coding** | ✅ | Every code file will reference Task ID and spec section |

---

## Implementation Roadmap (5 Steps)

### Step 1: Core Backend Setup & JWT Middleware (Principle II - Security Critical)

**Objective**: Establish FastAPI foundation with JWT verification as gatekeeper for all `/api/**` routes.

**Scope**:
- FastAPI application initialization with Uvicorn
- CORS and middleware configuration
- JWT verification middleware (core security layer)
- Request context setup for user_id extraction
- Dependency injection for authenticated routes

**Artifacts**:
- `backend/src/main.py` - FastAPI app with middleware stack
- `backend/src/middleware/jwt_verification.py` - JWT verification middleware (Constitution II)
- `backend/src/config.py` - Configuration from environment variables
- `.env` template with `BETTER_AUTH_SECRET`, `DATABASE_URL`, etc.

**Traceability**:
- Constitution Principle II: "All `/api/**` routes MUST have JWT middleware"
- Specification: `@specs/001-sdd-initialization/features/authentication.md`
- Success Criteria: SC-001 (JWT validation happens in < 50ms)

**Key Design**:
```python
# Pseudo-code for JWT middleware (Step 1)
@app.middleware("http")
async def jwt_middleware(request: Request, call_next):
    # 1. Extract JWT from Authorization: Bearer header
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        if is_public_endpoint(request.url.path):
            return await call_next(request)
        raise HTTPException(status_code=401, detail="Unauthorized")

    # 2. Verify JWT with BETTER_AUTH_SECRET
    token = auth_header[7:]  # Remove "Bearer " prefix
    try:
        payload = jwt.decode(token, BETTER_AUTH_SECRET, algorithms=["HS256"])
        user_id = payload.get("sub")  # JWT subject claim
        request.state.user_id = user_id
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    # 3. Continue to route handler
    return await call_next(request)
```

**Acceptance Criteria**:
- [ ] FastAPI starts without errors
- [ ] JWT middleware is first in middleware stack
- [ ] Public endpoints (register, login) work without token
- [ ] Protected endpoints (tasks) return 401 without token
- [ ] Protected endpoints return 401 with invalid token
- [ ] Protected endpoints extract user_id and pass to route handler

**Dependencies**: None (foundational step)

---

### Step 2: Database Schema & SQLModel Entities (Constitution III - User Isolation)

**Objective**: Implement SQLModel entity definitions and Alembic migrations reflecting `@specs/001-sdd-initialization/database/schema.md`.

**Scope**:
- SQLModel entity classes: User, Task, RefreshToken
- Foreign key relationships with CASCADE DELETE
- Pydantic validation rules
- Database migration initialization (Alembic)
- Connection pool setup for Neon DB

**Artifacts**:
- `backend/src/models/user.py` - User entity with password_hash
- `backend/src/models/task.py` - Task entity with user_id Foreign Key
- `backend/src/models/refresh_token.py` - RefreshToken entity
- `backend/src/db/engine.py` - SQLAlchemy engine and session factory
- `backend/alembic/versions/001_initial_schema.py` - Migration script

**Traceability**:
- Constitution Principle III: "Every database query filtered by user_id"
- Specification: `@specs/001-sdd-initialization/database/schema.md`
- Success Criteria: SC-004 (100% of database models include user_id scoping)

**Key Design**:
```python
# Pseudo-code for SQLModel entities (Step 2)
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime

class User(SQLModel, table=True):
    id: str = Field(primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    is_verified: bool = False
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)

    tasks: List["Task"] = Relationship(back_populates="user", cascade_delete=True)
    refresh_tokens: List["RefreshToken"] = Relationship(back_populates="user", cascade_delete=True)

class Task(SQLModel, table=True):
    id: str = Field(primary_key=True)
    user_id: str = Field(foreign_key="user.id", index=True)  # User isolation
    title: str
    description: Optional[str] = None
    status: str = Field(default="Pending")  # Enum: Pending, In Progress, Completed, Archived
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)

    user: User = Relationship(back_populates="tasks")

class RefreshToken(SQLModel, table=True):
    id: str = Field(primary_key=True)
    user_id: str = Field(foreign_key="user.id", index=True)
    token_hash: str
    expires_at: datetime
    revoked_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=utc_now)

    user: User = Relationship(back_populates="refresh_tokens")
```

**Indexes**:
- `users(email)` - Fast email lookups
- `tasks(user_id)` - Essential for user isolation queries
- `tasks(user_id, created_at DESC)` - Efficient task list with sorting
- `refresh_tokens(user_id)` - Find tokens for logout
- `refresh_tokens(expires_at)` - Cleanup expired tokens

**Acceptance Criteria**:
- [ ] All entities defined with correct fields and types
- [ ] Foreign keys created with CASCADE DELETE
- [ ] Indexes created on user_id for all user-scoped tables
- [ ] Pydantic validation enforced (e.g., email format)
- [ ] Migration runs without errors
- [ ] Tables created in Neon DB with correct schema

**Dependencies**: Step 1 (environment variables for DATABASE_URL)

---

### Step 3: REST API Endpoints with user_id Enforcement (Constitution III)

**Objective**: Implement all 11 REST endpoints from `@specs/001-sdd-initialization/api/rest-endpoints.md` with user_id filtering on all protected endpoints.

**Scope**:
- **Authentication Endpoints** (Public):
  - `POST /api/v1/auth/register` - Create account with email verification
  - `POST /api/v1/auth/login` - Authenticate and issue JWT
  - `POST /api/v1/auth/logout` - Revoke tokens
  - `POST /api/v1/auth/refresh` - Refresh access token
  - `POST /api/v1/auth/forgot-password` - Request password reset
  - `POST /api/v1/auth/reset-password` - Reset password with token

- **Task Endpoints** (Protected):
  - `POST /api/v1/tasks` - Create task (user_id from JWT)
  - `GET /api/v1/tasks` - List tasks (filter by user_id)
  - `GET /api/v1/tasks/{id}` - Get task (verify user_id match)
  - `PATCH /api/v1/tasks/{id}` - Update task (verify user_id match)
  - `DELETE /api/v1/tasks/{id}` - Delete task (verify user_id match)

**Artifacts**:
- `backend/src/schemas/user.py` - Request/response models for auth
- `backend/src/schemas/task.py` - Request/response models for tasks
- `backend/src/services/auth_service.py` - Authentication business logic
- `backend/src/services/task_service.py` - Task CRUD business logic (with user_id param)
- `backend/src/api/v1/auth.py` - Auth route handlers
- `backend/src/api/v1/tasks.py` - Task route handlers (protected)
- `backend/src/api/v1/__init__.py` - Router setup

**Traceability**:
- Constitution Principle III: "Every database query filtered by user_id"
- Specification: `@specs/001-sdd-initialization/api/rest-endpoints.md`
- Success Criteria: SC-005 (All REST endpoints include user_id validation)

**Key Design Pattern**:
```python
# Pseudo-code for protected task endpoint (Step 3)
from fastapi import Depends, HTTPException

def get_current_user_id(request: Request) -> str:
    """Dependency: Extract user_id from request.state (set by JWT middleware)"""
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return user_id

@router.get("/api/v1/tasks")
async def list_tasks(
    page: int = 1,
    limit: int = 20,
    user_id: str = Depends(get_current_user_id)  # Enforced by dependency
) -> TaskListResponse:
    """
    Task T045: List user's tasks
    From: @specs/001-sdd-initialization/api/rest-endpoints.md §GET /api/v1/tasks

    CRITICAL: Only returns tasks where database query filters by user_id.
    Constitution III: "Every database query filtered by user_id"
    """
    # Service method receives user_id as parameter
    tasks = await task_service.get_user_tasks(user_id=user_id, page=page, limit=limit)
    return TaskListResponse(data=tasks, pagination=...)

@router.patch("/api/v1/tasks/{task_id}")
async def update_task(
    task_id: str,
    request: UpdateTaskRequest,
    user_id: str = Depends(get_current_user_id)
) -> TaskResponse:
    """
    Task T046: Update task
    From: @specs/001-sdd-initialization/api/rest-endpoints.md §PATCH /api/v1/tasks/{id}

    Verifies user_id match BEFORE updating.
    """
    task = await task_service.update_task(
        task_id=task_id,
        user_id=user_id,  # PASSED AS PARAMETER (not from request body)
        data=request
    )
    if not task:
        raise HTTPException(status_code=403, detail="Forbidden")
    return task
```

**Service Layer Pattern** (user_id enforced at query level):
```python
# Pseudo-code for task service (Step 3)
class TaskService:
    async def get_user_tasks(self, user_id: str, page: int, limit: int):
        """
        CRITICAL: All queries filter by user_id (Constitution III).
        This prevents cross-user data access.
        """
        query = (
            select(Task)
            .where(Task.user_id == user_id)  # User isolation at query level
            .order_by(Task.created_at.desc())
            .offset((page - 1) * limit)
            .limit(limit)
        )
        return await session.execute(query)

    async def update_task(self, task_id: str, user_id: str, data: UpdateTaskRequest):
        """
        CRITICAL: Verify user_id match BEFORE updating.
        Prevents user A from updating user B's task.
        """
        task = await session.get(Task, task_id)
        if not task or task.user_id != user_id:
            return None  # Caller raises 403

        task.title = data.title
        task.description = data.description
        task.status = data.status
        task.updated_at = utc_now()
        return task
```

**Error Handling** (Constitution V):
- `201 Created` - Successful POST (return created resource)
- `200 OK` - Successful GET/PATCH with body
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid JWT token
- `403 Forbidden` - User lacks permission (accessing other user's task)
- `404 Not Found` - Resource does not exist

**Acceptance Criteria**:
- [ ] All 11 endpoints implemented and tested
- [ ] Authentication endpoints (public) work without JWT
- [ ] Protected endpoints (tasks) return 401 without JWT
- [ ] Protected endpoints enforce user_id match (403 if mismatch)
- [ ] Response models use Pydantic; never leak other users' data
- [ ] All errors return appropriate HTTP status codes
- [ ] Pagination works correctly (page, limit, offset)

**Dependencies**: Step 1 (JWT middleware), Step 2 (SQLModel entities)

---

### Step 4: Frontend Authentication with Better Auth Integration

**Objective**: Implement login, registration, and session management in Next.js using Better Auth client library.

**Scope**:
- Better Auth client setup with `NEXT_PUBLIC_BETTER_AUTH_URL`
- Login/Register pages with form validation (React Hook Form + Zod)
- Session context for authenticated state
- Fetch API wrapper that injects Bearer token from cookie
- Redirect logic (unauthenticated → login, authenticated → dashboard)
- Password reset flow

**Artifacts**:
- `frontend/src/lib/auth.ts` - Better Auth client initialization
- `frontend/src/lib/api.ts` - Fetch wrapper with Bearer token injection
- `frontend/src/app/login/page.tsx` - Login page (public)
- `frontend/src/app/register/page.tsx` - Registration page (public)
- `frontend/src/app/forgot-password/page.tsx` - Forgot password page (public)
- `frontend/src/app/reset-password/[token]/page.tsx` - Reset password form (public)
- `frontend/src/contexts/AuthContext.tsx` - Session state (authenticated user)
- `frontend/src/middleware.ts` - Redirect logic for protected pages

**Traceability**:
- Constitution Principle II: "Better Auth is the single source of truth for user identity"
- Specification: `@specs/001-sdd-initialization/features/authentication.md`
- Success Criteria: SC-006 (Token refresh transparent to user)

**Key Design**:
```typescript
// Pseudo-code for auth integration (Step 4)

// lib/auth.ts - Better Auth client
import { createAuthClient } from "better-auth";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  redirectTo: "/dashboard"  // After login
});

// lib/api.ts - Fetch wrapper with token injection
export async function apiCall(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await authClient.getToken();  // From HTTP-only cookie

  return fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers: {
        ...options.headers,
        "Authorization": `Bearer ${token}`,  // Inject token
        "Content-Type": "application/json"
      }
    }
  );
}

// contexts/AuthContext.tsx - Session state
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authClient.getSession().then(session => {
      setUser(session?.user || null);
      setLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// app/login/page.tsx - Login page
export default function LoginPage() {
  const router = useRouter();
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(loginSchema)
  });

  async function onSubmit(data: LoginForm) {
    const result = await authClient.signIn.email(data);
    if (result) {
      router.push("/dashboard");  // Redirect after login
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...control.register("email")} />
      <input {...control.register("password")} type="password" />
      <button type="submit">Sign In</button>
    </form>
  );
}

// middleware.ts - Redirect unauthenticated users
export async function middleware(request: NextRequest) {
  const session = await getSession(request);

  if (!session && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
```

**Acceptance Criteria**:
- [ ] Better Auth client initialized with correct endpoints
- [ ] Login page submits credentials to `/api/v1/auth/login`
- [ ] Register page submits to `/api/v1/auth/register`
- [ ] On successful login, JWT stored in HTTP-only cookie
- [ ] Fetch wrapper injects Bearer token for all API calls
- [ ] Session context reflects authenticated user
- [ ] Unauthenticated users redirected to login
- [ ] Authenticated users can access dashboard
- [ ] Logout clears cookie and redirects to login

**Dependencies**: Step 3 (REST API endpoints)

---

### Step 5: UI Components & Dashboard (User Workflows)

**Objective**: Implement React components for task display, creation, and editing as per `@specs/001-sdd-initialization/ui/pages.md`.

**Scope**:
- Dashboard page with task list, filters, pagination
- Create task form (modal or dedicated page)
- Edit task form with delete button
- Task card component with status badge
- Responsive design for mobile, tablet, desktop
- Form validation with React Hook Form + Zod

**Artifacts**:
- `frontend/src/app/dashboard/page.tsx` - Task list and dashboard
- `frontend/src/app/dashboard/tasks/new/page.tsx` - Create task page
- `frontend/src/app/dashboard/tasks/[id]/page.tsx` - Edit task page
- `frontend/src/components/TaskList.tsx` - Task list component
- `frontend/src/components/TaskCard.tsx` - Individual task card
- `frontend/src/components/TaskForm.tsx` - Create/edit form
- `frontend/src/components/common/Header.tsx` - Navigation header

**Traceability**:
- Constitution Principle III: "User can only see/modify their own resources"
- Specification: `@specs/001-sdd-initialization/ui/pages.md`
- Success Criteria: SC-008 (Responsive design works on mobile, tablet, desktop)

**Key Design Pattern**:
```typescript
// Pseudo-code for dashboard component (Step 5)
import { apiCall } from "@/lib/api";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "Pending" | "In Progress" | "Completed" | "Archived";
  created_at: string;
  updated_at: string;
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, [page, filter]);

  async function loadTasks() {
    setLoading(true);
    const statusParam = filter === "All" ? "" : `&status=${filter}`;
    const response = await apiCall(
      `/api/v1/tasks?page=${page}&limit=20${statusParam}`
    );
    const { data, pagination } = await response.json();
    setTasks(data);
  }

  async function deleteTask(taskId: string) {
    if (confirm("Delete this task?")) {
      const response = await apiCall(`/api/v1/tasks/${taskId}`, {
        method: "DELETE"
      });
      if (response.ok) {
        loadTasks();  // Refresh list
      }
    }
  }

  return (
    <div className="container">
      <Header title="Dashboard" />

      <div className="filters">
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option>All</option>
          <option>Pending</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>

        <Link href="/dashboard/tasks/new" className="btn-primary">
          + New Task
        </Link>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : tasks.length === 0 ? (
        <div>No tasks yet. Create one to get started!</div>
      ) : (
        <TaskList tasks={tasks} onDelete={deleteTask} />
      )}

      <Pagination currentPage={page} onPageChange={setPage} />
    </div>
  );
}

// components/TaskForm.tsx - Reusable form for create/edit
interface TaskFormProps {
  task?: Task;
  onSubmit: (data: any) => Promise<void>;
}

export function TaskForm({ task, onSubmit }: TaskFormProps) {
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: task || { title: "", status: "Pending" }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...control.register("title")} placeholder="Task title" />
      <textarea {...control.register("description")} placeholder="Description" />
      <select {...control.register("status")}>
        <option>Pending</option>
        <option>In Progress</option>
        <option>Completed</option>
        <option>Archived</option>
      </select>
      <button type="submit">{task ? "Update" : "Create"} Task</button>
    </form>
  );
}
```

**Responsive Design Breakpoints** (from UI spec):
- Mobile (< 640px): Single column, stacked cards
- Tablet (640px - 1024px): Filters sidebar or inline, 2-column layout
- Desktop (> 1024px): Filters left sidebar, main task area

**Acceptance Criteria**:
- [ ] Dashboard displays user's tasks (paginated)
- [ ] Create task page has form with title, description, status
- [ ] Edit task page shows task details with update button
- [ ] Delete button shows confirmation modal
- [ ] Filters work correctly (status, sorting)
- [ ] Responsive design works on mobile, tablet, desktop
- [ ] User only sees their own tasks
- [ ] Navigation header shows logout button
- [ ] Form validation shows error messages

**Dependencies**: Step 4 (Authentication), Step 3 (REST API endpoints)

---

## Phase Summary & Task Breakdown Structure

### Task Dependency Graph

```
Step 1: Core Backend
   ↓ (defines middleware, config)
Step 2: Database Schema
   ↓ (defines entities for API)
Step 3: REST API
   ├→ Step 4: Frontend Auth
   │    ↓ (authenticates requests)
   └→ Step 5: UI Components
        ↓ (calls API endpoints)
   Final: Integration Testing
```

### Estimation Guide for Phase 3 (Tasks Generation)

Each step will generate 5-15 atomic tasks:

**Step 1 Tasks** (5-7 tasks):
- T001: Setup FastAPI app structure
- T002: Configure middleware stack
- T003: Implement JWT verification middleware
- T004: Setup dependency injection for user_id
- T005: Configure CORS and error handling
- T006: Environment variable configuration

**Step 2 Tasks** (5-8 tasks):
- T010: Create User SQLModel entity
- T011: Create Task SQLModel entity
- T012: Create RefreshToken SQLModel entity
- T013: Setup database engine and session
- T014: Create Alembic migration for initial schema
- T015: Run migration and verify tables

**Step 3 Tasks** (10-15 tasks):
- T020: Implement POST /api/v1/auth/register
- T021: Implement POST /api/v1/auth/login
- T022: Implement JWT token issuance
- T023: Implement POST /api/v1/auth/logout
- T024: Implement token refresh
- T025: Implement POST /api/v1/tasks (create)
- T026: Implement GET /api/v1/tasks (list)
- T027: Implement GET /api/v1/tasks/{id} (read)
- T028: Implement PATCH /api/v1/tasks/{id} (update)
- T029: Implement DELETE /api/v1/tasks/{id} (delete)
- T030: Error handling and status codes

**Step 4 Tasks** (5-8 tasks):
- T040: Setup Better Auth client
- T041: Implement login page
- T042: Implement register page
- T043: Create auth context provider
- T044: Create fetch wrapper with Bearer token
- T045: Setup redirect middleware

**Step 5 Tasks** (8-12 tasks):
- T050: Create TaskList component
- T051: Create TaskCard component
- T052: Create TaskForm component
- T053: Implement dashboard page
- T054: Implement create task page
- T055: Implement edit task page
- T056: Implement pagination
- T057: Implement filters
- T058: Responsive design (mobile)
- T059: Responsive design (tablet/desktop)

---

## Design Decisions & Rationale

### Why JWT Middleware First (Step 1)?

**Decision**: Implement JWT verification before database or API endpoints.

**Rationale**:
- Constitution Principle II declares JWT as "Security Critical"
- All subsequent endpoints depend on user_id extraction
- Establishes the "authoritative identity chain" from frontend to backend
- Prevents accidental implementation of endpoints without authentication

### Why SQLModel Over Raw SQLAlchemy?

**Decision**: Use SQLModel for ORM and request/response validation.

**Rationale**:
- SQLModel combines SQLAlchemy (ORM) + Pydantic (validation)
- Single source of truth for entity definitions and API schemas
- Built-in validation at model level
- Integrates seamlessly with FastAPI dependency injection

### Why HTTP-Only Cookies for Token Storage?

**Decision**: Store JWT in HTTP-only cookies (set by backend), not localStorage.

**Rationale**:
- HTTP-only prevents XSS attacks (JavaScript cannot access token)
- Cookies sent automatically with requests (simpler client code)
- Server controls token lifecycle and refresh

### Why User Isolation at Query Level?

**Decision**: Filter by user_id at database query level, not in business logic.

**Rationale**:
- Defense in depth: multiple layers (middleware extracts user_id, service filters, query WHERE clause)
- Prevents accidental data leaks if business logic is bypassed
- Constitution Principle III explicitly requires "WHERE user_id = <extracted_id>"

---

## Success Criteria Mapping

Every implementation step maps to specific Success Criteria from specifications:

| Success Criteria | Spec | Step | Verification |
|---|---|---|---|
| **SC-001**: Developers can complete SDD cycle in < 1 hour | spec.md | All | This plan + tasks breakdown achieves it |
| **SC-003**: All REST endpoints include user_id validation | api/rest-endpoints.md | 3 | Each endpoint enforces user_id match |
| **SC-004**: 100% of database models include user_id scoping | database/schema.md | 2 | Task, RefreshToken have user_id FK |
| **SC-005**: Spec quality checklist passes | checklists/requirements.md | All | Referenced in every step |
| **SC-006**: Every session generates complete PHR | spec.md | All | PHR created after implementation |
| **SC-007**: New team members understand tech stack in 30 mins | overview.md | All | Architecture diagram + tech stack table |
| **SC-008**: All acceptance criteria independently testable | All specs | All | Each task includes test scenarios |
| **SC-009**: Zero code without referenced spec and task ID | Constitution | All | Every task requires Task ID reference |
| **SC-010**: Spec templates reduce time by 50% | spec.md | All | Using spec-template.md enabled this plan |

---

## Risk Mitigation

### Risk: JWT Secret Compromise

**Mitigation**:
- Store `BETTER_AUTH_SECRET` in environment variables (never hardcoded)
- Use strong secret (32+ bytes, random)
- Rotate secret on deployment if compromised

### Risk: Cross-User Data Access

**Mitigation**:
- Constitution Principle III explicitly requires WHERE user_id filtering
- Every service method receives user_id as parameter (passed from middleware)
- Database FK constraints enforce user_id existence
- Every acceptance scenario tests "User A cannot access User B's data"

### Risk: Token Expiration Handling

**Mitigation**:
- Better Auth handles token refresh transparently (frontend)
- Backend returns 401 for expired tokens (client redirects to login)
- Access token: 1 hour; Refresh token: 30 days

### Risk: Incomplete Specification

**Mitigation**:
- All specs passed 27/27 quality checklist
- No [NEEDS CLARIFICATION] markers remain
- Cross-specification consistency verified

---

## Next Phase: Task Generation (`/sp.tasks`)

This plan establishes the architecture and implementation sequence. The next phase (`/sp.tasks`) will:

1. **Break each step into atomic tasks** (T001, T002, ..., T059+)
2. **Add implementation details** (function signatures, test assertions)
3. **Create task dependency graph** (which tasks block which)
4. **Assign effort estimates** (optional; TBD with team)
5. **Reference spec sections explicitly** (each task links to spec)

The `/sp.tasks` workflow will transform this plan into a work breakdown structure ready for Phase 4 (Implementation).

---

## Approval Checklist

Before proceeding to task generation, verify:

- [x] Architecture aligns with Constitution Principle II (JWT middleware)
- [x] Architecture aligns with Constitution Principle III (user_id isolation)
- [x] All 5 implementation steps are sequential and non-blocking
- [x] Each step produces clear artifacts
- [x] Step 3 includes all 11 endpoints from spec
- [x] Step 2 includes all 3 entities from database schema
- [x] Success criteria mapped to each step
- [x] Risk mitigation documented
- [x] Task breakdown structure clear for Phase 3

---

## Conclusion

This plan provides a deterministic implementation roadmap for Phase 2. Each of the 5 steps is designed to be independent yet sequential, enabling parallelization where dependencies allow. The plan enforces the three constitutional principles:

1. **The JWT Bridge** (Step 1): FastAPI middleware as security gatekeeper
2. **User Isolation** (Step 2-3): Every query filtered by user_id
3. **Spec-Driven Development** (All Steps): Every task traces to specification

The resulting implementation will satisfy all Success Criteria from the specifications and uphold the project's commitment to no-manual-coding SDD development.

**Status**: ✅ Architecture Plan Complete
**Next Phase**: `/sp.tasks` for atomic task generation
**Readiness**: Ready for implementation phase

---

## Appendix: File Structure Summary

```
phase_2/
├── backend/
│   ├── src/
│   │   ├── main.py                      # FastAPI app (Step 1)
│   │   ├── config.py                    # Config & environment (Step 1)
│   │   ├── middleware/
│   │   │   └── jwt_verification.py      # JWT middleware (Step 1)
│   │   ├── models/
│   │   │   ├── user.py                  # User entity (Step 2)
│   │   │   ├── task.py                  # Task entity (Step 2)
│   │   │   └── refresh_token.py         # RefreshToken entity (Step 2)
│   │   ├── schemas/
│   │   │   ├── user.py                  # Request/response models
│   │   │   └── task.py                  # Task models
│   │   ├── services/
│   │   │   ├── auth_service.py          # Auth business logic (Step 3)
│   │   │   └── task_service.py          # Task business logic (Step 3)
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── auth.py              # Auth endpoints (Step 3)
│   │   │       └── tasks.py             # Task endpoints (Step 3)
│   │   └── db/
│   │       └── engine.py                # DB connection (Step 2)
│   ├── alembic/
│   │   └── versions/
│   │       └── 001_initial_schema.py    # Migration (Step 2)
│   ├── tests/                           # Test files (parallel to implementation)
│   └── pyproject.toml
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx               # Root layout (Step 4)
│   │   │   ├── login/page.tsx           # Login page (Step 4)
│   │   │   ├── register/page.tsx        # Register page (Step 4)
│   │   │   ├── forgot-password/page.tsx # Forgot password (Step 4)
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx             # Dashboard (Step 5)
│   │   │   │   └── tasks/
│   │   │   │       ├── new/page.tsx     # Create task (Step 5)
│   │   │   │       └── [id]/page.tsx    # Edit task (Step 5)
│   │   │   └── middleware.ts            # Auth redirect (Step 4)
│   │   ├── components/
│   │   │   ├── TaskList.tsx             # Task list (Step 5)
│   │   │   ├── TaskCard.tsx             # Task card (Step 5)
│   │   │   ├── TaskForm.tsx             # Task form (Step 5)
│   │   │   └── common/
│   │   │       └── Header.tsx           # Navigation (Step 5)
│   │   ├── lib/
│   │   │   ├── auth.ts                  # Better Auth client (Step 4)
│   │   │   └── api.ts                   # Fetch wrapper (Step 4)
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx          # Session state (Step 4)
│   │   └── types/
│   │       └── index.ts                 # TypeScript interfaces
│   ├── tests/
│   └── package.json
│
└── specs/001-sdd-initialization/
    ├── spec.md                          # (Already complete)
    ├── overview.md                      # (Already complete)
    ├── plan.md                          # (This document)
    ├── features/
    ├── api/
    ├── database/
    ├── ui/
    └── checklists/
```

---

**Plan Created**: 2026-01-22
**Plan Status**: ✅ Complete and Ready for Task Generation
**Next Command**: `/sp.tasks` to break into atomic work units
