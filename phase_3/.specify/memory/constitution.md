# Phase 2-3 Todo App Constitution: Full-Stack Web Application + AI Chatbot

<!--
  SYNC IMPACT REPORT (Version: 2.0.0 from 1.0.0)
  ============================================================================
  This constitution document establishes governance for Phase 2-3 of the Todo
  Full-Stack Web Application with AI Chatbot integration following Spec-Driven
  Development (SDD) principles.

  Version Bump: MAJOR (1.0.0 → 2.0.0)
  Rationale: Phase III introduces AI agent architecture, MCP server, and
             conversation persistence. These are architecturally significant
             and require new principles and constraints.

  Changed Principles:
  - VI. No Manual Coding Rule: clarified for AI agent context
  - IV. Stateless Backend: extended to cover AI agent statelessness

  Added Principles:
  - VII. MCP Server Architecture (AI Integration)
  - VIII. AI Agent Stateless Design
  - IX. Conversation History & Persistence

  Added Technology:
  - MCP SDK for tool exposure
  - OpenAI Agents SDK for AI logic
  - SQLModel (Conversation, Message) for persistence
  - OpenAI ChatKit for frontend conversational UI

  Added Code Organization:
  - backend/src/mcp/ (MCP server implementation)
  - frontend/src/app/chat/ (ChatKit integration)
  - Database models: Conversation, Message (linked to User via user_id)

  Templates Affected:
  ✅ plan-template.md (New AI Architecture section)
  ✅ spec-template.md (Conversation & tool specs support)
  ✅ tasks-template.md (MCP tool definition tasks)

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

### VII. MCP Server Architecture (AI Integration)

The backend exposes task operations as tools via a **stateless MCP (Model Context Protocol) Server** built with the Official MCP SDK.

**MCP Server Guarantees:**
- The MCP server is a **separate FastAPI service** (or integrated endpoint) that implements the MCP protocol.
- All task operations (create, read, update, delete) are exposed as **MCP tools** (not direct database calls).
- Tool names follow the pattern: `task_<action>` (e.g., `task_create`, `task_list`, `task_update`, `task_delete`).
- Every MCP tool receives `user_id` as a **mandatory parameter** (extracted from the JWT and passed by the AI Agent).
- MCP tools return results in a standardized format (e.g., `{"success": bool, "data": {...}, "error": str}`).
- Tools MUST validate the `user_id` and enforce permission checks; they MUST NOT return data belonging to other users.

**Frontend to AI to MCP Flow:**
```
User Message (in Chat UI)
  ↓
POST /api/v1/chat { user_id, message, conversation_id }
  ↓
Backend fetches conversation history (filtered by user_id)
  ↓
OpenAI Agent receives history + user message + list of available MCP tools
  ↓
Agent decides to call MCP tool (or respond directly)
  ↓
Agent calls MCP tool with user_id + parameters
  ↓
MCP tool queries DB (filtered by user_id), returns result
  ↓
Agent processes result, generates response
  ↓
Backend stores both user message and AI response in Conversation table (linked to user_id)
  ↓
Response returned to Chat UI
```

**Rationale:** Ensures the AI agent cannot access or modify data it shouldn't; the MCP protocol provides a clean, standardized interface for tool discovery and invocation.

---

### VIII. AI Agent Stateless Design

The OpenAI Agent MUST remain **completely stateless** between invocations. It MUST NOT store or maintain internal state.

**Agent Rules:**
- **No persistent memory:** The agent does NOT retain conversation context between requests. All context comes from the `/api/v1/chat` request.
- **Conversation history is backend-managed:** The backend MUST:
  - Fetch all previous messages for the conversation before invoking the agent.
  - Provide the full message history (user_id, timestamp, role, content) to the agent.
  - Store the agent's response back in the database immediately after generation.
- **No agent-side database access:** The agent MUST NOT call the database directly. All data operations go through MCP tools.
- **Deterministic output:** Given the same conversation history and user message, the agent MUST produce the same response (or semantically equivalent).

**Agent Configuration (Required in Environment):**
```
OPENAI_API_KEY=sk-...                    # OpenAI API credentials
OPENAI_AGENT_MODEL=gpt-4-turbo-preview   # Model to use for agent
OPENAI_AGENT_TEMPERATURE=0.7             # Determinism vs. creativity
MCP_SERVER_URL=http://localhost:8001     # URL to MCP server (if separate)
```

**Rationale:** Statelessness ensures horizontal scalability, simplifies debugging, and prevents memory leaks. Backend-managed history ensures consistency and enables multi-turn conversations with full context.

---

### IX. Conversation History & Persistence

Every conversation and message MUST be stored in the database, strictly isolated by `user_id`.

**Database Models (Required in SQLModel):**

**Conversation Model:**
```python
class Conversation(SQLModel, table=True):
    id: UUID4 = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID4 = Field(foreign_key="user.id")  # User isolation
    title: str | None = None                        # Auto-generated or user-provided
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    # Relationship to messages
    messages: list["Message"] = Relationship(back_populates="conversation")
```

**Message Model:**
```python
class Message(SQLModel, table=True):
    id: UUID4 = Field(default_factory=uuid4, primary_key=True)
    conversation_id: UUID4 = Field(foreign_key="conversation.id")
    user_id: UUID4 = Field(foreign_key="user.id")  # Redundant for isolation check
    role: str = Field(...)  # "user", "assistant", "system"
    content: str = Field(...)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    # Relationship back to conversation
    conversation: "Conversation" = Relationship(back_populates="messages")
```

