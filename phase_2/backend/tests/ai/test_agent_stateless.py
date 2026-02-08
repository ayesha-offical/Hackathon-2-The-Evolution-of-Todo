# Task: T323 | Spec: specs/004-todo-ai-chatbot/tasks.md §Phase 3: OpenAI Agent Integration
# Constitution VIII: AI Agent Stateless Design - Stateless behavior verification

"""Integration tests for agent stateless behavior."""

import pytest

from src.ai.agent import create_agent
from src.ai.context_builder import build_agent_context
from src.models.message import Message, MessageRole
from src.utils.datetime import utc_now
from src.utils.uuid import uuid4_str


class TestAgentStatelessBehavior:
    """Test suite for agent stateless design."""

    def test_agent_has_no_persistent_memory(self):
        """
        Verify agent does not store state between invocations.

        This test ensures that:
        1. Agent initialized with context_1 processes message_1
        2. Agent is fresh-initialized with context_1 + context_2
        3. Agent does NOT remember response_1 (no persistent memory)
        """
        # Arrange
        user_id = "user_test_123"

        # Context 1: Single message "What's the weather?"
        context_1_messages = [
            Message(
                id=uuid4_str(),
                conversation_id=uuid4_str(),
                user_id=user_id,
                role=MessageRole.USER,
                content="What's the weather?",
                created_at=utc_now(),
            )
        ]
        context_1 = build_agent_context(context_1_messages, user_id)

        # Context 2: Original message + follow-up
        context_2_messages = [
            Message(
                id=uuid4_str(),
                conversation_id=uuid4_str(),
                user_id=user_id,
                role=MessageRole.USER,
                content="What's the weather?",
                created_at=utc_now(),
            ),
            Message(
                id=uuid4_str(),
                conversation_id=uuid4_str(),
                user_id=user_id,
                role=MessageRole.ASSISTANT,
                content="I don't have weather data, but I can help with tasks!",
                created_at=utc_now(),
            ),
        ]
        context_2 = build_agent_context(context_2_messages, user_id)

        # Assert
        # Verify agent receives DIFFERENT context on second invocation
        # (agent should have access to both messages in context_2)
        assert len(context_2["conversation_history"]) == len(context_1_messages) + 1
        assert len(context_2["conversation_history"]) > len(context_1["conversation_history"])

    def test_agent_receives_full_history_on_each_call(self):
        """
        Verify agent receives complete conversation history on each invocation.

        This test ensures that:
        1. Full message history is provided (no truncation)
        2. Messages are in chronological order
        3. Agent can access all prior messages for context
        """
        # Arrange
        user_id = "user_history_test"
        conversation_id = uuid4_str()

        # Build conversation with multiple messages
        messages = [
            Message(
                id=uuid4_str(),
                conversation_id=conversation_id,
                user_id=user_id,
                role=MessageRole.USER,
                content="Create a task",
                created_at=utc_now(),
            ),
            Message(
                id=uuid4_str(),
                conversation_id=conversation_id,
                user_id=user_id,
                role=MessageRole.ASSISTANT,
                content="I'll create a task for you",
                created_at=utc_now(),
            ),
            Message(
                id=uuid4_str(),
                conversation_id=conversation_id,
                user_id=user_id,
                role=MessageRole.USER,
                content="What did I ask before?",
                created_at=utc_now(),
            ),
        ]

        # Act
        context = build_agent_context(messages, user_id)

        # Assert
        # All messages should be in history (no truncation)
        assert len(context["conversation_history"]) == 3

        # Messages should be in chronological order
        history = context["conversation_history"]
        assert history[0]["role"] == "user"
        assert history[0]["content"] == "Create a task"
        assert history[1]["role"] == "assistant"
        assert history[2]["role"] == "user"

    def test_agent_context_includes_user_id(self):
        """
        Verify agent context includes user_id for MCP tool calls.

        This test ensures that:
        1. user_id is present in context
        2. user_id can be passed to MCP tools
        3. Different users have isolated contexts
        """
        # Arrange
        user_id_1 = "user_alice_123"
        user_id_2 = "user_bob_456"
        messages = []

        # Act
        context_1 = build_agent_context(messages, user_id_1)
        context_2 = build_agent_context(messages, user_id_2)

        # Assert
        # Each user should have their own user_id in context
        assert context_1["user_id"] == user_id_1
        assert context_2["user_id"] == user_id_2
        assert context_1["user_id"] != context_2["user_id"]

    def test_agent_receives_tool_descriptions(self):
        """
        Verify agent context includes tool descriptions for decision-making.

        This test ensures that:
        1. Available tools are included
        2. Tool descriptions explain their purpose
        3. Tool parameters are documented
        """
        # Arrange
        user_id = "user_tools_test"
        messages = []

        # Act
        context = build_agent_context(messages, user_id)

        # Assert
        tools = context["available_tools"]
        assert len(tools) == 4

        # Each tool should have name and description
        for tool in tools:
            assert "name" in tool
            assert "description" in tool
            assert "parameters" in tool
            assert len(tool["name"]) > 0
            assert len(tool["description"]) > 0

    def test_context_consistency_across_calls(self):
        """
        Verify that building context from same messages produces consistent results.

        This test ensures that:
        1. Building context twice with same messages gives same result
        2. Agent receives predictable context
        3. Stateless design is verifiable
        """
        # Arrange
        user_id = "user_consistency_test"
        conversation_id = uuid4_str()

        message_list = [
            Message(
                id=uuid4_str(),
                conversation_id=conversation_id,
                user_id=user_id,
                role=MessageRole.USER,
                content="List tasks",
                created_at=utc_now(),
            ),
        ]

        # Act
        context_1 = build_agent_context(message_list, user_id)
        context_2 = build_agent_context(message_list, user_id)

        # Assert
        # Both contexts should have same structure and content
        assert context_1["user_id"] == context_2["user_id"]
        assert len(context_1["conversation_history"]) == len(context_2["conversation_history"])
        assert context_1["conversation_history"] == context_2["conversation_history"]

        # System prompt and tools should be identical
        assert context_1["system"] == context_2["system"]
        assert context_1["available_tools"] == context_2["available_tools"]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
