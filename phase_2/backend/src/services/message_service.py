# Task: T307 | Spec: @specs/004-todo-ai-chatbot/spec.md §FR-005
# Constitution III: User Isolation - Message service with defense-in-depth filtering
# Constitution IX: Conversation History & Persistence - Message storage and retrieval

"""Service layer for message operations."""

from typing import List

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.models.message import Message, MessageRole
from src.errors import InvalidMessageError
from src.utils.datetime import utc_now


class MessageService:
    """Service for managing chat messages with user isolation."""

    async def create_message(
        self,
        conversation_id: str,
        user_id: str,
        role: str,
        content: str,
        session: AsyncSession,
    ) -> Message:
        """
        Create a new message in a conversation.

        Constitution III: User Isolation - Message includes both conversation_id and user_id
        for defense-in-depth isolation. Message cannot be created without both identifiers.

        Constitution IX: Persistence - Message persisted to database immediately for history.

        Args:
            conversation_id: Conversation ID this message belongs to
            user_id: User ID from JWT claims (authoritative identity)
            role: Message role ('user' or 'assistant')
            content: Message content text
            session: Database session

        Returns:
            Created Message instance

        Raises:
            InvalidMessageError: If validation fails

        Reference: @specs/004-todo-ai-chatbot/plan.md Step 1
        """
        # Validate role
        try:
            role_enum = MessageRole(role)
        except ValueError:
            raise InvalidMessageError(
                f"Invalid message role '{role}'. Must be 'user' or 'assistant'."
            )

        # Validate content
        if not content or not content.strip():
            raise InvalidMessageError("Message content cannot be empty")

        if len(content) > 10000:
            raise InvalidMessageError("Message content exceeds maximum length of 10000 characters")

        # Create message
        message = Message(
            conversation_id=conversation_id,
            user_id=user_id,
            role=role_enum,
            content=content,
            created_at=utc_now(),
        )
        session.add(message)
        await session.flush()
        await session.refresh(message)
        return message

    async def list_by_conversation(
        self,
        user_id: str,
        conversation_id: str,
        session: AsyncSession,
    ) -> List[Message]:
        """
        Retrieve all messages for a conversation.

        Constitution III: User Isolation - CRITICAL: Query filters by BOTH conversation_id AND user_id.
        Defense-in-depth: Even if conversation_id is compromised, user_id filter protects data.

        Constitution IX: Persistence - Full message history loaded for agent context.

        Args:
            user_id: User ID from JWT claims (authoritative identity)
            conversation_id: Conversation ID to retrieve messages from
            session: Database session

        Returns:
            List of Message instances in chronological order (oldest first)

        Reference: @specs/004-todo-ai-chatbot/spec.md §FR-001 (full history for agent)
        """
        # Constitution III: Defense-in-depth filtering - conversation_id + user_id
        stmt = (
            select(Message)
            .where(
                Message.conversation_id == conversation_id,
                Message.user_id == user_id,
            )
            .order_by(Message.created_at.asc())  # Chronological order (oldest first)
        )
        result = await session.execute(stmt)
        return result.scalars().all()

    async def count_by_conversation(
        self,
        user_id: str,
        conversation_id: str,
        session: AsyncSession,
    ) -> int:
        """
        Count messages in a conversation for a user.

        Constitution III: User Isolation - CRITICAL: Counts only user's messages in the conversation.

        Args:
            user_id: User ID from JWT claims (authoritative identity)
            conversation_id: Conversation ID
            session: Database session

        Returns:
            Number of messages

        Reference: @specs/004-todo-ai-chatbot/plan.md Step 1
        """
        stmt = (
            select(Message)
            .where(
                Message.conversation_id == conversation_id,
                Message.user_id == user_id,
            )
        )
        result = await session.execute(stmt)
        return len(result.scalars().all())


# Create singleton instance for dependency injection
message_service = MessageService()
