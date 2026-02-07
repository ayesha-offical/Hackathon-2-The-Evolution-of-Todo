# Task: T003 | Spec: @specs/003-modern-ui-improvements/contracts/contact-api.md
# Feature: 003-modern-ui-improvements - Contact form request/response schemas
# Constitution IV: Stateless Backend - Contact form API schemas with validation

"""Contact form API request and response schemas."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class ContactFormRequest(BaseModel):
    """Request schema for contact form submission."""

    name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Sender's name (1-255 chars, required)",
    )

    email: EmailStr = Field(
        ...,
        description="Sender's email address (required, must be valid email format)",
    )

    subject: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="Message subject/topic (1-500 chars, required)",
    )

    message: str = Field(
        ...,
        min_length=1,
        description="Message content (required, minimum 1 character)",
    )

    class Config:
        """Pydantic configuration."""

        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john@example.com",
                "subject": "Question about FocusHub",
                "message": "I would like to know more about your service...",
            }
        }


class ContactFormResponse(BaseModel):
    """Response schema for contact form submission (201 Created)."""

    id: str = Field(
        ...,
        description="Message ID (UUID)",
    )

    user_id: Optional[str] = Field(
        default=None,
        description="User ID if authenticated, null if unauthenticated (Constitution III)",
    )

    name: str = Field(
        ...,
        description="Sender's name",
    )

    email: str = Field(
        ...,
        description="Sender's email address",
    )

    subject: str = Field(
        ...,
        description="Message subject/topic",
    )

    message: str = Field(
        ...,
        description="Message content",
    )

    created_at: datetime = Field(
        ...,
        description="Message creation timestamp (UTC)",
    )

    class Config:
        """Pydantic configuration."""

        from_attributes = True

        json_schema_extra = {
            "example": {
                "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
                "user_id": "9f47ac10-58cc-4372-a567-0e02b2c3d479",
                "name": "John Doe",
                "email": "john@example.com",
                "subject": "Question about FocusHub",
                "message": "I would like to know more about your service...",
                "created_at": "2026-02-06T10:30:00Z",
            }
        }
