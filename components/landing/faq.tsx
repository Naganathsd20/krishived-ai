"use client";

import React from "react";
import { HelpCircle } from "lucide-react";
import { Accordion, AccordionItemData } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

export const faqItems: AccordionItemData[] = [
  {
    id: "faq-1",
    question: "Is KrishiVed AI free to use for smallholder Indian farmers?",
    answer:
      "Yes, KrishiVed AI is completely free for individual farmers. Core modules including Leaf Disease Diagnosis, Weather Telemetry, and APMC Mandi price tracking remain free of charge.",
  },
  {
    id: "faq-2",
    question: "Which Indian regional languages are currently supported?",
    answer:
      "KrishiVed AI supports 7 major languages: Hindi, Marathi, Telugu, Tamil, Kannada, Punjabi, and English. Audio voice responses and localized text reports are provided in your native language.",
  },
  {
    id: "faq-3",
    question: "How accurate is the AI Crop Disease Detection engine?",
    answer:
      "Our deep-learning agricultural vision model achieves over 98% accuracy across 40+ common Indian crop diseases (including sugarcane red rot, paddy blast, cotton bollworm, and wheat rust).",
  },
  {
    id: "faq-4",
    question: "Does the mobile application work in low internet connectivity zones?",
    answer:
      "Yes. The mobile app allows farmers to capture leaf and field photos offline. Once internet or cellular signal is restored, diagnostic reports and remedies automatically sync.",
  },
  {
    id: "faq-5",
    question: "Where does KrishiVed AI fetch live APMC Mandi prices from?",
    answer:
      "KrishiVed AI aggregates daily price feeds directly from government APMC mandi databases (Agmarknet) across major market centers in India.",
  },
];

export const FAQ: React.FC = () => {
  return (
    <section id="faq" className="py-16 md:py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="emerald" className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 bg-emerald-100/90 text-emerald-800 border-emerald-200/80 shadow-2xs inline-flex items-center gap-1.5">
            <HelpCircle className="w-3 h-3 text-emerald-700 shrink-0" />
            Frequently Asked Questions
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked <span className="emerald-gradient-text">Questions</span>
          </h2>
          <p className="text-base text-slate-600 font-normal leading-relaxed">
            Everything you need to know about KrishiVed AI platform features, language support, and diagnostic accuracy.
          </p>
        </div>

        {/* Accordion Component */}
        <Accordion items={faqItems} />
      </div>
    </section>
  );
};
