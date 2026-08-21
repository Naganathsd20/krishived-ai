"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChatSidebar, ChatSession } from "@/components/ai-assistant/ChatSidebar";
import { ChatMessage, Message } from "@/components/ai-assistant/ChatMessage";
import { ChatInput } from "@/components/ai-assistant/ChatInput";
import { EmptyState } from "@/components/ai-assistant/EmptyState";
import { TypingIndicator } from "@/components/ai-assistant/TypingIndicator";
import { Bot, RefreshCw, PanelLeftOpen, AlertCircle, CheckCircle2 } from "lucide-react";

export default function AIAssistantPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Toast feedback state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Auto-scroll to bottom of chat
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating, scrollToBottom]);

  // Load user conversations from MongoDB on initial mount
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/ai-assistant/conversations");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.conversations)) {
          setSessions(data.conversations);
        } else {
          setSessions([]);
        }
      } else {
        setSessions([]);
      }
    } catch {
      setSessions([]);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Load specific conversation messages when clicked in sidebar
  const handleSelectSession = async (id: string) => {
    if (!id) return;
    try {
      const res = await fetch(`/api/ai-assistant/conversations/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.conversation) {
          setActiveSessionId(id);
          setMessages(data.conversation.messages || []);
        } else {
          setActiveSessionId(null);
          setMessages([]);
          showToast("Conversation not found.", "error");
          fetchConversations();
        }
      } else {
        setActiveSessionId(null);
        setMessages([]);
        showToast("Unable to load selected chat.", "error");
        fetchConversations();
      }
    } catch {
      setActiveSessionId(null);
      setMessages([]);
      showToast("Error loading conversation.", "error");
    }
  };

  // Send message to Gemini API and persist in MongoDB
  const handleSendMessage = async (text: string, image?: string) => {
    if (!text.trim() && !image) return;

    const tempUserMsgId = `temp-user-${Date.now()}`;
    const timestampStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMessageObj: Message = {
      id: tempUserMsgId,
      sender: "user",
      text,
      timestamp: timestampStr,
      image,
    };

    setMessages((prev) => [...prev, userMessageObj]);
    setIsGenerating(true);

    try {
      const res = await fetch("/api/ai-assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeSessionId,
          message: text,
          image,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setActiveSessionId(data.conversationId);

        // Replace temp messages with DB confirmed messages
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== tempUserMsgId),
          {
            id: data.userMessage.id,
            sender: "user",
            text: data.userMessage.text,
            image: data.userMessage.image,
            timestamp: new Date(data.userMessage.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
          {
            id: data.aiMessage.id,
            sender: "ai",
            text: data.aiMessage.text,
            timestamp: new Date(data.aiMessage.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);

        // Refresh conversation history sidebar
        fetchConversations();
      } else {
        showToast(data.error || "Failed to get response.", "error");
      }
    } catch {
      showToast("Network error. Please check connection.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  // Start a fresh chat session
  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
  };

  // Delete conversation from MongoDB
  const handleDeleteSession = async (id: string) => {
    try {
      const res = await fetch(`/api/ai-assistant/conversations/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSessions((prev) => prev.filter((s) => s.id !== id));
        if (activeSessionId === id) {
          handleNewChat();
        }
        showToast("Conversation deleted successfully.", "success");
      } else {
        showToast("Failed to delete conversation. Please try again.", "error");
      }
    } catch {
      showToast("Failed to delete conversation. Please try again.", "error");
    }
  };

  // Clear current active chat view without removing MongoDB history
  const handleClearCurrentChatView = () => {
    setMessages([]);
    showToast("Current chat view cleared.", "success");
  };

  return (
    <div className="h-[calc(100dvh-65px)] min-h-[500px] flex overflow-hidden bg-slate-50/60 dark:bg-slate-950/60 relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 right-6 z-50 px-4 py-2.5 rounded-2xl shadow-xl backdrop-blur-md border text-xs font-semibold flex items-center gap-2 ${
              toast.type === "error"
                ? "bg-rose-500/95 border-rose-400 text-white shadow-rose-500/20"
                : "bg-emerald-600/95 border-emerald-400 text-white shadow-emerald-600/20"
            }`}
          >
            {toast.type === "error" ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left Chat History Sidebar */}
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-14 px-4 border-b border-emerald-950/10 dark:border-emerald-500/20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Open Sidebar"
              >
                <PanelLeftOpen className="w-5 h-5" />
              </button>
            )}

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600/10 border border-emerald-600/20 flex items-center justify-center text-emerald-600">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <span>KrishiMitra</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </h2>
                <p className="text-[10px] text-slate-400 font-medium">
                  Your Smart Farming Companion
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={handleNewChat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-emerald-50 hover:text-emerald-700 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Session</span>
              </button>
            )}
          </div>
        </header>

        {/* Message History Viewport */}
        <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-emerald-200">
          {messages.length === 0 ? (
            <EmptyState onSelectSuggestion={handleSendMessage} />
          ) : (
            <div className="max-w-4xl mx-auto space-y-4">
              <AnimatePresence>
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
              </AnimatePresence>

              {isGenerating && <TypingIndicator />}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Bottom Input Area */}
        <div className="bg-gradient-to-t from-slate-50 dark:from-slate-950 via-slate-50/80 dark:via-slate-950/80 to-transparent pt-2 shrink-0">
          <ChatInput
            onSendMessage={handleSendMessage}
            onClearChat={handleClearCurrentChatView}
            disabled={isGenerating}
            hasMessages={messages.length > 0}
          />
        </div>
      </div>
    </div>
  );
}
