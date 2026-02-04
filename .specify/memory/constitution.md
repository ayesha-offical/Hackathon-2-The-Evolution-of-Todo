# Phase 2 Todo App Constitution: Full-Stack Web Application

<!--
  SYNC IMPACT REPORT (Version: 1.0.0 from 0.0.0)
  ============================================================================
  This constitution document establishes governance for Phase 2 of the Todo
  Full-Stack Web Application following Spec-Driven Development (SDD) principles.

  Version Bump: MINOR (0.0.0 → 1.0.0)
  Rationale: Initial constitution establishment for Phase 2

  Changed Principles:
  - N/A (initial version)

  Added Sections:
  - I. Spec-Driven Development (SDD)
  - II. The JWT Bridge (Security Critical)
  - III. User Isolation & Multi-Tenancy
  - IV. Stateless Backend Architecture
  - V. Error Handling & HTTP Semantics
  - VI. No Manual Coding Rule
  - Technology Stack & Dependencies
  - Development Workflow & Discipline

  Templates Affected:
  ✅ plan-template.md (Constitution Check section aligns)
  ✅ spec-template.md (Feature spec inputs aligned with architecture)
  ✅ tasks-template.md (Task organization follows Constitution phases)

  Deferred TODOs: None
  ============================================================================
-->

## Core Principles

### I. Spec-Driven Development (SDD)

The project follows a strict **Specify → Plan → Tasks → Implement** lifecycle.

**Non-Negotiable Rules:**
- **No code is written without an approved Task ID.** Every line of code must trace back to a specific Task in `/specs/<feature>/tasks.md`.
- **Every feature specification must be approved before planning begins.** Requirements ambiguity is resolved in the Specify phase, never during implementation.
- **The Constitution supersedes all other guidance.** If a conflict arises between Constitution and other documents, Constitution wins.
- **Agents must halt and request clarification** if a specification is incomplete, ambiguous, or references unspecified dependencies.

**Rationale:** SDD prevents "vibe coding," ensures architectural alignment, and guarantees that every implementation decision is traceable to an explicit requirement.

---

### II. The JWT Bridge (Security Critical)

Authentication must use **Better Auth** on the frontend and **JWT verification** on the backend via a shared `BETTER_AUTH_SECRET`.

**Frontend Guarantees:**
- Better Auth is the single source of truth for user identity and JWT issuance.
- All API requests to `/api/**` MUST include a valid JWT token in the `Authorization: Bearer <token>` header.
- Token refresh logic is handled by Better Auth; the frontend MUST not bypass it.

**Backend Guarantees:**
- **All `/api/**` routes MUST have JWT middleware that:**
  - Extracts the JWT from the `Authorization: Bearer` header.
  - Verifies it using the `BETTER_AUTH_SECRET`.
  - Extracts the `user_id` claim and stores it in request context (e.g., `request.state.user_id`).
  - Returns `401 Unauthorized` if the token is missing, invalid, or expired.
- JWT verification is **not optional** for any authenticated endpoint.
- The `user_id` extracted from the JWT is the authoritative source of user identity for all database queries.

**Rationale:** This design ensures a single, cryptographically verified identity chain from frontend to backend, preventing token spoofing and session hijacking.

---

### III. User Isolation & Multi-Tenancy

Every database query and API response **MUST** be filtered by the `user_id` extracted from the JWT.

**Database Query Rule:**
- **Every database query that touches user data MUST include a `WHERE user_id = <extracted_user_id>` clause** (or equivalent isolation logic).
- No query may return data without filtering by the requesting user's identity.
- Violations of this rule are **security defects** and MUST be caught in code review.

**API Response Rule:**
- **API responses MUST never include fields that belong to other users**, even if a query accidentally retrieved them.
- Use Pydantic response models to explicitly define what fields are returned; exclude sensitive user-specific data by default.

**Data Access Pattern (Required):**
```
Request arrives with JWT → Middleware extracts user_id →
Pass user_id to all service methods → All queries filter by user_id →
Response uses filtered results only
```

**Rationale:** Prevents horizontal privilege escalation where one user inadvertently accesses another user's tasks or data.

---

### IV. Stateless Backend Architecture

The FastAPI backend MUST remain stateless and horizontally scalable.

**Rules:**
- **No in-memory caches** that persist state across requests (use distributed cache like Redis if needed, not module-level globals).
- **No session objects** tied to a server instance. All state is in the database or JWT claims.
- **All request handling must be deterministic:** same input → same output regardless of server instance.
- Environment configuration (secrets, database URLs) comes from environment variables, never hardcoded.

**Rationale:** Enables horizontal scaling, simplifies debugging, and ensures consistent behavior across deployments.

---

### V. Error Handling & HTTP Semantics

All errors MUST be raised as FastAPI `HTTPException` with appropriate status codes.

