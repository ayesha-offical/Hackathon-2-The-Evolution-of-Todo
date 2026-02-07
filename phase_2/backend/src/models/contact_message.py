# Task: T002 | Spec: @specs/003-modern-ui-improvements/spec.md §US2
# Feature: 003-modern-ui-improvements - Contact form message entity
# Constitution III: User Isolation - contact_messages with optional user_id

"""ContactMessage SQLModel entity for user contact form submissions."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel

from src.utils.datetime import utc_now
from src.utils.uuid import uuid4_str


class ContactMessage(SQLModel, table=True):
    """
    ContactMessage entity for storing user contact form submissions.

    Constitution III: User Isolation - OPTIONAL user_id foreign key allows both authenticated
    and unauthenticated submissions. When user_id is NULL, message is from unauthenticated user.

    Table: contact_messages
    Primary Key: id (UUID)
    Foreign Key: user_id -> users.id (OPTIONAL, nullable for unauthenticated submissions)
    Indexes: (user_id), (created_at DESC), (email), (is_read)
    """

    # Primary Key
    id: str = Field(
        default_factory=uuid4_str,
        primary_key=True,
        description="Message ID (UUID)",
    )

    # Foreign Key (Constitution III - OPTIONAL for unauthenticated submissions)
    user_id: Optional[str] = Field(
        default=None,
        foreign_key="user.id",
        index=True,
        description="User ID (FK to users.id, nullable for unauthenticated submissions)",
    )

    # Contact Form Fields
    name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Sender's name (1-255 chars, required)",
    )

    email: str = Field(
        ...,
        max_length=255,
        description="Sender's email address (required, must be valid format)",
    )

    subject: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="Message subject/topic (1-500 chars, required)",
    )

    message: str = Field(
        ...,
        description="Message content (required, no max length)",
    )

    # Metadata Fields
    created_at: datetime = Field(
        default_factory=utc_now,
        description="Message creation timestamp (UTC)",
    )

    updated_at: datetime = Field(
        default_factory=utc_now,
        description="Last update timestamp (UTC)",
    )

    ip_address: Optional[str] = Field(
        default=None,
        max_length=45,
        description="IP address of sender (optional, IPv4 or IPv6, max 45 chars)",
    )

    is_read: bool = Field(
        default=False,
        description="Whether admin has read this message (default False)",
    )

    admin_notes: Optional[str] = Field(
        default=None,
        description="Internal notes from admin (not visible to user, optional)",
    )
