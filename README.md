# Phase 2: Console to Web Evolution - Task Management Application

A modern, secure, multi-user web application built with **Spec-Driven Development (SDD)** principles. This project evolves from a basic console task manager to a full-stack web application with JWT authentication and multi-tenant data isolation.

**Status**: 🔄 In Development (SPECIFY ✅ → PLAN ✅ → TASKS → IMPLEMENT)

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Getting Started](#getting-started)
- [Features](#features)
- [Architecture](#architecture)
- [Success Metrics](#success-metrics)
- [Documentation](#documentation)
- [Contributing](#contributing)

---

## 🎯 Project Overview

This is a **Spec-Driven Development (SDD)** monorepo implementing the evolution of a task management system from CLI to web. The project enforces a strict specification-first workflow where:

1. **SPECIFY** ✅ - Define requirements via user stories and acceptance criteria
2. **PLAN** ✅ - Design architecture with component breakdowns
3. **TASKS** 📍 - Break into atomic, testable work units
4. **IMPLEMENT** - Write code with Task ID references

### Key Principles

- **Zero Manual Coding**: No code written without a referenced Task ID
- **Multi-Tenant Isolation**: All data scoped by `user_id` at every layer
- **JWT Security**: Better Auth integration with stateless backend
- **AI Governance**: Every session recorded as Prompt History Records (PHR)

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 16+ (React)
- **Language**: TypeScript
- **Auth**: Better Auth with JWT
- **Form Validation**: React Hook Form + Zod
- **Styling**: Tailwind CSS (responsive design)
- **HTTP Client**: Fetch API with Bearer token injection

### Backend
- **Framework**: FastAPI (Python 3.9+)
- **ORM**: SQLModel (SQLAlchemy + Pydantic)
- **Authentication**: JWT via Better Auth bridge
- **Validation**: Pydantic models
- **Password Hashing**: bcrypt

### Database
- **Database**: PostgreSQL (via Neon)
- **Migrations**: Alembic
- **Connection Pooling**: Built-in Neon pooling
- **Timezone Support**: UTC for all timestamps

### DevOps
- **Version Control**: GitHub (Git)
- **Package Manager**: npm (frontend), uv (backend)
- **Spec Framework**: Spec-Kit

---

## 📁 Project Structure

```
phase_2/
├── backend/                          # FastAPI backend
│   ├── src/
│   │   ├── main.py                  # FastAPI app entry
│   │   ├── config.py                # Configuration
│   │   ├── middleware/              # JWT verification
│   │   ├── models/                  # SQLModel entities
│   │   ├── schemas/                 # Request/response models
│   │   ├── services/                # Business logic
│   │   ├── api/v1/                  # REST endpoints
│   │   └── db/                      # Database setup
│   ├── alembic/                     # Database migrations
│   ├── tests/                       # Unit & integration tests
│   └── pyproject.toml               # Dependencies
│
├── frontend/                         # Next.js frontend
│   ├── src/
│   │   ├── app/                     # App Router pages
│   │   ├── components/              # React components
│   │   ├── contexts/                # React Context (Auth)
│   │   ├── lib/                     # Utilities (auth, api)
│   │   ├── types/                   # TypeScript interfaces
│   │   └── styles/                  # Tailwind config
│   ├── tests/                       # Component tests
│   └── package.json                 # Dependencies
│
├── specs/                           # Specifications (SDD)
│   └── 001-sdd-initialization/
│       ├── spec.md                  # Feature specifications
│       ├── overview.md              # Project overview
│       ├── plan.md                  # Architecture plan
│       ├── features/                # Feature specs
│       ├── api/                     # API endpoint specs
│       ├── database/                # Database schema specs
│       ├── ui/                      # UI component specs
│       └── checklists/              # Quality validation
│
├── history/                         # Prompt History Records (PHR)
│   └── prompts/                     # AI agent session logs
│
├── AGENTS.md                        # Agent workflow guidelines
├── CLAUDE.md                        # Claude Code configuration
└── README.md                        # This file
```

---

## 🚀 Development Workflow (SDD Lifecycle)

### Phase 1: Specification (✅ COMPLETE)

All requirements defined in `/specs/001-sdd-initialization/`:

- **4 User Stories** with acceptance scenarios
- **50+ Acceptance Criteria** across all specs
- **11 REST Endpoints** documented
- **3 Database Entities** with FK relationships
- **5 UI Pages** with responsive design patterns

**Quality**: 27/27 specification checklist items passed ✅

### Phase 2: Planning (✅ COMPLETE)

Architecture designed in `plan.md`:

- **5 Sequential Implementation Steps**
- **Component Breakdown** with dependencies
- **System Architecture Diagram** (5-layer design)
- **JWT Data Flow** from frontend → backend → database
- **Task Breakdown Structure** (60+ atomic tasks)

**Validated**: All Constitutional principles verified ✅

### Phase 3: Task Breakdown (📍 NEXT)

Atomic task generation:
- Break plan into 60+ testable tasks (T001-T059+)
- Link each task to spec sections
- Define preconditions and expected outputs
- Create task dependency graph

### Phase 4: Implementation (⏳ FUTURE)

Code generation with task references:
- Every file includes `Task ID` comment
- Every commit references spec section
- Tests verify acceptance criteria
- Integration testing before merge

---

## 🏃 Getting Started

### Prerequisites

- Node.js 18+ (frontend)
- Python 3.9+ (backend)
- PostgreSQL 14+ (or Neon account)
- Git

### Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Setup environment variables
cp .env.example .env
# Edit .env with your database URL and Better Auth secret

# 5. Run database migrations
alembic upgrade head

# 6. Start development server
uvicorn src.main:app --reload
```

**API runs on**: http://localhost:8000

### Frontend Setup

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local
# Edit with your API base URL

# 4. Start development server
npm run dev
```

**App runs on**: http://localhost:3000

---

## ✨ Features

### Phase 1: Core Task Management (In Progress)

#### 🔐 Authentication
- User registration with email verification
- Secure login with JWT tokens
- HTTP-only cookie storage
- Password reset flow
- Token refresh mechanism
- Logout with token revocation

#### 📋 Task Management
- Create tasks with title and description
- View paginated task list
- Filter by status (Pending, In Progress, Completed, Archived)
- Update task details
- Delete tasks (hard delete)
- Multi-user isolation (cannot see others' tasks)

#### 🎨 User Interface
- Responsive design (mobile, tablet, desktop)
- Login page with form validation
- Registration flow
- Dashboard with task list
- Create/edit task forms
- Password reset interface

#### 🔒 Security
- Multi-tenant isolation via `user_id` scoping
- All API endpoints validated with JWT
- Database Foreign Keys enforce relationships
- Password hashing with bcrypt
- Secure token refresh patterns

### Phase 2: Collaboration (Out of Scope)
- Task sharing with team members
- Shared task lists
- Comments and activity feeds
- Notifications

### Phase 3: Advanced (Out of Scope)
- Multi-factor authentication (MFA)
- OAuth2 social login
- Team workspaces
- Advanced reporting
- Mobile native app

---

## 🏗 Architecture

### 5-Layer System Design

```
┌─────────────────────────────────────┐
│      Frontend (Next.js 16)          │
│  Login → Register → Dashboard       │
├─────────────────────────────────────┤
│   HTTP/HTTPS with Bearer Tokens     │
├─────────────────────────────────────┤
│     Backend API (FastAPI)           │
│  11 REST Endpoints + JWT Middleware │
├─────────────────────────────────────┤
│     ORM Layer (SQLModel)            │
│  User, Task, RefreshToken entities  │
├─────────────────────────────────────┤
│   Database (PostgreSQL/Neon)        │
│  users, tasks, refresh_tokens       │
└─────────────────────────────────────┘
```

### JWT Security Flow

```
1. User logs in → API issues JWT token
2. Token stored in HTTP-only cookie
3. Frontend sends: Authorization: Bearer <JWT>
4. Backend JWT middleware extracts user_id from claims
5. user_id passed to all services for query filtering
6. User can only access their own resources
```

### User Isolation Pattern

```python
# Every database query filters by user_id
SELECT * FROM tasks
WHERE user_id = <extracted_from_jwt>  # Constitution Principle III

# Every endpoint enforces ownership
PATCH /api/v1/tasks/{id}
→ Verify task.user_id == request.state.user_id
→ Return 403 Forbidden if mismatch
```

---

## 📊 Success Metrics

### Functionality
- ✅ All 11 REST endpoints implemented
- ✅ Task CRUD operations fully functional
- ✅ Authentication flows complete
- ✅ Email verification working

### Security
- ✅ Zero cross-user data access
- ✅ Passwords hashed with bcrypt
- ✅ Tokens in HTTP-only cookies
- ✅ user_id isolation at all layers

### Performance
- ✅ Create/update operations < 1 second
- ✅ List operations with pagination < 1 second
- ✅ Authentication < 500ms

### Quality
- ✅ 27/27 specification checks passed
- ✅ 100% acceptance criteria testable
- ✅ Cross-specification consistency verified
- ✅ All edge cases identified

---

## 📚 Documentation

### Specifications (Primary Source of Truth)

| Document | Purpose | Location |
|----------|---------|----------|
| **spec.md** | Feature requirements & user stories | `/specs/001-sdd-initialization/spec.md` |
| **overview.md** | Project vision & evolution | `/specs/001-sdd-initialization/overview.md` |
| **plan.md** | Architecture & implementation roadmap | `/specs/001-sdd-initialization/plan.md` |
| **task-crud.md** | Task management specifications | `/specs/001-sdd-initialization/features/task-crud.md` |
| **authentication.md** | Auth flow specifications | `/specs/001-sdd-initialization/features/authentication.md` |
| **rest-endpoints.md** | 11 REST API contracts | `/specs/001-sdd-initialization/api/rest-endpoints.md` |
| **schema.md** | Database entity definitions | `/specs/001-sdd-initialization/database/schema.md` |
| **pages.md** | UI component & page specs | `/specs/001-sdd-initialization/ui/pages.md` |

### Agent Guidelines

- **AGENTS.md** - How AI agents must follow SDD principles
- **CLAUDE.md** - Claude Code configuration

---

## 🤝 Contributing

### Code Submission Rules (SDD Enforcement)

Every code contribution MUST include:

1. **Task ID Reference**: `# Task ID: T025` in file header
2. **Specification Link**: Comment citing spec section (e.g., `@specs/001-sdd-initialization/features/task-crud.md`)
3. **Acceptance Criteria**: Code matches spec exactly (no additions beyond spec)
4. **Test Coverage**: Tests verify acceptance scenarios

### Example Code Comment

```python
# Task ID: T025
# From: @specs/001-sdd-initialization/api/rest-endpoints.md §POST /api/v1/tasks
# Purpose: Create task with automatic user_id association
@router.post("/api/v1/tasks")
async def create_task(request: CreateTaskRequest, user_id: str = Depends(extract_user_id)):
    """Create a new task associated with authenticated user."""
    # Implementation follows spec exactly
```

### Commit Message Format

```
[TASK-ID] Brief description of what changed

Why this change:
- Reference to spec section
- Link to acceptance criteria
- Why it matters

Testing:
- What was tested
- How to verify
```

---

## 🐛 Known Issues & Limitations

### Phase 1 Scope

- ❌ No task sharing/collaboration
- ❌ No notifications
- ❌ No file attachments
- ❌ No advanced reporting
- ❌ No OAuth2 social login (Phase 3)

### Current Status

- 📝 Specifications complete (27/27 checks ✅)
- 🏗 Architecture planned (all principles verified ✅)
- ⏳ Tasks pending generation (Phase 3)
- ⏳ Implementation pending (Phase 4)

---

## 📞 Support

### Documentation
- Read specifications in `/specs/001-sdd-initialization/`
- Check Architecture Overview in `plan.md`
- Review user stories in `spec.md`

### Feedback & Issues
- GitHub Issues: For bugs and feature requests
- GitHub Discussions: For questions and ideas
- PHR Records: Check `/history/prompts/` for AI agent session logs

---

## 📜 License

[Your License Here]

---

## 🔗 Related Links

- **Spec-Kit Documentation**: https://github.com/anthropics/spec-kit
- **FastAPI**: https://fastapi.tiangolo.com/
- **Next.js**: https://nextjs.org/
- **SQLModel**: https://sqlmodel.tiangolo.com/
- **Better Auth**: https://www.better-auth.com/

---

## 👥 Team

**Project**: Spec-Driven Development Task Management Application
**Phase**: 2 (Console to Web Evolution)
**Status**: 🔄 In Development
**Last Updated**: 2026-01-22

---

**Next Step**: Phase 3 - Task Generation (`/sp.tasks`) to break plan into atomic work units

