"use client";

import React, { forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { CardProps } from "@/types";

export interface ExtendedCardProps
  extends Omit<HTMLMotionProps<"div">, "children">,
    Omit<CardProps, "children"> {
  children?: React.ReactNode;
}

export const Card = forwardRef<HTMLDivElement, ExtendedCardProps>(
  ({ className, variant = "glass", hoverEffect = true, children, ...props }, ref) => {
    const variantClasses = {
      glass: "glass-card",
      default: "bg-white border border-slate-200/80 shadow-sm",
      bordered: "bg-white/80 backdrop-blur-md border-2 border-emerald-500/20 shadow-sm",
      gradient: "bg-gradient-to-br from-white/90 via-emerald-50/30 to-white/90 border border-emerald-200/60 shadow-glass",
    };

    return (
      <motion.div
        ref={ref}
        whileHover={hoverEffect ? { y: -3, transition: { duration: 0.2 } } : undefined}
        className={cn(
          "rounded-3xl p-4 sm:p-6 transition-all duration-300 relative overflow-hidden",
          variantClasses[variant],
          hoverEffect && "glass-card-hover",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 mb-4", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-xl font-bold tracking-tight text-slate-900 leading-snug", className)}
      {...props}
    >
      {children}
    </h3>
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-slate-500 font-normal leading-relaxed", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center pt-4 border-t border-slate-100 mt-4", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";
