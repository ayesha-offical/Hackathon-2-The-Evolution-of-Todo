/**
 * Task: T331 | Modern Message Input
 */

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export function MessageInput({ onSendMessage, isLoading }: { onSendMessage: (m: string) => void, isLoading: boolean }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim() || isLoading) return;
    onSendMessage(text);
    setText("");
  };

  return (
    <div className="relative group">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
        placeholder="Type a message..."
        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-16 text-sm text-white placeholder:text-gray-600 outline-none focus:border-cyan-500/50 focus:bg-white/[0.07] transition-all resize-none min-h-[56px] max-h-32"
        rows={1}
      />
      <motion.button
        onClick={handleSend}
        disabled={!text.trim() || isLoading}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="absolute right-3 bottom-3 p-2 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl text-white shadow-lg disabled:opacity-30 disabled:grayscale transition-all"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </motion.button>
    </div>
  );
}