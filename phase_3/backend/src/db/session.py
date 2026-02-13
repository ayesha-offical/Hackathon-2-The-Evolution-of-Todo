# Task: T025 | Spec: specs/001-sdd-initialization/tasks.md §Database Connection & Session Management
# Constitution IV: Stateless Backend - Database session factory for dependency injection

"""Database session factory for SQLAlchemy async sessions."""

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker

from src.db.engine import engine


# Create async session factory
SessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency injection function for database sessions.

    Yields AsyncSession for use in route handlers.
    Automatically closes session after request completes.

    Used in route handlers with: Depends(get_db_session)

    Yields:
        AsyncSession: Database session for query execution
    """
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
