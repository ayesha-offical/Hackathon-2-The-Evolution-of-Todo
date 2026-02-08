/**
 * Task: T330 | Spec: @specs/004-todo-ai-chatbot/spec.md §UI-001
 * Description: Chat sidebar with conversation history (ChatGPT-like)
 * Purpose: Display list of previous conversations and new chat button
 */

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "@/contexts/ChatContext";

/**
 * ChatSidebar Component
 *
 * Features:
 * - New Chat button
 * - List of conversation history
 * - Click to switch conversations
 * - Delete conversation option
 * - Responsive mobile menu
 *
 * Layout:
 * - Header with logo/branding
 * - New Chat button
 * - Scrollable conversation list
 * - Each conversation shows title and date
 */
export function ChatSidebar() {
  const { conversations, currentConversation, startNewConversation, loadConversation } = useChat();
  const [isOpen, setIsOpen] = useState(true);
  const [isHovering, setIsHovering] = useState<string | null>(null);

  const handleNewChat = async () => {
    await startNewConversation();
  };

  const handleSelectConversation = (conversationId: string) => {
    if (conversationId !== currentConversation?.id) {
      loadConversation(conversationId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-6 left-6 z-50 w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-glow-sm transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? "✕" : "☰"}
      </motion.button>

      {/* Sidebar Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            className="fixed lg:static top-0 left-0 bottom-0 w-64 bg-gradient-to-b from-background-elevated/40 to-background/60 border-r border-border/40 backdrop-blur-md z-40 flex flex-col overflow-hidden"
            initial={{ x: -256, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -256, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <motion.div
              className="p-4 border-b border-border/40 bg-background-elevated/60"
              layoutId="sidebar-header"
            >
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-2xl">💬</span>
                Conversations
              </h2>
            </motion.div>

            {/* New Chat Button */}
            <motion.button
              onClick={handleNewChat}
              className="m-4 px-4 py-3 bg-gradient-primary rounded-lg text-white font-semibold hover:shadow-glow-sm transition-all flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>➕</span>
              New Chat
            </motion.button>

            {/* Conversations List */}
            <motion.div className="flex-1 overflow-y-auto px-3 space-y-2">
              <AnimatePresence mode="popLayout">
                {conversations.length === 0 ? (
                  <motion.div
                    key="empty"
                    className="text-center text-text-muted text-sm py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <p>No conversations yet</p>
                    <p>Start a new chat to begin</p>
                  </motion.div>
                ) : (
                  conversations.map((conv) => {
                    const isActive = currentConversation?.id === conv.id;
                    return (
                      <motion.button
                        key={conv.id}
                        onClick={() => handleSelectConversation(conv.id)}
                        onHoverStart={() => setIsHovering(conv.id)}
                        onHoverEnd={() => setIsHovering(null)}
                        className={`w-full text-left p-3 rounded-lg transition-all group ${
                          isActive
                            ? "bg-primary/30 border border-primary/50"
                            : "hover:bg-background-surface/50 border border-transparent"
                        }`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        whileHover={{ x: 4 }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              Chat • {formatDate(conv.created_at)}
                            </p>
                            <p className="text-xs text-text-muted truncate">
                              {formatDate(conv.updated_at)}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })
                )}
              </AnimatePresence>
            </motion.div>

            {/* Footer Info */}
            <motion.div
              className="p-4 border-t border-border/40 bg-background-elevated/30 text-xs text-text-muted text-center"
              layoutId="sidebar-footer"
            >
              <p>Chat history is auto-saved</p>
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </>
  );
}
