"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock, Target, ShieldCheck, HeartHandshake } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const reasons = [
  {
    icon: Clock,
    title: "Save Time",
    description: "Get instant sub-second crop diagnosis directly on your phone, replacing days of waiting for manual agronomist visits.",
  },
  {
    icon: Target,
    title: "Better Crop Decisions",
    description: "Empower your farm with soil-matched seed recommendations, NPK optimization, and optimal harvest timing.",
  },
  {
    icon: ShieldCheck,
    title: "Early Disease Detection",
    description: "Identify fungal rust, bacterial blight, and pest infestation at stage 1 before infection spreads across your field.",
  },
  {
    icon: HeartHandshake,
    title: "Easy to Use",
    description: "Built with vernacular voice inputs, large tap targets, and simple visual guides tailored for Indian farmers.",
  },
];

export const WhyChoose: React.FC = () => {
  return (
    <section id="why-choose" className="py-16 md:py-20 bg-[#f8faf9] relative border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="emerald" className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 bg-emerald-100/90 text-emerald-800 border-emerald-200/80 shadow-2xs inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-emerald-700 shrink-0" />
            Why Farmers Choose Us
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Why Choose <span className="emerald-gradient-text">KrishiVed AI</span>?
          </h2>
          <p className="text-base text-slate-600 font-normal leading-relaxed">
            Built from the ground up to solve the real daily challenges of agriculture in India.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <Card variant="glass" className="h-full flex flex-col justify-between">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-xs text-slate-600 leading-relaxed font-normal">
                      {item.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
