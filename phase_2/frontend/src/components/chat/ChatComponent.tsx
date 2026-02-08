/**
 * Task: T329 | Spec: @specs/004-todo-ai-chatbot/spec.md §FR-007
 * Description: Main chat component
 * Purpose: Display chat interface with messages and input
 * Design: Professional glassmorphic layout matching dashboard theme
 */

"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "@/contexts/ChatContext";
import { MessageItem } from "./MessageItem";
import { MessageInput } from "./MessageInput";

/**
 * ChatComponent
 *
 * Features:
 * - Message list with auto-scroll to latest message
 * - Loading spinner while waiting for response
 * - Error message display with dismiss
 * - Empty state with instructions
 * - Smooth animations and transitions
 * - Professional glassmorphic design
 * - Responsive layout
 *
 * Layout:
 * - Header: Title and conversation info
 * - Message List: Scrollable area with messages
 * - Loading Indicator: Shown while processing
 * - Message Input: Always visible at bottom
 * - Error Alert: Dismissible error messages
 */
export function ChatComponent() {
  const { messages, isLoading, error, sendMessage, clearError, currentConversation } = useChat();
  const messageListRef = useRef<HTMLDivElement>(null);
  const [showNewMessageIndicator, setShowNewMessageIndicator] = useState(false);

  /**
   * Auto-scroll to latest message
   */
  useEffect(() => {
    if (messageListRef.current) {
      // Small delay to ensure DOM has updated
      setTimeout(() => {
        messageListRef.current?.scrollTo({
          top: messageListRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 50);
    }
  }, [messages]);

  /**
   * Show indicator when scrolled up and new messages arrive
   */
  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      setShowNewMessageIndicator(false);
    }
  }, [messages, isLoading]);

  return (
    <motion.div
      className="flex flex-col h-full bg-gradient-to-b from-background-elevated/20 to-background/40 rounded-xl border border-border/40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <motion.div
        className="px-6 py-4 border-b border-border/40 bg-background-elevated/60 backdrop-blur-md flex items-center justify-between"
        layoutId="chat-header"
      >
        <div>
          <h2 className="text-xl font-bold text-white">AI Task Assistant</h2>
          <p className="text-sm text-text-muted mt-1">
            {currentConversation ? "Continue your conversation" : "Start a new conversation"}
          </p>
        </div>
        {currentConversation && (
          <div className="text-xs text-text-muted bg-background-surface/50 px-3 py-1 rounded-full">
            {messages.length} messages
          </div>
        )}
      </motion.div>

      {/* Messages Container */}
      <div
        ref={messageListRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-2 scroll-smooth"
      >
        {/* Empty State */}
        {messages.length === 0 && !isLoading && (
          <motion.div
            className="flex flex-col items-center justify-center h-full text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-6">
              <motion.div
                className="text-6xl mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                💬
              </motion.div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Start a Conversation</h3>
            <p className="text-text-muted max-w-md mb-6">
              Ask the AI to create, list, update, or delete tasks using natural language.
            </p>

            {/* Example Prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              {[
                "Create a task called buy milk",
                "List my pending tasks",
                "Mark task buy milk as done",
                "Delete all completed tasks",
              ].map((example, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => sendMessage(example)}
                  className="px-4 py-2 text-sm bg-primary/20 border border-primary/40 text-primary-300 rounded-lg hover:bg-primary/30 hover:border-primary/60 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {example}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Messages List */}
        <AnimatePresence mode="popLayout">
          {messages.map((msg, idx) => (
            <MessageItem key={msg.id} message={msg} index={idx} />
          ))}
        </AnimatePresence>

        {/* Loading Indicator - Show typing bubble */}
        {isLoading && (
          <motion.div
            className="flex justify-start"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-background-elevated/80 border border-primary/20 text-white px-4 py-3 rounded-2xl rounded-bl-sm backdrop-blur-sm">
              <div className="flex gap-2 items-center">
                <motion.div
                  className="w-3 h-3 bg-text-muted rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                />
                <motion.div
                  className="w-3 h-3 bg-text-muted rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                />
                <motion.div
                  className="w-3 h-3 bg-text-muted rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* New Message Indicator */}
        {showNewMessageIndicator && (
          <motion.button
            className="mx-auto px-4 py-2 bg-primary/20 border border-primary/40 text-primary-300 rounded-full text-sm font-semibold hover:bg-primary/30 transition-all"
            onClick={() => {
              messageListRef.current?.scrollTo({
                top: messageListRef.current.scrollHeight,
                behavior: "smooth",
              });
              setShowNewMessageIndicator(false);
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            ↓ New message
          </motion.button>
        )}
      </div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="mx-4 mt-3 p-3 bg-error/10 border border-error/40 text-error-light rounded-lg flex items-start gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <span className="text-lg mt-0.5">⚠️</span>
            <div className="flex-1">
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-error-light hover:text-error transition-colors"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Input */}
      <div className="p-4 border-t border-border/40 bg-background-elevated/30 backdrop-blur-sm">
        <MessageInput
          onSendMessage={sendMessage}
          isLoading={isLoading}
          disabled={false}
        />
      </div>
    </motion.div>
  );
}
