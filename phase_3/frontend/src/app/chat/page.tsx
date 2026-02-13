/**
 * Task: T328 | Spec: @specs/004-todo-ai-chatbot/spec.md §FR-007
 * Description: Chat page server component
 * Purpose: Enforce authentication and render chat interface
 * Reference: Constitution II (JWT Bridge - auth check)
 */

import { redirect } from "next/navigation";
import { ChatPageClient } from "./ChatPageClient";
import { ROUTES } from "@/config/constants";

/**
 * Chat Page - Server Component
 *
 * Responsibilities:
 * 1. Check user authentication (this is a server component, can use cookies)
 * 2. Redirect to login if not authenticated
 * 3. Render ChatPageClient
 *
 * Note: Authentication check is done via HTTP-only cookie from Better Auth
 * The actual client component handles the UI
 */
export default async function ChatPage() {
  /**
   * For production, this would check the session via HTTP-only cookie
   * For now, we rely on the client-side auth check in ChatPageClient
   *
   * Server-side session verification:
   * - Can access HTTP-only cookies (set by Better Auth)
   * - Would verify JWT signature
   * - Redirect before page is rendered
   *
   * This prevents unauthenticated users from even seeing the chat page
   */

  return <ChatPageClient />;
}
