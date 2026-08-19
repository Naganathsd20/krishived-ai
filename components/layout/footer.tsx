"use client";

import React from "react";
import { Sprout, Heart } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200/60 bg-white/50 backdrop-blur-md py-6 px-4 sm:px-6 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        {/* Left: Brand info */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
            <Sprout className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-700">{APP_CONFIG.name}</span>
          <span>© {new Date().getFullYear()} • All rights reserved.</span>
        </div>

        {/* Center: Status & Made with info */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            AI Node Cluster Online
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:flex items-center gap-1">
            Engineered with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for Agriculture
          </span>
        </div>

        {/* Right: Version & Links */}
        <div className="flex items-center gap-4 text-slate-400 font-medium">
          <a href="/help-support" className="hover:text-emerald-600 transition-colors">
            Privacy
          </a>
          <a href="/help-support" className="hover:text-emerald-600 transition-colors">
            Terms
          </a>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px]">
            {APP_CONFIG.version}
          </span>
        </div>
      </div>
    </footer>
  );
};
