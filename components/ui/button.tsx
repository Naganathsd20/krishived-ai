"use client";

import React, { forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ComponentVariant, ComponentSize } from "@/types";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "size" | "children"> {
  children?: React.ReactNode;
  variant?: ComponentVariant;
  size?: ComponentSize | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ComponentVariant, string> = {
  default:
    "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald border border-emerald-500/30 font-medium",
  emerald:
    "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-600/25 border border-emerald-400/20 font-semibold",
  outline:
    "border border-emerald-600/30 hover:border-emerald-600 text-emerald-800 hover:bg-emerald-50/60 bg-white/50 backdrop-blur-sm font-medium",
  glass:
    "glass-pill text-emerald-900 hover:bg-white/80 border border-emerald-200/60 shadow-sm font-medium",
  ghost:
    "text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/50 font-medium",
  danger:
    "bg-rose-600 hover:bg-rose-700 text-white shadow-sm font-medium",
};

const sizeStyles: Record<ComponentSize | "icon", string> = {
  sm: "h-8 px-3 text-xs rounded-xl gap-1.5",
  md: "h-10 px-4 text-sm rounded-2xl gap-2",
  lg: "h-12 px-6 text-base rounded-2xl gap-2.5",
  icon: "h-10 w-10 p-0 rounded-2xl justify-center",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.015 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.975 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}

        {children && <span>{children}</span>}

        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
