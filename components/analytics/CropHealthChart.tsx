"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sprout, AlertTriangle, ShieldAlert, CheckCircle2, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ICropHealthDistribution } from "@/types/analytics";

interface CropHealthChartProps {
  data: ICropHealthDistribution;
}

export const CropHealthChart: React.FC<CropHealthChartProps> = ({ data }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const {
    healthyCount,
    healthyPercentage,
    moderateRiskCount,
    moderateRiskPercentage,
    highRiskCount,
    highRiskPercentage,
    totalFieldsAnalyzed,
  } = data;

  const HEALTH_CATEGORIES = [
    {
      label: "Healthy Crops",
      percentage: healthyPercentage,
      count: healthyCount,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500",
      borderColor: "border-emerald-200",
      badgeVariant: "emerald" as const,
      icon: CheckCircle2,
      description: "Optimal leaf vigor, normal color, zero severe disease symptoms.",
    },
    {
      label: "Moderate Risk",
      percentage: moderateRiskPercentage,
      count: moderateRiskCount,
      color: "text-amber-600",
      bgColor: "bg-amber-500",
      borderColor: "border-amber-200",
      badgeVariant: "warning" as const,
      icon: AlertTriangle,
      description: "Moderate disease symptoms or minor pathogen flags detected.",
    },
    {
      label: "High Risk",
      percentage: highRiskPercentage,
      count: highRiskCount,
      color: "text-rose-600",
      bgColor: "bg-rose-500",
      borderColor: "border-rose-200",
      badgeVariant: "danger" as const,
      icon: ShieldAlert,
      description: "High severity crop infection detected requiring treatment.",
    },
  ];

  return (
    <Card variant="glass" className="border-slate-200/80">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">
                Crop Health Overview
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Field distribution calculated from your actual diagnosis records
              </CardDescription>
            </div>
          </div>
          <Badge variant="emerald" className="text-[10px] font-mono">
            {totalFieldsAnalyzed} Total Records
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {totalFieldsAnalyzed > 0 ? (
          <>
            {/* Custom Visual Donut / Segment Bar Chart */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>Crop Status Distribution</span>
                <span className="font-mono text-emerald-700 font-bold">{healthyPercentage}% Healthy Rate</span>
              </div>

              {/* Segmented Stacked Progress Bar */}
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex p-0.5 shadow-inner">
                {HEALTH_CATEGORIES.map((cat, idx) => (
                  <motion.div
                    key={cat.label}
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.percentage}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className={`h-full ${cat.bgColor} cursor-pointer transition-all duration-200 ${
                      idx === 0 ? "rounded-l-full" : ""
                    } ${idx === HEALTH_CATEGORIES.length - 1 ? "rounded-r-full" : ""} ${
                      hoveredIdx === idx ? "opacity-90 scale-y-110" : "opacity-100"
                    }`}
                  />
                ))}
              </div>

              {/* Clean Donut SVG Representation */}
              <div className="flex items-center justify-center pt-2">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      strokeWidth="4"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Healthy Arc */}
                    <circle
                      cx="18"
                      cy="18"
                      r="15.9155"
                      fill="none"
                      className="text-emerald-500"
                      strokeWidth="4"
                      strokeDasharray={`${healthyPercentage}, 100`}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                      stroke="currentColor"
                    />
                    {/* Moderate Arc */}
                    <circle
                      cx="18"
                      cy="18"
                      r="15.9155"
                      fill="none"
                      className="text-amber-400"
                      strokeWidth="4"
                      strokeDasharray={`${moderateRiskPercentage}, 100`}
                      strokeDashoffset={`-${healthyPercentage}`}
                      strokeLinecap="round"
                      stroke="currentColor"
                    />
                    {/* High Risk Arc */}
                    <circle
                      cx="18"
                      cy="18"
                      r="15.9155"
                      fill="none"
                      className="text-rose-500"
                      strokeWidth="4"
                      strokeDasharray={`${highRiskPercentage}, 100`}
                      strokeDashoffset={`-${healthyPercentage + moderateRiskPercentage}`}
                      strokeLinecap="round"
                      stroke="currentColor"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      {totalFieldsAnalyzed}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Scans Analyzed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Breakdown Cards */}
            <div className="space-y-2.5">
              {HEALTH_CATEGORIES.map((cat, idx) => {
                const Icon = cat.icon;
                const isHovered = hoveredIdx === idx;

                return (
                  <motion.div
                    key={cat.label}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className={`p-3 rounded-2xl border transition-all duration-200 ${
                      isHovered
                        ? `${cat.borderColor} bg-white shadow-sm`
                        : "border-slate-200/60 bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${cat.bgColor}`} />
                        <Icon className={`w-4 h-4 ${cat.color}`} />
                        <span className="text-xs font-bold text-slate-800">{cat.label}</span>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="font-extrabold text-slate-900">{cat.count} records</span>
                        <Badge variant={cat.badgeVariant} className="text-[10px] py-0 px-1.5 font-bold">
                          {cat.percentage}%
                        </Badge>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1 pl-5 leading-relaxed font-normal">
                      {cat.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="py-12 text-center space-y-3">
            <div className="p-3 w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
              <Sprout className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-slate-800">No Crop Scans Available</div>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Run leaf scans on the AI Disease Diagnostics page to populate your real crop health distribution.
            </p>
          </div>
        )}

        <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 flex items-start gap-2.5 text-xs text-emerald-900">
          <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-snug text-[11px]">
            <span className="font-bold">Agronomy Tip:</span> Regular weekly leaf diagnostics help detect early stage infections before they spread across plots.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
