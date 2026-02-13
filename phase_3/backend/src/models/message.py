# Task: T302 | Spec: @specs/004-todo-ai-chatbot/spec.md §FR-005
# Constitution III: User Isolation - Message entity with defense-in-depth user_id filtering
# Constitution IX: Conversation History & Persistence - Message storage for multi-turn chats

"""Message SQLModel entity for storing individual chat messages."""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel

from src.utils.datetime import utc_now
from src.utils.uuid import uuid4_str


class MessageRole(str, Enum):
    """Message role enum for chat messages."""

    USER = "user"
    ASSISTANT = "assistant"


class Message(SQLModel, table=True):
    """
    Message entity for storing individual chat messages in a conversation.

    Constitution III: User Isolation - CRITICAL: Both conversation_id AND user_id foreign keys
    enforce defense-in-depth user isolation. Every database query must filter by both keys.
    This prevents accidental data leakage even if conversation_id filtering is bypassed.

    Constitution IX: Conversation History & Persistence - Messages form the conversation history.
    All messages for a conversation are loaded and provided to the AI agent as context.

    Table: messages
    Primary Key: id (UUID)
    Foreign Keys:
      - conversation_id -> conversations.id (CASCADE delete)
      - user_id -> users.id (CASCADE delete, defense-in-depth)
    Indexes:
      - (conversation_id, created_at ASC) - load conversation history in order
      - (user_id, created_at DESC) - efficient user message retrieval
    Constraints:
      - role IN ('user', 'assistant')
      - content NOT NULL and NOT EMPTY
      - created_at immutable (no updates after creation)
    """

    # Primary Key
    id: str = Field(
        default_factory=uuid4_str,
        primary_key=True,
        description="Message ID (UUID)",
    )

    # Foreign Keys (Constitution III - CRITICAL for user isolation)
    conversation_id: str = Field(
        ...,
        foreign_key="conversation.id",
        index=True,
        description="Conversation ID (FK to conversations.id) - links to chat session",
    )

    user_id: str = Field(
        ...,
        foreign_key="user.id",
        index=True,
        description="User ID (FK to users.id) - CRITICAL for Constitution III defense-in-depth isolation",
    )

    # Message Content
    role: MessageRole = Field(
        ...,
        description="Message role: 'user' or 'assistant'",
    )

    content: str = Field(
        ...,
        min_length=1,
        max_length=10000,
        description="Message content (1-10000 chars)",
    )

    # Timestamps (Constitution IV - Stateless Backend)
    # created_at is immutable - messages cannot be edited, only deleted
    created_at: datetime = Field(
        default_factory=utc_now,
        description="Message creation timestamp (UTC, immutable)",
    )

    # Relationships (cascade delete for data consistency)
    # conversation: "Conversation" = Relationship(back_populates="messages")
