"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Paperclip,
  Trash2,
  Image as ImageIcon,
  X,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (text: string, image?: string) => void;
  onClearChat: () => void;
  disabled?: boolean;
  hasMessages?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onClearChat,
  disabled = false,
  hasMessages = false,
}) => {
  const [text, setText] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea logic
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        160
      )}px`;
    }
  }, [text]);

  const handleSend = () => {
    if ((!text.trim() && !attachedImage) || disabled) return;
    onSendMessage(text.trim(), attachedImage || undefined);
    setText("");
    setAttachedImage(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Mock sample image attachment selection for UI demonstration
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSimulateAttachImage = () => {
    // If no real file chosen, fallback to a sample high-quality agricultural photo
    setAttachedImage(
      "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=800&auto=format&fit=crop"
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-3 sm:p-4 space-y-2 relative">
      {/* Attached Image Preview Bar */}
      <AnimatePresence>
        {attachedImage && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="flex items-center justify-between p-2 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-emerald-500/30 shadow-md backdrop-blur-md max-w-xs mb-1"
          >
            <div className="flex items-center gap-2.5">
              <img
                src={attachedImage}
                alt="Upload preview"
                className="w-10 h-10 rounded-xl object-cover border border-emerald-500/20"
              />
              <div className="text-[11px]">
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                  Crop Image Attached
                </p>
                <p className="text-emerald-600 dark:text-emerald-400 font-medium text-[10px]">
                  Ready for AI analysis
                </p>
              </div>
            </div>
            <button
              onClick={() => setAttachedImage(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Input Box Card */}
      <div className="relative rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-emerald-950/5 focus-within:border-emerald-500/60 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all duration-300 p-2 sm:p-3">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        <div className="flex items-end gap-2">
          {/* Action Toolbar Left */}
          <div className="flex items-center gap-1 pb-1">
            {/* Attach Image Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.click();
                } else {
                  handleSimulateAttachImage();
                }
              }}
              title="Attach crop image (UI)"
              className="p-2 rounded-2xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
            >
              <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>

            {/* Clear Chat Button (visible when messages exist) */}
            {hasMessages && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setShowClearConfirm(true)}
                title="Clear current chat"
                className="p-2 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            )}
          </div>

          {/* Multiline Textarea */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask KrishiMitra anything about crops, diseases, weather, soil, irrigation, fertilizers, or farming..."
            rows={1}
            disabled={disabled}
            className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-xs sm:text-sm py-2 px-1 resize-none max-h-40 scrollbar-thin scrollbar-thumb-emerald-300"
          />

          {/* Send Button */}
          <div className="pb-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handleSend}
              disabled={(!text.trim() && !attachedImage) || disabled}
              className={cn(
                "p-2.5 sm:p-3 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-md",
                text.trim() || attachedImage
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none"
              )}
            >
              <Send className="w-4 h-4 sm:w-4 sm:h-4" />
            </motion.button>
          </div>
        </div>

        {/* Clear Chat Confirmation Modal */}
        <AnimatePresence>
          {showClearConfirm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl p-3 flex items-center justify-between z-20 border border-rose-500/30 shadow-lg"
            >
              <div className="flex items-center gap-2 text-rose-600 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Clear all current chat messages?</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onClearChat();
                    setShowClearConfirm(false);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500 shadow-sm transition-colors"
                >
                  Clear Chat
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Helper Disclaimer Line */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 px-2 font-medium">
        <div className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          <span>🌱 Press Enter to send • Shift+Enter for a new line</span>
        </div>
        <span>Powered by KrishiMitra</span>
      </div>
    </div>
  );
};
