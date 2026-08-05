"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "emerald" | "warning" | "info" | "glass" | "outline" | "danger";
  dot?: boolean;
}

const variantStyles = {
  emerald: "bg-emerald-100 text-emerald-800 border-emerald-200/80",
  warning: "bg-amber-100 text-amber-800 border-amber-200/80",
  info: "bg-sky-100 text-sky-800 border-sky-200/80",
  glass: "glass-pill text-emerald-900 border-emerald-300/50",
  outline: "bg-white/80 text-slate-700 border-slate-200",
  danger: "bg-rose-100 text-rose-800 border-rose-200/80",
};

const dotColors = {
  emerald: "bg-emerald-500",
  warning: "bg-amber-500",
  info: "bg-sky-500",
  glass: "bg-emerald-500",
  outline: "bg-slate-400",
  danger: "bg-rose-500",
};

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "emerald",
  dot = false,
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-sm transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse", dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
};
