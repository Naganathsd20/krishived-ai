"use client";

import React from "react";
import { Sprout, Heart } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200/80 bg-white/70 backdrop-blur-md py-6 px-4 sm:px-6 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        {/* LEFT */}
        <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0">
              <Sprout className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-900">{APP_CONFIG.name}</span>
          </div>
          <span className="hidden sm:inline text-slate-300">•</span>
          <span className="text-slate-600 font-medium">
            AI-Powered Smart Agricultural Intelligence
          </span>
          <span className="hidden sm:inline text-slate-300">•</span>
          <span>© {new Date().getFullYear()} KrishiVed AI. All rights reserved.</span>
        </div>

        {/* CENTER / STATUS */}
        <div className="flex items-center gap-2.5">
          <span className="font-medium text-slate-600">Built for Smarter Farming</span>
          <span className="text-slate-300">•</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            Platform Services Online
          </span>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4 text-slate-500 font-medium">
          <a href="/help-support" className="hover:text-emerald-600 transition-colors">
            Help & Support
          </a>
          <a href="/help-support" className="hover:text-emerald-600 transition-colors">
            Privacy
          </a>
          <a href="/help-support" className="hover:text-emerald-600 transition-colors">
            Terms
          </a>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-bold border border-slate-200">
            v{APP_CONFIG.version}
          </span>
        </div>
      </div>
    </footer>
  );
};
