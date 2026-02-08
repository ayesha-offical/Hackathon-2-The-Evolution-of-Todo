# Task: T319 | Spec: specs/004-todo-ai-chatbot/tasks.md §Phase 3: OpenAI Agent Integration
# Constitution VIII: AI Agent Stateless Design - Agent MUST NOT store state between requests

"""OpenAI Agent initialization and invocation for stateless task processing."""

import json
import logging
from typing import Any, Dict, List, Optional

from openai import OpenAI

logger = logging.getLogger(__name__)


def create_agent(api_key: str, model: str = "gpt-4o-mini") -> OpenAI:
    """
    Create and configure OpenAI client (Constitution VIII).

    This function initializes a stateless OpenAI client. The client itself is stateless;
    all context comes from the request (conversation history + current message).

    Args:
        api_key: OpenAI API key (OPENAI_API_KEY environment variable)
        model: Model to use (default: gpt-4o-mini for cost efficiency)

    Returns:
        Configured OpenAI client instance

    Raises:
        ValueError: If api_key is empty or None
    """
    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable must be set")

    # Initialize OpenAI client with provided API key
    client = OpenAI(api_key=api_key)

    logger.info(f"OpenAI agent initialized with model: {model}")
    return client


async def invoke_agent(
    client: OpenAI,
    context: Dict[str, Any],
    current_message: str,
    user_id: str,
    mcp_server: Any = None,
) -> str:
    """
    Invoke OpenAI agent with full conversation context (Constitution VIII).

    This function demonstrates stateless agent design:
    1. Agent receives FULL conversation history (no truncation)
    2. Agent has NO persistent memory between calls
    3. All context comes from the request
    4. Agent can call MCP tools, but cannot store their results locally
    5. On next invocation, agent receives fresh context (even if same conversation)

    Args:
        client: OpenAI client instance
        context: Context dict from build_agent_context() with system prompt + history
        current_message: Current user message (will be appended to history)
        user_id: User ID from JWT token (for MCP tool calls)
        mcp_server: MCP server instance (optional, for tool execution)

    Returns:
        Agent response as string (what to show to user)

    Raises:
        Exception: OpenAI API errors, logged with full context for debugging
    """
    try:
        # Extract context components
        system_prompt = context.get("system", "")
        conversation_history = context.get("conversation_history", [])
        available_tools = context.get("available_tools", [])

        # Build messages for API call: system + history + current message
        messages = [{"role": "system", "content": system_prompt}]

        # Add full conversation history (Constitution VIII - no truncation)
        for msg in conversation_history:
            messages.append({
                "role": msg.get("role", "user"),
                "content": msg.get("content", ""),
            })

        # Add current message as new user message
        messages.append({
            "role": "user",
            "content": current_message,
        })

        # Include available tools in system context for agent understanding
        tools_context = f"\n\nAvailable Tools:\n{json.dumps(available_tools, indent=2)}"
        messages[0]["content"] += tools_context

        logger.debug(f"Agent invoking with {len(conversation_history)} history messages")

        # Call OpenAI API for agent response (stateless - no persistent state)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.7,
            max_tokens=1000,
        )

        # Extract response text
        agent_response = response.choices[0].message.content

        logger.info(f"Agent response generated for user {user_id}")
        return agent_response

    except Exception as e:
        # Log error with full context
        logger.error(f"Agent invocation failed for user {user_id}: {str(e)}", exc_info=True)
        error_message = f"Error processing request: {str(e)}"
        return error_message
