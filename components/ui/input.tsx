"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isGlass?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      isGlass = true,
      disabled,
      id,
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center justify-between"
          >
            <span>
              {label}
              {required && <span className="text-rose-500 ml-0.5">*</span>}
            </span>
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center justify-center text-slate-400 pointer-events-none shrink-0">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            type={type}
            ref={ref}
            disabled={disabled}
            className={cn(
              "w-full h-11 px-4 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 disabled:opacity-50 disabled:bg-slate-100/50",
              isGlass
                ? "bg-white/75 backdrop-blur-md border border-slate-200/80 shadow-sm hover:border-slate-300"
                : "bg-slate-50 border border-slate-200 focus:bg-white",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-rose-500 focus:ring-rose-500/30 focus:border-rose-500",
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3.5 flex items-center justify-center text-slate-400 shrink-0">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-xs text-rose-500 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-400 font-normal">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
