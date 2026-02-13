/**
 * Task: T330 | Professional Message Bubbles
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Message } from "@/types/chat";

export function MessageItem({ message, index = 0 }: { message: Message; index?: number }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`flex gap-3 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {/* Avatar Placeholder */}
        <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${
          isUser ? "bg-blue-900 text-white" : "bg-white/10 text-white border border-white/10"
        }`}>
          {isUser ? "U" : "AI"}
        </div>

        <div className={`p-4 rounded-2xl shadow-xl ${
          isUser 
            ? "bg-gradient-to-br from-blue-900 to-cyan-800 text-white rounded-tr-sm" 
            : "bg-white/[0.03] border border-white/10 text-gray-200 rounded-tl-sm backdrop-blur-sm"
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          <p className={`text-[9px] mt-2 opacity-40 font-bold ${isUser ? "text-right" : "text-left"}`}>
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </motion.div>
  );
}