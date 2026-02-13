# Task: T310 | Spec: specs/004-todo-ai-chatbot/tasks.md §Phase 2: MCP Server & Tool Implementation
# Constitution III: User Isolation - user_id validation and defense-in-depth filtering
# Constitution VII: MCP Server Architecture - Standardized response format

"""MCP middleware for user_id validation and response formatting."""

from typing import Any, Dict, Optional


def validate_user_id_param(request_user_id: str, tool_user_id: str) -> bool:
    """
    Validate that tool user_id matches request user_id (Constitution III).

    This ensures that a user cannot invoke MCP tools with another user's ID.
    This is a critical security validation that must happen before any tool execution.

    Args:
        request_user_id: User ID extracted from JWT token (from request context)
        tool_user_id: User ID parameter passed to the MCP tool

    Returns:
        True if both IDs are equal, False otherwise
    """
    return request_user_id == tool_user_id


def create_tool_response(
    success: bool, data: Optional[Dict[str, Any]] = None, error: Optional[str] = None
) -> Dict[str, Any]:
    """
    Create standardized MCP tool response (Constitution VII).

    All MCP tools must return responses in this format to ensure consistency
    and enable the agent to parse responses reliably.

    Args:
        success: Whether the tool execution was successful
        data: Response data when successful (default: None)
        error: Error message when unsuccessful (default: None)

    Returns:
        Standardized response dict: {"success": bool, "data": {...}, "error": "..."}
    """
    return {
        "success": success,
        "data": data if data is not None else {},
        "error": error,
    }
