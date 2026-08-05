"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ChevronRight } from "lucide-react";
import { DASHBOARD_NAV_ITEMS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-4 overflow-y-auto">
      {/* Top Navigation Sections */}
      <div className="space-y-6">
        {DASHBOARD_NAV_ITEMS.map((section, idx) => (
          <div key={idx} className="space-y-2">
            <h4 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {section.label}
            </h4>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "group flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20"
                        : "text-slate-600 hover:text-emerald-900 hover:bg-emerald-50/70"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          "w-4 h-4 transition-transform group-hover:scale-110",
                          isActive ? "text-white" : "text-slate-400 group-hover:text-emerald-600"
                        )}
                      />
                      <span>{item.title}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <Badge
                          variant={isActive ? "glass" : "emerald"}
                          className={cn("text-[9px] py-0 px-1.5", isActive && "text-white border-white/30")}
                        >
                          {item.badge}
                        </Badge>
                      )}
                      {item.isNew && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      )}
                      <ChevronRight
                        className={cn(
                          "w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity",
                          isActive ? "opacity-100 text-white" : "text-slate-400"
                        )}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom SaaS Banner */}
      <div className="mt-8 pt-4 border-t border-slate-200/70">
        <div className="rounded-3xl p-4 bg-gradient-to-br from-emerald-900 to-teal-950 text-white shadow-lg shadow-emerald-950/10 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-500/20 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-2 text-emerald-400 mb-1.5">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">KrishiEngine v1.0</span>
          </div>
          <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">
            Next-gen AI crop diagnosis & soil telemetry pipeline ready.
          </p>
          <div className="flex items-center justify-between text-[10px] text-emerald-300/80 font-mono">
            <span>Next.js 15</span>
            <span>•</span>
            <span>Framer Motion</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden lg:block w-64 h-[calc(100vh-65px)] sticky top-[65px] glass-sidebar shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Content Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-72 max-w-[80vw] h-full bg-white/95 backdrop-blur-2xl border-r border-slate-200 z-10 flex flex-col"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">Navigation</span>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {sidebarContent}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
