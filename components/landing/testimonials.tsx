"use client";

import React from "react";
import { Star, UserCheck, Quote } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface TestimonialItem {
  id: string;
  author: string;
  location: string;
  state: string;
  crop: string;
  quote: string;
  avatarInitials: string;
  rating: number;
}

export const row1Testimonials: TestimonialItem[] = [
  {
    id: "t1",
    author: "Ramesh Patil",
    location: "Kolhapur",
    state: "Maharashtra",
    crop: "Sugarcane",
    quote: "The leaf disease diagnosis detected sugarcane red rot at stage 1. Following the recommended bio-treatment saved almost 2 acres of my crop.",
    avatarInitials: "RP",
    rating: 5,
  },
  {
    id: "t2",
    author: "Gurpreet Singh",
    location: "Ludhiana",
    state: "Punjab",
    crop: "Wheat",
    quote: "Checking live APMC mandi prices on KrishiVed AI helped me sell my wheat harvest at ₹2,450/quintal instead of selling at lower local rates.",
    avatarInitials: "GS",
    rating: 5,
  },
  {
    id: "t3",
    author: "Sivasankar M.",
    location: "Thanjavur",
    state: "Tamil Nadu",
    crop: "Paddy",
    quote: "Getting weather telemetry alerts in Tamil along with precise bio-fertilizer dosage for my paddy field increased our seasonal yield noticeably.",
    avatarInitials: "SM",
    rating: 5,
  },
  {
    id: "t4",
    author: "Mahesh Gowda",
    location: "Shimoga",
    state: "Karnataka",
    crop: "Arecanut",
    quote: "The AI crop advisor diagnosed yellow leaf disease on my arecanut palms within seconds. The voice guidance in Kannada is very easy to use.",
    avatarInitials: "MG",
    rating: 5,
  },
  {
    id: "t5",
    author: "Sunita Devi",
    location: "Varanasi",
    state: "Uttar Pradesh",
    crop: "Wheat",
    quote: "Using KrishiVed AI's Soil Advisory gave us exact NPK fertilizer recommendations. Our input expenses reduced by 25% this season.",
    avatarInitials: "SD",
    rating: 5,
  },
];

export const row2Testimonials: TestimonialItem[] = [
  {
    id: "t6",
    author: "Raju Naik",
    location: "Warangal",
    state: "Telangana",
    crop: "Cotton",
    quote: "The early bollworm pest warning alert saved my cotton field from devastation. Highly recommend KrishiVed AI to all cotton growers.",
    avatarInitials: "RN",
    rating: 5,
  },
  {
    id: "t7",
    author: "Harpreet Kaur",
    location: "Karnal",
    state: "Haryana",
    crop: "Rice",
    quote: "Accessing government subsidy schemes and PM-KISAN tracking directly inside the app made applying for equipment grants fast and simple.",
    avatarInitials: "HK",
    rating: 5,
  },
  {
    id: "t8",
    author: "Ashok Jadhav",
    location: "Nashik",
    state: "Maharashtra",
    crop: "Onion",
    quote: "Real-time Mandi price notifications helped our onion farmers' cooperative choose the best APMC market for selling onion stocks.",
    avatarInitials: "AJ",
    rating: 5,
  },
  {
    id: "t9",
    author: "Vivek Yadav",
    location: "Muzaffarpur",
    state: "Bihar",
    crop: "Maize",
    quote: "The Farm Diary feature helped me track all fertilizer purchases, labor costs, and sowing dates for my 5-acre maize field.",
    avatarInitials: "VY",
    rating: 5,
  },
  {
    id: "t10",
    author: "Manoj Kumar",
    location: "Ujjain",
    state: "Madhya Pradesh",
    crop: "Soybean",
    quote: "Weather insights with rain probability alerts helped us time our soybean harvesting perfectly before sudden unseasonal rainfall.",
    avatarInitials: "MK",
    rating: 5,
  },
];

const TestimonialCard: React.FC<{ item: TestimonialItem }> = ({ item }) => (
  <div className="w-[320px] sm:w-[380px] shrink-0 px-3">
    <Card variant="glass" className="h-full flex flex-col justify-between p-6 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-1.5 transition-all duration-300 border border-slate-200/80">
      <CardHeader className="p-0 mb-3">
        <div className="flex items-center justify-between mb-3">
          {/* Rating */}
          <div className="flex items-center gap-1">
            {Array.from({ length: item.rating }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>

          <Badge variant="glass" className="text-[10px] py-0.5 px-2">
            {item.crop}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0 space-y-4">
        {/* Quote */}
        <p className="text-xs text-slate-700 leading-relaxed font-normal italic">
          &quot;{item.quote}&quot;
        </p>

        {/* Farmer Info */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar Pill */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {item.avatarInitials}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 leading-tight">
                {item.author}
              </h4>
              <p className="text-[10px] text-slate-500 font-medium">
                {item.location}, {item.state}
              </p>
            </div>
          </div>

          <Quote className="w-5 h-5 text-emerald-600/30 shrink-0" />
        </div>
      </CardContent>
    </Card>
  </div>
);

export const Testimonials: React.FC = () => {
  return (
    <section className="py-16 md:py-20 bg-[#f8faf9] relative border-t border-slate-200/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="emerald" className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 bg-emerald-100/90 text-emerald-800 border-emerald-200/80 shadow-2xs inline-flex items-center gap-1.5">
            <UserCheck className="w-3 h-3 text-emerald-700 shrink-0" />
            Farmer Stories
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Trusted by Farmers Across <span className="emerald-gradient-text">India</span>
          </h2>
          <p className="text-base text-slate-600 font-normal leading-relaxed">
            Real feedback from sugarcane, paddy, and wheat growers using KrishiVed AI in their daily field operations.
          </p>
        </div>

        {/* Marquee Container with Hover Pause */}
        <div className="relative marquee-container space-y-6">
          {/* Side Fading Gradient Masks */}
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#f8faf9] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#f8faf9] to-transparent z-10 pointer-events-none" />

          {/* Row 1: Right to Left */}
          <div className="overflow-hidden flex">
            <div className="animate-marquee py-2">
              {[...row1Testimonials, ...row1Testimonials].map((item, idx) => (
                <TestimonialCard key={`row1-${item.id}-${idx}`} item={item} />
              ))}
            </div>
          </div>

          {/* Row 2: Left to Right */}
          <div className="overflow-hidden flex">
            <div className="animate-marquee-reverse py-2">
              {[...row2Testimonials, ...row2Testimonials].map((item, idx) => (
                <TestimonialCard key={`row2-${item.id}-${idx}`} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
