"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sprout, ShieldCheck, CloudSun, Leaf, Sparkles, Building2 } from "lucide-react";
import { SuggestionCards } from "./SuggestionCards";

interface EmptyStateProps {
  onSelectSuggestion: (prompt: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectSuggestion }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 space-y-8 max-w-5xl mx-auto text-center my-auto">
      {/* Hero Welcome Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4 max-w-3xl"
      >
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" style={{ animationDuration: "6s" }} />
          <span>KrishiVed AI Ecosystem</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          Welcome to KrishiMitra
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 font-semibold max-w-xl mx-auto">
          Your Smart Farming Companion
        </p>

        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Ask me anything about:
        </p>

        {/* Feature Capabilities Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 max-w-2xl mx-auto text-xs font-semibold text-slate-700 dark:text-slate-200">
          <span className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
            <Sprout className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Crop recommendations</span>
          </span>
          <span className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
            <Leaf className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Plant disease diagnosis</span>
          </span>
          <span className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
            <CloudSun className="w-4 h-4 text-sky-600 shrink-0" />
            <span>Weather & irrigation</span>
          </span>
          <span className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Soil health & fertilizers</span>
          </span>
          <span className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Pest management</span>
          </span>
          <span className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
            <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Government schemes</span>
          </span>
        </div>
      </motion.div>

      {/* Suggestion Cards */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full"
      >
        <SuggestionCards onSelectSuggestion={onSelectSuggestion} />
      </motion.div>
    </div>
  );
};
