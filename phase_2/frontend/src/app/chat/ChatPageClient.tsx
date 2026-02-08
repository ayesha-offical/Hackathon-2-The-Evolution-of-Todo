/**
 * Task: T328 | Spec: @specs/004-todo-ai-chatbot/spec.md §FR-007
 * Description: Chat page client component with authentication check
 * Purpose: Render chat interface with authentication guard
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ChatComponent, ChatSidebar } from "@/components/chat";
import { ROUTES } from "@/config/constants";
import { motion } from "framer-motion";

/**
 * ChatPageClient Component
 *
 * Features:
 * - Checks user authentication on load
 * - Redirects to login if not authenticated
 * - Shows loading state while checking auth
 * - Renders chat interface if authenticated
 * - Professional layout with dashboard styling
 *
 * Constitution II: User identity verified via JWT token from AuthContext
 */
export function ChatPageClient() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  /**
   * Check authentication and redirect if needed
   */
  useEffect(() => {
    if (!isLoading && !user) {
      router.push(ROUTES.LOGIN);
    }
  }, [user, isLoading, router]);

  /**
   * Show loading state
   */
  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            💬
          </motion.div>
          <p className="text-text-muted">Loading chat...</p>
        </motion.div>
      </div>
    );
  }

  /**
   * Show login prompt if not authenticated
   * (This shouldn't happen due to useEffect redirect, but as a fallback)
   */
  if (!user) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-text-muted mb-6">Please log in to use the chat feature.</p>
          <motion.button
            onClick={() => router.push(ROUTES.LOGIN)}
            className="px-6 py-3 bg-gradient-primary text-white font-semibold rounded-lg hover:shadow-glow-sm transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Go to Login
          </motion.button>
        </motion.div>
      </div>
    );
  }

  /**
   * Render chat interface with ChatGPT-like layout (sidebar + main chat)
   */
  return (
    <motion.main
      className="w-full h-screen bg-gradient-to-br from-background/40 via-background/80 to-background-surface/40 flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Sidebar */}
      <ChatSidebar />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Section */}
        <motion.div
          className="px-6 py-4 border-b border-border/40 bg-background-elevated/20 backdrop-blur-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            AI Task Assistant
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Chat with AI to create, list, update, or delete tasks using natural language
          </p>
        </motion.div>

        {/* Chat Interface */}
        <motion.div
          className="flex-1 overflow-hidden px-4 py-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <ChatComponent />
        </motion.div>

        {/* Footer Info */}
        <motion.div
          className="px-6 py-3 text-xs text-text-muted text-center border-t border-border/40 bg-background-elevated/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <p>
            Powered by OpenAI • User Isolation enforced
          </p>
        </motion.div>
      </div>
    </motion.main>
  );
}
