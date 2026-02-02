# Task: T030, T032, T034, T036, T038, T039 | Spec: specs/001-sdd-initialization/tasks.md §Authentication Features
# Constitution II: JWT Bridge - Authentication endpoints for register, login, refresh, logout

"""Authentication endpoints for user registration and login."""

from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Request, Response
from jose import jwt
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies import get_current_user_id
from src.constants import JWT_ACCESS_TOKEN_EXPIRE_SECONDS, JWT_ALGORITHM
from src.db.session import get_db_session
from src.errors import (
    InvalidCredentialsError,
    UserExistsError,
    UserNotFoundError,
    UnauthorizedError,
)
from src.schemas.user import UserCreate, UserLogin, UserResponse
from src.services.auth_service import AuthService

router = APIRouter()


# ============================================================================
# Better Auth Compatible Endpoints
# ============================================================================

@router.post(
    "/sign-up/email",
    response_model=dict,
    status_code=200,
    summary="Better Auth Sign Up",
    description="Sign up with email (Better Auth compatible)",
)
async def better_auth_sign_up(
    user_data: UserCreate,
    session: AsyncSession = Depends(get_db_session),
) -> dict:
    """Better Auth compatible sign-up endpoint."""
    try:
        service = AuthService(session)
        user = await service.register_user(
            email=user_data.email,
            password=user_data.password,
        )
        await session.commit()
        return {
            "user": {
                "id": user.id,
                "email": user.email,
                "name": getattr(user, "name", user.email.split("@")[0]),
                "is_verified": user.is_verified,
                "created_at": user.created_at.isoformat() if user.created_at else None,
            },
            "url": None,
        }
    except UserExistsError as e:
        await session.rollback()
        raise HTTPException(status_code=409, detail=str(e))
    except InvalidCredentialsError as e:
        await session.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        await session.rollback()
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Sign up error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/sign-in/email",
    response_model=dict,
    status_code=200,
    summary="Better Auth Sign In",
    description="Sign in with email (Better Auth compatible)",
)
async def better_auth_sign_in(
    credentials: UserLogin,
    response: Response,
    session: AsyncSession = Depends(get_db_session),
) -> dict:
    """Better Auth compatible sign-in endpoint."""
    try:
        service = AuthService(session)
        user, access_token, refresh_token = await service.login_user(
            email=credentials.email,
            password=credentials.password,
        )
        await session.commit()

        # Set HTTP-only cookies for local development
        # For localhost: Use samesite="lax" (simpler, sufficient for local dev)
        # For production: Should use samesite="strict" or "none" with secure=True
        response.set_cookie(
            key="Authorization",
            value=f"Bearer {access_token}",
            httponly=True,  # True for security - prevents JavaScript access
            secure=False,  # False for localhost HTTP (would be True in production with HTTPS)
            samesite="lax",  # "lax" for local development (sufficient for same-domain)
            path="/",
            max_age=JWT_ACCESS_TOKEN_EXPIRE_SECONDS,
        )
        response.set_cookie(
            key="RefreshToken",
            value=refresh_token,
            httponly=True,
            secure=False,
            samesite="lax",  # "lax" for local development
            path="/",
            max_age=2592000,
        )

        return {
            "user": {
                "id": user.id,
                "email": user.email,
                "name": getattr(user, "name", user.email.split("@")[0]),
                "is_verified": user.is_verified,
                "created_at": user.created_at.isoformat() if user.created_at else None,
            },
            "token": access_token,
            "expires_in": JWT_ACCESS_TOKEN_EXPIRE_SECONDS,
        }
    except (InvalidCredentialsError, UserNotFoundError):
        await session.rollback()
        raise HTTPException(status_code=401, detail="Invalid email or password")
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get(
    "/get-session",
    response_model=dict,
    status_code=200,
    summary="Get Session",
    description="Get current session (Better Auth compatible)",
)
async def better_auth_get_session(
    request: Request,  # Inject FastAPI Request object to access cookies
    session: AsyncSession = Depends(get_db_session),
    authorization: Optional[str] = Header(None),
) -> dict:
    """Get current session from Authorization header or cookies."""
    from src.config import get_settings
    from src.models.user import User
    from sqlalchemy import select
    import logging
    logger = logging.getLogger(__name__)

    try:
        token = None

        # Try to get token from Authorization header first
        if authorization and authorization.startswith("Bearer "):
            token = authorization[len("Bearer "):].strip()
            logger.debug(f"[get-session] Token from Authorization header")

        # If no token in header, check cookies (Constitution II - HTTP-only cookies)
        if not token:
            # Try to get from Authorization cookie set by login endpoint
            # The cookie value is "Bearer <token>"
            try:
                auth_cookie = request.cookies.get('Authorization')
                if auth_cookie and auth_cookie.startswith("Bearer "):
                    token = auth_cookie[len("Bearer "):].strip()
                    logger.debug(f"[get-session] Token from Authorization cookie")
            except (AttributeError, TypeError):
                # Request object might not have cookies in some contexts
                pass

            # If still no token, return empty session
            if not token:
                logger.debug(f"[get-session] No token found in header or cookies")
                return {"user": None, "session": None}

        settings = get_settings()

        try:
            payload = jwt.decode(
                token,
                settings.better_auth_secret,
                algorithms=[JWT_ALGORITHM],
            )
            logger.debug(f"[get-session] JWT decoded successfully: {payload}")
        except Exception as decode_error:
            logger.debug(f"[get-session] JWT decode error: {decode_error}")
            return {"user": None, "session": None}

        user_id = payload.get("sub")
        if not user_id:
            logger.debug(f"[get-session] No user_id in token payload")
            return {"user": None, "session": None}

        logger.debug(f"[get-session] Looking up user: {user_id}")

        # Get user from database
        result = await session.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

        if not user:
            logger.debug(f"[get-session] User not found in database: {user_id}")
            return {"user": None, "session": None}

        logger.debug(f"[get-session] User found: {user.email}")

        return {
            "user": {
                "id": user.id,
                "email": user.email,
                "name": getattr(user, "name", user.email.split("@")[0]),
                "is_verified": user.is_verified,
                "created_at": user.created_at.isoformat() if user.created_at else None,
            },
            "session": {
                "id": user_id,
                "user_id": user_id,
                "expires_at": payload.get("exp"),
            },
        }
    except Exception as e:
        logger.debug(f"[get-session] Session check error: {e}")
        return {"user": None, "session": None}


