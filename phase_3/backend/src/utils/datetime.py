# Task: T027 | Spec: specs/001-sdd-initialization/tasks.md §Utility Functions - datetime.py
# Constitution IV: Stateless Backend - Timestamp utilities with UTC timezone awareness

"""DateTime utility functions for timestamp handling."""

from datetime import datetime, timezone


def utc_now() -> datetime:
    """
    Return current UTC datetime.

    Used for all timestamp fields: created_at, updated_at, expires_at.
    Returns naive datetime in UTC (database columns are TIMESTAMP WITHOUT TIME ZONE).
    This simplifies compatibility with PostgreSQL TIMESTAMP columns.

    Returns:
        datetime: Current UTC time (naive, no timezone info)
    """
    # Return naive UTC datetime (no timezone info)
    # Database uses TIMESTAMP WITHOUT TIME ZONE
    return datetime.utcnow()
