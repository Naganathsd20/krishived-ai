"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Bot,
  CloudSun,
  Sprout,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Hero: React.FC = () => {
  return (
    <section id="top" className="relative pt-32 pb-16 md:pt-40 md:pb-20 lg:pt-44 lg:pb-24 overflow-hidden bg-white">
      {/* Background Radial Atmosphere Glow */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[500px] bg-emerald-400/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Headline, Description, CTAs & Trust Bar */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="lg:col-span-7 space-y-7 text-left z-10"
          >
            {/* Refined Section Badge */}
            <div className="inline-flex items-center gap-2">
              <Badge variant="glass" className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 text-emerald-900 border-emerald-300/60 shadow-2xs">
                <Sparkles className="w-3 h-3 text-emerald-600 mr-1.5 shrink-0" />
                AI-Powered Agriculture Platform
              </Badge>
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                Built for Indian Farmers
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-3xl">
              Helping Indian Farmers Make{" "}
              <span className="emerald-gradient-text">Smarter Decisions</span> with AI
            </h1>

            {/* Supporting Description */}
            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl">
              KrishiVed AI empowers farmers with AI-powered crop disease detection, smart crop recommendations, weather insights, government schemes, farm analytics, and intelligent farming assistance—all in one modern platform.
            </p>

            {/* Two Primary / Secondary CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-1">
              <Link href="/dashboard">
                <Button
                  variant="emerald"
                  size="lg"
                  className="w-full sm:w-auto px-8 py-3.5 text-base shadow-emerald"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Get Started Free
                </Button>
              </Link>

              <a href="#why-farmers-choose">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-8 py-3.5 text-base border-slate-300/90 text-slate-700 hover:text-emerald-700 hover:border-emerald-500 hover:bg-emerald-50/50"
                  leftIcon={<Sparkles className="w-4 h-4 text-emerald-600" />}
                >
                  Explore Features
                </Button>
              </a>
            </div>

            {/* Trust Section: Built for Indian Agriculture */}
            <div className="pt-6 border-t border-slate-200/60 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Built for Indian Agriculture
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white/90 border border-slate-200/70 shadow-2xs">
                  <Bot className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>AI Assistance</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white/90 border border-slate-200/70 shadow-2xs">
                  <CloudSun className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Weather Insights</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white/90 border border-slate-200/70 shadow-2xs">
                  <Sprout className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Crop Health</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white/90 border border-slate-200/70 shadow-2xs">
                  <TrendingUp className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Market Prices</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Frameless Farmer Scene */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:col-span-5 flex justify-center relative w-full h-[380px] sm:h-[460px] lg:h-[520px]"
          >
            {/* Multi-edge Feather Masking */}
            <div
              className="relative w-full h-full"
              style={{
                maskImage: `
                  radial-gradient(ellipse at 50% 50%, #000 45%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0.4) 75%, rgba(0,0,0,0.1) 90%, transparent 100%),
                  linear-gradient(to right, transparent 0%, #000 18%, #000 82%, transparent 100%)
                `,
                WebkitMaskImage: `
                  radial-gradient(ellipse at 50% 50%, #000 45%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0.4) 75%, rgba(0,0,0,0.1) 90%, transparent 100%),
                  linear-gradient(to right, transparent 0%, #000 18%, #000 82%, transparent 100%)
                `,
                maskComposite: "intersect",
                WebkitMaskComposite: "source-in",
              }}
            >
              <Image
                src="/farmer-seamless-white.png"
                alt="Sharp Indian farmer portrait with wide multi-side feathered background dissolve"
                fill
                className="object-cover object-center scale-105"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
