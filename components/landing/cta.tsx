"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sprout, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const CTA: React.FC = () => {
  return (
    <section id="cta" className="py-16 md:py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-4xl bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 p-8 sm:p-14 md:p-16 text-white text-center relative overflow-hidden shadow-2xl shadow-emerald-950/20"
        >
          {/* Subtle Ambient Background Glows & Sprout Watermark */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />
          <Sprout className="absolute -right-6 -bottom-6 w-56 h-56 text-emerald-500/5 pointer-events-none rotate-12" />

          <div className="max-w-3xl mx-auto space-y-7 relative z-10">
            <Badge variant="glass" className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-1 text-emerald-300 border-emerald-400/30 shadow-2xs inline-flex items-center gap-1.5">
              <Sprout className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              Start Your Smart Farming Journey
            </Badge>

            {/* Main Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
              Start Farming Smarter with <span className="text-emerald-400">KrishiVed AI</span>
            </h2>

            {/* Subheading (No Technical Jargon) */}
            <p className="text-sm sm:text-base text-slate-200 font-normal max-w-2xl mx-auto leading-relaxed">
              Detect crop diseases, receive AI-powered crop recommendations, check live mandi prices, monitor weather, discover government schemes, and manage your farm—all from one intelligent platform.
            </p>

            {/* Two Action Buttons */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
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
                  className="w-full sm:w-auto px-8 py-3.5 text-base text-white border-white/30 hover:bg-white/10 hover:border-emerald-400"
                  leftIcon={<Sparkles className="w-4 h-4 text-emerald-400" />}
                >
                  Explore Platform
                </Button>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
