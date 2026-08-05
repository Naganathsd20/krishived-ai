"use client";

import React from "react";
import { motion } from "framer-motion";
import { Layers, Bot, Languages, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const highlights = [
  {
    icon: Layers,
    title: "9 Smart Farming Modules",
    description: "Disease Detection, Crop Recommendation, Weather, Mandi Prices, Schemes, Farm Diary, Analytics, AI Assistant & Center Locator.",
  },
  {
    icon: Bot,
    title: "AI Powered Assistance",
    description: "Sub-second vision inference & agricultural knowledge engine powered by state-of-the-art AI.",
  },
  {
    icon: Languages,
    title: "Supports Multiple Languages",
    description: "Fluent in Hindi, Marathi, Telugu, Tamil, Kannada, Punjabi, and English voice & text modes.",
  },
  {
    icon: Heart,
    title: "Designed for Indian Farmers",
    description: "Built for Indian crops, APMC mandis, local soil types, and regional weather micro-climates.",
  },
];

export const Highlights: React.FC = () => {
  return (
    <section className="py-20 bg-white relative border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="glass" dot>
            Product Pillars
          </Badge>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Engineered with Purpose, Not Vanity Stats
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className="p-6 rounded-3xl bg-emerald-50/50 border border-emerald-100/80 space-y-3"
              >
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900 leading-snug">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
