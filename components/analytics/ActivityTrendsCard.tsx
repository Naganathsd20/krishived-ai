"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar, Activity, TrendingUp, AlertTriangle, Layers, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IActivityTrends } from "@/types/advanced-analytics";

interface ActivityTrendsCardProps {
  data?: IActivityTrends;
}

export const ActivityTrendsCard: React.FC<ActivityTrendsCardProps> = ({ data }) => {
  if (!data || !data.hasData || data.trend.length === 0) {
    return (
      <Card variant="glass" className="border-slate-200/80">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">
                  Farm Operational Activity Trends
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Task frequency and operational rhythm over time
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono">
              0 Tasks
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="py-10 text-center space-y-3">
          <div className="p-3 w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center border border-indigo-200">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="text-sm font-bold text-slate-800">No Activity Records Available</div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Log your daily field work (irrigation, sowing, crop inspection, pest spraying) to build historical activity trends.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { hasEnoughTrendData, trend, byType } = data;
  const totalActivities = trend.reduce((sum, t) => sum + t.activityCount, 0);

  // Maximum activity count for bar graph height scaling
  const maxActivityCount = Math.max(...trend.map((t) => t.activityCount), 1);

  return (
    <Card variant="glass" className="border-slate-200/80">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">
                Farm Operational Activity Trends
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Timeline frequency of field tasks and management operations
              </CardDescription>
            </div>
          </div>
          <Badge variant="info" className="text-[10px] font-mono font-bold">
            {totalActivities} Total Tasks
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Insufficient Trend Data Alert */}
        {!hasEnoughTrendData && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-extrabold text-amber-900">
                Insufficient historical data for trend analysis
              </div>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                A minimum of 2 separate historical dates is required to compute multi-period operational trend graphs.
              </p>
            </div>
          </div>
        )}

        {/* Timeline Bar Graph */}
        {trend.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                Completed Field Activities Timeline
              </span>
              <span className="text-[10px] text-slate-400 font-normal">{trend.length} Time Period Points</span>
            </div>

            <div className="h-44 w-full bg-slate-50/80 rounded-2xl p-4 border border-slate-200/60 flex items-end justify-between gap-2 overflow-x-auto">
              {trend.map((point, idx) => {
                const heightPercent = Math.max(12, Math.round((point.activityCount / maxActivityCount) * 100));
                return (
                  <div
                    key={`${point.periodLabel}-${idx}`}
                    className="flex-1 flex flex-col items-center gap-2 min-w-[32px] group"
                  >
                    <div className="text-[10px] font-bold text-slate-700 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                      {point.activityCount}
                    </div>
                    <div className="w-full h-28 flex items-end justify-center">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPercent}%` }}
                        transition={{ duration: 0.5, delay: idx * 0.05 }}
                        className="w-full max-w-[28px] bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg group-hover:brightness-110 transition-all cursor-pointer"
                      />
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 truncate max-w-full">
                      {point.periodLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Task Category Pill Matrix */}
        {byType.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              Task Category Breakdown
            </h4>
            <div className="flex flex-wrap gap-2">
              {byType.map((item) => (
                <div
                  key={item.activityType}
                  className="px-3 py-1.5 rounded-xl border border-slate-200/70 bg-slate-50/70 flex items-center gap-2 text-xs font-semibold text-slate-800"
                >
                  <span>{item.activityType}</span>
                  <Badge variant="info" className="text-[10px] py-0 px-1.5 font-bold">
                    {item.count}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200/60 flex items-start gap-2 text-xs text-indigo-900">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <p className="leading-snug text-[11px]">
            <span className="font-bold">Operations Tip:</span> Maintaining a regular activity log improves KrishiMitra AI consultation accuracy and seasonal farm planning.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
