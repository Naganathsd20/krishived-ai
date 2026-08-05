"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  Sprout,
  CloudSunRain,
  TrendingUp,
  Landmark,
  NotebookPen,
  BarChart3,
  MessageCircleMore,
  MapPinned,
  ArrowRight,
  Layers,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const farmerChoiceItems = [
  {
    icon: BrainCircuit,
    title: "AI Disease Detection",
    description: "Upload a crop image and instantly detect diseases, pests, and nutrient deficiencies with treatment suggestions.",
    badge: "AI Diagnosis",
  },
  {
    icon: Sprout,
    title: "Smart Crop Recommendation",
    description: "Receive personalized crop recommendations based on season, soil conditions, and farming requirements.",
    badge: "Soil Advisory",
  },
  {
    icon: CloudSunRain,
    title: "Weather Insights",
    description: "Get accurate weather forecasts, rainfall predictions, humidity, and temperature updates for better planning.",
    badge: "Telemetry",
  },
  {
    icon: TrendingUp,
    title: "Live Mandi Prices",
    description: "Track real-time crop prices from agricultural markets across India before selling your produce.",
    badge: "APMC Rates",
  },
  {
    icon: Landmark,
    title: "Government Schemes",
    description: "Discover government schemes, subsidies, and eligibility information designed specifically for farmers.",
    badge: "Subsidies",
  },
  {
    icon: NotebookPen,
    title: "Farm Diary",
    description: "Digitally maintain crop history, expenses, irrigation schedules, and daily farming activities.",
    badge: "Field Log",
  },
  {
    icon: BarChart3,
    title: "Farm Analytics",
    description: "Monitor farm performance using beautiful charts, crop reports, expenses, and profit insights.",
    badge: "Analytics",
  },
  {
    icon: MessageCircleMore,
    title: "AI Farming Assistant",
    description: "Ask farming questions anytime and receive AI-powered guidance in simple language.",
    badge: "Multilingual",
  },
  {
    icon: MapPinned,
    title: "Nearby Agriculture Centers",
    description: "Locate nearby soil testing laboratories, seed centers, fertilizer shops, and agriculture offices.",
    badge: "GPS Locator",
  },
];

export const WhyFarmersChoose: React.FC = () => {
  return (
    <section id="why-farmers-choose" className="py-16 md:py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="emerald" className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 bg-emerald-100/90 text-emerald-800 border-emerald-200/80 shadow-2xs inline-flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            Core Features
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Why Farmers Choose <span className="emerald-gradient-text">KrishiVed AI</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            KrishiVed AI combines artificial intelligence, agricultural insights, and modern technology to help Indian farmers make better farming decisions every day.
          </p>
        </div>

        {/* Photorealistic Indian Agriculture Drone Photo Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative w-full h-48 sm:h-64 rounded-3xl overflow-hidden border border-slate-200/80 shadow-xl shadow-emerald-950/10"
        >
          <Image
            src="/agri-photo-banner.png"
            alt="Photorealistic aerial drone view of vast green Indian paddy fields at golden sunrise"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Subtle Gradient Overlay on Left Side Only */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/30 to-transparent flex items-center p-6 sm:p-10">
            <div className="max-w-md text-white space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
                Empowering Modern Farmers
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                Technology Designed for Every Field in India
              </h3>
            </div>
          </div>
        </motion.div>

        {/* 9 Feature Cards Grid (No emojis, clean 18px Lucide SVG icons) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {farmerChoiceItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <Card variant="glass" className="h-full flex flex-col justify-between group p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
                  <CardHeader className="mb-2">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 shadow-2xs">
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge variant="glass" className="text-[10px] font-semibold py-0.5 px-2.5">
                        {item.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-bold group-hover:text-emerald-800 transition-colors">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-xs text-slate-600 leading-relaxed font-normal min-h-[36px]">
                      {item.description}
                    </CardDescription>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 group-hover:text-emerald-800 transition-colors">
                        <span>Learn More</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </button>
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
