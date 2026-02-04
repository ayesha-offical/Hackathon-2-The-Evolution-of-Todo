# Task: T027 | Spec: specs/001-sdd-initialization/tasks.md §Utility Functions - password.py
# Constitution IV: Stateless Backend - Password hashing and verification

"""Password utility functions for authentication."""

from passlib.context import CryptContext

# Bcrypt password hashing context with 12 salt rounds
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)


def hash_password(password: str) -> str:
    """
    Hash a plaintext password using bcrypt with salt rounds.

    Constitution II: JWT Bridge - Password hashing for secure storage
    Uses bcrypt with 12 salt rounds for secure password storage
    Called during user registration to create password_hash field

    Args:
        password: Plaintext password from user registration

    Returns:
        str: Bcrypt hashed password (60 chars)
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify plaintext password against bcrypt hash.

    Constitution II: JWT Bridge - Password verification during login
    Called during user login to verify password matches stored hash

    Args:
        plain_password: Plaintext password from login attempt
        hashed_password: Bcrypt hash stored in database

    Returns:
        bool: True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)
