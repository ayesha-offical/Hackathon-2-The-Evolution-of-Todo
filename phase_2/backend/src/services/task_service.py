# Task: T043, T045, T048, T050 | Spec: specs/001-sdd-initialization/tasks.md §Task CRUD
# Constitution III: User Isolation - All queries filter by user_id from JWT token

"""Task management service layer."""

from typing import List, Optional, Tuple

from sqlalchemy import delete, desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.constants import TaskStatus
from src.models.task import Task
from src.schemas.task import TaskUpdate
from src.utils.datetime import utc_now
from src.utils.uuid import uuid4_str


class TaskService:
    """Service for task management with Constitution III user isolation."""

    def __init__(self, session: AsyncSession):
        """Initialize task service with async database session."""
        self.session = session

    async def create_task(
        self, user_id: str, title: str, description: Optional[str] = None, status: TaskStatus = TaskStatus.PENDING
    ) -> Task:
        """
        Create a new task for the user.

        Constitution III: user_id parameter MUST come from JWT token, never from request body.
        Task T043: Functional Requirements FR-001-002 from task-crud.md

        Args:
            user_id: User ID extracted from JWT token (Constitution III)
            title: Task title (1-255 chars)
            description: Optional task description (0-2000 chars)
            status: Task status (default: Pending)

        Returns:
            Created Task entity with all fields populated

        Raises:
            BadRequestError if validation fails
        """
        # Validate title
        if not title or len(title) < 1 or len(title) > 255:
            raise ValueError("Title must be 1-255 characters")

        # Validate description
        if description and len(description) > 2000:
            raise ValueError("Description cannot exceed 2000 characters")

        # Validate status
        if status not in [TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED, TaskStatus.ARCHIVED]:
            raise ValueError(f"Invalid status: {status}")

        # Create task with user_id from JWT (Constitution III - user isolation)
        task = Task(
            id=uuid4_str(),
            user_id=user_id,
            title=title,
            description=description,
            status=status,
            created_at=utc_now(),
            updated_at=utc_now(),
        )

        self.session.add(task)
        return task

    async def get_user_tasks(
        self,
        user_id: str,
        limit: int = 20,
        offset: int = 0,
        status: Optional[str] = None,
    ) -> Tuple[List[Task], int]:
        """
        Get all tasks for a user with pagination.

        Constitution III: Query includes WHERE user_id = <extracted_user_id> filtering.
        Task T045: Functional Requirements FR-003-004 from task-crud.md

        Args:
            user_id: User ID extracted from JWT token (Constitution III)
            limit: Number of tasks to return (default: 20, max: 100)
            offset: Pagination offset (default: 0)
            status: Optional status filter (Pending, In Progress, Completed, Archived)

        Returns:
            Tuple of (tasks list, total count)

        Raises:
            ValueError if status is invalid
        """
        # Build base query with user_id filter (Constitution III - CRITICAL)
        stmt = select(Task).where(Task.user_id == user_id)

        # Apply status filter if provided
        if status:
            if status not in [ts.value for ts in TaskStatus]:
                raise ValueError(f"Invalid status filter: {status}")
            stmt = stmt.where(Task.status == status)

        # Get total count before pagination
        count_stmt = select(Task).where(Task.user_id == user_id)
        if status:
            count_stmt = count_stmt.where(Task.status == status)

        count_result = await self.session.execute(count_stmt)
        total = len(count_result.fetchall())

        # Order by created_at descending and apply pagination
        stmt = stmt.order_by(desc(Task.created_at)).offset(offset).limit(limit)

        result = await self.session.execute(stmt)
        tasks = result.scalars().all()

        return tasks, total

    async def get_task_by_id(self, user_id: str, task_id: str) -> Optional[Task]:
        """
        Get a task by ID with user isolation check.

        Constitution III: Query includes both task_id AND user_id check (defense in depth).
        Task T045: Functional Requirement FR-004 from task-crud.md

        Args:
            user_id: User ID extracted from JWT token (Constitution III)
            task_id: Task ID to retrieve

        Returns:
            Task if found and belongs to user, None otherwise
        """
        # Query with both task_id and user_id (Constitution III - defense in depth)
        stmt = select(Task).where(Task.id == task_id, Task.user_id == user_id)

        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def update_task(
        self, user_id: str, task_id: str, data: TaskUpdate
    ) -> Optional[Task]:
        """
        Update a task with user isolation check.

        Constitution III: CRITICAL - Verify user owns task BEFORE updating.
        Task T048: Functional Requirements FR-005-006 from task-crud.md

        Args:
            user_id: User ID extracted from JWT token (Constitution III)
            task_id: Task ID to update
            data: TaskUpdate schema with fields to update

        Returns:
            Updated Task if successful, None if not found or user_id mismatch
        """
        # Query with user_id check first (Constitution III - CRITICAL)
        stmt = select(Task).where(Task.id == task_id, Task.user_id == user_id)

        result = await self.session.execute(stmt)
        task = result.scalar_one_or_none()

        if not task:
            return None

        # Update only provided fields
        if data.title is not None:
            if not data.title or len(data.title) < 1 or len(data.title) > 255:
                raise ValueError("Title must be 1-255 characters")
            task.title = data.title

        if data.description is not None:
            if len(data.description) > 2000:
                raise ValueError("Description cannot exceed 2000 characters")
            task.description = data.description

        if data.status is not None:
            if data.status not in [TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED, TaskStatus.ARCHIVED]:
                raise ValueError(f"Invalid status: {data.status}")
            task.status = data.status

        # Always update the updated_at timestamp
        task.updated_at = utc_now()

        self.session.add(task)
        return task

    async def delete_task(self, user_id: str, task_id: str) -> bool:
        """
        Delete a task with user isolation check.

        Constitution III: CRITICAL - Verify user owns task BEFORE deleting.
        Task T050: Functional Requirements FR-007-008 from task-crud.md

        Args:
            user_id: User ID extracted from JWT token (Constitution III)
            task_id: Task ID to delete

        Returns:
            True if deleted successfully, False if not found
        """
        # Build DELETE statement with user_id check (Constitution III - CRITICAL)
        # This ensures we only delete tasks that belong to the user
        stmt = delete(Task).where(Task.id == task_id, Task.user_id == user_id)

        # Execute the delete statement
        result = await self.session.execute(stmt)

        # Flush to ensure the delete is processed and rowcount is accurate
        # In SQLAlchemy async, rowcount may not be reliable until flushed
        await self.session.flush()

        # Check if any rows were deleted
        # result.rowcount gives the number of rows affected
        return result.rowcount > 0
