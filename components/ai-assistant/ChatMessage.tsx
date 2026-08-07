"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  User,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  image?: string;
}

interface ChatMessageProps {
  message: Message;
}

// Inline Markdown Parser Component for Gemini AI responses
const MarkdownRenderer: React.FC<{ content: string; isUser: boolean }> = ({
  content,
  isUser,
}) => {
  if (isUser) {
    return <div className="whitespace-pre-wrap">{content}</div>;
  }

  const parseInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong
            key={index}
            className="font-bold text-emerald-950 dark:text-emerald-200"
          >
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (
        part.startsWith("*") &&
        part.endsWith("*") &&
        !part.startsWith("**")
      ) {
        return (
          <em
            key={index}
            className="italic text-slate-700 dark:text-slate-300"
          >
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={index}
            className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-mono text-[11px] border border-emerald-200/50"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const lines = content.split("\n");

  return (
    <div className="space-y-2 text-xs sm:text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Headers ### Header
        if (trimmed.startsWith("### ")) {
          return (
            <h3
              key={idx}
              className="text-sm font-bold text-emerald-900 dark:text-emerald-300 mt-2 mb-1 flex items-center gap-1.5 border-b border-emerald-500/10 pb-1"
            >
              {parseInline(trimmed.replace(/^###\s+/, ""))}
            </h3>
          );
        }

        if (trimmed.startsWith("## ")) {
          return (
            <h2
              key={idx}
              className="text-base font-bold text-emerald-900 dark:text-emerald-300 mt-3 mb-1"
            >
              {parseInline(trimmed.replace(/^##\s+/, ""))}
            </h2>
          );
        }

        // Bullet lists - Item or * Item
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2 my-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span>{parseInline(trimmed.replace(/^[-*]\s+/, ""))}</span>
            </div>
          );
        }

        // Numbered lists 1. Item
        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numberedMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2 my-0.5">
              <span className="font-bold text-emerald-600 text-xs shrink-0">
                {numberedMatch[1]}.
              </span>
              <span>{parseInline(numberedMatch[2])}</span>
            </div>
          );
        }

        // Standard Paragraph
        return <p key={idx}>{parseInline(trimmed)}</p>;
      })}
    </div>
  );
};

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);

  const isUser = message.sender === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex items-start gap-3 my-4 group",
        isUser ? "flex-row-reverse justify-start" : "flex-row justify-start"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md transition-transform group-hover:scale-105",
          isUser
            ? "bg-gradient-to-tr from-slate-700 to-slate-900 shadow-slate-900/20"
            : "bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-600/20"
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message Content Container */}
      <div
        className={cn(
          "max-w-[85%] sm:max-w-[75%] space-y-1.5",
          isUser ? "items-end text-right" : "items-start text-left"
        )}
      >
        {/* Header Metadata */}
        <div
          className={cn(
            "flex items-center gap-2 text-[10px] font-semibold text-slate-400 px-1",
            isUser ? "justify-end" : "justify-start"
          )}
        >
          <span className="text-slate-600 dark:text-slate-300">
            {isUser ? "You" : "KrishiMitra"}
          </span>
          <span>•</span>
          <span>{message.timestamp}</span>
        </div>

        {/* Message Bubble */}
        <div
          className={cn(
            "rounded-2xl p-4 shadow-sm backdrop-blur-xl relative transition-all duration-200",
            isUser
              ? "rounded-tr-xs bg-gradient-to-br from-emerald-700 to-teal-700 text-white shadow-emerald-900/10"
              : "rounded-tl-xs bg-white/95 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-slate-900/5"
          )}
        >
          {/* Attached Image if Present */}
          {message.image && (
            <div className="mb-3 overflow-hidden rounded-xl border border-white/20 shadow-xs max-w-xs">
              <div className="relative group/img">
                <img
                  src={message.image}
                  alt="Crop attachment"
                  className="w-full h-40 object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[10px] font-medium text-white bg-slate-900/70 px-2 py-1 rounded-full flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" /> Crop Attachment
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Markdown Content */}
          <MarkdownRenderer content={message.text} isUser={isUser} />

          {/* Action bar for AI messages */}
          {!isUser && (
            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4 text-slate-400 text-xs">
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopy}
                  title="Copy text"
                  className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors text-[11px]"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setLiked(liked === true ? null : true)}
                  title="Helpful"
                  className={cn(
                    "p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
                    liked === true
                      ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
                      : ""
                  )}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setLiked(liked === false ? null : false)}
                  title="Not helpful"
                  className={cn(
                    "p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
                    liked === false
                      ? "text-rose-600 bg-rose-50 dark:bg-rose-950/40"
                      : ""
                  )}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>🌱 KrishiMitra</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
