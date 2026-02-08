/**
 * Task: T328 | Spec: @specs/004-todo-ai-chatbot/spec.md §FR-007
 * Description: Chat page layout with provider
 * Purpose: Wrap chat page with ChatProvider for state management
 */

import { ChatProvider } from "@/contexts/ChatContext";

export const metadata = {
  title: "Chat | Focus Hub",
  description: "AI-powered task management chat interface",
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      {children}
    </ChatProvider>
  );
}
