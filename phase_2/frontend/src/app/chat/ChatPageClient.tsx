/**
 * Task: T328 | Spec: @specs/004-todo-ai-chatbot/spec.md §FR-007
 * Description: Chat page client component with authentication check
 * Purpose: Render chat interface with authentication guard
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ChatComponent } from "@/components/chat";
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
   * Render chat interface
   */
  return (
    <motion.main
      className="w-full min-h-screen bg-gradient-to-br from-background-elevated/10 via-background/80 to-background-surface/40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Container */}
      <div className="max-w-6xl mx-auto h-screen px-4 py-6">
        {/* Header Section */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            AI Task Assistant
          </h1>
          <p className="text-text-muted">
            Chat with AI to manage your tasks. Create, list, update, or delete tasks with natural language.
          </p>
        </motion.div>

        {/* Chat Interface */}
        <motion.div
          className="h-[calc(100%-120px)] rounded-xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <ChatComponent />
        </motion.div>

        {/* Footer Info */}
        <motion.div
          className="mt-4 text-xs text-text-muted text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <p>
            Powered by OpenAI • Your messages are processed securely • Constitution III: User Isolation enforced
          </p>
        </motion.div>
      </div>
    </motion.main>
  );
}
