"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  BrainCircuit,
  CloudSun,
  MessageSquare,
  BarChart3,
  FileText,
  Sprout,
  TrendingUp,
  Settings,
  ShieldCheck,
  CheckCircle2,
  Info,
  LifeBuoy,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  GridContainer,
} from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQ_LIST: FAQItem[] = [
  {
    id: "faq-1",
    question: "How do I scan my crop for disease pathogens?",
    answer: "Navigate to the Disease Diagnostics page, upload or take a clear photo of an infected leaf, and click 'Analyze Leaf Image'. Gemini 1.5 Flash AI will identify the pathogen, severity level, and treatment protocol within seconds.",
    category: "Diagnostics",
  },
  {
    id: "faq-2",
    question: "Where can I view my overall Farm Health Score?",
    answer: "Your composite Farm Health Score (0–100) is displayed on both the Dashboard and Farm Analytics pages. It is computed automatically from crop health, soil health, weather stability, irrigation, and disease risk factors.",
    category: "Dashboard",
  },
  {
    id: "faq-3",
    question: "How do I save a soil & crop recommendation report?",
    answer: "On the Weather & Soil page, search for your farming city, then click 'Generate Soil & Crop Report'. Click 'Save Report' to persist the NPK fertilizer dosage and irrigation strategy to your profile.",
    category: "Soil & Crop",
  },
  {
    id: "faq-4",
    question: "How do I check live weather conditions for my region?",
    answer: "Go to the Weather & Soil page and enter your city name in the search bar. You can view temperature, humidity, rain probability, wind speed, pressure, and a 5-day atmospheric forecast.",
    category: "Weather",
  },
  {
    id: "faq-5",
    question: "How do I ask KrishiMitra AI for farming advice?",
    answer: "Click 'KrishiMitra' in the sidebar to open the AI Chat Assistant. Type or speak your questions in English, Hindi, Kannada, Marathi, or Telugu to receive instant expert agricultural guidance.",
    category: "KrishiMitra",
  },
  {
    id: "faq-6",
    question: "How do I download a Field Report PDF or CSV?",
    answer: "Navigate to the Field Reports page. Click 'Download PDF Report' for a formatted multi-section printable document, or 'Export CSV' for a spreadsheet file containing all your farm telemetry.",
    category: "Field Reports",
  },
  {
    id: "faq-7",
    question: "How do I export Farm Analytics data?",
    answer: "Go to the Farm Analytics page and click 'Download PDF Report' or 'Export CSV' in the top action header. Both exports include your health score, disease statistics, weather telemetry, and recent activity log.",
    category: "Analytics",
  },
  {
    id: "faq-8",
    question: "Why does Smart Farm Intelligence show 'Limited Data'?",
    answer: "Smart Farm Intelligence evaluates risk based on your saved telemetry. If you haven't performed a leaf scan or saved a soil report yet, it displays 'Limited Data'. Performing scans will upgrade your data confidence.",
    category: "Farm Intelligence",
  },
  {
    id: "faq-9",
    question: "How do I change my default farm location or preferred crop?",
    answer: "Navigate to the Settings page in the sidebar. You can select your preferred platform language, default farming city, primary crop focus, and notification alert toggles, then click 'Save Preferences'.",
    category: "Settings",
  },
  {
    id: "faq-10",
    question: "What does Yield Intelligence mean without numerical predictions?",
    answer: "Yield Intelligence evaluates your multi-factor crop readiness (Favorable, Moderate, Needs Attention) based on real soil score, weather envelope, and disease scans. Quantitative predictions (tonnes/ha) require logging historical harvest records after harvest.",
    category: "Yield Intelligence",
  },
];

