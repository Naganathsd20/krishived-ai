"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  MessageSquare,
  Trash2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Bot,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatSession {
  id: string;
  title: string;
  dateGroup: "Today" | "Yesterday" | "Previous 7 Days" | "Older";
  timestamp: string;
  preview: string;
}

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  isOpen,
  onToggle,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const filteredSessions = sessions.filter(
    (session) =>
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const grouped = {
    Today: filteredSessions.filter((s) => s.dateGroup === "Today"),
    Yesterday: filteredSessions.filter((s) => s.dateGroup === "Yesterday"),
    "Previous 7 Days": filteredSessions.filter(
      (s) => s.dateGroup === "Previous 7 Days"
    ),
    Older: filteredSessions.filter((s) => s.dateGroup === "Older"),
  };

  const confirmDeleteSession = (id: string) => {
    onDeleteSession(id);
    setDeleteTargetId(null);
  };

  return (
    <>
      {/* Sidebar Desktop Drawer */}
      <motion.aside
        initial={false}
        animate={{ width: isOpen ? 280 : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className={cn(
          "h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-emerald-950/10 dark:border-emerald-500/20 flex flex-col overflow-hidden relative shadow-sm z-20 shrink-0",
          !isOpen && "pointer-events-none hidden lg:flex"
        )}
      >
        {/* Top Header & New Chat Button */}
        <div className="p-4 border-b border-emerald-900/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                  KrishiMitra
                </h3>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Your Smart Farming Companion
                </p>
              </div>
            </div>
            <button
              onClick={onToggle}
              title="Collapse sidebar"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </motion.button>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 transition-all"
            />
          </div>
        </div>

        {/* Conversation History List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs scrollbar-thin scrollbar-thumb-emerald-200">
          {(["Today", "Yesterday", "Previous 7 Days", "Older"] as const).map(
            (groupKey) => {
              const items = grouped[groupKey];
              if (!items || items.length === 0) return null;

              return (
                <div key={groupKey} className="space-y-1.5">
                  <div className="flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <Calendar className="w-3 h-3 text-emerald-600" />
                    <span>{groupKey}</span>
                  </div>

                  <div className="space-y-1">
                    {items.map((session) => {
                      const isActive = session.id === activeSessionId;
                      const isHovered = hoveredId === session.id;

                      return (
                        <motion.div
                          key={session.id}
                          onMouseEnter={() => setHoveredId(session.id)}
                          onMouseLeave={() => setHoveredId(null)}
                          whileHover={{ x: 2 }}
                          className="relative group"
                        >
                          <button
                            onClick={() => onSelectSession(session.id)}
                            className={cn(
                              "w-full text-left flex items-start gap-2.5 px-3 py-2 rounded-xl transition-all duration-200",
                              isActive
                                ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 font-semibold shadow-xs"
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
                            )}
                          >
                            <MessageSquare
                              className={cn(
                                "w-3.5 h-3.5 mt-0.5 shrink-0",
                                isActive
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-slate-400 group-hover:text-emerald-500"
                              )}
                            />
                            <div className="flex-1 min-w-0 pr-6">
                              <p className="truncate text-xs">
                                {session.title
                                  .replace(/KrishiVed Advisory for:?/gi, "KrishiMitra Advice for")
                                  .replace(/KrishiVed AI Agricultural Advisory/gi, "KrishiMitra Advice")
                                  .replace(/KrishiVed Assistant/gi, "KrishiMitra")
                                  .replace(/KrishiVed Advisory/gi, "KrishiMitra Advice")
                                  .replace(/KrishiVed/gi, "KrishiMitra")}
                              </p>
                              <p className="truncate text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                                {session.preview
                                  .replace(/KrishiVed AI Agricultural Advisory/gi, "KrishiMitra Agricultural Advice")
                                  .replace(/KrishiVed Advisory for:?/gi, "KrishiMitra Advice for")
                                  .replace(/KrishiVed Assistant/gi, "KrishiMitra")
                                  .replace(/KrishiVed Advisory/gi, "KrishiMitra Advice")
                                  .replace(/KrishiVed/gi, "KrishiMitra")}
                              </p>
                            </div>
                          </button>

                          {/* Action Buttons on Hover */}
                          <AnimatePresence>
                            {(isHovered || isActive) && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-1 rounded-lg border border-slate-200/50 shadow-xs"
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteTargetId(session.id);
                                  }}
                                  title="Delete conversation"
                                  className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            }
          )}

          {filteredSessions.length === 0 && (
            <div className="text-center py-8 text-slate-400 px-4">
              <Sparkles className="w-6 h-6 mx-auto mb-2 text-emerald-500/40" />
              <p className="text-xs">No conversations yet</p>
            </div>
          )}
        </div>

        {/* Footer info card */}
        <div className="p-3 border-t border-emerald-900/10 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px]">
            <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="leading-tight">
              🌱 KrishiMitra is online.
            </span>
          </div>
        </div>
      </motion.aside>

      {/* Floating Toggle Button when Collapsed */}
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={onToggle}
          title="Open chat sidebar"
          className="fixed left-4 top-20 z-30 p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:border-emerald-300 transition-all hidden lg:flex items-center justify-center"
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTargetId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-rose-500/30 rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-600">
                <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Delete Conversation
                  </h4>
                  <p className="text-xs text-slate-500">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Are you sure you want to permanently delete this conversation?
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setDeleteTargetId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmDeleteSession(deleteTargetId)}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500 shadow-md shadow-rose-600/20 transition-colors"
                >
                  Delete Conversation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
