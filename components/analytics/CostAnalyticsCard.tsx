"use client";

import React from "react";
import { motion } from "framer-motion";
import { Coins, Receipt, ArrowUpRight, PieChart, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IExpenseAnalytics } from "@/types/advanced-analytics";

interface CostAnalyticsCardProps {
  data?: IExpenseAnalytics;
}

export const CostAnalyticsCard: React.FC<CostAnalyticsCardProps> = ({ data }) => {
  if (!data || !data.hasData || data.activityCount === 0) {
    return (
      <Card variant="glass" className="border-slate-200/80">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">
                  Farm Financial & Cost Analytics
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Expense tracking by activity category and crop
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono">
              ₹0 Recorded
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="py-10 text-center space-y-3">
          <div className="p-3 w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center border border-amber-200">
            <Receipt className="w-6 h-6" />
          </div>
          <div className="text-sm font-bold text-slate-800">No Expense Records Available</div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Log your operational expenses (seeds, fertilizer, labor, irrigation, spraying) on the Farm Diary page to generate cost analytics.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { totalExpenses, activityCount, byActivity, byCrop } = data;

  const maxActivityCost = Math.max(...byActivity.map((a) => a.totalCost), 1);

  return (
    <Card variant="glass" className="border-slate-200/80">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">
                Farm Financial & Cost Analytics
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Input expense breakdown across field management categories
              </CardDescription>
            </div>
          </div>
          <Badge variant="warning" className="text-[10px] font-mono font-bold">
            ₹{totalExpenses.toLocaleString("en-IN")} Total Spent
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Top Summary Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-amber-200/60 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Total Farm Operational Expenses
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight mt-0.5">
              ₹{totalExpenses.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="text-right font-mono">
            <div className="text-xs font-bold text-slate-700">{activityCount} Logged Tasks</div>
            <div className="text-[10px] text-slate-500">
              Avg ₹{activityCount > 0 ? Math.round(totalExpenses / activityCount).toLocaleString("en-IN") : 0} / Task
            </div>
          </div>
        </div>

        {/* Activity Category Breakdown */}
        {byActivity.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5 text-amber-600" />
                Expense Breakdown by Activity
              </span>
              <span className="text-[10px] text-slate-400 font-normal">% of total input cost</span>
            </div>

            <div className="space-y-2.5">
              {byActivity.map((item, idx) => {
                const barWidth = Math.min(100, Math.round((item.totalCost / maxActivityCost) * 100));
                return (
                  <div key={item.activityType} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-800 font-bold">{item.activityType}</span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-slate-900 font-bold">
                          ₹{item.totalCost.toLocaleString("en-IN")}
                        </span>
                        <Badge variant="outline" className="text-[10px] py-0 px-1 font-bold text-slate-600">
                          {item.percentage}%
                        </Badge>
                      </div>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex p-0.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(barWidth, 4)}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.08 }}
                        className="h-full bg-amber-500 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Crop-wise Cost Breakdown */}
        {byCrop.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Expense Distribution by Crop
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {byCrop.map((item) => (
                <div
                  key={item.crop}
                  className="p-3 rounded-2xl border border-slate-200/70 bg-slate-50/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-xs font-bold text-slate-800">{item.crop}</span>
                  </div>
                  <div className="font-mono text-xs font-black text-slate-900">
                    ₹{item.totalCost.toLocaleString("en-IN")}
                    <span className="text-[10px] text-slate-400 font-normal ml-1">({item.count} tasks)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-start gap-2 text-xs text-amber-900">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-snug text-[11px]">
            <span className="font-bold">Financial Advice:</span> Tracking input costs per category ensures accurate ROI estimation per acre upon harvesting.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
