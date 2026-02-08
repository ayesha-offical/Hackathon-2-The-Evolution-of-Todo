# Task: T320 | Spec: specs/004-todo-ai-chatbot/tasks.md §Phase 3: OpenAI Agent Integration
# Constitution VIII: AI Agent Stateless Design - Agent receives full context on each invocation
# Constitution IX: Conversation History & Persistence - Full message history provided to agent

"""Context builder for stateless agent - prepares conversation history for LLM."""

import json
import logging
from typing import Any, Dict, List

from src.models.message import Message

logger = logging.getLogger(__name__)


def build_agent_context(
    conversation_history: List[Message],
    user_id: str,
) -> Dict[str, Any]:
    """
    Build agent context from conversation history (Constitution VIII & IX).

    This function demonstrates stateless context design:
    1. Converts ALL messages from database to agent-compatible format
    2. Creates system prompt that explains available tools
    3. Includes user_id for MCP tool calls (Constitution III)
    4. Returns complete context dict (no truncation)

    The agent receives this full context on EVERY request. This ensures:
    - Agent has complete conversation history
    - Agent cannot rely on previous state
    - Each invocation is independent

    Args:
        conversation_history: List of Message objects from database (in chronological order)
        user_id: User ID from JWT token (for MCP tool context)

    Returns:
        Context dict with keys:
        - system: System prompt explaining agent role and tools
        - conversation_history: List of [{"role": "...", "content": "..."}] dicts
        - user_id: User ID (for tool calls)
        - available_tools: Tool descriptions for agent understanding
    """
    # Convert Message objects to agent-compatible dicts (Constitution IX)
    history_dicts = [
        {
            "role": msg.role.value,  # "user" or "assistant"
            "content": msg.content,
        }
        for msg in conversation_history
    ]

    # System prompt explaining agent role and available tools
    system_prompt = f"""You are a helpful AI assistant managing a todo list for the user.

Your role:
1. Understand the user's intent (create, list, update, or delete tasks)
2. Use the available tools to manipulate their todo list
3. Provide clear, helpful responses to the user

IMPORTANT - User Identity (Constitution II - JWT Bridge):
- The current user's ID is: {user_id}
- This is already authenticated and verified
- You MUST use this exact user_id when calling any tool
- DO NOT ask the user for their user_id - you already have it!
- All task operations will be scoped to this user automatically

IMPORTANT - About your tools:
- You have access to MCP tools to manage tasks
- When you call a tool, it returns a standardized response: {{"success": bool, "data": {{...}}, "error": "..."}}
- ALWAYS check the "success" field before responding to the user
- If success=false, explain the error to the user and offer to help differently
- If success=true, incorporate the data into your response
- Always pass user_id='{user_id}' when calling tools

Guidelines:
- Be concise and helpful
- Confirm task operations with specific details (e.g., "I've created a task 'Buy milk' for you")
- When listing tasks, format them clearly
- Ask clarifying questions if the user's intent is unclear
- Remember: Every conversation is independent; don't assume state from previous messages
"""

    # Tool descriptions for agent understanding
    available_tools = [
        {
            "name": "task_create",
            "description": "Create a new task with title, optional description, and optional status",
            "parameters": {
                "user_id": "User ID (required, must match current user)",
                "title": "Task title (required, 1-255 chars)",
                "description": "Task description (optional, 0-2000 chars)",
                "status": "Task status (optional, default 'pending')",
            },
        },
        {
            "name": "task_list",
            "description": "List all tasks for the user with optional status filter",
            "parameters": {
                "user_id": "User ID (required, must match current user)",
                "limit": "Number of tasks to return (optional, default 20)",
                "offset": "Pagination offset (optional, default 0)",
                "status": "Optional status filter (optional)",
            },
        },
        {
            "name": "task_update",
            "description": "Update an existing task",
            "parameters": {
                "user_id": "User ID (required, must match current user)",
                "task_id": "Task ID to update (required)",
                "title": "New title (optional)",
                "description": "New description (optional)",
                "status": "New status (optional)",
            },
        },
        {
            "name": "task_delete",
            "description": "Delete a task",
            "parameters": {
                "user_id": "User ID (required, must match current user)",
                "task_id": "Task ID to delete (required)",
            },
        },
    ]

    # Build context dict
    context = {
        "system": system_prompt,
        "conversation_history": history_dicts,
        "user_id": user_id,
        "available_tools": available_tools,
    }

    logger.debug(
        f"Agent context built for user {user_id} with {len(history_dicts)} history messages"
    )

    return context


def format_tool_description(tools: List[Dict[str, Any]]) -> str:
    """
    Format tool descriptions as readable text for agent prompt.

    Args:
        tools: List of tool definition dicts

    Returns:
        Formatted tool description string
    """
    formatted = "Available Tools:\n"
    for tool in tools:
        formatted += f"\n- **{tool['name']}**: {tool['description']}\n"
        formatted += f"  Parameters: {json.dumps(tool['parameters'], indent=4)}\n"
    return formatted
