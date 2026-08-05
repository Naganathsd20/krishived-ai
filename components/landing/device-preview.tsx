"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Sprout,
  Scan,
  TrendingUp,
  CloudRain,
  ShieldCheck,
  Smartphone,
  Laptop,
  BrainCircuit,
  ArrowUpRight,
  LineChart,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const DevicePreview: React.FC = () => {
  return (
    <section id="action-preview" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="emerald" dot>
            Live Interactive Workspace
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            See <span className="emerald-gradient-text">KrishiVed AI</span> in Action
          </h2>
          <p className="text-base text-slate-600 font-normal leading-relaxed">
            Explore real-time crop health telemetry, micro-climate weather forecasts, live APMC mandi rates, AI advisory signals, and instant mobile disease scanning.
          </p>
        </div>

        {/* Dual Device Stage (Desktop Dashboard + Smartphone Mockup with 10-15% Overlap) */}
        <div className="relative max-w-5xl mx-auto pt-4 pb-12">
          {/* Desktop Browser Shell */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl bg-slate-950 text-white border border-slate-800/90 shadow-2xl shadow-emerald-950/20 p-6 sm:p-8 relative z-10"
          >
            {/* Desktop Top Window Header Bar */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Laptop className="w-4.5 h-4.5 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200">
                  KrishiVed AI Telemetry Command Center v1.0
                </span>
              </div>
              <div className="flex gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  ● Telemetry Stream Active
                </span>
              </div>
            </div>

            {/* Realistic Farming Widgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Widget 1: Crop Health */}
              <div className="p-4.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Crop Health
                  </span>
                  <Sprout className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex items-baseline gap-1.5 pt-1">
                  <span className="text-2xl font-extrabold text-white">94%</span>
                  <span className="text-[11px] font-semibold text-emerald-400 flex items-center">
                    +4% <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Sector-4 Paddy Plot • Optimal Vigour
                </p>
              </div>

              {/* Widget 2: Weather Forecast */}
              <div className="p-4.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                    Weather Forecast
                  </span>
                  <CloudRain className="w-4 h-4 text-sky-400" />
                </div>
                <div className="flex items-baseline gap-1.5 pt-1">
                  <span className="text-2xl font-extrabold text-white">28°C</span>
                  <span className="text-[11px] font-semibold text-sky-300">72% Humidity</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Light rain expected at 4:00 PM (15mm)
                </p>
              </div>

              {/* Widget 3: Live Market Prices */}
              <div className="p-4.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Market Prices (APMC)
                  </span>
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex items-baseline gap-1.5 pt-1">
                  <span className="text-2xl font-extrabold text-white">₹2,450</span>
                  <span className="text-xs font-normal text-slate-400">/ Quintal</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Kolhapur Mandi Wheat • Highest in 30 days
                </p>
              </div>
            </div>

            {/* Bottom Row: Today's AI Recommendation & Farm Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
              {/* Today's AI Recommendation Banner */}
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/70 text-white space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Today&apos;s AI Recommendation
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                    98.2% Confidence
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  &quot;Apply 5kg/acre organic bio-fertilizer within 48h to maximize paddy grain weight before expected rainfall.&quot;
                </p>
              </div>

              {/* Farm Analytics & Recent Scan */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <LineChart className="w-4 h-4 text-emerald-400" /> Farm Analytics
                  </span>
                  <span className="font-extrabold text-emerald-400">+18% Yield Forecast</span>
                </div>
                <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Recent Scan: Paddy Leaf (Healthy)</span>
                  </div>
                  <Badge variant="glass" className="text-[9px]">
                    Zero Blight
                  </Badge>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Floating Mobile Smartphone Mockup (Overlaps desktop dashboard by 10-15%) */}
          <motion.div
            initial={{ opacity: 0, x: 20, y: 20 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:absolute -right-6 -bottom-8 w-full md:w-64 mt-6 md:mt-0 rounded-3xl bg-slate-950 border-4 border-slate-800 shadow-2xl shadow-slate-950/50 p-4 text-white z-20 md:translate-x-4 md:translate-y-4"
          >
            {/* Phone Top Notch */}
            <div className="w-20 h-3.5 bg-slate-900 rounded-full mx-auto mb-3.5 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-slate-700" />
            </div>

            {/* Mobile App Screen Content */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-bold">Mobile AI App</span>
                </div>
                <Badge variant="glass" className="text-[8px] py-0 px-1.5">
                  Online
                </Badge>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-900/50 border border-emerald-700/50 text-center space-y-1.5">
                <Scan className="w-6 h-6 text-emerald-400 mx-auto animate-pulse" />
                <span className="text-xs font-bold block text-white">
                  Instant Leaf Scanner
                </span>
                <p className="text-[10px] text-emerald-200 leading-snug">
                  Scan leaf in 1s for early disease warnings.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Offline Diagnosis Ready</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
