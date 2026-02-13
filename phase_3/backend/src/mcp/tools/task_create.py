# Task: T311 | Spec: specs/004-todo-ai-chatbot/tasks.md §Phase 2: MCP Server & Tool Implementation
# Constitution III: User Isolation - user_id parameter MUST come from JWT, never from tool params
# Constitution VII: MCP Server Architecture - Stateless tool execution

"""MCP tool for creating tasks."""

from typing import Any, Dict, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from src.constants import TaskStatus
from src.mcp.middleware import create_tool_response, validate_user_id_param
from src.services.task_service import TaskService


async def task_create(
    user_id: str,
    title: str,
    description: Optional[str] = None,
    status: str = "pending",
    session: AsyncSession = None,
) -> Dict[str, Any]:
    """
    Create a new task via MCP tool (Constitution III & VII).

    This tool MUST receive user_id as a parameter from the agent context.
    The user_id is validated against the JWT-extracted user_id to prevent
    cross-user operations (Constitution III defense-in-depth).

    Args:
        user_id: User ID from MCP tool parameters (must match JWT user_id)
        title: Task title (required, 1-255 chars)
        description: Task description (optional, 0-2000 chars)
        status: Task status (optional, default 'pending')
        session: AsyncSession for database operations

    Returns:
        Standardized response: {"success": true, "data": {...task...}} or error response
    """
    try:
        # Validate user_id is provided
        if not user_id:
            return create_tool_response(success=False, error="user_id parameter is required")

        # Validate title is provided and not empty
        if not title:
            return create_tool_response(success=False, error="title parameter is required")

        # Validate title length
        if len(title) < 1 or len(title) > 255:
            return create_tool_response(success=False, error="title must be 1-255 characters")

        # Validate description length if provided
        if description and len(description) > 2000:
            return create_tool_response(success=False, error="description cannot exceed 2000 characters")

        # Validate status is valid enum value
        valid_statuses = [TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED, TaskStatus.ARCHIVED]
        if status not in [s.value for s in valid_statuses]:
            return create_tool_response(success=False, error=f"Invalid status: {status}")

        # Create task using service
        service = TaskService(session)
        task = await service.create_task(
            user_id=user_id,
            title=title,
            description=description,
            status=TaskStatus(status),
        )

        # Commit changes to database
        await session.commit()

        # Return standardized response with task data
        return create_tool_response(
            success=True,
            data={
                "id": task.id,
                "user_id": task.user_id,
                "title": task.title,
                "description": task.description,
                "status": task.status.value,
                "created_at": task.created_at.isoformat(),
                "updated_at": task.updated_at.isoformat(),
            },
        )

    except ValueError as e:
        # Validation error from service
        return create_tool_response(success=False, error=str(e))
    except Exception as e:
        # Unexpected error
        return create_tool_response(success=False, error=f"Failed to create task: {str(e)}")
