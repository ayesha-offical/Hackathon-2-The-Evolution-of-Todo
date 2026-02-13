# Task: T309 | Spec: specs/004-todo-ai-chatbot/tasks.md §Phase 2: MCP Server & Tool Implementation
# Constitution VII: MCP Server Architecture - Stateless MCP server exposing task operations as tools

"""MCP Server initialization for Phase III Todo AI Chatbot."""

from typing import Any, Callable, Dict

from sqlalchemy.ext.asyncio import AsyncSession

from src.mcp.middleware import create_tool_response, validate_user_id_param
from src.mcp.tools.task_create import task_create
from src.mcp.tools.task_delete import task_delete
from src.mcp.tools.task_list import task_list
from src.mcp.tools.task_update import task_update


class TodoMCPServer:
    """
    Stateless MCP Server for task management (Constitution VII).

    This server exposes four tools via the Model Context Protocol:
    - task_create: Create new tasks
    - task_list: List user's tasks
    - task_update: Update existing tasks
    - task_delete: Delete tasks

    All tools require user_id as a parameter and validate it against JWT-extracted user_id.
    The server itself is stateless - all state is managed by the backend database.
    """

    def __init__(self):
        """Initialize MCP server."""
        self.name = "TodoMCPServer"
        self.version = "1.0.0"
        self.tools = {
            "task_create": task_create,
            "task_list": task_list,
            "task_update": task_update,
            "task_delete": task_delete,
        }

    async def initialize(self) -> None:
        """
        Initialize server but do NOT start yet.

        The FastAPI main.py will handle server startup.
        This method is called during application startup for any initialization hooks.
        """
        pass

    async def execute_tool(
        self,
        tool_name: str,
        request_user_id: str,
        tool_params: Dict[str, Any],
        session: AsyncSession,
    ) -> Dict[str, Any]:
        """
        Execute a tool with user_id validation (Constitution III & VII).

        This is the main entry point for agent tool calls.
        All calls go through this method to ensure:
        1. Tool exists in registry
        2. user_id parameter is validated against JWT user_id
        3. Tool execution is stateless

        Args:
            tool_name: Name of tool to execute
            request_user_id: User ID from JWT token (Constitution III)
            tool_params: Parameters for the tool
            session: AsyncSession for database operations

        Returns:
            Standardized response from tool execution
        """
        # Validate tool exists
        if tool_name not in self.tools:
            return create_tool_response(
                success=False,
                error=f"Tool '{tool_name}' not found. Available tools: {list(self.tools.keys())}",
            )

        # Extract user_id from tool parameters
        tool_user_id = tool_params.get("user_id")

        # Validate user_id is provided in tool params
        if not tool_user_id:
            return create_tool_response(
                success=False,
                error="user_id parameter is required for all MCP tools (Constitution VII)",
            )

        # Validate user_id matches JWT-extracted user_id (Constitution III - defense-in-depth)
        if not validate_user_id_param(request_user_id, tool_user_id):
            return create_tool_response(
                success=False,
                error="user_id mismatch: Tool user_id does not match request user_id (403 Forbidden)",
            )

        # Get tool function
        tool_func: Callable = self.tools[tool_name]

        # Add session to tool params for database operations
        tool_params["session"] = session

        # Execute tool (stateless execution)
        try:
            result = await tool_func(**tool_params)
            return result
        except TypeError as e:
            # Parameter mismatch error
            return create_tool_response(
                success=False,
                error=f"Tool parameter error: {str(e)}",
            )
        except Exception as e:
            # Unexpected error
            return create_tool_response(
                success=False,
                error=f"Tool execution error: {str(e)}",
            )

    def get_tool_schemas(self) -> Dict[str, Dict[str, Any]]:
        """
        Get schemas for all available tools (for agent context).

        Returns:
            Dict mapping tool names to their schemas and parameters
        """
        return {
            "task_create": {
                "name": "task_create",
                "description": "Create a new task for the user",
                "parameters": {
                    "user_id": {"type": "string", "description": "User ID (required, must match JWT)", "required": True},
                    "title": {"type": "string", "description": "Task title (1-255 chars)", "required": True},
                    "description": {"type": "string", "description": "Task description (0-2000 chars)", "required": False},
                    "status": {"type": "string", "description": "Task status (default: pending)", "required": False},
                },
            },
            "task_list": {
                "name": "task_list",
                "description": "List all tasks for the user",
                "parameters": {
                    "user_id": {"type": "string", "description": "User ID (required, must match JWT)", "required": True},
                    "limit": {"type": "integer", "description": "Number of tasks to return (default: 20)", "required": False},
                    "offset": {"type": "integer", "description": "Pagination offset (default: 0)", "required": False},
                    "status": {"type": "string", "description": "Optional status filter", "required": False},
                },
            },
            "task_update": {
                "name": "task_update",
                "description": "Update an existing task",
                "parameters": {
                    "user_id": {"type": "string", "description": "User ID (required, must match JWT)", "required": True},
                    "task_id": {"type": "string", "description": "Task ID to update", "required": True},
                    "title": {"type": "string", "description": "New title", "required": False},
                    "description": {"type": "string", "description": "New description", "required": False},
                    "status": {"type": "string", "description": "New status", "required": False},
                },
            },
            "task_delete": {
                "name": "task_delete",
                "description": "Delete a task",
                "parameters": {
                    "user_id": {"type": "string", "description": "User ID (required, must match JWT)", "required": True},
                    "task_id": {"type": "string", "description": "Task ID to delete", "required": True},
                },
            },
        }


# Global MCP server instance
mcp_server = TodoMCPServer()
