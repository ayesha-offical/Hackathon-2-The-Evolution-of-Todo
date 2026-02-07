/**
 * Task: T011 | Spec: @specs/003-modern-ui-improvements/spec.md §US2
 * Feature: 003-modern-ui-improvements - Contact form types and interfaces
 * Purpose: TypeScript interfaces for contact form data and API responses
 * Reference: Constitution VI (Code Quality - Type Safety)
 */

/**
 * Contact form input data
 * Mirrors the request schema from the backend
 */
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Contact form API response
 * Returned by POST /api/v1/messages/contact (201 Created)
 */
export interface ContactMessageResponse {
  id: string;
  user_id: string | null; // Null if unauthenticated submission
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string; // ISO 8601 timestamp
}

/**
 * API error response
 * Returned by backend on validation or server errors
 */
export interface ApiErrorResponse {
  detail?: string;
  message?: string;
  error?: number | string;
  [key: string]: unknown;
}

/**
 * Contact form submission result
 * Used for tracking submission state in components
 */
export interface ContactFormSubmissionResult {
  success: boolean;
  message?: string;
  messageId?: string;
  error?: string;
}
