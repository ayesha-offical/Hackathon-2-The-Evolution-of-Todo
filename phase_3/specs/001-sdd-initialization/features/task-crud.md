# Feature Specification: Task CRUD Operations with User Isolation

**Feature Branch**: `001-sdd-initialization`
**Feature Path**: `@specs/001-sdd-initialization/features/task-crud.md`
**Created**: 2026-01-22
**Status**: Draft

---

## Overview

This specification defines CRUD (Create, Read, Update, Delete) operations for tasks with strict user isolation. Every task belongs to exactly one user (identified by user_id), and users can only access their own tasks.

---

## User Scenarios & Testing

### User Story 1 - Create a Task (Priority: P1)

As a user, I need to create a new task with a title and description so that I can track work items I need to complete.

**Why this priority**: Task creation is the foundational feature. Without this, users cannot manage any work.

**Independent Test**: Can be fully tested by creating a task and verifying it appears in the user's task list with the correct data.

**Acceptance Scenarios**:

1. **Given** I am an authenticated user, **When** I create a task with title "Buy groceries" and description "Milk, eggs, bread", **Then** the task is created and associated with my user_id
2. **Given** I create a task, **When** I refresh the page, **Then** the task persists and I can retrieve it
3. **Given** another user exists, **When** they attempt to access my task via the API, **Then** they receive a 403 Forbidden response

---

### User Story 2 - View My Tasks (Priority: P1)

As a user, I need to view all my tasks so that I can see what work is pending.

**Why this priority**: Task viewing is essential for the dashboard experience. Users need visibility into their own tasks.

**Independent Test**: Can be fully tested by creating multiple tasks and verifying the list endpoint returns only tasks belonging to the authenticated user.

**Acceptance Scenarios**:

1. **Given** I have 3 tasks in the system, **When** I fetch my task list, **Then** I receive exactly 3 tasks
2. **Given** another user creates tasks, **When** I fetch my task list, **Then** I only see my tasks (cross-user data isolation confirmed)
3. **Given** I fetch tasks without authentication, **When** the API receives the request, **Then** it returns 401 Unauthorized

---

### User Story 3 - Update a Task (Priority: P1)

As a user, I need to update my task details (title, description, status) so that I can keep my task information current.

**Why this priority**: Task updates enable task management workflows and status tracking.

**Independent Test**: Can be fully tested by updating a task field and verifying the change persists in the system.

**Acceptance Scenarios**:

1. **Given** I own a task, **When** I update the title to "Buy groceries (Priority)", **Then** the change is saved
2. **Given** I own a task with status "Pending", **When** I update it to "In Progress", **Then** the status change persists
3. **Given** another user owns a task, **When** I attempt to update it, **Then** I receive a 403 Forbidden response

---

### User Story 4 - Delete a Task (Priority: P2)

As a user, I need to delete tasks so that I can remove completed or irrelevant work items.

**Why this priority**: Task deletion is important for cleanup but less critical than CRUD read/write operations.

**Independent Test**: Can be fully tested by deleting a task and verifying it no longer appears in the list.

**Acceptance Scenarios**:

1. **Given** I own a task, **When** I delete it, **Then** it is removed from my task list
2. **Given** a task is deleted, **When** I attempt to fetch it by ID, **Then** I receive a 404 Not Found response
3. **Given** another user owns a task, **When** I attempt to delete it, **Then** I receive a 403 Forbidden response

---

### Edge Cases

- What happens when a user tries to create a task with an empty title?
- How does the system handle concurrent updates to the same task from the same user?
- What occurs if a task is deleted while another user's request references it?
- How does pagination work when a user has 1000+ tasks?

---

## Requirements

### Functional Requirements

- **FR-001**: Users MUST be able to create a task with a title and optional description
- **FR-002**: Every task MUST be automatically associated with the creating user's user_id
- **FR-003**: Users MUST be able to view a paginated list of their own tasks only
- **FR-004**: System MUST return only tasks belonging to the authenticated user (cross-user isolation)
- **FR-005**: Users MUST be able to update task title, description, and status fields
- **FR-006**: Users MUST NOT be able to update tasks that do not belong to them (403 Forbidden)
- **FR-007**: Users MUST be able to delete their own tasks
- **FR-008**: Users MUST NOT be able to delete tasks that do not belong to them (403 Forbidden)
- **FR-009**: System MUST include a created_at timestamp on all tasks
- **FR-010**: System MUST include an updated_at timestamp that reflects the last modification time
- **FR-011**: Deleted tasks MUST return 404 Not Found on subsequent access attempts
- **FR-012**: Task status MUST be one of: "Pending", "In Progress", "Completed", "Archived"

### Key Entities

- **Task**: Represents a single work item with:
  - `id`: Unique identifier (auto-generated)
  - `user_id`: Reference to the owning user (required for isolation)
  - `title`: Task title (required, non-empty string)
  - `description`: Detailed task description (optional)
  - `status`: Current status (enum: Pending, In Progress, Completed, Archived)
  - `created_at`: ISO 8601 timestamp
  - `updated_at`: ISO 8601 timestamp

- **User**: System actor identified by:
  - `id`: Unique user identifier
  - Implicit scoping of all owned tasks via user_id

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can create a task in under 1 second (average response time)
- **SC-002**: Users can fetch their task list (up to 100 tasks) in under 1 second
- **SC-003**: 100% of API responses include proper status codes (200, 400, 401, 403, 404)
- **SC-004**: All task modification endpoints validate user_id match with authenticated user
- **SC-005**: Cross-user data isolation test passes: User A cannot retrieve User B's tasks via any endpoint
- **SC-006**: Task persistence test passes: Tasks created and updated persist across server restarts
- **SC-007**: Concurrent update handling: System correctly handles simultaneous updates to different tasks
- **SC-008**: Pagination works correctly: Users with 100+ tasks can retrieve them in pages of configurable size

---

## Assumptions

1. Users are authenticated via JWT Bearer tokens (see authentication.md)
2. The user_id is extracted from the JWT token and validated for each request
3. Database automatically enforces UNIQUE constraint on task ids
4. Timestamps are stored in UTC and returned in ISO 8601 format
5. Task status is a simple enum (no complex state machine required initially)
6. Soft deletes are not required (hard deletes only)
7. There are no shared tasks or collaborative features in this phase
8. No audit trail or task history is required (only current state)

---

## Cross-References

- **Authentication**: `@specs/001-sdd-initialization/features/authentication.md` - User authentication and JWT tokens
- **REST API**: `@specs/001-sdd-initialization/api/rest-endpoints.md` - API endpoint contracts
- **Database Schema**: `@specs/001-sdd-initialization/database/schema.md` - SQLModel Task entity definition
- **UI Pages**: `@specs/001-sdd-initialization/ui/pages.md` - Dashboard task display and forms

---

## Notes

The core principle of this specification is **user_id-based isolation**. Every acceptance scenario, acceptance criterion, and database query must verify that:

1. Only the authenticated user's data is visible to them
2. Attempts to access other users' tasks are rejected with 403
3. User_id is automatically set from the authenticated session (not from user input)

This ensures multi-tenant security by default.
