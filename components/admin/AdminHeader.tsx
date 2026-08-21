"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, RefreshCw, Clock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminTimeRange } from "@/types/admin";

interface AdminHeaderProps {
  selectedRange: AdminTimeRange;
  onRangeChange: (range: AdminTimeRange) => void;
  onRefresh: () => void;
  isLoading: boolean;
  generatedAt?: string;
}

const RANGES: { value: AdminTimeRange; label: string }[] = [
  { value: "24h", label: "24 Hours" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "all", label: "All Time" },
];

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  selectedRange,
  onRangeChange,
  onRefresh,
  isLoading,
  generatedAt,
}) => {
  const formattedTime = generatedAt
    ? new Date(generatedAt).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : null;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Admin Command Center
          </h1>
          <Badge variant="emerald" className="gap-1 px-2.5 py-1 text-xs font-bold shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            Platform Oversight
          </Badge>
        </div>
        <p className="text-xs text-slate-500 font-medium">
          Real-time agricultural telemetry, user adoption analytics, disease diagnostic trends, and system health status.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Time Range Selector */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-100/90 border border-slate-200/80 max-w-full overflow-x-auto scrollbar-none">
          {RANGES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => onRangeChange(r.value)}
              className={`relative px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedRange === r.value
                  ? "text-emerald-800"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {selectedRange === r.value && (
                <motion.div
                  layoutId="activeAdminRange"
                  className="absolute inset-0 bg-white rounded-xl shadow-sm border border-emerald-200/60"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{r.label}</span>
            </button>
          ))}
        </div>

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading}
          onClick={onRefresh}
          className="rounded-xl border-slate-200 text-xs font-bold gap-1.5 h-9"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>

        {/* Timestamp */}
        {formattedTime && (
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-slate-400 px-2 py-1 bg-slate-50 rounded-xl border border-slate-200/60 font-mono">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Updated: {formattedTime}</span>
          </div>
        )}
      </div>
    </div>
  );
};
