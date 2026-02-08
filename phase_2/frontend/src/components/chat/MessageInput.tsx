/**
 * Task: T331 | Spec: @specs/004-todo-ai-chatbot/spec.md §FR-007
 * Description: Message input component for chat
 * Purpose: Allow users to type and send messages
 * Design: Glassmorphism with smooth transitions
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface MessageInputProps {
  onSendMessage: (message: string) => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
}

/**
 * MessageInput Component
 *
 * Features:
 * - Text input with character counter
 * - Send button that disables during sending
 * - Enter key to send (Shift+Enter for new line)
 * - Auto-focus and clear after sending
 * - Max 2000 characters
 * - Professional glassmorphic styling
 *
 * Props:
 * - onSendMessage: Callback when sending message
 * - isLoading: Whether waiting for response
 * - disabled: Whether input is disabled
 */
export function MessageInput({ onSendMessage, isLoading = false, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isSending = isLoading || isLocalLoading;
  const charCount = message.length;
  const maxChars = 2000;
  const isOverLimit = charCount > maxChars;

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  /**
   * Auto-resize textarea based on content
   */
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    }
  }, [message]);

  /**
   * Handle sending message
   */
  const handleSend = async () => {
    if (!message.trim() || isOverLimit || isSending || disabled) {
      return;
    }

    try {
      setIsLocalLoading(true);
      const messageToSend = message.trim();
      setMessage(""); // Clear immediately for better UX
      await onSendMessage(messageToSend);
    } catch (error) {
      // Error is handled by context
      // Restore message if sending failed
      console.error("Failed to send message:", error);
    } finally {
      setIsLocalLoading(false);
      textareaRef.current?.focus();
    }
  };

  /**
   * Handle key press (Enter to send, Shift+Enter for new line)
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      className="w-full px-4 py-3 bg-gradient-to-b from-background-elevated/80 to-background-surface/60 border border-primary/20 rounded-xl backdrop-blur-md shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-3">
        {/* Input Area */}
        <div className="flex gap-3 items-end">
          {/* Textarea */}
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask AI to create, list, or update tasks... (Shift+Enter for new line)"
              disabled={isSending || disabled}
              className="w-full px-4 py-3 bg-background-surface/60 border border-border/80 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 focus:shadow-glow-sm backdrop-blur-sm transition-all resize-none min-h-[44px] max-h-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Send Button */}
          <motion.button
            onClick={handleSend}
            disabled={!message.trim() || isOverLimit || isSending || disabled}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-3 h-[44px] bg-gradient-primary text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-glow-sm active:scale-95 flex items-center gap-2"
          >
            {isSending ? (
              <>
                <motion.div
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, easing: "linear" }}
                />
                <span>Sending</span>
              </>
            ) : (
              <>
                <span>Send</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </>
            )}
          </motion.button>
        </div>

        {/* Character Counter */}
        <div className="flex justify-between items-center px-1 text-xs">
          <div className="text-text-muted">
            {charCount}/{maxChars} characters
          </div>
          {isOverLimit && (
            <motion.div
              className="text-error font-semibold"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              Message too long
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
