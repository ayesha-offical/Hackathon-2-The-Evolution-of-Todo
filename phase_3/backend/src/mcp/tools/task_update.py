# Task: T313 | Spec: specs/004-todo-ai-chatbot/tasks.md §Phase 2: MCP Server & Tool Implementation
# Constitution III: User Isolation - CRITICAL - Verify user owns task BEFORE updating
# Constitution VII: MCP Server Architecture - Stateless tool execution

"""MCP tool for updating tasks."""

from typing import Any, Dict, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from src.mcp.middleware import create_tool_response
from src.schemas.task import TaskUpdate
from src.services.task_service import TaskService


async def task_update(
    user_id: str,
    task_id: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    status: Optional[str] = None,
    session: AsyncSession = None,
) -> Dict[str, Any]:
    """
    Update a task via MCP tool (Constitution III & VII).

    CRITICAL: This tool verifies user owns the task BEFORE updating.
    This is defense-in-depth enforcement of Constitution III.

    Args:
        user_id: User ID from MCP tool parameters (Constitution III)
        task_id: Task ID to update (required)
        title: New title (optional)
        description: New description (optional)
        status: New status (optional)
        session: AsyncSession for database operations

    Returns:
        Standardized response: {"success": true, "data": {...updated_task...}} or error response
    """
    try:
        # Validate required parameters
        if not user_id:
            return create_tool_response(success=False, error="user_id parameter is required")
        if not task_id:
            return create_tool_response(success=False, error="task_id parameter is required")

        # Create service with session
        service = TaskService(session)

        # Validate task exists and belongs to user (Constitution III - double-check ownership)
        existing_task = await service.get_task_by_id(user_id=user_id, task_id=task_id)
        if not existing_task:
            return create_tool_response(success=False, error="Task not found or does not belong to user")

        # Build update data with only provided fields
        update_data = TaskUpdate(
            title=title,
            description=description,
            status=status,
        )

        # Update task using service
        updated_task = await service.update_task(
            user_id=user_id,
            task_id=task_id,
            data=update_data,
        )

        if not updated_task:
            return create_tool_response(success=False, error="Task not found or does not belong to user")

        # Commit changes to database
        await session.commit()

        # Return standardized response with updated task data
        return create_tool_response(
            success=True,
            data={
                "id": updated_task.id,
                "user_id": updated_task.user_id,
                "title": updated_task.title,
                "description": updated_task.description,
                "status": updated_task.status.value,
                "created_at": updated_task.created_at.isoformat(),
                "updated_at": updated_task.updated_at.isoformat(),
            },
        )

    except ValueError as e:
        # Validation error from service
        return create_tool_response(success=False, error=str(e))
    except Exception as e:
        # Unexpected error
        return create_tool_response(success=False, error=f"Failed to update task: {str(e)}")
