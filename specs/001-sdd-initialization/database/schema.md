# Database Specification: Schema and Entity Models

**Feature Branch**: `001-sdd-initialization`
**Database Path**: `@specs/001-sdd-initialization/database/schema.md`
**Created**: 2026-01-22
**Status**: Draft

---

## Overview

This specification defines the database schema using SQLModel (ORM layer) and Neon DB (PostgreSQL). All tables are designed with explicit user_id scoping for multi-tenant data isolation.

---

## Data Model Diagram

```
┌─────────────────────┐
│      User           │
│─────────────────────│
│ id (PK)             │
│ email (UNIQUE)      │
│ password_hash       │
│ is_verified         │
│ created_at          │
│ updated_at          │
└────────┬────────────┘
         │ 1
         │
         │ N
         │
┌────────▼────────────┐
│      Task           │
│─────────────────────│
│ id (PK)             │
│ user_id (FK, UNIQUE)│
│ title               │
│ description         │
│ status              │
│ created_at          │
│ updated_at          │
└─────────────────────┘


┌──────────────────────┐
│   RefreshToken       │
│──────────────────────│
│ id (PK)              │
│ user_id (FK)         │
│ token_hash           │
│ expires_at           │
│ revoked_at           │
│ created_at           │
└──────────────────────┘
```

---

## Entity Definitions

### User Entity

Represents a registered user account.

**SQLModel Definition**:
```python
class User(SQLModel, table=True):
    """User account with authentication credentials"""
    __tablename__ = "users"

    # Primary Key
    id: str = Field(primary_key=True, default_factory=uuid4_str)

    # Authentication
    email: str = Field(unique=True, index=True, min_length=5, max_length=255)
    password_hash: str = Field(min_length=60)  # bcrypt hash (60 chars)

    # Account Status
    is_verified: bool = Field(default=False)

    # Timestamps
    created_at: datetime = Field(default_factory=utc_now, sa_column=Column(DateTime(timezone=True)))
    updated_at: datetime = Field(default_factory=utc_now, sa_column=Column(DateTime(timezone=True)))

    # Relationships
    tasks: List["Task"] = Relationship(back_populates="user", cascade_delete=True)
    refresh_tokens: List["RefreshToken"] = Relationship(back_populates="user", cascade_delete=True)
```

**Indexes**:
- Primary: `id`
- Unique: `email`
- Regular: `email` (for fast lookups)

**Constraints**:
- `UNIQUE(email)` - No duplicate email accounts
- `NOT NULL` on: id, email, password_hash, is_verified, created_at, updated_at

**Timestamp Handling**:
- `created_at`: Set once on creation, never updated
- `updated_at`: Set on creation, updated on every account change

---

### Task Entity

Represents a single task item owned by a user.

**SQLModel Definition**:
```python
class Task(SQLModel, table=True):
    """User task with automatic user_id scoping"""
    __tablename__ = "tasks"

    # Primary Key
    id: str = Field(primary_key=True, default_factory=uuid4_str)

    # Foreign Key (User Isolation)
    user_id: str = Field(foreign_key="users.id", index=True)

    # Task Data
    title: str = Field(min_length=1, max_length=255, nullable=False)
    description: Optional[str] = Field(default=None, max_length=2000)
    status: str = Field(default="Pending", sa_column=Column(Enum("Pending", "In Progress", "Completed", "Archived")))

    # Timestamps
    created_at: datetime = Field(default_factory=utc_now, sa_column=Column(DateTime(timezone=True)))
    updated_at: datetime = Field(default_factory=utc_now, sa_column=Column(DateTime(timezone=True)))

    # Relationships
    user: User = Relationship(back_populates="tasks")
```

**Indexes**:
- Primary: `id`
- Foreign Key: `user_id` (for scoped queries)
- Composite Index: `(user_id, created_at DESC)` (for task list queries)

**Constraints**:
- `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`
- `NOT NULL` on: id, user_id, title, status, created_at, updated_at
- `CHECK (title != '')` - Title must not be empty
- `CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Archived'))`

**Status Enum**:
- `Pending`: Initial state, work not started
- `In Progress`: User is actively working on the task
- `Completed`: Task finished successfully
- `Archived`: Task is no longer relevant (similar to deletion but preserves history)

**Data Isolation**:
- All queries MUST include `WHERE user_id = :user_id`
- ORM should enforce this at the model level for safety
- API layer validates user_id from JWT token matches request scoping

---

### RefreshToken Entity

Represents a long-lived refresh token for session management.

**SQLModel Definition**:
```python
class RefreshToken(SQLModel, table=True):
    """Refresh token for JWT session extension"""
    __tablename__ = "refresh_tokens"

    # Primary Key
    id: str = Field(primary_key=True, default_factory=uuid4_str)

    # Foreign Key
    user_id: str = Field(foreign_key="users.id", index=True)

    # Token Data
    token_hash: str = Field(nullable=False)  # hashed token value

    # Expiration & Revocation
    expires_at: datetime = Field(sa_column=Column(DateTime(timezone=True)), nullable=False)
    revoked_at: Optional[datetime] = Field(default=None, sa_column=Column(DateTime(timezone=True)))

    # Timestamp
    created_at: datetime = Field(default_factory=utc_now, sa_column=Column(DateTime(timezone=True)))

    # Relationships
    user: User = Relationship(back_populates="refresh_tokens")
```

