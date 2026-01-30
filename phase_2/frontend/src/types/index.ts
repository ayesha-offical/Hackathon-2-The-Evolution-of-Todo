/**
 * Task: T079 | Spec: @specs/001-sdd-initialization/ui/pages.md §TypeScript Types
 * Description: TypeScript interfaces for frontend
 * Purpose: Type safety across components and API calls
 * Reference: plan.md Step 4 & 5, Constitution VI §Code Quality
 */

/**
 * Task Interface
 * Matches API response from backend GET /api/v1/tasks
 */
export interface Task {
  id: string;
  user_id: string; // From JWT - ensures user isolation
  title: string;
  description?: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Archived';
  created_at: string; // ISO 8601 datetime
  updated_at: string; // ISO 8601 datetime
}

/**
 * User Interface
 * Matches API response from backend GET /api/v1/auth/me
 */
export interface User {
  id: string;
  email: string;
  is_verified: boolean;
  created_at: string;
  updated_at?: string;
}

/**
 * Pagination Interface
 * Standard pagination response structure from backend API
 * Constitution III: Matches backend TaskListResponse from src/schemas/task.py
 */
export interface Pagination {
  total: number;
  offset: number;
  limit: number;
}

/**
 * Paginated Response Interface
 * Wrapper for paginated API responses
 * Matches backend format: { data: T[], total: number, offset: number, limit: number }
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  offset: number;
  limit: number;
}

/**
 * Error Response Interface
 * Standard error response from backend
 */
export interface ErrorResponse {
  detail: string;
  status?: number;
}

/**
 * Login Request Interface
 * Request body for POST /api/v1/auth/login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login Response Interface
 * Response from POST /api/v1/auth/login
 */
export interface LoginResponse {
  user: User;
  token: string;
  expires_in: number;
}

/**
 * Register Request Interface
 * Request body for POST /api/v1/auth/register
 */
export interface RegisterRequest {
  email: string;
  password: string;
}

/**
 * Register Response Interface
 * Response from POST /api/v1/auth/register
 */
export interface RegisterResponse {
  id: string;
  email: string;
  is_verified: boolean;
  created_at: string;
}

/**
 * Create Task Request Interface
 * Request body for POST /api/v1/tasks
 */
export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: 'Pending' | 'In Progress' | 'Completed' | 'Archived';
}

/**
 * Update Task Request Interface
 * Request body for PATCH /api/v1/tasks/{id}
 */
export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'Pending' | 'In Progress' | 'Completed' | 'Archived';
}

/**
 * API Call Options Interface
 * Options for the apiCall wrapper function
 */
export interface ApiCallOptions extends RequestInit {
  body?: string | FormData;
}

/**
 * Session Interface
 * User session state
 */
export interface Session {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
