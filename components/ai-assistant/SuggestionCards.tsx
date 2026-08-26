"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowUpRight, Sprout, Leaf, Droplets, FlaskConical, CloudSun, Bug, LucideIcon } from "lucide-react";

export interface SuggestionItem {
  id: string;
  icon: LucideIcon;
  prompt: string;
  category: "Disease" | "Crop Planning" | "Irrigation" | "Soil & Fertilizer" | "Weather" | "Pest Control";
  color: string;
}

export const SUGGESTIONS: SuggestionItem[] = [
  {
    id: "1",
    icon: Leaf,
    prompt: "My tomato leaves are turning yellow.",
    category: "Disease",
    color: "from-amber-500/10 to-yellow-500/10 border-amber-500/20 text-amber-900 dark:text-amber-300",
  },
  {
    id: "2",
    icon: Sprout,
    prompt: "Which crop should I grow this season?",
    category: "Crop Planning",
    color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-900 dark:text-emerald-300",
  },
  {
    id: "3",
    icon: Droplets,
    prompt: "Suggest irrigation for paddy.",
    category: "Irrigation",
    color: "from-sky-500/10 to-blue-500/10 border-sky-500/20 text-sky-900 dark:text-sky-300",
  },
  {
    id: "4",
    icon: FlaskConical,
    prompt: "Recommend fertilizer for maize.",
    category: "Soil & Fertilizer",
    color: "from-purple-500/10 to-indigo-500/10 border-purple-500/20 text-purple-900 dark:text-purple-300",
  },
  {
    id: "5",
    icon: CloudSun,
    prompt: "How will tomorrow's weather affect my crop?",
    category: "Weather",
    color: "from-teal-500/10 to-cyan-500/10 border-teal-500/20 text-teal-900 dark:text-teal-300",
  },
  {
    id: "6",
    icon: Bug,
    prompt: "How do I control leaf blight?",
    category: "Pest Control",
    color: "from-rose-500/10 to-red-500/10 border-rose-500/20 text-rose-900 dark:text-rose-300",
  },
];

interface SuggestionCardsProps {
  onSelectSuggestion: (prompt: string) => void;
}

export const SuggestionCards: React.FC<SuggestionCardsProps> = ({ onSelectSuggestion }) => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>Quick Farming Prompts</span>
        </div>
        <span className="text-[11px] text-slate-400">Click any prompt to ask AI</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {SUGGESTIONS.map((item, index) => {
          const IconComp = item.icon;
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectSuggestion(item.prompt)}
              className={`group relative text-left p-4 rounded-2xl bg-gradient-to-br ${item.color} backdrop-blur-md border hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-900/5 transition-all duration-200 flex flex-col justify-between`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 shadow-xs group-hover:scale-110 transition-transform">
                  <IconComp className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/70 dark:bg-slate-800/70 border border-slate-200/50 text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  {item.category}
                </span>
              </div>

              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 group-hover:text-emerald-950 dark:group-hover:text-emerald-300 leading-snug">
                {item.prompt}
              </p>

              <div className="mt-3 flex items-center justify-end text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-[11px] font-medium">
                <span className="mr-1 opacity-0 group-hover:opacity-100 transition-opacity">Ask KrishiMitra</span>
                <ArrowUpRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
