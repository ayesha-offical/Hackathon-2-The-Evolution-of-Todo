# Task: T027 | Spec: specs/001-sdd-initialization/tasks.md §Utility Functions - uuid.py
# Constitution IV: Stateless Backend - UUID generation for primary keys

"""UUID utility functions for unique identifier generation."""

from uuid import uuid4


def uuid4_str() -> str:
    """
    Generate a UUID4 string for use as primary key (id field).

    Returns UUID as string format (36 chars with hyphens)
    Used in User, Task, RefreshToken models for id field generation

    Returns:
        str: UUID4 as string (e.g., "550e8400-e29b-41d4-a716-446655440000")
    """
    return str(uuid4())
