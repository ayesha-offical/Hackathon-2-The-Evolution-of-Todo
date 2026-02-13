# Task: T312 | Spec: specs/004-todo-ai-chatbot/tasks.md §Phase 2: MCP Server & Tool Implementation
# Constitution III: User Isolation - Query includes WHERE user_id filter (CRITICAL)
# Constitution VII: MCP Server Architecture - Stateless tool execution

"""MCP tool for listing tasks."""

from typing import Any, Dict

from sqlalchemy.ext.asyncio import AsyncSession

from src.mcp.middleware import create_tool_response
from src.services.task_service import TaskService


async def task_list(
    user_id: str,
    limit: int = 20,
    offset: int = 0,
    status: str = None,
    session: AsyncSession = None,
) -> Dict[str, Any]:
    """
    List tasks for a user via MCP tool (Constitution III & VII).

    CRITICAL: This tool MUST NOT return tasks from other users.
    The query includes WHERE user_id = <user_id> filtering to enforce Constitution III.

    Args:
        user_id: User ID from MCP tool parameters (Constitution III)
        limit: Number of tasks to return (default 20, max 100)
        offset: Pagination offset (default 0)
        status: Optional status filter
        session: AsyncSession for database operations

    Returns:
        Standardized response: {"success": true, "data": {"tasks": [...]}}
    """
    try:
        # Validate user_id is provided
        if not user_id:
            return create_tool_response(success=False, error="user_id parameter is required")

        # Create service with session
        service = TaskService(session)

        # Query tasks with Constitution III user_id filtering (CRITICAL)
        tasks, total = await service.get_user_tasks(
            user_id=user_id,
            limit=min(limit, 100),  # Cap at 100 for performance
            offset=offset,
            status=status,
        )

        # Convert tasks to serializable dict format
        task_dicts = [
            {
                "id": task.id,
                "user_id": task.user_id,
                "title": task.title,
                "description": task.description,
                "status": task.status.value,
                "created_at": task.created_at.isoformat(),
                "updated_at": task.updated_at.isoformat(),
            }
            for task in tasks
        ]

        # Return standardized response with tasks list
        return create_tool_response(
            success=True,
            data={
                "tasks": task_dicts,
                "total": total,
                "limit": limit,
                "offset": offset,
            },
        )

    except ValueError as e:
        # Validation error (e.g., invalid status)
        return create_tool_response(success=False, error=str(e))
    except Exception as e:
        # Unexpected error
        return create_tool_response(success=False, error=f"Failed to list tasks: {str(e)}")
