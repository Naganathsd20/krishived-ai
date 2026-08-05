"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sprout, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const spinnerSizes = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-10 h-10",
};

export const Spinner: React.FC<SpinnerProps> = ({ size = "md", className }) => (
  <Loader2 className={cn("animate-spin text-emerald-600", spinnerSizes[size], className)} />
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("glass-card rounded-3xl p-6 space-y-4 animate-pulse", className)}>
    <div className="flex items-center justify-between">
      <div className="h-4 bg-slate-200 rounded-full w-1/3" />
      <div className="w-8 h-8 bg-slate-200 rounded-2xl" />
    </div>
    <div className="h-8 bg-slate-200 rounded-2xl w-1/2" />
    <div className="space-y-2 pt-2">
      <div className="h-3 bg-slate-200 rounded-full w-full" />
      <div className="h-3 bg-slate-200 rounded-full w-4/5" />
    </div>
  </div>
);

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className,
}) => (
  <div className={cn("space-y-2.5 animate-pulse", className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={cn(
          "h-3.5 bg-slate-200/80 rounded-full",
          i === lines - 1 ? "w-2/3" : "w-full"
        )}
      />
    ))}
  </div>
);

export const FullPageLoading: React.FC<{ message?: string }> = ({
  message = "Initializing KrishiVed AI Environment...",
}) => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/90 backdrop-blur-xl">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.5 }}
      className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-600/30 mb-6"
    >
      <Sprout className="w-8 h-8 text-white" />
    </motion.div>
    <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
      KrishiVed <span className="text-emerald-600">AI</span>
    </h3>
    <p className="text-sm text-slate-500 font-medium animate-pulse">{message}</p>
  </div>
);
