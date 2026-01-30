# Task: T016 | Spec: specs/001-sdd-initialization/tasks.md §JWT Middleware Implementation
# Constitution II: JWT Bridge - JWT verification middleware for secure authentication

"""JWT verification middleware for Better Auth integration."""

import logging
from typing import Callable

from fastapi import Request, Response
from jose import JWTError, jwt
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from src.config import get_settings
from src.constants import PUBLIC_ENDPOINTS, JWT_ALGORITHM

logger = logging.getLogger(__name__)


class JWTVerificationMiddleware(BaseHTTPMiddleware):
    """
    JWT verification middleware for Constitution II - JWT Bridge.

    Constitution II: JWT Bridge - Extracts and verifies JWT tokens from
    Authorization headers, integrating with Better Auth frontend.

    Behavior:
    - Extract JWT from Authorization: Bearer <token> header
    - Verify JWT signature using BETTER_AUTH_SECRET with HS256
    - Extract 'sub' (user_id) claim from verified token
    - Store user_id in request.state.user_id
    - Return 401 Unauthorized if invalid/expired/missing
    - Skip verification for PUBLIC_ENDPOINTS

    Used by dependency injection in get_current_user_id()
    """

    BEARER_PREFIX = "Bearer "
    PUBLIC_ENDPOINTS = PUBLIC_ENDPOINTS

    async def dispatch(
        self, request: Request, call_next: Callable
    ) -> Response:
        """
        Process request through JWT verification.

        Args:
            request: FastAPI request object
            call_next: Next middleware in chain

        Returns:
            Response: Either verified request forwarded to next handler,
                     or 401 Unauthorized JSON response
        """
        # Skip verification for CORS preflight requests (OPTIONS)
        if request.method == "OPTIONS":
            return await call_next(request)

        # Skip verification for public endpoints
        if request.url.path in self.PUBLIC_ENDPOINTS:
            return await call_next(request)

        # Extract token from Authorization header
        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith(self.BEARER_PREFIX):
            logger.warning(
                f"Missing or malformed Authorization header for {request.url.path}"
            )
            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid or missing Authorization header"},
            )

        token = auth_header[len(self.BEARER_PREFIX) :].strip()

        # Verify JWT signature
        try:
            settings = get_settings()
            payload = jwt.decode(
                token,
                settings.better_auth_secret,
                algorithms=[JWT_ALGORITHM],
            )

            # Extract 'sub' claim (user_id from Better Auth)
            user_id = payload.get("sub")

            if not user_id:
                logger.warning("JWT token missing 'sub' claim")
                return JSONResponse(
                    status_code=401,
                    content={"detail": "Invalid token claims"},
                )

            # Store user_id in request state (Constitution III - User Isolation)
            request.state.user_id = user_id
            logger.debug(f"JWT verified for user: {user_id}")

        except JWTError as e:
            logger.warning(f"JWT verification failed: {str(e)}")
            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid or expired token"},
            )
        except Exception as e:
            logger.error(f"Unexpected error in JWT verification: {str(e)}")
            return JSONResponse(
                status_code=401,
                content={"detail": "Authentication failed"},
            )

        # Forward request with user_id in request.state
        response = await call_next(request)
        return response
