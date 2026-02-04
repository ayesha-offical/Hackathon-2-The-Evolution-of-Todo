# Task: T028 | Spec: specs/001-sdd-initialization/tasks.md §Base Configuration & Helpers
# Constitution IV: Stateless Backend - Application constants and configuration values

"""Application constants for Phase 2 Foundation Layer."""

import os
import re
from enum import Enum

# ============================================================================
# JWT Configuration (Constitution II - JWT Bridge)
# ============================================================================

JWT_ALGORITHM = "HS256"
JWT_ACCESS_TOKEN_EXPIRE_SECONDS = 3600  # 1 hour
JWT_REFRESH_TOKEN_EXPIRE_SECONDS = 2592000  # 30 days

# ============================================================================
# Password Validation (Constitution II - Security)
# ============================================================================

# Password validation regex: 8+ chars, mixed case, at least one number
PASSWORD_REGEX = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$")
PASSWORD_MIN_LENGTH = 8
PASSWORD_MAX_LENGTH = 128
PASSWORD_VALIDATION_MESSAGE = (
    "Password must be at least 8 characters with uppercase, lowercase, and number"
)

# ============================================================================
# Task Status Enum (Constitution III - User Isolation)
# ============================================================================


class TaskStatus(str, Enum):
    """Task status enumeration for task workflow."""

    PENDING = "Pending"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    ARCHIVED = "Archived"


# ============================================================================
# Email Validation (Constitution II - User Registration)
# ============================================================================

EMAIL_MIN_LENGTH = 5
EMAIL_MAX_LENGTH = 255
EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")

# ============================================================================
# API Configuration (Constitution IV - Stateless Backend)
# ============================================================================

API_TITLE = "Phase 2 Todo API"
API_VERSION = "1.0.0"
API_DESCRIPTION = "Full-stack todo application with JWT authentication"

# Public endpoints that skip JWT verification
PUBLIC_ENDPOINTS = {
    "/health",
    "/api/v1/auth/register",
    "/api/v1/auth/login",
    "/api/v1/auth/refresh",  # Refresh can use refresh token instead of access token
    "/api/v1/auth/forgot-password",
    "/api/v1/auth/reset-password",
    # Better Auth compatible endpoints
    "/api/v1/auth/sign-up/email",
    "/api/v1/auth/sign-in/email",
    "/api/v1/auth/get-session",
    # Documentation endpoints
    "/docs",
    "/redoc",
    "/openapi.json",
}

# ============================================================================
# Database Configuration (Constitution IV - Stateless Backend)
# ============================================================================

# Neon PostgreSQL uses NullPool to prevent connection pool exhaustion
DB_POOL_SIZE = 5
DB_MAX_OVERFLOW = 10
DB_POOL_PRE_PING = True  # Verify connections before use
DB_ECHO = False  # Set to True for SQL debugging

# ============================================================================
# Pagination Defaults
# ============================================================================

PAGINATION_DEFAULT_LIMIT = 20
PAGINATION_MAX_LIMIT = 100
PAGINATION_DEFAULT_OFFSET = 0

# ============================================================================
# Error Messages (Constitution V - Error Handling)
# ============================================================================

ERROR_INVALID_CREDENTIALS = "Invalid email or password"
ERROR_USER_NOT_FOUND = "User not found"
ERROR_USER_EXISTS = "User with this email already exists"
ERROR_INVALID_TOKEN = "Invalid or expired token"
ERROR_INSUFFICIENT_PERMISSIONS = "Insufficient permissions"
ERROR_TASK_NOT_FOUND = "Task not found"
ERROR_INVALID_EMAIL = "Invalid email format"
ERROR_INVALID_PASSWORD = "Invalid password format"
