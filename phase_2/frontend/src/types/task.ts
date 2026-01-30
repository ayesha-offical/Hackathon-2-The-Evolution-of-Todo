/**
 * Task: T079 | Spec: @specs/001-sdd-initialization/ui/pages.md
 * Description: Task type definitions for frontend
 * Purpose: Provide TypeScript interfaces for task data matching backend API
 * Reference: backend/src/models/task.py, backend/src/schemas/task.py
 */

/**
 * Task status enum matching backend TaskStatus
 */
export enum TaskStatus {
  PENDING = "Pending",
  IN_PROGRESS = "In Progress",
  COMPLETED = "Completed",
  ARCHIVED = "Archived",
}

/**
 * Task object from backend API
 * Maps to Task entity in database schema
 */
export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

/**
 * Create task request payload
 */
export interface TaskCreate {
  title: string;
  description?: string;
  status?: TaskStatus;
}

/**
 * Update task request payload
 * All fields are optional for partial updates
 */
export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: TaskStatus;
}

/**
 * Task list API response with pagination
 * Constitution III: Matches backend TaskListResponse schema from src/schemas/task.py
 */
export interface TaskListResponse {
  data: Task[];
  total: number;
  offset: number;
  limit: number;
}
