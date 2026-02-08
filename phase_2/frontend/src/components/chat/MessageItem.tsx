/**
 * Task: T330 | Spec: @specs/004-todo-ai-chatbot/spec.md §FR-007
 * Description: Individual message display component
 * Purpose: Render a single chat message with proper styling
 * Design: Professional chat bubbles with glassmorphism
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Message } from "@/types/chat";

interface MessageItemProps {
  message: Message;
  index?: number;
}

/**
 * MessageItem Component
 *
 * Features:
 * - Different styling for user vs assistant messages
 * - Smooth entrance animation
 * - Formatted timestamps
 * - Professional chat bubble design
 * - Glassmorphic effects
 *
 * User messages: Right-aligned, primary color gradient
 * Assistant messages: Left-aligned, neutral/elevated background
 *
 * Props:
 * - message: Message object with id, role, content, created_at
 * - index: Index for staggered animations (optional)
 */
export function MessageItem({ message, index = 0 }: MessageItemProps) {
  const isUser = message.role === "user";

  // Format timestamp (e.g., "2:30 PM" or "Today 2:30 PM")
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();

      const timeFormatter = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      if (isToday) {
        return timeFormatter.format(date);
      }

      const dateFormatter = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      });

      return `${dateFormatter.format(date)} ${timeFormatter.format(date)}`;
    } catch {
      return "";
    }
  };

  return (
    <motion.div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: "easeOut",
      }}
    >
      <div
        className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl ${
          isUser
            ? // User message: Primary gradient, right-aligned
              "bg-gradient-primary text-white rounded-br-sm shadow-glow-sm"
            : // Assistant message: Card style, left-aligned
              "bg-background-elevated/80 border border-primary/20 text-white rounded-bl-sm shadow-card backdrop-blur-sm"
        }`}
      >
        {/* Message Content */}
        <div className="break-words whitespace-pre-wrap text-sm leading-relaxed">
          {message.content}
        </div>

        {/* Timestamp */}
        <div
          className={`text-xs mt-2 opacity-70 ${
            isUser ? "text-white/70" : "text-text-muted"
          }`}
        >
          {formatTime(message.created_at)}
        </div>
      </div>
    </motion.div>
  );
}
