# Task: T301 | Spec: @specs/004-todo-ai-chatbot/spec.md §FR-004
# Constitution III: User Isolation - Conversation entity with strict user_id enforcement
# Constitution IX: Conversation History & Persistence - Database-backed multi-turn state

"""Conversation SQLModel entity for AI chatbot multi-turn interactions."""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from sqlmodel import Field, Relationship, SQLModel

from src.utils.datetime import utc_now
from src.utils.uuid import uuid4_str


class Conversation(SQLModel, table=True):
    """
    Conversation entity for storing multi-turn chat sessions.

    Constitution III: User Isolation - CRITICAL: user_id foreign key enforces strict
    conversation isolation. Every database query must filter by user_id.

    Constitution IX: Conversation History & Persistence - Backend manages all conversation
    state. Conversations are persisted to enable multi-turn interactions and history recall.

    Table: conversations
    Primary Key: id (UUID)
    Foreign Key: user_id -> users.id (CRITICAL - Constitution III)
    Indexes: (user_id, created_at DESC) for efficient user conversation listing
    """

    # Primary Key
    id: str = Field(
        default_factory=uuid4_str,
        primary_key=True,
        description="Conversation ID (UUID)",
    )

    # Foreign Key (Constitution III - CRITICAL for user isolation)
    user_id: str = Field(
        ...,
        foreign_key="user.id",
        index=True,
        description="User ID (FK to users.id) - CRITICAL for Constitution III user isolation",
    )

    # Timestamps (Constitution IV - Stateless Backend)
    created_at: datetime = Field(
        default_factory=utc_now,
        description="Conversation creation timestamp (UTC)",
    )

    updated_at: datetime = Field(
        default_factory=utc_now,
        description="Last update timestamp (UTC)",
    )

    # Relationships (cascade delete for data consistency)
    # messages will be populated when querying related data
    # For Phase 1 MVP, we use implicit cascade via foreign key
    # messages: Optional[List["Message"]] = Relationship(back_populates="conversation", cascade_delete=True)
