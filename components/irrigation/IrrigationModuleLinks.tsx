"use client";

import React from "react";
import Link from "next/link";
import { CloudSun, Sprout, Calendar, BookOpen, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const IrrigationModuleLinks: React.FC = () => {
  const links = [
    {
      title: "Weather & Soil Telemetry",
      desc: "View live rainfall radar, humidity & temperature history.",
      href: "/weather-soil",
      icon: CloudSun,
      color: "text-sky-600 bg-sky-50 border-sky-200/60",
    },
    {
      title: "AI Crop Advisory",
      desc: "Get personalized crop nutrient and water stress management tips.",
      href: "/crop-advisory",
      icon: Sprout,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200/60",
    },
    {
      title: "ICAR Crop Schedule",
      desc: "Sync irrigation events with your crop stage milestones.",
      href: "/crop-schedule",
      icon: Calendar,
      color: "text-amber-600 bg-amber-50 border-amber-200/60",
    },
    {
      title: "Farm Diary Logs",
      desc: "Record actual water applied and pump power usage logs.",
      href: "/farm-diary",
      icon: BookOpen,
      color: "text-teal-600 bg-teal-50 border-teal-200/60",
    },
  ];

  return (
    <div className="space-y-3 pt-2">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
        Related KrishiEngine Modules
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.title} href={item.href}>
              <Card
                variant="glass"
                className="p-3.5 border-slate-200/70 hover:border-emerald-500/40 transition-all group"
              >
                <CardContent className="p-0 flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-xl border shrink-0 transition-transform group-hover:scale-105 ${item.color}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                      <span className="truncate">{item.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
