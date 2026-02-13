# Project Overview: Console to Web Evolution

**Project**: Spec-Driven Development (SDD) Task Management Application
**Branch**: `001-sdd-initialization`
**Created**: 2026-01-22
**Status**: Overview Document

---

## Executive Summary

This project represents the evolution of a task management system from a command-line console application to a modern web-based platform. The system is designed with multi-tenant architecture, emphasizing security through user_id-based data isolation and implementing a JWT-based Bearer token authentication system.

---

## Project Vision

Transform a basic console task manager into a scalable, secure, multi-user web application that prioritizes:

1. **Data Security**: Strict multi-tenant isolation via user_id scoping at every layer
2. **Developer Efficiency**: Spec-Driven Development (SDD) workflow prevents vague requirements and ensures alignment
3. **User Experience**: Intuitive web interface with responsive design across devices
4. **System Reliability**: Complete authentication flow, persistent data storage, and error handling

---

## Console → Web Evolution

### Phase 0: Console Application (Baseline)

**Characteristics**:
- Single-user command-line interface
- Local file storage or simple database
- No authentication required
- Basic CRUD operations (Create, Read, Update, Delete)
- Manual task management via CLI commands

**Example Commands**:
```bash
task add "Buy groceries"
task list
task complete 1
task delete 2
```

**Limitations**:
- ❌ No multi-user support
- ❌ No authentication/authorization
- ❌ No data isolation between users
- ❌ No concurrent access handling
- ❌ Limited user experience (CLI only)

---

### Phase 1: Web Application (This Project)

**Transition**: Evolve from console to web with multi-tenant architecture

#### Backend Evolution
```
Console (Python CLI)
    ↓
FastAPI REST API
    + JWT Authentication
    + Database (PostgreSQL via Neon)
    + SQLModel ORM
    + User_id scoping on all endpoints
```

#### Frontend Evolution
```
Console (Terminal)
    ↓
Next.js 16 Web Application
    + Login/Registration
    + Dashboard with task list
    + Create/Edit/Delete interface
    + Responsive design
    + Session management via HTTP-only cookies
```

#### Authentication Evolution
```
No Auth (Console)
    ↓
JWT Bearer Tokens
    + Email verification
    + Secure password hashing
    + Token refresh mechanism
    + HTTP-only cookie storage
    + User isolation enforcement
```

#### Data Model Evolution
```
Single File/Simple DB
    ↓
PostgreSQL (Neon)
    + User table (authentication)
    + Task table (with user_id FK)
    + RefreshToken table (session management)
    + Indexes for performance
    + Constraints for data integrity
```

---

## Architecture Overview

### Layers

```
┌─────────────────────────────────────────────────────┐
│           Frontend (Next.js 16)                     │
│  Login → Register → Dashboard → Task CRUD Pages     │
├─────────────────────────────────────────────────────┤
│           HTTP/HTTPS with Bearer Tokens             │
├─────────────────────────────────────────────────────┤
│           Backend API (FastAPI)                     │
│  11 REST Endpoints:                                 │
│  - Auth (register, login, logout, refresh, reset)  │
│  - Tasks (POST, GET list, GET single, PATCH, DEL)  │
├─────────────────────────────────────────────────────┤
│           ORM Layer (SQLModel)                      │
│  - User Entity                                      │
│  - Task Entity (with user_id FK)                    │
│  - RefreshToken Entity                              │
├─────────────────────────────────────────────────────┤
│           Database (Neon PostgreSQL)                │
│  - users table (unique email, password_hash)       │
│  - tasks table (FK to users, indexed by user_id)   │
│  - refresh_tokens table (session management)        │
└─────────────────────────────────────────────────────┘
```

### Cross-Cutting Concerns

**User_id Isolation**:
- Every endpoint extracts user_id from JWT token
- All queries filtered by user_id
- Database foreign keys enforce relationships
- Cannot access other users' data

**Authentication**:
- JWT tokens issued on login
- Tokens contain user_id (subject claim)
- Refresh token mechanism extends sessions
- HTTP-only cookies prevent XSS attacks

**Data Integrity**:
- Foreign keys maintain relationships
- NOT NULL constraints prevent invalid states
- CHECK constraints enforce enum values
- Indexes optimize query performance

---

## Key Features

### 1. User Authentication & Authorization

**Registration Flow**:
1. User provides email and password
2. System validates format and strength
3. Password hashed with bcrypt (never stored plaintext)
4. Verification email sent
5. User confirms email to activate account

**Login Flow**:
1. User enters email and password
2. System validates credentials
3. JWT token issued and stored in HTTP-only cookie
4. User redirected to dashboard
5. Token sent with every subsequent request

**Token Management**:
- Access token: 1 hour expiration
- Refresh token: 30 day expiration
- Automatic refresh on expiration
- Logout revokes tokens

