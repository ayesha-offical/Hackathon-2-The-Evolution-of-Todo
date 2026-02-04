/**
 * Task: T015 | Spec: Constitution VI - Frontend Configuration
 * Description: Frontend configuration constants loaded from environment variables
 * Purpose: Centralize API URLs, auth endpoints, and configuration
 */

// ============================================================================
// API CONFIGURATION
// ============================================================================

/**
 * Backend API base URL
 * Environment: NEXT_PUBLIC_API_BASE_URL
 * Default: http://localhost:8000 (development)
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

/**
 * Better Auth service URL
 * Environment: NEXT_PUBLIC_BETTER_AUTH_URL
 * Default: http://localhost:8000/api/v1/auth (development)
 */
export const BETTER_AUTH_URL =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:8000/api/v1/auth';

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * Authentication API endpoints
 * Reference: @specs/001-sdd-initialization/api/rest-endpoints.md
 */
export const AUTH_ENDPOINTS = {
  REGISTER: `${API_BASE_URL}/api/v1/auth/register`,
  LOGIN: `${API_BASE_URL}/api/v1/auth/login`,
  LOGOUT: `${API_BASE_URL}/api/v1/auth/logout`,
  REFRESH: `${API_BASE_URL}/api/v1/auth/refresh`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/v1/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/api/v1/auth/reset-password`,
} as const;

/**
 * Task CRUD API endpoints
 * Reference: @specs/001-sdd-initialization/api/rest-endpoints.md
 */
export const TASK_ENDPOINTS = {
  CREATE: `${API_BASE_URL}/api/v1/tasks`,
  LIST: `${API_BASE_URL}/api/v1/tasks`,
  GET: (id: string) => `${API_BASE_URL}/api/v1/tasks/${id}`,
  UPDATE: (id: string) => `${API_BASE_URL}/api/v1/tasks/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/api/v1/tasks/${id}`,
} as const;

// ============================================================================
// APPLICATION CONSTANTS
// ============================================================================

/**
 * Task status enum values
 * Reference: @specs/001-sdd-initialization/database/schema.md
 */
export const TASK_STATUS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  ARCHIVED: 'Archived',
} as const;

/**
 * Task status colors for UI
 * Reference: @specs/001-sdd-initialization/ui/pages.md §Design System
 */
export const TASK_STATUS_COLORS: Record<string, string> = {
  [TASK_STATUS.PENDING]: 'bg-blue-500',     // Blue
  [TASK_STATUS.IN_PROGRESS]: 'bg-orange-500', // Orange
  [TASK_STATUS.COMPLETED]: 'bg-green-500',   // Green
  [TASK_STATUS.ARCHIVED]: 'bg-gray-500',     // Gray
} as const;

// ============================================================================
// PAGINATION
// ============================================================================

/**
 * Default pagination settings
 * Reference: @specs/001-sdd-initialization/api/rest-endpoints.md
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// ============================================================================
// VALIDATION RULES
// ============================================================================

/**
 * Password validation requirements
 * Reference: @specs/001-sdd-initialization/features/authentication.md
 */
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  REQUIRES_UPPERCASE: true,
  REQUIRES_LOWERCASE: true,
  REQUIRES_NUMBER: true,
  REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
} as const;

/**
 * Email validation regex
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Task title validation
 * Reference: @specs/001-sdd-initialization/features/task-crud.md
 */
export const TASK_VALIDATION = {
  TITLE_MIN_LENGTH: 1,
  TITLE_MAX_LENGTH: 255,
  DESCRIPTION_MAX_LENGTH: 2000,
} as const;

// ============================================================================
// TIMING CONSTANTS
// ============================================================================

/**
 * JWT token expiration times (must match backend)
 * Reference: @specs/001-sdd-initialization/features/authentication.md
 */
export const JWT_EXPIRATION = {
  ACCESS_TOKEN_SECONDS: 3600,      // 1 hour
  REFRESH_TOKEN_DAYS: 30,          // 30 days
  REFRESH_TOKEN_SECONDS: 30 * 24 * 60 * 60, // 2,592,000 seconds
} as const;

/**
 * UI timing constants (milliseconds)
 */
export const TIMING = {
  TOAST_DURATION: 3000,            // Toast notification auto-dismiss
  DEBOUNCE_DELAY: 500,             // Input debounce
  TRANSITION_DURATION: 300,        // UI transition duration
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

/**
 * Standard error messages for user feedback
 */
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_ALREADY_REGISTERED: 'Email already registered',
  WEAK_PASSWORD: 'Password does not meet requirements',
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
  INVALID_EMAIL: 'Invalid email address',
  EMAIL_VERIFICATION_REQUIRED: 'Please verify your email first',
  TASK_NOT_FOUND: 'Task not found',
  UNAUTHORIZED_ACCESS: 'You do not have permission to access this resource',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
} as const;

// ============================================================================
// ROUTING
// ============================================================================

/**
 * Application routes
 * Reference: @specs/001-sdd-initialization/ui/pages.md §Navigation Structure
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: (token: string) => `/reset-password/${token}`,
  DASHBOARD: '/dashboard',
  TASKS_NEW: '/dashboard/tasks/new',
  TASKS_EDIT: (id: string) => `/dashboard/tasks/${id}`,
} as const;

// ============================================================================
// DEBUG/DEVELOPMENT SETTINGS
// ============================================================================

export const DEBUG = {
  LOG_API_CALLS: process.env.NODE_ENV === 'development',
  MOCK_AUTH: false, // Set true to mock auth for development without backend
} as const;