# ============================================================================
# T030: POST /api/v1/auth/register (PUBLIC)
# ============================================================================


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=201,
    summary="User Registration",
    description="Register a new user account with email and password",
    responses={
        201: {"description": "User registered successfully"},
        400: {"description": "Invalid email or password"},
        409: {"description": "Email already registered"},
    },
)
async def register(
    user_data: UserCreate,
    session: AsyncSession = Depends(get_db_session),
) -> UserResponse:
    """
    Register a new user.

    Task: T030 | Reference: FR-001-004, rest-endpoints.md §POST /api/auth/register

    Args:
        user_data: UserCreate with email and password
        session: Database session (dependency injection)

    Returns:
        UserResponse: Created user record with id, email, is_verified, created_at

    Raises:
        400: Invalid email or password
        409: Email already registered
    """
    try:
        service = AuthService(session)
        user = await service.register_user(
            email=user_data.email,
            password=user_data.password,
        )

        # Commit transaction
        await session.commit()

        # TODO: T038 - Send verification email (mock for now)

        return UserResponse(
            id=user.id,
            email=user.email,
            is_verified=user.is_verified,
            created_at=user.created_at,
        )

    except UserExistsError as e:
        await session.rollback()
        raise HTTPException(status_code=409, detail=str(e))
    except InvalidCredentialsError as e:
        await session.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        await session.rollback()
        import traceback
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Registration error: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# ============================================================================
# T032: POST /api/v1/auth/login (PUBLIC)
# ============================================================================


