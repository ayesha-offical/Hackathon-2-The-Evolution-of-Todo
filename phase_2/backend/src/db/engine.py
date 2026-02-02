"""
Task: T014 | Spec: Constitution IV - Stateless Backend Architecture
Description: SQLAlchemy engine initialization for PostgreSQL connections
Purpose: Create database connection pool for async queries

Reference: plan.md Step 2, schema.md Database Setup
Constitution IV: Configuration from environment variables, stateless connections
"""

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    AsyncEngine,
)
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

from src.config import settings


def get_database_url() -> str:
    """
    Get database URL from configuration.

    Converts standard PostgreSQL URL to asyncpg-compatible async URL.
    Example: postgresql://user:pass@host/db → postgresql+asyncpg://user:pass@host/db

    Handles Neon-specific parameters:
    - Removes sslmode and channel_binding parameters (passed via connect_args instead)
    """
    url = settings.get_database_url()

    # Replace postgresql:// with postgresql+asyncpg:// for async driver
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)

    # Remove query parameters that asyncpg handles differently
    if "?" in url:
        import re
        # Remove all query parameters - they'll be handled via connect_args
        url = url.split("?")[0]

    return url


# Create async SQLAlchemy engine
# For local development: Use simple connection pool
# For production (Neon): Use NullPool with SSL
engine: AsyncEngine = create_async_engine(
    get_database_url(),
    echo=settings.is_development(),
    future=True,
    poolclass=NullPool if "neon.tech" in settings.get_database_url() else None,
    connect_args={
        # Only use SSL for remote Neon databases, not for local PostgreSQL
        "ssl": "require" if "neon.tech" in settings.get_database_url() else None,
        "server_settings": {
            "application_name": "phase2_todo_api",
        },
    } if "neon.tech" in settings.get_database_url() else {},
)

# Create session factory for dependency injection
async_session_factory = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    future=True,
)


async def get_async_session() -> AsyncSession:
    """
    Dependency injection function for FastAPI routes.

    Usage in route:
        @app.get("/items")
        async def get_items(session: AsyncSession = Depends(get_async_session)):
            result = await session.execute(...)
            return result
    """
    async with async_session_factory() as session:
        yield session


async def init_db() -> None:
    """
    Initialize database (create tables from models).

    Must be called on application startup.
    Requires all SQLModel entities to be imported before calling.
    """
    async with engine.begin() as conn:
        # Import Base to ensure all models are registered
        from sqlmodel import SQLModel
        await conn.run_sync(SQLModel.metadata.create_all)


async def close_db() -> None:
    """
    Close database connections on shutdown.

    Must be called on application shutdown.
    """
    await engine.dispose()
