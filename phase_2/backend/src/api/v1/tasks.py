# Task: T044, T046, T047, T049, T051, T052 | Spec: specs/001-sdd-initialization/tasks.md §Task CRUD Features
# Constitution III: User Isolation - Every endpoint extracts user_id from JWT and filters by it

"""Task CRUD endpoints for todo management."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies import get_current_user_id
from src.constants import PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT
from src.db.session import get_db_session
from src.schemas.task import TaskCreate, TaskListResponse, TaskResponse, TaskUpdate
from src.services.task_service import TaskService

router = APIRouter()


# ============================================================================
# T044: POST /api/v1/tasks (PROTECTED)
# ============================================================================


@router.post(
    "",
    response_model=TaskResponse,
    status_code=201,
    summary="Create Task",
    description="Create a new task for the authenticated user",
    responses={
        201: {"description": "Task created successfully"},
        400: {"description": "Invalid request data"},
        401: {"description": "Unauthorized - missing or invalid token"},
    },
)
async def create_task(
    task_data: TaskCreate,
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db_session),
) -> TaskResponse:
    """
    Create a new task.

    Task: T044 | Reference: FR-001-002, rest-endpoints.md §POST /api/tasks

    Constitution III: user_id extracted from JWT token and passed to service.
    Never trust task data from request body.

    Args:
        task_data: TaskCreate schema with title, description (optional), status (optional)
        user_id: Extracted from JWT token via middleware (Constitution III)
        session: Database session

    Returns:
        TaskResponse with created task details

    Raises:
        HTTPException 400 if validation fails
        HTTPException 401 if unauthorized
    """
    try:
        service = TaskService(session)
        task = await service.create_task(
            user_id=user_id,
            title=task_data.title,
            description=task_data.description,
            status=task_data.status,
        )
        # Flush the create to DB to get generated values (id, timestamps, etc.)
        await session.flush()
        # Refresh from DB to get all generated values
        await session.refresh(task)
        # Commit the transaction
        await session.commit()
        return TaskResponse.model_validate(task)
    except ValueError as e:
        await session.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        await session.rollback()
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Task creation error for user {user_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to create task")


# ============================================================================
# T046: GET /api/v1/tasks (PROTECTED) - List tasks with pagination
# ============================================================================


@router.get(
    "",
    response_model=TaskListResponse,
    status_code=200,
    summary="List Tasks",
    description="Get all tasks for the authenticated user with pagination",
    responses={
        200: {"description": "Tasks retrieved successfully"},
        401: {"description": "Unauthorized - missing or invalid token"},
    },
)
async def list_tasks(
    limit: int = Query(PAGINATION_DEFAULT_LIMIT, ge=1, le=PAGINATION_MAX_LIMIT),
    offset: int = Query(0, ge=0),
    status: Optional[str] = Query(None, description="Filter by status: Pending, In Progress, Completed, Archived"),
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db_session),
) -> TaskListResponse:
    """
    List all tasks for the user.

    Task: T046 | Reference: FR-003-004, rest-endpoints.md §GET /api/tasks

    Constitution III: Query filters by user_id extracted from JWT token.

    Args:
        limit: Number of tasks to return (1-100, default 20)
        offset: Pagination offset (default 0)
        status: Optional filter by task status
        user_id: Extracted from JWT token (Constitution III)
        session: Database session

    Returns:
        TaskListResponse with paginated task list

    Raises:
        HTTPException 400 if invalid query parameters
        HTTPException 401 if unauthorized
    """
    try:
        service = TaskService(session)
        tasks, total = await service.get_user_tasks(
            user_id=user_id,
            limit=limit,
            offset=offset,
            status=status,
        )

        return TaskListResponse(
            data=[TaskResponse.model_validate(task) for task in tasks],
            total=total,
            offset=offset,
            limit=limit,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve tasks")


# ============================================================================
# T047: GET /api/v1/tasks/{id} (PROTECTED) - Get specific task
# ============================================================================


@router.get(
    "/{task_id}",
    response_model=TaskResponse,
    status_code=200,
    summary="Get Task",
    description="Get a specific task by ID",
    responses={
        200: {"description": "Task retrieved successfully"},
        401: {"description": "Unauthorized - missing or invalid token"},
        403: {"description": "Forbidden - task belongs to another user"},
        404: {"description": "Task not found"},
    },
)
async def get_task(
    task_id: str,
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db_session),
) -> TaskResponse:
    """
    Get a specific task by ID.

    Task: T047 | Reference: FR-004, rest-endpoints.md §GET /api/tasks/{id}

    Constitution III: Query checks both task_id AND user_id (defense in depth).

    Args:
        task_id: Task ID (UUID string)
        user_id: Extracted from JWT token (Constitution III)
        session: Database session

    Returns:
        TaskResponse with task details

    Raises:
        HTTPException 401 if unauthorized
        HTTPException 403 if task belongs to different user
        HTTPException 404 if task not found
    """
    try:
        service = TaskService(session)
        task = await service.get_task_by_id(user_id=user_id, task_id=task_id)

        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        return TaskResponse.model_validate(task)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve task")


# ============================================================================
# T049: PATCH /api/v1/tasks/{id} (PROTECTED) - Update task
# ============================================================================


@router.patch(
    "/{task_id}",
    response_model=TaskResponse,
    status_code=200,
    summary="Update Task",
    description="Update a task (title, description, status)",
    responses={
        200: {"description": "Task updated successfully"},
        400: {"description": "Invalid request data"},
        401: {"description": "Unauthorized - missing or invalid token"},
        403: {"description": "Forbidden - task belongs to another user"},
        404: {"description": "Task not found"},
    },
)
async def update_task(
    task_id: str,
    task_data: TaskUpdate,
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db_session),
) -> TaskResponse:
    """
    Update a task.

    Task: T049 | Reference: FR-005-006, rest-endpoints.md §PATCH /api/tasks/{id}

    Constitution III: Verifies user owns task BEFORE updating (defense in depth).

    Args:
        task_id: Task ID to update
        task_data: TaskUpdate schema with optional fields to update
        user_id: Extracted from JWT token (Constitution III)
        session: Database session

    Returns:
        TaskResponse with updated task details

    Raises:
        HTTPException 400 if validation fails
        HTTPException 401 if unauthorized
        HTTPException 403 if task belongs to different user
        HTTPException 404 if task not found
    """
    try:
        service = TaskService(session)
        task = await service.update_task(user_id=user_id, task_id=task_id, data=task_data)

        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        # Flush the update to database first (required with autoflush=False)
        await session.flush()
        # Commit the transaction
        await session.commit()
        return TaskResponse.model_validate(task)
    except ValueError as e:
        await session.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        await session.rollback()
        raise
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail="Failed to update task")


# ============================================================================
# T051: DELETE /api/v1/tasks/{id} (PROTECTED) - Delete task
# ============================================================================


@router.delete(
    "/{task_id}",
    status_code=204,
    summary="Delete Task",
    description="Delete a task",
    responses={
        204: {"description": "Task deleted successfully"},
        401: {"description": "Unauthorized - missing or invalid token"},
        403: {"description": "Forbidden - task belongs to another user"},
        404: {"description": "Task not found"},
    },
)
async def delete_task(
    task_id: str,
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db_session),
) -> None:
    """
    Delete a task.

    Task: T051 | Reference: FR-007-008, rest-endpoints.md §DELETE /api/tasks/{id}

    Constitution III: Verifies user owns task BEFORE deleting (defense in depth).

    Args:
        task_id: Task ID to delete
        user_id: Extracted from JWT token (Constitution III)
        session: Database session

    Raises:
        HTTPException 401 if unauthorized
        HTTPException 403 if task belongs to different user
        HTTPException 404 if task not found
    """
    try:
        service = TaskService(session)
        deleted = await service.delete_task(user_id=user_id, task_id=task_id)

        if not deleted:
            raise HTTPException(status_code=404, detail="Task not found")

        # Commit the transaction to persist the deletion
        # The service already flushed the deletion, so we just need to commit
        await session.commit()
    except HTTPException:
        await session.rollback()
        raise
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete task")
