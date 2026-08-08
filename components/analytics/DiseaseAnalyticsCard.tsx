"use client";

import React from "react";
import { motion } from "framer-motion";
import { BrainCircuit, CheckCircle2, AlertCircle, ShieldAlert, BarChart3, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IDiseaseAnalyticsData } from "@/types/analytics";

interface DiseaseAnalyticsCardProps {
  data: IDiseaseAnalyticsData;
}

export const DiseaseAnalyticsCard: React.FC<DiseaseAnalyticsCardProps> = ({ data }) => {
  const {
    totalAnalyses,
    healthyCount,
    healthyPercentage,
    diseaseDetectedCount,
    diseaseDetectedPercentage,
    highestDetectedDisease,
    breakdown,
  } = data;

  return (
    <Card variant="glass" className="border-slate-200/80">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-100 text-teal-700">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">
                Disease Analytics
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Real pathogen diagnosis records and occurrence distribution
              </CardDescription>
            </div>
          </div>
          <Badge variant="emerald" className="text-[10px] font-mono">
            {totalAnalyses} Total Analyses
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Top 4 Metrics Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-white border border-slate-200/70 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Scans</span>
            <div className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">{totalAnalyses}</div>
            <span className="text-[10px] text-slate-500 font-medium">Recorded</span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-emerald-700">Healthy</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-xl font-extrabold text-emerald-800 font-mono mt-0.5">{healthyCount}</div>
            <span className="text-[10px] text-emerald-700 font-medium">{healthyPercentage}% Rate</span>
          </div>

          <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-200/60 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-rose-700">Detected</span>
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <div className="text-xl font-extrabold text-rose-800 font-mono mt-0.5">{diseaseDetectedCount}</div>
            <span className="text-[10px] text-rose-700 font-medium">{diseaseDetectedPercentage}% Disease</span>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/60 shadow-2xs col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-amber-700">Highest Risk</span>
            <div className="text-xs font-bold text-slate-900 mt-1 truncate">
              {highestDetectedDisease}
            </div>
            <span className="text-[10px] text-amber-700 font-medium">Most Frequent</span>
          </div>
        </div>

        {/* Chart / Bar Distribution Visual */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              Pathogen Occurrence Distribution
            </span>
            <span className="text-[11px] font-mono text-slate-500 font-normal">Real Records</span>
          </div>

          {breakdown.length > 0 ? (
            <div className="space-y-2.5">
              {breakdown.map((item, idx) => {
                const barColor =
                  item.severity === "Healthy"
                    ? "bg-emerald-500"
                    : item.severity === "High"
                    ? "bg-rose-500"
                    : "bg-amber-500";

                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-2 font-mono shrink-0">
                        <span className="font-extrabold text-slate-900">{item.count} scans</span>
                        <span className="text-slate-400 text-[11px]">({item.percentage}%)</span>
                      </div>
                    </div>

                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ duration: 0.7, delay: 0.15 + idx * 0.08 }}
                        className={`h-full rounded-full ${barColor}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              No disease records logged yet for your account.
            </div>
          )}
        </div>

        {/* Insight Footer */}
        <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Diagnostic Record Status</div>
              <div className="text-[11px] text-slate-300">
                {diseaseDetectedCount > 0
                  ? `${diseaseDetectedCount} disease scan(s) flagged. Review treatment advice in Disease Diagnostics.`
                  : "All recorded scans indicate healthy crops. Keep up regular monitoring!"}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
};
