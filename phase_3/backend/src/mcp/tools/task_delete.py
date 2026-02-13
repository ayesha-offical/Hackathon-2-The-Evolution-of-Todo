# Task: T314 | Spec: specs/004-todo-ai-chatbot/tasks.md §Phase 2: MCP Server & Tool Implementation
# Constitution III: User Isolation - CRITICAL - Verify user owns task BEFORE deleting
# Constitution VII: MCP Server Architecture - Stateless tool execution

"""MCP tool for deleting tasks."""

from typing import Any, Dict

from sqlalchemy.ext.asyncio import AsyncSession

from src.mcp.middleware import create_tool_response
from src.services.task_service import TaskService


async def task_delete(
    user_id: str,
    task_id: str,
    session: AsyncSession = None,
) -> Dict[str, Any]:
    """
    Delete a task via MCP tool (Constitution III & VII).

    CRITICAL: This tool verifies user owns the task BEFORE deleting.
    This is defense-in-depth enforcement of Constitution III.

    Args:
        user_id: User ID from MCP tool parameters (Constitution III)
        task_id: Task ID to delete (required)
        session: AsyncSession for database operations

    Returns:
        Standardized response: {"success": true, "data": {...}} or error response
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

        # Delete task using service (includes user_id check for safety)
        deleted = await service.delete_task(user_id=user_id, task_id=task_id)

        if not deleted:
            return create_tool_response(success=False, error="Task not found or does not belong to user")

        # Commit changes to database
        await session.commit()

        # Return standardized response confirming deletion
        return create_tool_response(
            success=True,
            data={
                "deleted_task_id": task_id,
                "message": "Task deleted successfully",
            },
        )

    except Exception as e:
        # Unexpected error
        return create_tool_response(success=False, error=f"Failed to delete task: {str(e)}")