@router.post(
    "/login",
    status_code=200,
    summary="User Login",
    description="Authenticate user and return JWT access token",
    responses={
        200: {"description": "Login successful"},
        401: {"description": "Invalid credentials"},
    },
)
async def login(
    credentials: UserLogin,
    response: Response,
    session: AsyncSession = Depends(get_db_session),
) -> dict:
    """
    Authenticate user and generate JWT tokens.

    Task: T032 | Reference: FR-005-006, rest-endpoints.md §POST /api/auth/login

    Sets HTTP-only cookies for access and refresh tokens.

    Args:
        credentials: UserLogin with email and password
        response: FastAPI Response for setting cookies
        session: Database session (dependency injection)

    Returns:
        dict: {"user": UserResponse, "token": access_token, "expires_in": 3600}

    Raises:
        401: Invalid email or password
    """
    try:
        service = AuthService(session)
        user, access_token, refresh_token = await service.login_user(
            email=credentials.email,
            password=credentials.password,
        )

        # Commit transaction
        await session.commit()

        # Set HTTP-only cookies for local development
        response.set_cookie(
            key="Authorization",
            value=f"Bearer {access_token}",
            httponly=True,  # True for security - prevents JavaScript access
            secure=False,  # False for localhost HTTP
            samesite="lax",  # "lax" for local development
            path="/",
            max_age=JWT_ACCESS_TOKEN_EXPIRE_SECONDS,
        )

        response.set_cookie(
            key="RefreshToken",
            value=refresh_token,
            httponly=True,
            secure=False,
            samesite="lax",  # "lax" for local development
            path="/",
            max_age=2592000,  # 30 days
        )

        return {
            "user": UserResponse(
                id=user.id,
                email=user.email,
                is_verified=user.is_verified,
                created_at=user.created_at,
            ).dict(),
            "token": access_token,
            "expires_in": JWT_ACCESS_TOKEN_EXPIRE_SECONDS,
        }

    except InvalidCredentialsError as e:
        await session.rollback()
        raise HTTPException(status_code=401, detail=str(e))
    except UserNotFoundError as e:
        await session.rollback()
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")


# ============================================================================
# T034: POST /api/v1/auth/refresh (PUBLIC)
# ============================================================================


@router.post(
    "/refresh",
    status_code=200,
    summary="Token Refresh",
    description="Refresh access token using refresh token",
    responses={
        200: {"description": "Token refreshed successfully"},
        401: {"description": "Invalid or expired refresh token"},
    },
)
async def refresh(
    response: Response,
    session: AsyncSession = Depends(get_db_session),
    authorization: Optional[str] = Header(None),
) -> dict:
    """
    Refresh access token using refresh token from Authorization header.

    Task: T034 | Reference: FR-010, rest-endpoints.md §POST /api/auth/refresh

    Args:
        response: FastAPI Response for setting cookies
        session: Database session (dependency injection)
        authorization: Authorization header with Bearer <refresh_token>

    Returns:
        dict: {"token": new_access_token, "expires_in": 3600}

    Raises:
        401: Invalid or expired refresh token
    """
    # Extract refresh token from Authorization header
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid Authorization header")

    refresh_token = authorization[len("Bearer ") :].strip()

    try:
        service = AuthService(session)
        new_access_token = await service.refresh_access_token(refresh_token)

        # Commit transaction
        await session.commit()

        # Set new access token cookie
        response.set_cookie(
            key="Authorization",
            value=f"Bearer {new_access_token}",
            httponly=True,
            secure=False,  # False for localhost HTTP
            samesite="lax",  # "lax" for local development
            path="/",
            max_age=JWT_ACCESS_TOKEN_EXPIRE_SECONDS,
        )

        return {
            "token": new_access_token,
            "expires_in": JWT_ACCESS_TOKEN_EXPIRE_SECONDS,
        }

    except UnauthorizedError as e:
        await session.rollback()
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=401, detail="Invalid refresh token")


