# Task: T022 | Spec: specs/001-sdd-initialization/tasks.md §Pydantic Schemas
# Constitution IV: Stateless Backend - Task request/response schemas with validation

"""Task API request and response schemas."""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from src.constants import TaskStatus


class TaskCreate(BaseModel):
    """Request schema for creating a task."""

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

    status: Optional[TaskStatus] = Field(
        default=TaskStatus.PENDING,
        description="Task status (defaults to Pending)",
    )


class TaskUpdate(BaseModel):
    """Request schema for updating a task."""

    title: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=255,
        description="Task title (optional)",
    )

    description: Optional[str] = Field(
        default=None,
        max_length=2000,
        description="Task description (optional)",
    )

    status: Optional[TaskStatus] = Field(
        default=None,
        description="Task status (optional)",
    )


class TaskResponse(BaseModel):
    """Response schema for task endpoints."""

    id: str = Field(
        ...,
        description="Task ID (UUID)",
    )

    user_id: str = Field(
        ...,
        description="Task owner ID (Constitution III)",
    )

    title: str = Field(
        ...,
        description="Task title",
    )

    description: Optional[str] = Field(
        default=None,
        description="Task description",
    )

    status: TaskStatus = Field(
        ...,
        description="Task status",
    )

    created_at: datetime = Field(
        ...,
        description="Task creation timestamp",
    )

    updated_at: datetime = Field(
        ...,
        description="Last update timestamp",
    )

    class Config:
        """Pydantic configuration."""

        from_attributes = True


class TaskListResponse(BaseModel):
    """Response schema for list of tasks with pagination."""

    data: List[TaskResponse] = Field(
        ...,
        description="List of tasks",
    )

    total: int = Field(
        ...,
        description="Total number of tasks",
    )

    offset: int = Field(
        ...,
        description="Pagination offset",
    )

    limit: int = Field(
        ...,
        description="Pagination limit",
    )
