# Task: T306 | Spec: @specs/004-todo-ai-chatbot/spec.md §FR-004
# Constitution III: User Isolation - Conversation service with strict user_id filtering
# Constitution IX: Conversation History & Persistence - Conversation CRUD operations

"""Service layer for conversation operations."""

from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.models.conversation import Conversation
from src.errors import ConversationNotFoundError
from src.utils.datetime import utc_now


class ConversationService:
    """Service for managing conversations with user isolation."""

    async def create_conversation(
        self,
        user_id: str,
        session: AsyncSession,
    ) -> Conversation:
        """
        Create a new conversation for a user.

        Constitution III: User Isolation - conversation is automatically scoped to user_id.
        Constitution IX: Persistence - conversation persisted to database for history retrieval.

        Args:
            user_id: User ID from JWT claims (authoritative identity)
            session: Database session

        Returns:
            Created Conversation instance

        Reference: @specs/004-todo-ai-chatbot/plan.md Step 1
        """
        conversation = Conversation(
            user_id=user_id,
            created_at=utc_now(),
            updated_at=utc_now(),
        )
        session.add(conversation)
        await session.flush()
        await session.refresh(conversation)
        return conversation

    async def get_by_id(
        self,
        user_id: str,
        conversation_id: str,
        session: AsyncSession,
    ) -> Conversation:
        """
        Retrieve a conversation by ID with user isolation.

        Constitution III: User Isolation - CRITICAL: Query filters by BOTH conversation_id AND user_id.
        This ensures user_a cannot access user_b's conversations.

        Args:
            user_id: User ID from JWT claims (authoritative identity)
            conversation_id: Conversation ID to retrieve
            session: Database session

        Returns:
            Conversation instance

        Raises:
            ConversationNotFoundError: If conversation not found or doesn't belong to user

        Reference: @specs/004-todo-ai-chatbot/plan.md Step 1 §Testing
        """
        # Constitution III: Dual filtering - conversation_id + user_id (defense in depth)
        stmt = select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id,
        )
        result = await session.execute(stmt)
        conversation = result.scalar_one_or_none()

        if not conversation:
            raise ConversationNotFoundError(
                f"Conversation {conversation_id} not found or doesn't belong to user {user_id}"
            )

        return conversation

    async def list_by_user(
        self,
        user_id: str,
        session: AsyncSession,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Conversation]:
        """
        List all conversations for a user.

        Constitution III: User Isolation - CRITICAL: Query filters by user_id only.
        Returns only conversations belonging to the authenticated user.

        Args:
            user_id: User ID from JWT claims (authoritative identity)
            session: Database session
            limit: Maximum number of results to return
            offset: Offset for pagination

        Returns:
            List of Conversation instances, ordered by creation time (newest first)

        Reference: @specs/004-todo-ai-chatbot/plan.md Step 1
        """
        stmt = (
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await session.execute(stmt)
        return result.scalars().all()


# Create singleton instance for dependency injection
conversation_service = ConversationService()
