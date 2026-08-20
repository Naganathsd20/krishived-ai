"use client";

import React from "react";
import {
  BrainCircuit,
  Bot,
  CloudSun,
  BookOpen,
  Calendar,
  TrendingUp,
  BarChart2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { IAdminFeatureUsage } from "@/types/admin";

interface AdminFeatureUsageProps {
  usage: IAdminFeatureUsage;
}

export const AdminFeatureUsage: React.FC<AdminFeatureUsageProps> = ({ usage }) => {
  const {
    diseaseScans,
    aiConversations,
    soilAdvisories,
    farmDiaryEntries,
    cropSchedules,
    harvestLogs,
  } = usage;

  const total =
    diseaseScans +
      aiConversations +
      soilAdvisories +
      farmDiaryEntries +
      cropSchedules +
      harvestLogs || 1;

  const features = [
    {
      name: "Disease Diagnostics",
      count: diseaseScans,
      icon: BrainCircuit,
      color: "bg-emerald-500",
      textColor: "text-emerald-700",
      percentage: Math.round((diseaseScans / total) * 100),
    },
    {
      name: "KrishiMitra AI Assistant",
      count: aiConversations,
      icon: Bot,
      color: "bg-teal-500",
      textColor: "text-teal-700",
      percentage: Math.round((aiConversations / total) * 100),
    },
    {
      name: "Weather & Soil Telemetry",
      count: soilAdvisories,
      icon: CloudSun,
      color: "bg-sky-500",
      textColor: "text-sky-700",
      percentage: Math.round((soilAdvisories / total) * 100),
    },
    {
      name: "Farm Diary Activity Logs",
      count: farmDiaryEntries,
      icon: BookOpen,
      color: "bg-amber-500",
      textColor: "text-amber-700",
      percentage: Math.round((farmDiaryEntries / total) * 100),
    },
    {
      name: "ICAR Crop Schedule",
      count: cropSchedules,
      icon: Calendar,
      color: "bg-indigo-500",
      textColor: "text-indigo-700",
      percentage: Math.round((cropSchedules / total) * 100),
    },
    {
      name: "Harvest Logs & Intelligence",
      count: harvestLogs,
      icon: TrendingUp,
      color: "bg-rose-500",
      textColor: "text-rose-700",
      percentage: Math.round((harvestLogs / total) * 100),
    },
  ];

  return (
    <Card variant="glass" className="border-slate-200/80">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              Platform Feature Adoption & Usage
            </CardTitle>
            <CardDescription className="text-xs">
              Comparative engagement breakdown across core KrishiEngine tools
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        {features.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2 text-slate-800">
                  <Icon className={`w-3.5 h-3.5 ${item.textColor}`} />
                  <span>{item.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-slate-900 font-extrabold">{item.count.toLocaleString()}</span>
                  <span className="text-[11px] text-slate-400">({item.percentage}%)</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 rounded-full bg-slate-100/90 border border-slate-200/60 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                  style={{ width: `${Math.max(4, item.percentage)}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