**Password Reset**:
1. User requests reset via email
2. Secure reset link sent (24 hour validity)
3. User sets new password via reset link
4. Can re-authenticate with new password

---

### 2. Task Management with User Isolation

**Create Task**:
- User provides title and optional description
- System automatically associates with user_id
- Task assigned "Pending" status
- Timestamps (created_at, updated_at) recorded

**View Tasks**:
- User sees only their tasks
- Dashboard displays paginated list
- Filters by status (Pending, In Progress, Completed, Archived)
- Sorting options (newest, oldest, title)

**Update Task**:
- User can modify title, description, status
- Updated_at timestamp automatically updated
- Only owner can modify task

**Delete Task**:
- Hard delete (permanent removal)
- Only owner can delete
- Attempting to access deleted task returns 404

**User Isolation**:
- User A cannot see User B's tasks
- API returns 403 Forbidden for unauthorized access
- Database query includes WHERE user_id = :user_id
- Cannot be bypassed via API or direct database query

---

### 3. Multi-Tenant Data Isolation

**Database Level**:
- user_id Foreign Key on all user-scoped tables
- CASCADE DELETE: Deleting user deletes all their tasks
- Indexes on (user_id) for fast filtering
- Composite indexes like (user_id, created_at DESC) for efficient sorting

**API Level**:
- user_id extracted from JWT token
- Every request validated: token.user_id must match requested resource owner
- Returns 401 Unauthorized for invalid/expired tokens
- Returns 403 Forbidden for permission violations

**Query Level**:
- All queries include WHERE user_id = :user_id
- ORM enforces this at model level
- Cannot accidentally query other users' data
- Anti-pattern: No bare queries without user_id filter

**Testing Level**:
- Every test scenario verifies user isolation
- Test cases explicitly check: "User A cannot access User B's data"
- Cross-user data isolation is security-critical acceptance criterion

---

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (React)
- **Language**: TypeScript
- **Styling**: (Technology-agnostic in specs)
- **HTTP Client**: Fetch API with Bearer token handling
- **State Management**: Context API or similar
- **Authentication Storage**: HTTP-only cookies (set by server)

### Backend
- **Framework**: FastAPI (Python)
- **Language**: Python 3.9+
- **ORM**: SQLModel (SQLAlchemy + Pydantic)
- **Authentication**: JWT tokens via Better Auth bridge
- **Password Hashing**: bcrypt
- **Validation**: Pydantic models

### Database
- **Database**: PostgreSQL (via Neon)
- **Migrations**: Alembic (database versioning)
- **Connection Pooling**: Built into Neon
- **Timezone Support**: UTC for all timestamps

### DevOps & Infrastructure
- **API Hosting**: (Deployment choice)
- **Frontend Hosting**: (Deployment choice)
- **Database Hosting**: Neon DB (managed PostgreSQL)
- **Source Control**: GitHub
- **CI/CD**: (Infrastructure choice)

---

## Development Workflow

### Spec-Driven Development (SDD) Lifecycle

```
1. SPECIFY (This Phase)
   ├─ Write detailed specifications
   ├─ Define user stories and requirements
   ├─ Create acceptance criteria
   └─ Validate completeness
       ↓
2. PLAN (Next Phase)
   ├─ Design architecture
   ├─ Break down into components
   ├─ Create data flow diagrams
   └─ Verify alignment with specs
       ↓
3. TASKS (Phase After)
   ├─ Create atomic tasks from plan
   ├─ Link tasks back to specs
   ├─ Prioritize by value
   └─ Estimate effort (optional)
       ↓
4. IMPLEMENT (Final Phase)
   ├─ Write code for each task
   ├─ Reference task ID in every file
   ├─ Follow plan exactly
   └─ No creative additions without spec update
       ↓
5. VERIFY (Continuous)
   ├─ Test against acceptance criteria
   ├─ Verify user_id isolation
   ├─ Check cross-specification consistency
   └─ Update specs if requirements change
```

### No Manual Coding Rule

Every piece of code must:
1. ✅ Have a source Task ID
2. ✅ Have that Task ID link to specification
3. ✅ Follow exact requirements from spec (no additions)
4. ✅ Include comment citing spec section

**Example**:
```python
# Task ID: 001-tasks-create
# From: @specs/001-sdd-initialization/features/task-crud.md §User Story 1
# Purpose: Create task with automatic user_id association
@router.post("/api/tasks")
async def create_task(request: CreateTaskRequest, user_id: str = Depends(extract_user_id)) -> TaskResponse:
    """Create a new task associated with authenticated user."""
    # Implementation...
```

---

## Success Metrics

### Functionality
- ✅ All 11 REST endpoints implemented and working
- ✅ Task CRUD operations fully functional
- ✅ Authentication flows complete
- ✅ Email verification working

### Security
- ✅ Zero instances of cross-user data access
- ✅ All passwords hashed, never stored plaintext
- ✅ Tokens stored in HTTP-only cookies
- ✅ user_id isolation verified at all layers

