"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "@/contexts/ChatContext";

export function ChatSidebar() {
  const { conversations, currentConversation, startNewConversation, loadConversation } = useChat();

  return (
    <aside className="w-72 bg-[#030712] border-r border-white/5 flex flex-col h-full overflow-hidden">
      {/* Brand Header Section */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8"> {/* Added margin bottom for spacing */}
         
         
        </div>

        {/* New Chat Button - Now shifted down */}
        <motion.button
          onClick={startNewConversation}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 px-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <span className="text-xl">+</span> New Chat
        </motion.button>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto px-4 space-y-2 custom-scrollbar">
        <p className="px-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-4">History</p>
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => loadConversation(conv.id)}
            className={`w-full text-left p-3 rounded-xl text-sm transition-all border ${
              currentConversation?.id === conv.id 
                ? "bg-white/5 border-white/10 text-white" 
                : "border-transparent text-gray-500 hover:bg-white/[0.02]"
            }`}
          >
            <span className="truncate block font-medium">{conv.title || "New Task Chat"}</span>
          </button>
        ))}
      </div>

      {/* User Info Footer */}
      <div className="p-6 border-t border-white/5 bg-white/[0.01]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 border border-white/10 flex items-center justify-center text-[10px] text-white font-bold">U</div>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Pro Member</span>
        </div>
      </div>
    </aside>
  );
}