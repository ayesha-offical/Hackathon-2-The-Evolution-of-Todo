/**
 * Task: T327 | Spec: @specs/004-todo-ai-chatbot/spec.md §FR-007
 * Description: Chat context for managing chat state
 * Purpose: Provide chat state management across components
 * Reference: Constitution VI (Context State), Constitution III (User Isolation)
 */

"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { sendChatMessage } from "@/lib/api";
import type { Message, Conversation, ChatContextType } from "@/types/chat";

const ChatContext = createContext<ChatContextType | undefined>(undefined);

/**
 * ChatProvider component
 *
 * Responsibilities:
 * 1. Manage conversation list
 * 2. Manage current conversation and messages
 * 3. Handle sending messages to AI
 * 4. Manage loading and error states
 * 5. Provide chat state to all children
 *
 * Usage:
 * ```tsx
 * <ChatProvider>
 *   <ChatPage />
 * </ChatProvider>
 * ```
 *
 * Then use `const { messages, sendMessage } = useChat()` in child components
 *
 * Reference: Constitution III - User Isolation enforced by authentication
 */
export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  // Conversation state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Loading and error state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Start a new conversation
   * Creates new conversation in backend (implicit, happens on first message)
   * For MVP, we just clear the current state and let first message create it
   */
  const startNewConversation = useCallback(async () => {
    try {
      setError(null);
      setMessages([]);
      setCurrentConversation(null);
      console.debug("[Chat] Started new conversation");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start conversation";
      setError(message);
      console.error("[Chat] Failed to start new conversation:", message);
      throw err;
    }
  }, []);

  /**
   * Load an existing conversation
   * Loads conversation messages from history
   */
  const loadConversation = useCallback(
    async (conversationId: string) => {
      try {
        setError(null);
        setIsLoading(true);

        // Find conversation from list
        const conv = conversations.find((c) => c.id === conversationId);
        if (!conv) {
          throw new Error("Conversation not found");
        }

        setCurrentConversation(conv);

        // Fetch messages for this conversation from API
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chat/conversations/${conversationId}`,
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${sessionStorage.getItem("auth_token")}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
          console.debug("[Chat] Loaded conversation messages:", conversationId);
        } else {
          console.warn("[Chat] Could not load conversation messages, will start fresh");
          setMessages([]);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load conversation";
        setError(message);
        console.error("[Chat] Failed to load conversation:", message);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    },
    [conversations]
  );

  /**
   * Send a message to the AI chatbot
   * Handles:
   * 1. Message validation
   * 2. Creating new conversation if needed
   * 3. Calling chat API
   * 4. Updating local messages state
   * 5. Updating conversation if it was just created
   */
  const sendMessage = useCallback(
    async (text: string) => {
      try {
        setError(null);
        setIsLoading(true);

        if (!text.trim()) {
          throw new Error("Message cannot be empty");
        }

        // Send message to API
        const response = await sendChatMessage(text, currentConversation?.id);

        // Update messages from API response
        setMessages(response.messages);

        // Update current conversation if not set
        if (!currentConversation) {
          const newConversation: Conversation = {
            id: response.conversation_id,
            user_id: user?.id || "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setCurrentConversation(newConversation);
          setConversations((prev) => [newConversation, ...prev]);
          console.debug("[Chat] Created new conversation:", response.conversation_id);
        }

        console.debug("[Chat] Message sent successfully", {
          conversationId: response.conversation_id,
          messageCount: response.messages.length,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to send message";
        setError(message);
        console.error("[Chat] Failed to send message:", message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [currentConversation, user?.id]
  );

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Load conversations on component mount
   * Fetches all conversations for the current user from the backend
   */
  useEffect(() => {
    if (!user) return;

    const loadConversations = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chat/conversations`,
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${sessionStorage.getItem("auth_token")}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setConversations(data.conversations || []);
          console.debug("[Chat] Loaded conversations on mount:", data.conversations?.length);
        } else {
          console.warn("[Chat] Failed to load conversations, starting fresh");
        }
      } catch (err) {
        console.error("[Chat] Error loading conversations:", err);
        // Continue without error - conversation list is optional on load
      }
    };

    loadConversations();
  }, [user]);

  const value: ChatContextType = {
    conversations,
    currentConversation,
    messages,
    isLoading,
    error,
    startNewConversation,
    loadConversation,
    sendMessage,
    clearError,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

/**
 * Hook to use chat context
 * Throws error if used outside ChatProvider
 *
 * Usage:
 * ```tsx
 * const { messages, sendMessage, isLoading } = useChat();
 * ```
 */
export function useChat(): ChatContextType {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
}
