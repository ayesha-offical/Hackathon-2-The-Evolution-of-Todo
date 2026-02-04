# Task: T022 | Spec: specs/001-sdd-initialization/tasks.md §Pydantic Schemas
# Constitution IV: Stateless Backend - User request/response schemas with validation

"""User API request and response schemas."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

from src.constants import PASSWORD_REGEX, PASSWORD_VALIDATION_MESSAGE


class UserCreate(BaseModel):
    """Request schema for user registration."""

    email: EmailStr = Field(
        ...,
        min_length=5,
        max_length=255,
        description="User email (must be valid email format)",
    )

    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="Password (8+ chars, uppercase, lowercase, number)",
    )

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password meets complexity requirements."""
        if not PASSWORD_REGEX.match(v):
            raise ValueError(PASSWORD_VALIDATION_MESSAGE)
        return v


class UserLogin(BaseModel):
    """Request schema for user login."""

    email: EmailStr = Field(
        ...,
        description="User email",
    )

    password: str = Field(
        ...,
        description="User password",
    )


class UserResponse(BaseModel):
    """Response schema for user endpoints."""

    id: str = Field(
        ...,
        description="User ID (UUID)",
    )

    email: str = Field(
        ...,
        description="User email",
    )

    is_verified: bool = Field(
        ...,
        description="Email verification status",
    )

    created_at: datetime = Field(
        ...,
        description="Account creation timestamp",
    )

    class Config:
        """Pydantic configuration."""

        from_attributes = True
