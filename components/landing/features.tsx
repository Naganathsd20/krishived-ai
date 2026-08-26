"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  Sprout,
  CloudSun,
  TrendingUp,
  Landmark,
  BookOpen,
  LineChart,
  Bot,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const featureItems = [
  {
    icon: BrainCircuit,
    title: "AI Disease Detection",
    description: "Scan leaf photos via camera to instantly diagnose bacterial blight, rust, or pest infestations with step-by-step organic remedies.",
    badge: "AI Vision",
  },
  {
    icon: Sprout,
    title: "Smart Crop Recommendation",
    description: "Match your field soil pH, NPK values, regional micro-climate, and season to discover optimal high-yield crop options.",
    badge: "Soil Engine",
  },
  {
    icon: CloudSun,
    title: "Weather Insights",
    description: "Hyper-local weather forecasts, humidity tracking, and automated rain alerts tailored to your exact village pin code.",
    badge: "Telemetry",
  },
  {
    icon: TrendingUp,
    title: "Live Mandi Prices",
    description: "Track live daily APMC and Mandi commodity rates across Indian market centers to sell your harvest at peak profit.",
    badge: "APMC Mandi",
  },
  {
    icon: Landmark,
    title: "Government Schemes",
    description: "Discover eligible central & state agricultural subsidies, PM-KISAN payouts, Fasal Bima Yojana, and equipment grants.",
    badge: "Subsidies",
  },
  {
    icon: BookOpen,
    title: "Farm Diary",
    description: "Digital field logbook to record fertilizer purchases, irrigation cycles, sowing dates, and seasonal farm expenses.",
    badge: "Field Log",
  },
  {
    icon: LineChart,
    title: "Farm Analytics",
    description: "Predict seasonal yield output, track input cost ROI, and monitor field vegetation health index over time.",
    badge: "Analytics",
  },
  {
    icon: Bot,
    title: "AI Farming Assistant",
    description: "24/7 conversational voice & text advisor fluent in Hindi, Marathi, Telugu, Tamil, Kannada, Punjabi, and English.",
    badge: "Multilingual",
  },
  {
    icon: MapPin,
    title: "Nearby Agriculture Centers",
    description: "Locate nearest Krishi Vigyan Kendras (KVK), authorized seed suppliers, soil testing labs, and tractor rentals.",
    badge: "GPS Locator",
  },
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="emerald" dot>
            Complete Platform Ecosystem
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            9 Smart Modules Engineered for <span className="emerald-gradient-text">Precision Agriculture</span>
          </h2>
          <p className="text-base text-slate-600 font-normal leading-relaxed">
            Every module is designed to solve real challenges faced by Indian farmers — reducing input costs, preventing crop loss, and maximizing seasonal profits.
          </p>
        </div>

        {/* 9 Feature Cards Grid (3 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <Card variant="glass" className="h-full flex flex-col justify-between group">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 shadow-xs text-xl">
                        <Icon className="w-6 h-6" />
                      </div>
                      <Badge variant="glass" className="text-[10px]">
                        {item.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg group-hover:text-emerald-800 transition-colors">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-xs text-slate-600 leading-relaxed font-normal">
                      {item.description}
                    </CardDescription>
                    <div className="pt-2 flex items-center gap-1 text-xs font-semibold text-emerald-600 group-hover:translate-x-1 transition-transform">
                      <span>Explore Module</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
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