const MODULE_GUIDES = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    color: "text-emerald-600 bg-emerald-50",
    description: "Overview of farm health, quick action cards, weather widget, and Smart Farm Intelligence summary.",
  },
  {
    title: "Disease Diagnostics",
    icon: BrainCircuit,
    color: "text-emerald-600 bg-emerald-50",
    description: "AI leaf image scanner detecting crop diseases, pathogen causes, symptoms, and organic treatment protocols.",
  },
  {
    title: "Weather & Soil",
    icon: CloudSun,
    color: "text-amber-500 bg-amber-50",
    description: "Live atmospheric weather lookup, 5-day forecasts, and NPK fertilizer recommendation generator.",
  },
  {
    title: "KrishiMitra AI Assistant",
    icon: MessageSquare,
    color: "text-teal-600 bg-teal-50",
    description: "Multi-lingual agronomic chat assistant answering questions about pest control, seeds, and irrigation.",
  },
  {
    title: "Farm Analytics",
    icon: BarChart3,
    color: "text-indigo-600 bg-indigo-50",
    description: "Composite health breakdown, crop risk distribution, disease trend charts, and exportable analytics.",
  },
  {
    title: "Field Reports",
    icon: FileText,
    color: "text-emerald-600 bg-emerald-50",
    description: "Comprehensive agricultural field reports with PDF & CSV export capabilities.",
  },
  {
    title: "Crop Advisory",
    icon: Sprout,
    color: "text-emerald-600 bg-emerald-50",
    description: "Personalized crop suitability recommendations, qualitative crop comparison matrix, and field preparation tips.",
  },
  {
    title: "Yield Intelligence",
    icon: TrendingUp,
    color: "text-emerald-600 bg-emerald-50",
    description: "Multi-factor crop readiness evaluation assessing soil, climate, and disease impact on crop potential.",
  },
  {
    title: "Settings & Preferences",
    icon: Settings,
    color: "text-slate-600 bg-slate-100",
    description: "Customize platform language, default farming city, primary crop focus, and notification toggles.",
  },
];

export default function HelpSupportPage() {
  const [openFaqId, setOpenFaqId] = useState<string | null>("faq-1");

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader
        title="Help & Support"
        description="Find simple guidance for using KrishiVed AI."
        badge={
          <Badge variant="emerald" dot>
            Farmer Knowledge Base
          </Badge>
        }
      />

      <div className="max-w-5xl mx-auto space-y-10">
        {/* SECTION 1: GETTING STARTED MODULE GUIDES */}
        <Card variant="glass" className="border-emerald-200/90 shadow-md">
          <CardHeader className="border-b border-emerald-100 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              <CardTitle className="text-base">Getting Started with KrishiVed AI Modules</CardTitle>
            </div>
            <CardDescription>
              Simple overview of all 9 farmer-facing tools available in your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {MODULE_GUIDES.map((mod) => {
                const IconComponent = mod.icon;
                return (
                  <div
                    key={mod.title}
                    className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs space-y-2 flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${mod.color}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{mod.title}</h4>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{mod.description}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* SECTION 2: FARMER FREQUENTLY ASKED QUESTIONS (FAQ) */}
        <Card variant="glass" className="border-emerald-200/90 shadow-md">
          <CardHeader className="border-b border-emerald-100 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-600" />
                <CardTitle className="text-base">Farmer Frequently Asked Questions (FAQ)</CardTitle>
              </div>
              <Badge variant="glass" className="text-xs font-bold">
                10 Questions
              </Badge>
            </div>
            <CardDescription>
              Clear answers matching the exact functionality of your KrishiVed AI platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {FAQ_LIST.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border transition-all ${
                    isOpen
                      ? "bg-emerald-50/70 border-emerald-300 shadow-xs"
                      : "bg-white/90 border-slate-200/80 hover:bg-slate-50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs text-slate-900"
                  >
                    <span className="flex items-center gap-2">
                      <Badge variant="glass" className="text-[10px] bg-white text-emerald-800 border-emerald-200 shrink-0">
                        {faq.category}
                      </Badge>
                      <span>{faq.question}</span>
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="px-4 pb-4 pt-1 text-xs text-slate-700 leading-relaxed border-t border-emerald-200/50">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* SECTION 3: GENUINE SUPPORT CHANNEL NOTICE */}
        <Card variant="glass" className="border-emerald-200/90 shadow-md">
          <CardHeader className="border-b border-emerald-100 pb-3">
            <div className="flex items-center gap-2">
              <LifeBuoy className="w-5 h-5 text-teal-600" />
              <CardTitle className="text-base">Support & Contact Information</CardTitle>
            </div>
            <CardDescription>
              Platform support channel configuration status.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Info className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Support Configuration Notice</span>
              </div>
              <p>
                Direct telephone call or live ticket routing is not currently configured for this account. Please refer to the self-service FAQ guidelines and getting started module guides above for immediate assistance.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