**Required Status Codes:**
- `200 OK`: Successful GET/POST/PATCH/DELETE with response body.
- `201 Created`: Successful POST that creates a new resource (return created resource).
- `204 No Content`: Successful DELETE or update with no response body.
- `400 Bad Request`: Invalid input validation failure (e.g., malformed JSON, constraint violation).
- `401 Unauthorized`: Missing or invalid JWT token.
- `403 Forbidden`: Valid token but user lacks permission to access resource (e.g., accessing another user's task).
- `404 Not Found`: Resource does not exist.
- `409 Conflict`: State conflict (e.g., duplicate entity, concurrent write).
- `500 Internal Server Error`: Unexpected backend failure (log stack trace).

**Error Response Format (Required):**
```json
{
  "detail": "Human-readable error message"
}
```

**Backend Logging:**
- All `5xx` errors MUST be logged with full stack trace for debugging.
- All `4xx` client errors MUST be logged at `info` level (not `error`).
- Include `user_id`, endpoint, and timestamp in all logs.

**Rationale:** Consistent error handling enables clients to handle failures gracefully and aids debugging.

---

### VI. No Manual Coding Rule

**CRITICAL CONSTRAINT:** This project forbids manual code entry by human developers. All code is generated by AI agents (Claude Code).

**Enforcement:**
- Git commits MUST include the co-author line: `Co-Authored-By: Claude <noreply@anthropic.com>`.
- Code reviews focus on **spec compliance** and **architecture adherence**, not code style (formatters handle that).
- If a human developer must intervene (emergency fix, clarification), the Work MUST be documented in a Prompt History Record (PHR).

**Rationale:** Maintains traceability, ensures consistent AI-generated code quality, and enables PHR knowledge capture for future iterations.

---

## Technology Stack & Dependencies

### Backend (Python/FastAPI)

**Required Stack:**
- **Language:** Python 3.11+
- **Framework:** FastAPI (latest stable)
- **ORM/Database:** SQLModel (dataclass-based SQLAlchemy)
- **Database:** Neon Serverless PostgreSQL
- **Authentication:** Better Auth (via JWT verification)
- **HTTP Client:** httpx (for external calls)
- **Task Queue (if needed):** Celery + Redis (not mandated for Phase 2 MVP)
- **Testing:** pytest + pytest-asyncio
- **Linting/Formatting:** ruff (formatter + linter)

**Environment Variables (Required):**
```
DATABASE_URL=postgresql://...  # Neon connection string
BETTER_AUTH_SECRET=...          # Shared JWT secret
API_PORT=8000
API_HOST=0.0.0.0
LOG_LEVEL=info
ENVIRONMENT=development|production
```

### Frontend (Next.js/React)

**Required Stack:**
- **Framework:** Next.js 15+ (App Router)
- **UI Library:** React 18+
- **Styling:** Tailwind CSS
- **Authentication:** Better Auth (client library)
- **HTTP Client:** fetch API or axios
- **State Management:** React Context (or minimal Zustand if needed)
- **Form Handling:** React Hook Form + zod validation
- **Testing:** jest + React Testing Library (if tests requested)
- **Linting/Formatting:** ESLint + Prettier

**Environment Variables (Required):**
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000  # Backend API
NEXT_PUBLIC_BETTER_AUTH_URL=...                  # Better Auth endpoint
```

### Shared Conventions

**Naming:**
- Python: `snake_case` for variables/functions, `PascalCase` for classes.
- TypeScript/JavaScript: `camelCase` for variables/functions, `PascalCase` for classes/components.
- API routes: `/api/v1/<resource>/<action>` (versioned).
- Database tables: `snake_case` plural names (e.g., `user_tasks`, `users`).

**API Contract Format:**
- All requests/responses are JSON.
- Pydantic models define API contracts (Python backend).
- TypeScript interfaces mirror Pydantic models (frontend).

---

## Development Workflow & Discipline

### Code Organization

**Backend (`/backend`):**
```
backend/
├── src/
│   ├── main.py                 # FastAPI app initialization
│   ├── middleware/             # JWT verification, CORS, logging
│   ├── models/                 # SQLModel entity definitions
│   ├── schemas/                # Pydantic request/response models
│   ├── services/               # Business logic layer
│   ├── api/                    # Route handlers
│   │   └── v1/
│   │       ├── tasks.py
│   │       ├── users.py
│   │       └── auth.py
│   ├── db/                     # Database initialization, migrations
│   └── config.py               # Environment and app settings
├── tests/
│   ├── unit/                   # Unit tests (services, schemas)
│   ├── integration/            # Full request flow tests
│   └── conftest.py             # Pytest fixtures
└── pyproject.toml              # Dependencies, metadata
```

**Frontend (`/frontend`):**
```
frontend/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── tasks/
│   │       ├── page.tsx        # Tasks list
│   │       └── [id]/
│   │           └── page.tsx    # Task detail/edit
│   ├── components/             # Reusable React components
│   │   ├── TaskList.tsx
│   │   ├── TaskForm.tsx
│   │   └── common/
│   ├── lib/                    # Utilities, API clients
│   │   ├── api.ts              # Fetch wrapper with auth
│   │   └── auth.ts             # Better Auth integration
│   ├── types/                  # TypeScript interfaces
│   └── styles/                 # Global Tailwind config (if needed)
├── tests/                      # Jest + React Testing Library (if tests requested)
└── package.json
```

### Task Execution & Delivery

**Every Task Must Include:**
1. **Task ID** (e.g., T001, T042): Unique, sequential identifier.
2. **Clear Description**: What file(s) to create/modify, what behavior to implement.
3. **Preconditions**: Which prior tasks must be complete (dependencies).
4. **Expected Output**: What the completed task looks like (file paths, API responses, test assertions).
5. **Traceability**: Reference to Spec and Plan sections (e.g., `@specs/features/task-crud.md §2.1`).

**Code Submission Requirements:**
- Every function/module MUST include a comment linking it to the Task ID and Spec section.
- Example: `# Task T015: Implements task creation endpoint (@specs/features/task-crud.md §2.1)`
- Commit message MUST reference the Task ID: `feat(T015): Implement POST /api/v1/tasks endpoint`

**Verification Checklist:**
- [ ] Code compiles/passes linter without warnings.
- [ ] If a Task includes tests, all tests pass.
- [ ] No hardcoded secrets in code (use environment variables).
- [ ] No console.log/print statements left in production code.
- [ ] PR/commit includes co-author line: `Co-Authored-By: Claude <noreply@anthropic.com>`.

---

## Governance

### Constitution Authority

- **This Constitution is the single source of truth** for Phase 2 governance.
- In case of conflict between this document and any other (spec, plan, task, README), Constitution wins.
- Changes to the Constitution require explicit user approval; amendments are tracked by version number and `LAST_AMENDED_DATE`.

### Amendment Process

1. **Propose Change**: A change is discovered to be necessary (e.g., new principle, relaxed constraint).
2. **Draft Amendment**: Update this file with clear justification in comments.
3. **Version Bump**: Apply semantic versioning (MAJOR for breaking changes, MINOR for additions, PATCH for clarifications).
4. **User Approval**: Present the amendment to the user; get explicit approval before merging.
5. **Propagate**: Update affected templates and dependent documents (see Sync Impact Report).
6. **Commit**: Commit with message: `docs: amend constitution to vX.Y.Z (<change summary>)`.

### Compliance Review

- **Every PR**: Reviewer checks that code traces to a Task ID and follows this Constitution.
- **Every Spec/Plan/Task update**: Ensure alignment with Constitution sections (Architecture, Security, Database, etc.).
- **Weekly (or per milestone)**: Audit code and specs for Constitutional violations; escalate to user if found.

### Principle Hierarchy (Conflict Resolution)

If a conflict arises, resolve in this order:
1. **Constitution** (this file) — highest authority.
2. **Specification** (`/specs/<feature>/spec.md`) — user requirements.
3. **Plan** (`/specs/<feature>/plan.md`) — architectural decisions.
4. **Tasks** (`/specs/<feature>/tasks.md`) — implementation breakdown.

---

## Enforcement & Failure Modes

### Agents MUST NOT:

- [ ] Write code without a referenced Task ID.
- [ ] Modify architecture without updating this Constitution and the Plan.
- [ ] Propose features without a corresponding Specification.
- [ ] Change principles without documenting an amendment to this Constitution.
- [ ] Generate missing requirements; instead, **request clarification from the user**.
- [ ] Bypass the JWT verification middleware under any circumstances.
- [ ] Write queries that don't filter by `user_id`.
- [ ] Hardcode secrets or environment-dependent values.
- [ ] Add manual step-by-step instructions (use automation via CI/CD and Makefile).

### If Conflict Arises:

1. **Stop immediately**; do not guess or improvise.
2. **Document the conflict** in a Prompt History Record (PHR).
3. **Request user clarification**: "This task requires a decision on [X]. The Constitution says [A], but the Plan says [B]. Which takes priority?"
4. **Await explicit guidance** before proceeding.

---

## Glossary

- **Task ID**: Unique identifier for an atomic unit of work (e.g., T042).
- **User Story**: A feature from the user's perspective, tied to a specific user journey.
- **JWT**: JSON Web Token; issued by Better Auth frontend, verified by FastAPI backend.
- **user_id**: Primary identifier for a user, extracted from the JWT `sub` claim.
- **PHR**: Prompt History Record; captures AI agent inputs and decisions for knowledge capture.
- **SDD**: Spec-Driven Development; the governance model for this project.
- **Stateless**: Backend holds no persistent session state between requests; all state is in DB or JWT.

---

**Version**: 1.0.0 | **Ratified**: 2025-01-18 | **Last Amended**: 2025-01-18
