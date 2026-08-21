"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, className }) => {
  return (
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn("flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6", className)}
    >
      {children}
    </motion.main>
  );
};

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badge,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60",
        className
      )}
    >
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl font-normal leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {action && <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">{action}</div>}
    </div>
  );
};

export const GridContainer: React.FC<{
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  className?: string;
}> = ({ children, cols = 3, className }) => {
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-6", colClasses[cols], className)}>
      {children}
    </div>
  );
};
