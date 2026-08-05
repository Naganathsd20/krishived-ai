"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Sprout,
  CloudSun,
  TrendingUp,
  BrainCircuit,
  ArrowUpRight,
  ShieldCheck,
  Scan,
  Smartphone,
  CheckCircle2,
  LineChart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const DashboardMockup: React.FC = () => {
  return (
    <div className="relative w-full max-w-xl mx-auto pt-2 pb-8 pr-4 lg:pr-8">
      {/* Desktop Dashboard Mockup Frame */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.2 }}
        className="relative w-full rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-2xl shadow-emerald-950/15 p-6 space-y-4 z-10"
      >
        {/* Mockup Top Window Controls Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-400/80" />
              <span className="w-3 h-3 rounded-full bg-amber-400/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
            </div>
            <span className="text-[11px] font-mono font-semibold text-slate-400 ml-2">
              krishived.ai/dashboard/overview
            </span>
          </div>

          <Badge variant="emerald" dot>
            Live Farm Engine
          </Badge>
        </div>

        {/* 2-Column Grid: Crop Health & Weather Forecast */}
        <div className="grid grid-cols-2 gap-3.5">
          {/* Widget 1: Crop Health */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/70 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider">
                Crop Health
              </span>
              <Sprout className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-1.5 pt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">94%</span>
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
                +4% <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
            <p className="text-[10px] text-emerald-800 font-medium">
              Sector-4 Paddy • Optimal Vigour
            </p>
          </div>

          {/* Widget 2: Weather Forecast */}
          <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-200/70 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-sky-950 uppercase tracking-wider">
                Weather Forecast
              </span>
              <CloudSun className="w-4 h-4 text-sky-600" />
            </div>
            <div className="flex items-baseline gap-1.5 pt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">28°C</span>
              <span className="text-[11px] font-semibold text-sky-700">72% Humidity</span>
            </div>
            <p className="text-[10px] text-sky-800 font-medium">
              Light rain expected at 4:00 PM
            </p>
          </div>
        </div>

        {/* Widget 3: Today's AI Recommendation */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-950 text-white space-y-2 relative overflow-hidden shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Today&apos;s Recommendation
              </span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono border border-emerald-400/30">
              Confidence 98.2%
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-normal">
            &quot;Nitrogen level optimal. Apply 5kg/acre organic bio-fertilizer within 48h to maximize grain weight before expected rainfall.&quot;
          </p>
        </div>

        {/* 2-Column Grid: AI Disease Detection & Farm Analytics */}
        <div className="grid grid-cols-2 gap-3.5">
          {/* Widget 4: AI Disease Detection */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                AI Disease Detection
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="text-sm font-bold text-slate-900">Zero Blight Signs</span>
            </div>
            <p className="text-[10px] text-slate-500 font-normal">
              40+ pathogen models checked
            </p>
          </div>

          {/* Widget 5: Farm Analytics */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Farm Analytics
              </span>
              <LineChart className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-center gap-1 pt-0.5 font-bold text-emerald-700 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+18% Yield Projection</span>
            </div>
            <p className="text-[10px] text-slate-500 font-normal">
              NPK Score: 88/100 (Optimal)
            </p>
          </div>
        </div>

        {/* Bottom Bar: Recent Crop Scan */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-800">Recent Crop Scan:</span>
            <span className="text-slate-500">Paddy Leaf • Passed Healthy</span>
          </div>
        </div>
      </motion.div>

      {/* Floating Smartphone Mockup (Repositioned further right with 10-15% overlap) */}
      <motion.div
        initial={{ opacity: 0, x: 25, y: 25 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.65, delay: 0.35 }}
        className="hidden sm:block absolute -right-6 -bottom-6 w-56 rounded-3xl bg-slate-950 border-4 border-slate-800/90 shadow-2xl shadow-slate-950/40 p-3.5 text-white z-20 translate-x-6 translate-y-4"
      >
        {/* Phone Notch */}
        <div className="w-16 h-3 bg-slate-900 rounded-full mx-auto mb-3 flex items-center justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
        </div>

        {/* Mobile Mockup Inner Content */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <div className="flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-bold">Field Camera App</span>
            </div>
            <Badge variant="glass" className="text-[8px] py-0 px-1">
              Online
            </Badge>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-700/60 text-center space-y-1">
            <Scan className="w-5 h-5 text-emerald-400 mx-auto animate-pulse" />
            <span className="text-[11px] font-bold block text-white">
              Instant Leaf Diagnosis
            </span>
            <p className="text-[9px] text-emerald-200 leading-tight">
              Scan leaf in 1s for early disease warnings.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