# ============================================================================
# T036: POST /api/v1/auth/logout (PROTECTED - requires Bearer token)
# ============================================================================


@router.post(
    "/logout",
    status_code=200,
    summary="User Logout",
    description="Logout user and revoke all refresh tokens",
    responses={
        200: {"description": "Logged out successfully"},
        401: {"description": "Unauthorized"},
    },
)
async def logout(
    response: Response,
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db_session),
) -> dict:
    """
    Logout user by revoking all refresh tokens.

    Task: T036 | Reference: FR-012-013, rest-endpoints.md

    Constitution III: User Isolation - user_id from JWT token (Depends).

    Args:
        response: FastAPI Response for clearing cookies
        user_id: Current user ID from JWT token (dependency injection)
        session: Database session (dependency injection)

    Returns:
        dict: {"message": "Logged out successfully"}

    Raises:
        401: Unauthorized
    """
    try:
        service = AuthService(session)
        await service.logout_user(user_id)

        # Commit transaction
        await session.commit()

        # Clear cookies with matching parameters to ensure proper deletion
        # IMPORTANT: Parameters MUST match the set_cookie parameters exactly
        response.delete_cookie(
            "Authorization",
            httponly=True,  # Must match set_cookie parameter
            secure=False,
            samesite="lax",  # Must match set_cookie parameter
            path="/",
        )
        response.delete_cookie(
            "RefreshToken",
            httponly=True,  # Must match set_cookie parameter
            secure=False,
            samesite="lax",  # Must match set_cookie parameter
            path="/",
        )

        return {"message": "Logged out successfully"}

    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")


# ============================================================================
# T038: POST /api/v1/auth/forgot-password (PUBLIC)
# ============================================================================


@router.post(
    "/forgot-password",
    status_code=200,
    summary="Request Password Reset",
    description="Request password reset email (security: always returns 200)",
    responses={
        200: {"description": "If email exists, reset link has been sent"},
    },
)
async def forgot_password(
    data: dict,
    session: AsyncSession = Depends(get_db_session),
) -> dict:
    """
    Request password reset email.

    Task: T038 | Reference: FR-014, rest-endpoints.md §POST /api/auth/forgot-password

    Security: Always returns 200 even if email not found (don't reveal registered emails).

    Args:
        data: {"email": "user@example.com"}
        session: Database session (dependency injection)

    Returns:
        dict: {"message": "If email exists, reset link has been sent"}
    """
    email = data.get("email", "").lower()

    try:
        service = AuthService(session)
        await service.request_password_reset(email)

        # Always commit and return same response for security
        await session.commit()

        return {"message": "If email exists, reset link has been sent"}

    except Exception as e:
        await session.rollback()
        # Still return success for security
        return {"message": "If email exists, reset link has been sent"}


# ============================================================================
# T039: POST /api/v1/auth/reset-password (PUBLIC)
# ============================================================================


@router.post(
    "/reset-password",
    status_code=200,
    summary="Reset Password",
    description="Reset user password using reset token",
    responses={
        200: {"description": "Password reset successfully"},
        400: {"description": "Invalid or expired reset token"},
    },
)
async def reset_password(
    data: dict,
    session: AsyncSession = Depends(get_db_session),
) -> dict:
    """
    Reset user password using reset token.

    Task: T039 | Reference: FR-015, rest-endpoints.md §POST /api/auth/reset-password

    Args:
        data: {"reset_token": "...", "new_password": "..."}
        session: Database session (dependency injection)

    Returns:
        dict: {"message": "Password reset successfully"}

    Raises:
        400: Invalid or expired reset token
    """
    reset_token = data.get("reset_token", "")
    new_password = data.get("new_password", "")

    try:
        service = AuthService(session)
        await service.reset_password(reset_token, new_password)

        # Commit transaction
        await session.commit()

        return {"message": "Password reset successfully"}

    except InvalidCredentialsError as e:
        await session.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