**Conversation History Retrieval (Required):**
- **Every `/api/v1/chat` request MUST:**
  1. Extract `user_id` from JWT.
  2. Fetch all messages for the conversation WHERE `user_id = <extracted_user_id>` AND `conversation_id = <provided_id>`.
  3. Pass the full message history to the OpenAI Agent (in chronological order).
  4. Store both the new user message and AI response with `user_id` and `conversation_id`.

**API Endpoint (`POST /api/v1/chat`):**
```
Request:
{
  "conversation_id": "<UUID>",      # (Optional; create new if omitted)
  "message": "<user input>"
}

Response:
{
  "conversation_id": "<UUID>",
  "message_id": "<UUID>",           # AI response message ID
  "response": "<AI output>",
  "conversation": [
    {"id": "<UUID>", "role": "user", "content": "...", "timestamp": "..."},
    {"id": "<UUID>", "role": "assistant", "content": "...", "timestamp": "..."}
  ]
}
```

**User Isolation Rules (Critical):**
- **Every database query for messages MUST include `WHERE user_id = <JWT_user_id>`**.
- **API responses MUST NOT include messages where `user_id != <JWT_user_id>`**, even if a query accidentally retrieved them.
- Violation of this rule is a **security defect**.

**Rationale:** Persistent conversation history enables multi-turn dialogues; strict user isolation prevents cross-user data leakage and ensures GDPR/privacy compliance.

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
- **MCP Server:** Official MCP SDK (for tool exposure)
- **AI Agent:** OpenAI Agents SDK (for agent logic)
- **AI Model:** OpenAI API (gpt-4-turbo-preview or latest)
- **Task Queue (if needed):** Celery + Redis (not mandated for Phase 2-3 MVP)
- **Testing:** pytest + pytest-asyncio
- **Linting/Formatting:** ruff (formatter + linter)

**Environment Variables (Required):**
```
DATABASE_URL=postgresql://...           # Neon connection string
BETTER_AUTH_SECRET=...                  # Shared JWT secret
API_PORT=8000
API_HOST=0.0.0.0
LOG_LEVEL=info
ENVIRONMENT=development|production

# Phase III: AI Chatbot
OPENAI_API_KEY=sk-...                   # OpenAI API key
OPENAI_AGENT_MODEL=gpt-4-turbo-preview  # Agent model
OPENAI_AGENT_TEMPERATURE=0.7            # Response creativity (0.0-1.0)
MCP_SERVER_URL=http://localhost:8001    # MCP server (if separate service)
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
- **Chat UI:** OpenAI ChatKit (for conversational interface)
- **Chat State:** React Context for conversation history management
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
│   │   ├── task.py
│   │   ├── user.py
│   │   ├── conversation.py     # Phase III: Conversation history
│   │   └── message.py          # Phase III: Messages
│   ├── schemas/                # Pydantic request/response models
│   ├── services/               # Business logic layer
│   ├── api/                    # Route handlers
│   │   └── v1/
│   │       ├── tasks.py
│   │       ├── users.py
│   │       ├── auth.py
│   │       └── chat.py         # Phase III: Chat endpoint
│   ├── mcp/                    # Phase III: MCP Server
│   │   ├── __init__.py
│   │   ├── server.py           # MCP server initialization
│   │   ├── tools/
│   │   │   ├── task_create.py
│   │   │   ├── task_list.py
│   │   │   ├── task_update.py
│   │   │   └── task_delete.py
│   │   └── agent.py            # OpenAI Agent initialization
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
│   │   ├── tasks/
│   │   │   ├── page.tsx        # Tasks list
│   │   │   └── [id]/
│   │   │       └── page.tsx    # Task detail/edit
│   │   └── chat/               # Phase III: Chat interface
│   │       ├── layout.tsx      # Chat layout (sidebar + main)
│   │       ├── page.tsx        # Chat page with ChatKit
│   │       └── [conversation_id]/
│   │           └── page.tsx    # Conversation detail
│   ├── components/             # Reusable React components
│   │   ├── TaskList.tsx
│   │   ├── TaskForm.tsx
│   │   ├── chat/               # Phase III: Chat components
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── MessageList.tsx
│   │   │   └── MessageInput.tsx
│   │   └── common/
│   ├── lib/                    # Utilities, API clients
│   │   ├── api.ts              # Fetch wrapper with auth
│   │   ├── auth.ts             # Better Auth integration
│   │   └── chat.ts             # Phase III: Chat API helper
│   ├── contexts/               # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── ChatContext.tsx     # Phase III: Conversation state
│   ├── types/                  # TypeScript interfaces
│   │   ├── task.ts
│   │   ├── user.ts
│   │   └── chat.ts             # Phase III: Chat types
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
- [ ] **Phase III Only:** Create MCP tools that access the database directly; all data access MUST go through service methods with `user_id` validation.
- [ ] **Phase III Only:** Allow the AI Agent to store or maintain state between requests; all conversation history MUST come from the backend.
- [ ] **Phase III Only:** Return data from MCP tools without verifying the `user_id` matches the request context.

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

**Version**: 2.0.0 | **Ratified**: 2025-02-08 | **Last Amended**: 2025-02-08