**Indexes**:
- Primary: `id`
- Foreign Key: `user_id`
- Regular: `expires_at` (for cleanup queries)

**Constraints**:
- `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`
- `NOT NULL` on: id, user_id, token_hash, expires_at, created_at
- `CHECK (expires_at > created_at)` - Expiration must be in future

**Revocation**:
- `revoked_at` is NULL if token is valid
- `revoked_at` is set to current timestamp when token is revoked (logout)
- Validation: Token is valid if `revoked_at IS NULL AND expires_at > NOW()`

---

## SQL Migrations

### Schema Creation Script

```sql
-- Create User table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (email != '')
);

CREATE INDEX idx_users_email ON users(email);

-- Create Task table
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000),
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (title != ''),
    CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Archived'))
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_user_created ON tasks(user_id, created_at DESC);

-- Create RefreshToken table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (expires_at > created_at)
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
```

---

## Data Access Patterns

### User Isolation Pattern

**Required Pattern for All Queries**:
```python
# Query with automatic user scoping
user_id = extract_user_id_from_token(request)  # From JWT
tasks = session.query(Task).filter(Task.user_id == user_id).all()

# Anti-pattern (NEVER DO THIS):
# tasks = session.query(Task).filter(Task.id == task_id).all()  # Missing user_id check!
```

**ORM Safety Pattern** (Recommended):
```python
@dataclass
class TaskRepository:
    session: Session

    def get_user_tasks(self, user_id: str, page: int = 1, limit: int = 20):
        """Get tasks with automatic user scoping"""
        query = self.session.query(Task).filter(Task.user_id == user_id)
        return query.order_by(Task.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    def get_task_by_id(self, task_id: str, user_id: str):
        """Get single task with user_id verification"""
        return self.session.query(Task).filter(
            Task.id == task_id,
            Task.user_id == user_id
        ).first()
```

### Timestamp Handling

**On Create**:
- `created_at`: Set to current UTC timestamp
- `updated_at`: Set to current UTC timestamp

**On Update**:
- `updated_at`: Updated to current UTC timestamp
- `created_at`: Never modified

```python
# ORM trigger or application logic
def before_update(mapper, connection, target):
    target.updated_at = datetime.utcnow()
```

---

## Indexes and Performance

### Index Strategy

| Table | Index | Reason |
|---|---|---|
| users | PRIMARY KEY (id) | Fast user lookups by id |
| users | UNIQUE (email) | Fast user lookups by email, enforce uniqueness |
| tasks | PRIMARY KEY (id) | Fast task lookups by id |
| tasks | (user_id) | Filter tasks by user (ESSENTIAL for isolation) |
| tasks | (user_id, created_at DESC) | Efficient task list queries with sorting |
| refresh_tokens | (user_id) | Find tokens for user |
| refresh_tokens | (expires_at) | Cleanup expired tokens |

### Query Optimization

- All user-scoped queries use the `(user_id)` or `(user_id, created_at DESC)` index
- Avoid queries without user_id filter (will do table scan)
- Use pagination to limit result set size

---

## Constraints & Validation

### Data Integrity

| Constraint | Level | Implementation |
|---|---|---|
| Email uniqueness | Database | UNIQUE constraint |
| Email format | Application | Regex validation before save |
| Password strength | Application | Validation before hash |
| user_id existence | Database | FOREIGN KEY constraint |
| Task isolation | Application + Database | Filter by user_id + FOREIGN KEY |
| Status values | Database | CHECK constraint with enum |

---

## Cross-References

- **Authentication Spec**: `@specs/001-sdd-initialization/features/authentication.md` - User entity and token handling
- **Task CRUD Spec**: `@specs/001-sdd-initialization/features/task-crud.md` - Task entity and operations
- **REST API Spec**: `@specs/001-sdd-initialization/api/rest-endpoints.md` - Data returned in API responses

---

## Notes

### Key Design Principles

1. **User_id Scoping**: Every user-scoped table includes `user_id` field with index for fast filtering
2. **CASCADE DELETE**: Deleting a user automatically deletes their tasks and tokens
3. **Immutable Created**: `created_at` never changes once set
4. **Automatic Updated**: `updated_at` automatically updated on any row modification
5. **Soft vs Hard Deletes**: Currently using hard deletes (no archive table); Task.status provides logical archiving
6. **Enum Status**: Task status is constrained to specific values via CHECK constraint

### Future Considerations

- Audit trail table for compliance (if required)
- Soft deletes via `deleted_at` timestamp (if recovery needed)
- Task templates or recurrence patterns (Phase 2)
- Collaborative tasks with sharing (Phase 3)
