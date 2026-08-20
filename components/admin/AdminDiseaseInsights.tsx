"use client";

import React from "react";
import { BrainCircuit, AlertTriangle, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IAdminDiseaseInsight } from "@/types/admin";

interface AdminDiseaseInsightsProps {
  insights: IAdminDiseaseInsight[];
}

export const AdminDiseaseInsights: React.FC<AdminDiseaseInsightsProps> = ({ insights }) => {
  return (
    <Card variant="glass" className="border-slate-200/80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Top Detected Crop Diseases
              </CardTitle>
              <CardDescription className="text-xs">
                Most frequent crop disease diagnostics reported across fields
              </CardDescription>
            </div>
          </div>

          <Badge variant="emerald" className="text-[10px] px-2 py-0.5 font-bold">
            Regional Pest Radar
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-1 space-y-3">
        {!insights || insights.length === 0 ? (
          <div className="p-6 text-center space-y-2 rounded-2xl bg-slate-50/70 border border-slate-200/60">
            <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No crop disease detections recorded</p>
            <p className="text-[11px] text-slate-500">
              No AI disease scans were logged within the selected time window.
            </p>
          </div>
        ) : (
          insights.map((item, idx) => (
            <div key={item.disease} className="space-y-1.5 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/60">
              <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-mono font-extrabold">
                    #{idx + 1}
                  </span>
                  <span className="text-slate-900 font-semibold">{item.disease}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-emerald-700 font-extrabold">{item.count} scans</span>
                  <span className="text-[11px] text-slate-400">({item.percentage}%)</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-slate-200/70 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                  style={{ width: `${Math.max(5, item.percentage)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