### Performance
- ✅ Create/update operations < 1 second
- ✅ List operations with pagination < 1 second
- ✅ Authentication < 500ms on success/failure

### User Experience
- ✅ Responsive design on mobile, tablet, desktop
- ✅ Form validation with clear error messages
- ✅ Smooth authentication and session management
- ✅ Intuitive task management interface

### Quality
- ✅ 27/27 specification quality checks passed
- ✅ 100% of acceptance criteria testable
- ✅ Cross-specification consistency verified
- ✅ All edge cases identified and planned

---

## Scope & Boundaries

### In Scope (Phase 1)

**Authentication**:
- ✅ User registration
- ✅ Email verification
- ✅ Login/logout
- ✅ Password reset
- ✅ Token refresh

**Task Management**:
- ✅ Create tasks
- ✅ View task list (paginated)
- ✅ View single task
- ✅ Update tasks
- ✅ Delete tasks
- ✅ Filter by status

**UI/UX**:
- ✅ Login page
- ✅ Registration page
- ✅ Dashboard with task list
- ✅ Create/edit task pages
- ✅ Password reset flow

**Security**:
- ✅ User_id isolation
- ✅ JWT authentication
- ✅ Password hashing
- ✅ Email verification

### Out of Scope (Future Phases)

**Phase 2 Features**:
- ❌ Task sharing/collaboration
- ❌ Task templates/recurrence
- ❌ Notifications
- ❌ File attachments
- ❌ Comments/activity feed

**Phase 3+ Features**:
- ❌ Multi-factor authentication (MFA)
- ❌ OAuth2 social login
- ❌ Team workspaces
- ❌ Advanced reporting
- ❌ Mobile native app

---

## Risk Mitigation

### Security Risks
**Risk**: Cross-user data access vulnerabilities
**Mitigation**:
- ✅ user_id scoping explicit in all layers
- ✅ Every acceptance scenario tests isolation
- ✅ Database Foreign Keys enforce relationships

**Risk**: Password security
**Mitigation**:
- ✅ bcrypt hashing with salt
- ✅ Strong password requirements
- ✅ Reset flow uses secure tokens

**Risk**: Token compromise
**Mitigation**:
- ✅ HTTP-only cookies (not accessible to JavaScript)
- ✅ Short-lived access tokens (1 hour)
- ✅ Long-lived refresh tokens (30 days)

### Technical Risks
**Risk**: Database performance under load
**Mitigation**:
- ✅ Indexes on (user_id) for fast filtering
- ✅ Pagination for list endpoints
- ✅ Neon DB managed infrastructure

**Risk**: Incomplete specifications
**Mitigation**:
- ✅ 27/27 quality checks passed
- ✅ All 40+ acceptance scenarios defined
- ✅ Cross-specification consistency verified

---

## Timeline & Phases

```
Phase 0: Console App (Baseline) - COMPLETE
Phase 1: Web Application (This Project)
  ├─ SPECIFY (In Progress) ✅
  ├─ PLAN (Next)
  ├─ TASKS (After PLAN)
  └─ IMPLEMENT (After TASKS)

Phase 2: Collaboration Features
  ├─ Task sharing
  ├─ Shared lists
  ├─ Comments & activity
  └─ Notifications

Phase 3: Advanced Features
  ├─ Team workspaces
  ├─ MFA & OAuth2
  ├─ Advanced reporting
  └─ Mobile app
```

---

## How to Read This Overview

1. **For Non-Technical Stakeholders**: Read Executive Summary and Project Vision
2. **For Product Managers**: Read Architecture Overview and Scope & Boundaries
3. **For Architects**: Read Technology Stack, Architecture Overview, and Development Workflow
4. **For Developers**: Read Phase 1 features, Technology Stack, and No Manual Coding Rule
5. **For QA/Testers**: Read Success Metrics and Scope & Boundaries

---

## Related Specifications

- **Main Spec**: `@specs/001-sdd-initialization/spec.md` - Project requirements
- **Task CRUD**: `@specs/001-sdd-initialization/features/task-crud.md` - Task operations
- **Authentication**: `@specs/001-sdd-initialization/features/authentication.md` - Auth flows
- **REST API**: `@specs/001-sdd-initialization/api/rest-endpoints.md` - API contract
- **Database**: `@specs/001-sdd-initialization/database/schema.md` - Data models
- **UI Pages**: `@specs/001-sdd-initialization/ui/pages.md` - Web interface
- **Quality**: `@specs/001-sdd-initialization/checklists/requirements.md` - Validation

---

## Conclusion

This overview documents the evolution from a simple console task manager to a modern, secure, multi-user web application. The SDD approach ensures that every implementation step maps back to explicit specifications, preventing "vibe coding" and enabling AI agents and humans to collaborate effectively.

**Status**: ✅ Overview Complete
**Next Step**: Proceed to `/sp.plan` for architectural design
