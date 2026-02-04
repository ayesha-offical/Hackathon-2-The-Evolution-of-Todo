# Task: T026 | Spec: specs/001-sdd-initialization/tasks.md §Error Handling Utilities
# Constitution V: Error Handling & HTTP Semantics - Custom exception classes

"""Custom exception classes for Phase 2 Foundation Layer."""

from fastapi import HTTPException


class InvalidCredentialsError(Exception):
    """Raised when user credentials are invalid."""

    def __init__(self, message: str = "Invalid credentials") -> None:
        """Initialize exception."""
        self.message = message
        self.status_code = 400
        super().__init__(self.message)

    def to_http_exception(self) -> HTTPException:
        """Convert to HTTPException for FastAPI response."""
        return HTTPException(status_code=self.status_code, detail=self.message)


class UserNotFoundError(Exception):
    """Raised when user is not found."""

    def __init__(self, message: str = "User not found") -> None:
        """Initialize exception."""
        self.message = message
        self.status_code = 404
        super().__init__(self.message)

    def to_http_exception(self) -> HTTPException:
        """Convert to HTTPException for FastAPI response."""
        return HTTPException(status_code=self.status_code, detail=self.message)


class TaskNotFoundError(Exception):
    """Raised when task is not found."""

    def __init__(self, message: str = "Task not found") -> None:
        """Initialize exception."""
        self.message = message
        self.status_code = 404
        super().__init__(self.message)

    def to_http_exception(self) -> HTTPException:
        """Convert to HTTPException for FastAPI response."""
        return HTTPException(status_code=self.status_code, detail=self.message)


class UnauthorizedError(Exception):
    """Raised when user is not authenticated."""

    def __init__(self, message: str = "Unauthorized") -> None:
        """Initialize exception."""
        self.message = message
        self.status_code = 401
        super().__init__(self.message)

    def to_http_exception(self) -> HTTPException:
        """Convert to HTTPException for FastAPI response."""
        return HTTPException(status_code=self.status_code, detail=self.message)


class ForbiddenError(Exception):
    """Raised when user lacks permissions."""

    def __init__(self, message: str = "Forbidden") -> None:
        """Initialize exception."""
        self.message = message
        self.status_code = 403
        super().__init__(self.message)

    def to_http_exception(self) -> HTTPException:
        """Convert to HTTPException for FastAPI response."""
        return HTTPException(status_code=self.status_code, detail=self.message)


class UserExistsError(Exception):
    """Raised when user already exists."""

    def __init__(self, message: str = "User already exists") -> None:
        """Initialize exception."""
        self.message = message
        self.status_code = 409
        super().__init__(self.message)

    def to_http_exception(self) -> HTTPException:
        """Convert to HTTPException for FastAPI response."""
        return HTTPException(status_code=self.status_code, detail=self.message)
