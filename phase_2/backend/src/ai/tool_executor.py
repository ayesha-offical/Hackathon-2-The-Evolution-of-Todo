# Task: T321 | Spec: specs/004-todo-ai-chatbot/tasks.md §Phase 3: OpenAI Agent Integration
# Constitution VII: MCP Server Architecture - Tool executor bridges agent to MCP tools

"""Tool executor for agent - bridges OpenAI agent to MCP tools."""

import json
import logging
import re
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)


async def execute_tool_call(
    tool_name: str,
    tool_params: Dict[str, Any],
    mcp_server: Any,
    request_user_id: str,
) -> Dict[str, Any]:
    """
    Execute MCP tool call from agent (Constitution VII).

    This function is the bridge between:
    - OpenAI Agent (wants to call a tool)
    - MCP Server (executes the tool)

    The function:
    1. Validates tool_name is recognized
    2. Calls mcp_server.execute_tool() with validation
    3. Returns standardized response

    Args:
        tool_name: Name of tool to call (e.g., "task_create")
        tool_params: Parameters for the tool (e.g., {"title": "...", "description": "..."})
        mcp_server: TodoMCPServer instance
        request_user_id: User ID from JWT token (for validation)

    Returns:
        Standardized response: {"success": bool, "data": {...}, "error": "..."}
    """
    try:
        # Validate tool_name
        valid_tools = ["task_create", "task_list", "task_update", "task_delete"]
        if tool_name not in valid_tools:
            logger.warning(f"Agent called invalid tool: {tool_name}")
            return {
                "success": False,
                "error": f"Tool '{tool_name}' not found. Valid tools: {valid_tools}",
            }

        logger.info(f"Executing MCP tool: {tool_name} for user {request_user_id}")

        # Call MCP server with user_id validation (Constitution VII)
        result = await mcp_server.execute_tool(
            tool_name=tool_name,
            request_user_id=request_user_id,
            tool_params=tool_params,
            session=None,  # Session will be provided by router
        )

        return result

    except Exception as e:
        logger.error(f"Tool execution failed for {tool_name}: {str(e)}", exc_info=True)
        return {
            "success": False,
            "error": f"Tool execution failed: {str(e)}",
        }


def parse_agent_response(
    agent_output: str,
) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Parse agent response to extract text and tool calls (Constitution VII).

    This function handles the agent's response which may contain:
    1. Natural language text (what to show to user)
    2. Tool calls (structured JSON indicating which MCP tools to call)

    The function looks for patterns like:
    - Tool call marker: "I'll use the task_create tool"
    - JSON in code blocks: ```json {...} ```
    - Direct JSON: {"success": true, ...}

    Args:
        agent_output: Raw response text from agent

    Returns:
        Tuple of:
        - response_text: User-facing response text
        - tool_calls: List of {"tool": "...", "params": {...}} dicts to execute

    Note: For MVP, agent responses are natural language.
    Tool calls may be added in future iterations when agent has structured output.
    """
    response_text = agent_output
    tool_calls = []

    # For MVP: Agent returns natural language response
    # Future: Parse tool calls from structured agent output if implemented

    logger.debug(f"Parsed agent response: {len(tool_calls)} tool calls found")

    return response_text, tool_calls


def extract_tool_calls_from_response(
    agent_response: str,
) -> List[Dict[str, Any]]:
    """
    Extract tool call definitions from agent response (if structured output used).

    This is a utility function for future use when agent has structured output.
    For MVP, agent returns natural language and tool calls are handled separately.

    Args:
        agent_response: Agent response text

    Returns:
        List of tool call dicts: [{"name": "...", "params": {...}}, ...]
    """
    tool_calls = []

    # Pattern 1: Look for JSON code blocks
    json_pattern = r"```json\n(.*?)\n```"
    matches = re.findall(json_pattern, agent_response, re.DOTALL)

    for match in matches:
        try:
            tool_data = json.loads(match)
            if "tool" in tool_data or "name" in tool_data:
                tool_calls.append(tool_data)
        except json.JSONDecodeError:
            logger.debug(f"Failed to parse JSON from agent response: {match}")

    # Pattern 2: Look for direct JSON objects
    json_pattern_direct = r"\{.*?\"(?:tool|name)\".*?\}"
    matches_direct = re.findall(json_pattern_direct, agent_response)

    for match in matches_direct:
        try:
            tool_data = json.loads(match)
            if tool_data not in tool_calls:  # Avoid duplicates
                tool_calls.append(tool_data)
        except json.JSONDecodeError:
            logger.debug(f"Failed to parse JSON object: {match}")

    return tool_calls


def validate_tool_params(
    tool_name: str,
    tool_params: Dict[str, Any],
) -> Tuple[bool, Optional[str]]:
    """
    Validate tool parameters before execution (Constitution VII).

    This function validates that:
    1. Required parameters are present
    2. Parameter types are correct
    3. Parameter values are within expected ranges

    Args:
        tool_name: Name of tool (e.g., "task_create")
        tool_params: Parameters dict

    Returns:
        Tuple of (is_valid, error_message)
    """
    # Define required and optional parameters for each tool
    tool_schemas = {
        "task_create": {
            "required": ["user_id", "title"],
            "optional": ["description", "status"],
        },
        "task_list": {
            "required": ["user_id"],
            "optional": ["limit", "offset", "status"],
        },
        "task_update": {
            "required": ["user_id", "task_id"],
            "optional": ["title", "description", "status"],
        },
        "task_delete": {
            "required": ["user_id", "task_id"],
            "optional": [],
        },
    }

    if tool_name not in tool_schemas:
        return False, f"Unknown tool: {tool_name}"

    schema = tool_schemas[tool_name]

    # Check required parameters
    for required_param in schema["required"]:
        if required_param not in tool_params:
            return False, f"Missing required parameter: {required_param}"

    # Validate parameter types and ranges
    if "title" in tool_params:
        title = tool_params["title"]
        if not isinstance(title, str) or len(title) < 1 or len(title) > 255:
            return False, "title must be a string 1-255 characters"

    if "description" in tool_params:
        desc = tool_params["description"]
        if desc and (not isinstance(desc, str) or len(desc) > 2000):
            return False, "description must be a string 0-2000 characters"

    if "limit" in tool_params:
        limit = tool_params["limit"]
        if not isinstance(limit, int) or limit < 1 or limit > 100:
            return False, "limit must be integer 1-100"

    return True, None
