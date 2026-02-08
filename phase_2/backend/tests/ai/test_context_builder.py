# Task: T322 | Spec: specs/004-todo-ai-chatbot/tasks.md §Phase 3: OpenAI Agent Integration
# Constitution VIII: AI Agent Stateless Design - Context builder tests

"""Unit tests for agent context builder."""

import pytest
from datetime import datetime

from src.ai.context_builder import build_agent_context, format_tool_description
from src.models.message import Message, MessageRole
from src.utils.datetime import utc_now
from src.utils.uuid import uuid4_str


class TestBuildAgentContext:
    """Test suite for build_agent_context function."""

    def test_build_context_returns_correct_structure(self):
        """Test that context dict has all required keys."""
        # Arrange
        messages = [
            Message(
                id=uuid4_str(),
                conversation_id=uuid4_str(),
                user_id="user_123",
                role=MessageRole.USER,
                content="List my tasks",
                created_at=utc_now(),
            ),
            Message(
                id=uuid4_str(),
                conversation_id=uuid4_str(),
                user_id="user_123",
                role=MessageRole.ASSISTANT,
                content="Here are your tasks...",
                created_at=utc_now(),
            ),
        ]
        user_id = "user_123"

        # Act
        context = build_agent_context(messages, user_id)

        # Assert
        assert "system" in context
        assert "conversation_history" in context
        assert "user_id" in context
        assert "available_tools" in context

    def test_conversation_history_converted_to_dicts(self):
        """Test that Message objects are converted to dicts."""
        # Arrange
        user_msg = Message(
            id=uuid4_str(),
            conversation_id=uuid4_str(),
            user_id="user_123",
            role=MessageRole.USER,
            content="Create a task",
            created_at=utc_now(),
        )
        messages = [user_msg]
        user_id = "user_123"

        # Act
        context = build_agent_context(messages, user_id)

        # Assert
        history = context["conversation_history"]
        assert len(history) == 1
        assert history[0]["role"] == "user"
        assert history[0]["content"] == "Create a task"

    def test_system_prompt_included(self):
        """Test that system prompt is included in context."""
        # Arrange
        messages = []
        user_id = "user_123"

        # Act
        context = build_agent_context(messages, user_id)

        # Assert
        system_prompt = context["system"]
        assert "todo list" in system_prompt.lower()
        assert "task" in system_prompt.lower()

    def test_user_id_included_in_context(self):
        """Test that user_id is included in context."""
        # Arrange
        messages = []
        user_id = "user_abc_123"

        # Act
        context = build_agent_context(messages, user_id)

        # Assert
        assert context["user_id"] == user_id

    def test_available_tools_included(self):
        """Test that available tools are included in context."""
        # Arrange
        messages = []
        user_id = "user_123"

        # Act
        context = build_agent_context(messages, user_id)

        # Assert
        tools = context["available_tools"]
        tool_names = [t["name"] for t in tools]
        assert "task_create" in tool_names
        assert "task_list" in tool_names
        assert "task_update" in tool_names
        assert "task_delete" in tool_names

    def test_empty_conversation_history(self):
        """Test context building with empty message list."""
        # Arrange
        messages = []
        user_id = "user_123"

        # Act
        context = build_agent_context(messages, user_id)

        # Assert
        assert context["conversation_history"] == []
        assert context["user_id"] == user_id
        assert len(context["available_tools"]) == 4

    def test_tool_parameters_are_documented(self):
        """Test that tool parameters are properly documented."""
        # Arrange
        messages = []
        user_id = "user_123"

        # Act
        context = build_agent_context(messages, user_id)

        # Assert
        tools = context["available_tools"]
        task_create = next((t for t in tools if t["name"] == "task_create"), None)
        assert task_create is not None
        assert "parameters" in task_create
        assert "user_id" in task_create["parameters"]
        assert "title" in task_create["parameters"]


class TestFormatToolDescription:
    """Test suite for format_tool_description function."""

    def test_format_returns_string(self):
        """Test that format returns a string."""
        # Arrange
        tools = [
            {
                "name": "task_create",
                "description": "Create a task",
                "parameters": {"title": "Task title"},
            }
        ]

        # Act
        result = format_tool_description(tools)

        # Assert
        assert isinstance(result, str)
        assert "Available Tools:" in result

    def test_format_includes_tool_names(self):
        """Test that formatted output includes tool names."""
        # Arrange
        tools = [
            {
                "name": "task_create",
                "description": "Create a task",
                "parameters": {},
            },
            {
                "name": "task_delete",
                "description": "Delete a task",
                "parameters": {},
            },
        ]

        # Act
        result = format_tool_description(tools)

        # Assert
        assert "task_create" in result
        assert "task_delete" in result


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
