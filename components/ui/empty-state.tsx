"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sprout } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { EmptyStateProps } from "@/types";

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "glass-card rounded-3xl p-10 flex flex-col items-center justify-center text-center max-w-lg mx-auto my-8 border border-emerald-100/60 shadow-sm",
        className
      )}
    >
      <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 mb-5 shadow-inner">
        {icon || <Sprout className="w-8 h-8" />}
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">
        {title}
      </h3>

      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button variant="emerald" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
};
