"use client";

import React from "react";
import { motion } from "framer-motion";
import { Activity, ShieldCheck, Sprout, CloudSun, Droplet, Sparkles, CheckCircle2, Info, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IFarmHealthData } from "@/types/analytics";

interface FarmHealthCardProps {
  data: IFarmHealthData;
}

export const FarmHealthCard: React.FC<FarmHealthCardProps> = ({ data }) => {
  const { hasEnoughData, overallScore, status, breakdown } = data;

  const METRICS = breakdown
    ? [
        {
          name: "Crop Health",
          score: breakdown.cropHealthScore,
          status: `${breakdown.cropHealthScore}% Optimal`,
          color: "text-emerald-600",
          barColor: "bg-gradient-to-r from-emerald-500 to-emerald-600",
          icon: Sprout,
        },
        {
          name: "Soil Health",
          score: breakdown.soilHealthScore,
          status: `${breakdown.soilHealthScore}/100 Grade`,
          color: "text-teal-600",
          barColor: "bg-gradient-to-r from-teal-500 to-emerald-500",
          icon: Activity,
        },
        {
          name: "Disease Risk Score",
          score: breakdown.diseaseRiskScore,
          status: `${breakdown.diseaseRiskScore}% Low Risk`,
          color: "text-green-600",
          barColor: "bg-gradient-to-r from-emerald-400 to-green-500",
          icon: ShieldCheck,
        },
        {
          name: "Weather Stability",
          score: breakdown.weatherStabilityScore,
          status: `${breakdown.weatherStabilityScore}% Favorable`,
          color: "text-sky-600",
          barColor: "bg-gradient-to-r from-sky-400 to-teal-500",
          icon: CloudSun,
        },
        {
          name: "Irrigation Status",
          score: breakdown.irrigationScore,
          status: `${breakdown.irrigationScore}% Hydrated`,
          color: "text-cyan-600",
          barColor: "bg-gradient-to-r from-cyan-500 to-emerald-500",
          icon: Droplet,
        },
      ]
    : [];

  return (
    <Card variant="gradient" className="border-emerald-200/80 shadow-md">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-emerald-100/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="emerald" className="px-2.5 py-0.5 text-xs font-semibold gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Live Farm Telemetry
              </Badge>
              <div className="group relative flex items-center gap-1 text-xs text-slate-500 cursor-help">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden group-hover:inline-block absolute left-5 -top-1 w-64 p-2 bg-slate-900 text-white text-[11px] rounded-xl shadow-lg z-20 font-normal">
                  An application-generated score based on available crop, soil, disease, weather, and irrigation indicators.
                </span>
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Farm Health Score
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              An application-generated score calculated from your real crop disease analyses, saved soil recommendations & weather telemetry.
            </p>
          </div>

          {/* Score Display */}
          <div className="flex items-center gap-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-emerald-200/80 shadow-sm shrink-0">
            {hasEnoughData && overallScore !== null ? (
              <>
                <div className="relative flex items-center justify-center w-20 h-20">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-emerald-100"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <motion.path
                      initial={{ strokeDasharray: "0, 100" }}
                      animate={{ strokeDasharray: `${overallScore}, 100` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className="text-emerald-600"
                      strokeDasharray={`${overallScore}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-xl font-black text-slate-900 leading-none font-mono">
                      {overallScore}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono leading-tight">/100</span>
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-0.5">
                    Current Status
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="text-lg font-black text-emerald-700">{status}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Calculated from stored records</span>
                </div>
              </>
            ) : (
              <div className="p-3 text-center">
                <div className="text-sm font-extrabold text-amber-800">Insufficient data</div>
                <p className="text-[11px] text-slate-500 mt-0.5 max-w-[180px]">
                  Run disease scans or save soil recommendations to calculate score.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Breakdown Progress Bars */}
        {hasEnoughData && METRICS.length > 0 ? (
          <div className="mt-6 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Parameter Breakdown
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {METRICS.map((metric, idx) => {
                const Icon = metric.icon;
                return (
                  <motion.div
                    key={metric.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08, duration: 0.3 }}
                    className="p-3.5 rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200/70 hover:border-emerald-300 transition-all shadow-2xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-800">{metric.name}</span>
                      </div>
                      <span className="text-xs font-extrabold text-slate-900 font-mono">
                        {metric.score}%
                      </span>
                    </div>

                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-1.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.score}%` }}
                        transition={{ duration: 0.8, delay: 0.2 + idx * 0.05 }}
                        className={`h-full rounded-full ${metric.barColor}`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Telemetry</span>
                      <span className={`font-semibold ${metric.color}`}>{metric.status}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 flex items-center gap-3 text-xs text-emerald-900">
            <Info className="w-5 h-5 text-emerald-600 shrink-0" />
            <p>
              <span className="font-bold">No farm telemetry recorded yet.</span> Start by performing a crop leaf disease analysis or checking weather and soil recommendations to build your live Farm Health Score.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
