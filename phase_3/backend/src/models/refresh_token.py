# Task: T021 | Spec: specs/001-sdd-initialization/tasks.md §Database Schema & Entities
# Constitution III: User Isolation - RefreshToken entity with user_id foreign key

"""RefreshToken SQLModel entity for JWT refresh token management."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel

from src.utils.datetime import utc_now
from src.utils.uuid import uuid4_str


class RefreshToken(SQLModel, table=True):
    """
    RefreshToken entity for managing JWT refresh tokens.

    Constitution III: User Isolation - user_id foreign key for user data isolation.
    Used to track valid refresh tokens and enable token revocation.

    Table: refresh_tokens
    Primary Key: id (UUID)
    Foreign Key: user_id -> users.id (Constitution III)
    Indexes: (user_id), (expires_at)
    """

    # Primary Key
    id: str = Field(
        default_factory=uuid4_str,
        primary_key=True,
        description="Token ID (UUID)",
    )

    # Foreign Key (Constitution III - User Isolation)
    user_id: str = Field(
        ...,
        foreign_key="user.id",
        index=True,
        description="User ID (FK to users.id) - Constitution III",
    )

    # Token Data
    token_hash: str = Field(
        ...,
        description="Hashed refresh token value",
    )

    # Expiration and Revocation
    expires_at: datetime = Field(
        ...,
        index=True,
        description="Token expiration timestamp (UTC)",
    )

    revoked_at: Optional[datetime] = Field(
        default=None,
        description="Token revocation timestamp (if revoked)",
    )

    # Timestamps (Constitution IV - Stateless Backend)
    created_at: datetime = Field(
        default_factory=utc_now,
        description="Token creation timestamp (UTC)",
    )

    # Relationships
    # Note: Relationship to User will be enabled in Phase 4 when eager loading is needed.
    # For Phase 3, user_id FK is sufficient.
    # user: "User" = Relationship(back_populates="refresh_tokens")
