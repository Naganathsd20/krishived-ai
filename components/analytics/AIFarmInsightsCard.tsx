"use client";

import React from "react";
import Link from "next/link";
import { Bot, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AIFarmInsightsCardProps {
  insights: string[];
}

export const AIFarmInsightsCard: React.FC<AIFarmInsightsCardProps> = ({ insights }) => {
  return (
    <Card variant="gradient" className="border-emerald-300/80 shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <span>KrishiMitra Insights</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-600">
                Application-level insights generated from your real analytics data
              </CardDescription>
            </div>
          </div>
          <Badge variant="emerald" className="text-[10px] px-2.5 py-1 gap-1 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Data Insights
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          {insights && insights.length > 0 ? (
            insights.map((insight, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white/80 backdrop-blur-md border border-emerald-200/70 flex items-start gap-3 shadow-2xs hover:border-emerald-400 transition-colors"
              >
                <div className="p-1 rounded-full bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                  {insight}
                </p>
              </div>
            ))
          ) : (
            <div className="p-4 rounded-2xl bg-white/70 text-center text-xs text-slate-500">
              No insights available yet. Perform farm activities to generate automated insights.
            </div>
          )}
        </div>

        <div className="pt-2">
          <div className="p-3 rounded-2xl bg-emerald-900 text-white flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-slate-200">
                Have specific agricultural questions? Consult KrishiMitra.
              </span>
            </div>
            <Link
              href="/ai-assistant"
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-[11px] flex items-center gap-1 transition-colors shrink-0"
            >
              <span>Ask Bot</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
