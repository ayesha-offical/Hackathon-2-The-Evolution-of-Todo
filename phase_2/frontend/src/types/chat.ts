/**
 * Task: T327, T332 | Spec: @specs/004-todo-ai-chatbot/spec.md §FR-007, FR-001
 * Description: Type definitions for chat feature
 * Purpose: Provide type safety for chat state management and API contracts
 */

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  startNewConversation: () => Promise<void>;
  loadConversation: (conversationId: string) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  clearError: () => void;
}

export interface ChatRequestBody {
  message: string;
  conversation_id?: string;
}

export interface ChatResponseBody {
  response: string;
  conversation_id: string;
  messages: Message[];
}
