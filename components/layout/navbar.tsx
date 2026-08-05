"use client";

import React from "react";
import { Sprout, Search, Bell, Menu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { APP_CONFIG } from "@/lib/constants";

interface NavbarProps {
  onMenuToggle?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-nav px-4 sm:px-6 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="lg:hidden text-slate-600 hover:text-emerald-700"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-2.5 cursor-pointer group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                  KrishiVed
                </span>
                <span className="px-1.5 py-0.2 text-xs font-black rounded-lg bg-emerald-600 text-white shadow-sm">
                  AI
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-400 -mt-0.5 hidden sm:inline">
                {APP_CONFIG.tagline}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search crop advisories, field diagnostics, disease models..."
              className="w-full h-10 pl-10 pr-12 text-xs bg-slate-100/70 border border-slate-200/80 rounded-2xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:bg-white transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded-md shadow-2xs pointer-events-none">
              <span>⌘</span>
              <span>K</span>
            </div>
          </div>
        </div>

        {/* Right: Actions, Status & User Pill */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status Badge */}
          <div className="hidden xl:flex">
            <Badge variant="glass" dot>
              System Operational
            </Badge>
          </div>

          {/* Quick AI Action Button */}
          <Button
            variant="emerald"
            size="sm"
            className="hidden sm:flex"
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            AI Assistant
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-slate-600 hover:text-emerald-700 rounded-2xl"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
          </Button>

          {/* User Profile Shell (Ready for Clerk) */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200/80">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-100 border border-emerald-200 flex items-center justify-center text-emerald-800 font-bold text-xs shadow-xs">
              KV
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
