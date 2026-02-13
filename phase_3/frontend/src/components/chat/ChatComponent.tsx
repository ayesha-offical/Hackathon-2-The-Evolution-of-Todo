/**
 * Task: T329 | Chat Interface - Borderless & No Header
 */

"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "@/contexts/ChatContext";
import { MessageItem } from "./MessageItem";
import { MessageInput } from "./MessageInput";

export function ChatComponent() {
  const { messages, isLoading, sendMessage } = useChat();
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageListRef.current) {
      setTimeout(() => {
        messageListRef.current?.scrollTo({
          top: messageListRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    }
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-full bg-[#030712]/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden relative shadow-2xl">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-cyan-500/5 blur-[100px] pointer-events-none" />

      {/* Messages Area - Now takes full space */}
      <div 
        ref={messageListRef} 
        className="flex-1 overflow-y-auto px-6 py-10 space-y-8 scrollbar-hide"
      >
        {messages.length === 0 && !isLoading && (
          <motion.div 
            className="flex flex-col items-center justify-center h-full text-center p-10" 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl mb-6 grayscale opacity-50">
              ⚡
            </div>
            <h3 className="text-xl font-bold text-white/80 mb-2 tracking-tight">FocusHub AI</h3>
            <p className="text-gray-600 text-[11px] uppercase tracking-widest max-w-xs leading-loose">
              How can I optimize your productivity today?
            </p>
          </motion.div>
        )}

        <AnimatePresence mode="popLayout">
          {messages.map((msg, idx) => (
            <MessageItem key={msg.id} message={msg} index={idx} />
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div className="flex justify-start px-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl flex gap-1.5 items-center">
              <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" />
              <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Section */}
      <div className="p-6 pt-2 bg-gradient-to-t from-[#030712] via-[#030712]/80 to-transparent">
        <MessageInput onSendMessage={sendMessage} isLoading={isLoading} />
        <p className="text-center text-[9px] text-gray-700 mt-3 uppercase tracking-widest">
          AI may provide task suggestions based on your habits
        </p>
      </div>
    </div>
  );
}