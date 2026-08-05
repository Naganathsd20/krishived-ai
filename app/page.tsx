"use client";

import React from "react";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { WhyFarmersChoose } from "@/components/landing/why-farmers-choose";
import { HowItWorks } from "@/components/landing/how-it-works";
import { WhyChoose } from "@/components/landing/why-choose";
import { Highlights } from "@/components/landing/highlights";
import { Testimonials } from "@/components/landing/testimonials";
import { FAQ } from "@/components/landing/faq";
import { CTA } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-emerald-500 selection:text-white relative">
      {/* 1. Sticky Navbar */}
      <Navbar />

      {/* 2. Hero Section with Indian Farmer Portrait & Trust Bar */}
      <Hero />

      {/* 3. Why Farmers Choose KrishiVed AI (9 Feature Cards & Agri Banner) */}
      <WhyFarmersChoose />

      {/* 4. How It Works 4-Step Timeline */}
      <HowItWorks />

      {/* 5. Core Value Propositions */}
      <WhyChoose />

      {/* 6. Product Highlights */}
      <Highlights />

      {/* 7. Farmer Testimonials */}
      <Testimonials />

      {/* 8. Frequently Asked Questions (Accordion) */}
      <FAQ />

      {/* 9. Call To Action */}
      <CTA />

      {/* 10. Footer */}
      <Footer />
    </div>
  );
}
