# Task: T019 | Spec: specs/001-sdd-initialization/tasks.md §Database Schema & Entities
# Constitution III: User Isolation - User entity with relationship enforcing data separation

"""User SQLModel entity for authentication and user data."""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from sqlmodel import Field, Relationship, SQLModel

from src.utils.datetime import utc_now
from src.utils.uuid import uuid4_str


class User(SQLModel, table=True):
    """
    User entity for authentication and profile management.

    Constitution III: User Isolation - Every user record is the root of their data hierarchy.
    All other entities (Task, RefreshToken) have user_id foreign key for strict isolation.

    Table: users
    Primary Key: id (UUID)
    Unique Index: email
    """

    # Primary Key
    id: str = Field(
        default_factory=uuid4_str,
        primary_key=True,
        description="User ID (UUID)",
    )

    # Authentication
    email: str = Field(
        ...,
        min_length=5,
        max_length=255,
        unique=True,
        index=True,
        description="User email (unique, indexed)",
    )

    password_hash: str = Field(
        ...,
        max_length=60,
        description="Bcrypt password hash (60 chars)",
    )

    # Status
    is_verified: bool = Field(
        default=False,
        description="Email verification status",
    )

    # Timestamps (Constitution IV - Stateless Backend)
    created_at: datetime = Field(
        default_factory=utc_now,
        description="Account creation timestamp (UTC)",
    )

    updated_at: datetime = Field(
        default_factory=utc_now,
        description="Last account update timestamp (UTC)",
    )

    # Relationships (cascade delete for data consistency)
    # Note: Relationships are defined at database level via foreign keys.
    # SQLModel relationships will be used in Phase 4+ when loading related data.
    # For Phase 3 (auth), we only need direct User queries.
    # tasks: Optional[List[Task]] = Relationship(back_populates="user", cascade_delete=True)
    # refresh_tokens: Optional[List[RefreshToken]] = Relationship(back_populates="user", cascade_delete=True)
