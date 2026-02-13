# Task: T315 | Spec: specs/004-todo-ai-chatbot/tasks.md §Phase 2: MCP Server & Tool Implementation
# Constitution VII: MCP Server Architecture - Tool registry

"""MCP tools package - Task management tools for AI agent."""

from src.mcp.tools.task_create import task_create
from src.mcp.tools.task_delete import task_delete
from src.mcp.tools.task_list import task_list
from src.mcp.tools.task_update import task_update

# Tool registry for MCP server
TOOLS = [task_create, task_list, task_update, task_delete]

__all__ = ["task_create", "task_list", "task_update", "task_delete", "TOOLS"]
