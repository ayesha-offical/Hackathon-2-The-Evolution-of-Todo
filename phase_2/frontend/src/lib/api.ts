// Task: T012 | Frontend API wrapper for backend communication
// @specs/001-sdd-initialization/features/authentication.md
// Task: T012 | @specs/003-modern-ui-improvements/contracts/contact-api.md

import { ContactFormData, ContactMessageResponse, ApiErrorResponse } from "@/types/contact";
import type { ChatRequestBody, ChatResponseBody } from "@/types/chat";

/**
 * Wrapper for API calls to backend
 *
 * Features:
 * - Automatically includes Authorization header from sessionStorage token (for cross-domain auth)
 * - Includes credentials (HTTP-only cookies) for same-domain requests
 * - Sets Content-Type to application/json
 * - Includes timeout handling to prevent hanging
 * - Proper error handling and logging
 *
 * @param endpoint - API endpoint path (e.g., "/api/v1/auth/login")
 * @param options - Optional fetch options (method, body, headers, etc.)
 * @returns Response object from fetch
 * @throws Error if request times out or other network issues
 */
export async function apiCall(
  endpoint: string,
  options?: RequestInit
): Promise<Response> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    const url = `${baseUrl}${endpoint}`;

    const headersObj = new Headers({
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    });

    // Add Authorization header from sessionStorage token (for cross-domain requests)
    // This is needed because cookies don't work across different domains
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('auth_token');
      if (token && !headersObj.has('Authorization')) {
        headersObj.set('Authorization', `Bearer ${token}`);
        console.debug(`[API] Added Authorization header from sessionStorage`);
      }
    }

    // Create abort controller to prevent requests from hanging indefinitely
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      console.debug(`[API] ${options?.method || 'GET'} ${endpoint}`);

      const response = await fetch(url, {
        ...options,
        headers: headersObj,
        credentials: "include", // Include HTTP-only cookies (for same-domain requests)
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.debug(`[API] ${options?.method || 'GET'} ${endpoint} - Status: ${response.status}`);

      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        console.error(`[API] Request timeout for ${endpoint}`, error);
        throw new Error(`Request timeout: ${endpoint}`);
      }

      console.error(`[API] Request failed for ${endpoint}:`, error);
      throw error;
    }
  } catch (error) {
    // Outer catch for any unexpected errors
    console.error('[API] Unexpected error in apiCall:', error);
    throw error;
  }
}

/**
 * Convenience wrapper for POST requests
 * @param endpoint - API endpoint path
 * @param body - Request body object (will be JSON stringified)
 * @param options - Optional additional fetch options
 * @returns Response object from fetch
 */
export async function apiPost(
  endpoint: string,
  body?: Record<string, unknown>,
  options?: RequestInit
): Promise<Response> {
  return apiCall(endpoint, {
    ...options,
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Task: T012 | Submit contact form to backend
 *
 * Submits contact form data to POST /api/v1/messages/contact endpoint.
 * Supports both authenticated and unauthenticated submissions.
 *
 * @param formData - Contact form data (name, email, subject, message)
 * @returns ContactMessageResponse with created message details
 * @throws Error if submission fails (validation, network, or server error)
 *
 * Reference: @specs/003-modern-ui-improvements/contracts/contact-api.md §POST /messages/contact
 */
export async function submitContactForm(
  formData: ContactFormData
): Promise<ContactMessageResponse> {
  try {
    const response = await apiPost("/api/v1/messages/contact", formData as unknown as Record<string, unknown>);

    // Handle HTTP error responses
    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.message || `HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    // Parse and return successful response
    const data: ContactMessageResponse = await response.json();
    console.log("[API] Contact form submitted successfully", { messageId: data.id });
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to submit contact form";
    console.error("[API] Contact form submission failed:", errorMessage);
    throw error;
  }
}

/**
 * Task: T332 | Spec: @specs/004-todo-ai-chatbot/spec.md §FR-001, FR-011
 * Send a message to the AI chatbot and receive response
 *
 * Features:
 * - Sends user message to POST /api/v1/chat endpoint
 * - Includes JWT token via Authorization header
 * - Supports optional conversation_id for continuing existing conversations
 * - Returns AI response with full message history
 *
 * @param message - User message text (1-2000 chars)
 * @param conversationId - Optional existing conversation ID
 * @returns ChatResponseBody with AI response and conversation history
 * @throws Error if validation fails, network error, or server error
 *
 * Reference:
 * - spec.md §FR-001 (endpoint contract)
 * - spec.md §FR-011 (JWT verification requirement)
 * - spec.md §SC-001, SC-002, SC-003 (task operations)
 */
export async function sendChatMessage(
  message: string,
  conversationId?: string
): Promise<ChatResponseBody> {
  try {
    // Validate message
    if (!message || !message.trim()) {
      throw new Error("Message cannot be empty");
    }
    if (message.length > 2000) {
      throw new Error("Message exceeds maximum length of 2000 characters");
    }

    const requestBody: ChatRequestBody = {
      message: message.trim(),
      ...(conversationId && { conversation_id: conversationId }),
    };

    console.debug("[Chat API] Sending message to /api/v1/chat", {
      messageLength: message.length,
      hasConversationId: !!conversationId,
    });

    const response = await apiPost("/api/v1/chat", requestBody as unknown as Record<string, unknown>);

    // Handle HTTP error responses
    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.message || `HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    // Parse and return successful response
    const data: ChatResponseBody = await response.json();
    console.log("[Chat API] Message sent successfully", {
      conversationId: data.conversation_id,
      messageCount: data.messages.length,
    });
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to send chat message";
    console.error("[Chat API] Failed to send message:", errorMessage);
    throw error;
  }
}
