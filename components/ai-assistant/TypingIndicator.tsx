"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bot } from "lucide-react";

export const TypingIndicator: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.25 }}
      className="flex items-start gap-3 my-4 max-w-3xl"
    >
      {/* Bot Avatar */}
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 shrink-0">
        <Bot className="w-4 h-4" />
      </div>

      {/* Typing Bubble */}
      <div className="rounded-2xl rounded-tl-xs px-4 py-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-emerald-500/20 shadow-md shadow-emerald-950/5 flex items-center gap-3">
        <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
          🌱 KrishiMitra is thinking...
        </span>
        <div className="flex items-center gap-1.5 pt-0.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{ y: [0, -5, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
              className="w-2 h-2 rounded-full bg-emerald-500"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
