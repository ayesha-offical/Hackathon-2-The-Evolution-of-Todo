# Task: T005 | Spec: @specs/003-modern-ui-improvements/contracts/contact-api.md
# Feature: 003-modern-ui-improvements - Contact form API endpoints
# Constitution III: User Isolation - Contact endpoint with optional user_id for unauthenticated users

"""Contact form message endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.session import get_db_session
from src.schemas.contact import ContactFormRequest, ContactFormResponse
from src.services.contact_service import ContactService

router = APIRouter()


# ============================================================================
# T005: POST /api/v1/messages/contact (PUBLIC - no auth required)
# ============================================================================


@router.post(
    "/contact",
    response_model=ContactFormResponse,
    status_code=201,
    summary="Submit Contact Form",
    description="Submit a contact form message (authentication optional)",
    responses={
        201: {"description": "Message submitted successfully"},
        400: {"description": "Validation error - invalid input data"},
        422: {"description": "Unprocessable entity - malformed request"},
        500: {"description": "Internal server error"},
    },
)
async def submit_contact_form(
    form_data: ContactFormRequest,
    request: Request,
    session: AsyncSession = Depends(get_db_session),
) -> ContactFormResponse:
    """
    Submit a contact form message.

    Task: T005 | Reference: FR-007-009, contact-api.md §POST /messages/contact

    Constitution III: Supports both authenticated and unauthenticated users.
    If JWT token is present, user_id is extracted and stored.
    If JWT token is missing, user_id is NULL (unauthenticated submission).

    Args:
        form_data: ContactFormRequest with name, email, subject, message
        request: FastAPI request object with optional JWT token
        session: Database session (dependency injection)

    Returns:
        ContactFormResponse with created message details

    Raises:
        HTTPException 400 if validation fails
        HTTPException 422 if request body is malformed
        HTTPException 500 if database error occurs
    """
    try:
        # Extract optional user_id from request (set by JWTVerificationMiddleware)
        # Constitution III: user_id is None for unauthenticated users, which is allowed
        user_id = getattr(request.state, "user_id", None)

        # Extract IP address from request
        client_host = request.client.host if request.client else None

        # Create service instance
        service = ContactService(session)

        # Create contact message (user_id can be None for unauthenticated submissions)
        contact_message = await service.create_contact_message(
            name=form_data.name,
            email=form_data.email,
            subject=form_data.subject,
            message=form_data.message,
            user_id=user_id,
            ip_address=client_host,
        )

        # Flush the create to DB to get generated values (id, timestamps, etc.)
        await session.flush()

        # Refresh from DB to get all generated values
        await session.refresh(contact_message)

        # Commit the transaction
        await session.commit()

        return ContactFormResponse.model_validate(contact_message)

    except ValueError as e:
        # Validation error from service
        await session.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Validation error: {str(e)}",
        )

    except Exception as e:
        # Unexpected error
        await session.rollback()
        import logging

        logger = logging.getLogger(__name__)
        logger.error(
            f"Contact form submission error (user_id={getattr(request.state, 'user_id', None)}): {str(e)}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=500,
            detail="Internal server error",
        )
