"use client";

import React from "react";
import { motion } from "framer-motion";
import { Camera, Cpu, Sparkles, TrendingUp, Compass } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const steps = [
  {
    number: "01",
    icon: Camera,
    title: "Upload Crop Image",
    description: "Snap a quick photo of your crop leaf, fruit, or soil plot directly using your smartphone camera.",
    tag: "Mobile Capture",
  },
  {
    number: "02",
    icon: Cpu,
    title: "AI Analysis Engine",
    description: "Our agricultural vision model analyzes pattern markers to identify diseases, pests, or nutrient deficiencies within seconds.",
    tag: "Sub-Second Diagnosis",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Get Actionable Recommendation",
    description: "Receive exact organic & chemical remedies, dosage steps, and prevention steps written in your regional language.",
    tag: "Localized Treatment",
  },
  {
    number: "04",
    icon: TrendingUp,
    title: "Improve Farming Output",
    description: "Apply recommendations, reduce crop loss by up to 35%, and maximize seasonal APMC mandi sales profit.",
    tag: "Profit Growth",
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-16 md:py-20 bg-[#f8faf9] relative border-y border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="glass" className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 text-emerald-900 border-emerald-300/60 shadow-2xs inline-flex items-center gap-1.5">
            <Compass className="w-3 h-3 text-emerald-600 shrink-0" />
            How It Works
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How <span className="emerald-gradient-text">KrishiVed AI</span> Works
          </h2>
          <p className="text-base text-slate-600 font-normal leading-relaxed">
            Designed for ease of use in the field. Zero complex setup required — get expert AI agricultural guidance in 4 simple steps.
          </p>
        </div>

        {/* Timeline Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="relative flex flex-col justify-between p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="space-y-4">
                  {/* Top Step Number & Icon */}
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-emerald-600/30 font-mono">
                      {step.number}
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {step.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {step.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-100 mt-4">
                  <Badge variant="emerald" className="text-[10px]">
                    {step.tag}
                  </Badge>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
