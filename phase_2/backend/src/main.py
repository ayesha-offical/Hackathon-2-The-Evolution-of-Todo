"""
Task: T018 | Spec: Constitution VI - FastAPI Application Setup
Description: FastAPI application entry point with health check endpoint
Purpose: Initialize FastAPI app with middleware stack and basic routes

Reference: plan.md Step 1, Constitution II (JWT Bridge)

This file sets up:
- FastAPI instance with metadata
- CORS middleware configuration
- Basic health check endpoint (public)
- Exception handlers for HTTP errors
- Placeholder for JWT middleware (Phase 2: T016)
- Placeholder for route routers (Phase 3+)
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.config import settings
from src.db.engine import init_db, close_db
from src.middleware.jwt_verification import JWTVerificationMiddleware


# ============================================================================
# LIFESPAN MANAGEMENT (Application startup/shutdown)
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI lifespan context manager for startup and shutdown events.

    Startup: Initialize database
    Shutdown: Close database connections
    """
    # STARTUP
    print(f"Starting Phase 2 Todo API (Environment: {settings.environment})")
    try:
        await init_db()
        print("✅ Database initialized")
    except Exception as e:
        print(f"⚠️ Database initialization warning: {e}")
        # Continue startup even if DB init fails (might be first run with missing migration)

    yield

    # SHUTDOWN
    print("Shutting down Phase 2 Todo API")
    await close_db()
    print("✅ Database connections closed")


# ============================================================================
# FASTAPI APPLICATION INITIALIZATION
# ============================================================================

app = FastAPI(
    title="Phase 2 Todo API",
    description="Full-Stack Todo Application Backend (SDD Implementation)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# ============================================================================
# MIDDLEWARE CONFIGURATION
# ============================================================================

# IMPORTANT: CORS Middleware MUST be added FIRST!
# This ensures OPTIONS preflight requests are handled before JWT verification
# CORS Middleware (Cross-Origin Resource Sharing)
# Allows frontend to make requests to backend API
# Allow both localhost:3000 and localhost:3001 for development (Next.js can use either port)

# Build allowed origins list for local development
# For development: Allow localhost on standard ports (3000, 3001)
# For production: Only allow configured frontend URL
# CORS configuration for cross-domain requests (Vercel <-> Hugging Face)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://focus-hub-omega.vercel.app"],  # Allow Vercel frontend
    allow_credentials=True,  # Allow cookies to be sent and received
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=["Content-Type", "Authorization"],
    max_age=3600,  # Cache preflight for 1 hour
)

# JWT Verification Middleware
# Added SECOND so OPTIONS requests bypass it
app.add_middleware(JWTVerificationMiddleware)
# ============================================================================
# EXCEPTION HANDLERS
# ============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """
    Handle HTTPException with proper error response format.

    Constitution V: Error Handling & HTTP Semantics
    Returns consistent error response with status code and detail message.
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.status_code,
            "message": exc.detail,
            "path": str(request.url),
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """
    Handle unexpected exceptions.

    Constitution V: Log stack trace for debugging, return 500 error
    Production: Hide implementation details, development: show traceback
    """
    import traceback
    import logging

    logger = logging.getLogger(__name__)
    logger.error(f"Unhandled exception: {exc}")
    logger.error(traceback.format_exc())

    detail = str(exc) if settings.is_development() else "Internal server error"
    return JSONResponse(
        status_code=500,
        content={
            "error": 500,
            "message": detail,
            "path": str(request.url),
        },
    )


# ============================================================================
# HEALTH CHECK ENDPOINT (PUBLIC - No authentication required)
# ============================================================================

@app.get(
    "/health",
    tags=["Health"],
    summary="Health Check",
    description="Verify API is running and healthy",
    responses={
        200: {"description": "API is healthy"},
        503: {"description": "API is not ready"},
    },
)
async def health_check():
    """
    Health check endpoint for monitoring and load balancers.

    Returns status of API and database connection.
    PUBLIC endpoint (no JWT required).

    Task: T018 | Spec: plan.md Step 1
    """
    try:
        # Check database connection
        from src.db.engine import engine
        from sqlalchemy import text
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "service": "phase2-todo-api",
            "environment": settings.environment,
            "version": "1.0.0",
        }
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "service": "phase2-todo-api",
                "error": str(e),
            },
        )


# ============================================================================
# API v1 ROUTER (Phase 3+)
# ============================================================================

# Task: T042 - Register v1 router with auth endpoints
from src.api.v1 import router as api_v1_router

app.include_router(api_v1_router)

# The following routers will be registered in subsequent phases:
# - Task CRUD endpoints (Phase 4: T043-T054)
#   - POST /api/v1/tasks (create)
#   - GET /api/v1/tasks (list with pagination)
#   - GET /api/v1/tasks/{id} (read)
#   - PATCH /api/v1/tasks/{id} (update)
#   - DELETE /api/v1/tasks/{id} (delete)


if __name__ == "__main__":
    import asyncio
    import sys
    import uvicorn

    # Fix for Python 3.8 + uvloop compatibility issue
    # Set the event loop policy explicitly to avoid RuntimeError
    if sys.version_info >= (3, 8) and sys.platform.startswith("linux"):
        try:
            # Try to use uvloop if available, but with proper event loop setup
            import uvloop
            asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())
        except (ImportError, RuntimeError):
            # Fall back to default asyncio event loop
            pass

    uvicorn.run(
        "src.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.is_development(),
        log_level=settings.log_level.lower(),
        loop="asyncio",  # Use asyncio instead of auto-detecting uvloop
    )
