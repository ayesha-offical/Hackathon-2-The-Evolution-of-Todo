# Task: T042, T052, T006 | Spec: specs/001-sdd-initialization/tasks.md §Endpoint Integration

"""API v1 routers package."""

from fastapi import APIRouter

from src.api.v1.auth import router as auth_router
from src.api.v1.tasks import router as task_router
from src.api.v1.messages import router as messages_router

# Create main router for all v1 endpoints
router = APIRouter(prefix="/api/v1")

# Register auth router (Task T042 - Authentication endpoints)
router.include_router(auth_router, prefix="/auth", tags=["auth"])

# Register task router (Task T052 - Task CRUD endpoints)
router.include_router(task_router, prefix="/tasks", tags=["tasks"])

# Register messages router (Task T006 - Contact form endpoints)
router.include_router(messages_router, prefix="/messages", tags=["messages"])

# ============================================================================
# Better Auth Compatibility Router (without /v1 prefix)
# ============================================================================
# Better Auth client expects /api/auth/* paths, not /api/v1/auth/*
# This router provides the expected paths for Better Auth library compatibility
router_v0 = APIRouter(prefix="/api")

# Register auth router at /api/auth for Better Auth compatibility
router_v0.include_router(auth_router, prefix="/auth", tags=["auth"])
