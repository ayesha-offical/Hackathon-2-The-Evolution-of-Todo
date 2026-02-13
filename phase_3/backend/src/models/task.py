# Task: T020 | Spec: specs/001-sdd-initialization/tasks.md §Database Schema & Entities
# Constitution III: User Isolation - Task entity with strict user_id foreign key enforcement

"""Task SQLModel entity for todo item management."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel

from src.constants import TaskStatus
from src.utils.datetime import utc_now
from src.utils.uuid import uuid4_str


class Task(SQLModel, table=True):
    """
    Task entity for todo items with user isolation.

    Constitution III: User Isolation - CRITICAL: user_id foreign key enforces strict
    user data isolation. Every database query must filter by user_id.

    Table: tasks
    Primary Key: id (UUID)
    Foreign Key: user_id -> users.id (CRITICAL - Constitution III)
    Indexes: (user_id), (user_id, created_at DESC)
    """

    # Primary Key
    id: str = Field(
        default_factory=uuid4_str,
        primary_key=True,
        description="Task ID (UUID)",
    )

    # Foreign Key (Constitution III - CRITICAL for user isolation)
    user_id: str = Field(
        ...,
        foreign_key="user.id",
        index=True,
        description="User ID (FK to users.id) - CRITICAL for Constitution III",
    )

    # Task Details
    title: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Task title (1-255 chars)",
    )

    description: Optional[str] = Field(
        default=None,
        max_length=2000,
        description="Task description (optional, 0-2000 chars)",
    )

    status: TaskStatus = Field(
        default=TaskStatus.PENDING,
        description="Task status (Pending, In Progress, Completed, Archived)",
    )

    # Timestamps (Constitution IV - Stateless Backend)
    created_at: datetime = Field(
        default_factory=utc_now,
        description="Task creation timestamp (UTC)",
    )

    updated_at: datetime = Field(
        default_factory=utc_now,
        description="Last update timestamp (UTC)",
    )

    # Relationships
    # Note: Relationship to User will be enabled in Phase 4 when eager loading is needed.
    # For Phase 3, user_id FK is sufficient.
    # user: "User" = Relationship(back_populates="tasks")
