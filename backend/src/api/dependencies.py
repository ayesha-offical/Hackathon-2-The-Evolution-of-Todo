# Task: T017 | Spec: specs/001-sdd-initialization/tasks.md §Dependency Injection
# Constitution III: User Isolation - Dependency function for extracting authenticated user

"""Dependency injection functions for route handlers."""

from fastapi import HTTPException, Request


async def get_current_user_id(request: Request) -> str:
    """
    Extract current user ID from JWT token (set by JWTVerificationMiddleware).

    Constitution III: User Isolation - Returns the user_id extracted from JWT's 'sub' claim.
    Used in route handlers to enforce user data isolation.

    Used in route handlers with: Depends(get_current_user_id)

    Raises:
        HTTPException: 401 Unauthorized if user_id not in request.state

    Args:
        request: FastAPI request object (populated by JWTVerificationMiddleware)

    Returns:
        str: User ID (UUID) for use in service methods and database queries
    """
    user_id = getattr(request.state, "user_id", None)

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized - invalid or missing authentication",
        )

    return user_id
