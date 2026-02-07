# Task: T004 | Spec: @specs/003-modern-ui-improvements/spec.md §US2
# Feature: 003-modern-ui-improvements - Contact form message service
# Constitution III: User Isolation - Contact messages with optional user_id

"""Contact form message service layer."""

from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from src.models.contact_message import ContactMessage
from src.utils.datetime import utc_now
from src.utils.uuid import uuid4_str


class ContactService:
    """Service for contact form message management."""

    def __init__(self, session: AsyncSession):
        """Initialize contact service with async database session.

        Args:
            session: AsyncSession for database operations
        """
        self.session = session

    async def create_contact_message(
        self,
        name: str,
        email: str,
        subject: str,
        message: str,
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> ContactMessage:
        """
        Create a new contact message (unauthenticated or authenticated).

        Constitution III: user_id parameter is OPTIONAL and comes from JWT token middleware.
        If user_id is None, message is from unauthenticated user (still valid).
        Task T004: Functional Requirements FR-007-009 from spec.md

        Args:
            name: Sender's name (1-255 chars, required)
            email: Sender's email address (required, must be valid format)
            subject: Message subject/topic (1-500 chars, required)
            message: Message content (required, no max length)
            user_id: User ID from JWT token (optional, None for unauthenticated users)
            ip_address: IP address of sender (optional, for spam tracking)

        Returns:
            Created ContactMessage entity with all fields populated

        Raises:
            ValueError: If validation fails
        """
        # Validate name
        if not name or len(name) < 1 or len(name) > 255:
            raise ValueError("Name must be 1-255 characters")

        if not name.strip():
            raise ValueError("Name cannot be empty or whitespace only")

        # Validate email
        if not email or len(email) < 5 or len(email) > 255:
            raise ValueError("Email must be 5-255 characters")

        if not email.strip():
            raise ValueError("Email cannot be empty or whitespace only")

        # Validate subject
        if not subject or len(subject) < 1 or len(subject) > 500:
            raise ValueError("Subject must be 1-500 characters")

        if not subject.strip():
            raise ValueError("Subject cannot be empty or whitespace only")

        # Validate message
        if not message or len(message) < 1:
            raise ValueError("Message cannot be empty")

        if not message.strip():
            raise ValueError("Message cannot be empty or whitespace only")

        # Create contact message with optional user_id (Constitution III - supports both auth states)
        contact_message = ContactMessage(
            id=uuid4_str(),
            user_id=user_id,  # NULL for unauthenticated users, UUID for authenticated
            name=name.strip(),
            email=email.strip(),
            subject=subject.strip(),
            message=message.strip(),
            ip_address=ip_address,
            is_read=False,
            admin_notes=None,
            created_at=utc_now(),
            updated_at=utc_now(),
        )

        self.session.add(contact_message)
        return contact_message
