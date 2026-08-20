"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sprout, Scale, MapPin, Tractor, TrendingUp, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IYieldAnalytics } from "@/types/advanced-analytics";

interface YieldAnalyticsCardProps {
  data?: IYieldAnalytics;
}

export const YieldAnalyticsCard: React.FC<YieldAnalyticsCardProps> = ({ data }) => {
  if (!data || !data.hasData || data.totalHarvests === 0) {
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
                  Harvest & Yield Intelligence
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Production volume and yield per acre metrics
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono">
              0 Harvests Logged
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="py-10 text-center space-y-3">
          <div className="p-3 w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200">
            <Tractor className="w-6 h-6" />
          </div>
          <div className="text-sm font-bold text-slate-800">No Harvest Logs Available</div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Log your crop harvests on the Yield Intelligence page to calculate real yield-per-acre efficiency and season production volume.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { totalHarvests, totalProductionQuintals, totalAreaAcres, avgYieldPerAcre, cropComparison, byCropAndSeason } = data;

  // Max yield per acre for scaling progress bars
  const maxYieldEfficiency = Math.max(...cropComparison.map((c) => c.avgYieldPerAcre), 1);

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
                Harvest & Yield Intelligence
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Real normalized production volume and yield efficiency (Quintals / Acre)
              </CardDescription>
            </div>
          </div>
          <Badge variant="emerald" className="text-[10px] font-mono font-bold">
            {totalHarvests} {totalHarvests === 1 ? "Harvest" : "Harvests"} Logged
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* KPI Mini Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mb-1">
              <Scale className="w-3.5 h-3.5 text-emerald-600" />
              <span>Total Output</span>
            </div>
            <div className="text-xl font-black text-slate-900 font-mono">
              {totalProductionQuintals} <span className="text-xs font-normal text-slate-500">Qtl</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mb-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Total Area</span>
            </div>
            <div className="text-xl font-black text-slate-900 font-mono">
              {totalAreaAcres} <span className="text-xs font-normal text-slate-500">Acres</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/60">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Avg Yield/Acre</span>
            </div>
            <div className="text-xl font-black text-emerald-900 font-mono">
              {avgYieldPerAcre} <span className="text-xs font-normal text-emerald-700">Qtl/Acre</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mb-1">
              <Tractor className="w-3.5 h-3.5 text-emerald-600" />
              <span>Log Count</span>
            </div>
            <div className="text-xl font-black text-slate-900 font-mono">
              {totalHarvests} <span className="text-xs font-normal text-slate-500">Records</span>
            </div>
          </div>
        </div>

        {/* Crop Productivity Efficiency Bar Chart */}
        {cropComparison.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Crop Productivity Efficiency (Quintals / Acre)</span>
              <span className="text-[10px] text-slate-400 font-normal">Higher is better</span>
            </div>

            <div className="space-y-2.5">
              {cropComparison.map((item, idx) => {
                const percentage = Math.min(100, Math.round((item.avgYieldPerAcre / maxYieldEfficiency) * 100));
                return (
                  <div key={item.crop} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-800 font-bold">{item.crop}</span>
                      <span className="font-mono text-emerald-700 font-extrabold">
                        {item.avgYieldPerAcre} Qtl/Acre ({item.totalYieldQuintals} Qtl total)
                      </span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex p-0.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(percentage, 4)}%` }}
                        transition={{ duration: 0.7, delay: idx * 0.1 }}
                        className="h-full bg-emerald-500 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Season Breakdown Cards */}
        {byCropAndSeason.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Seasonal Output Breakdown
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {byCropAndSeason.map((item) => (
                <div
                  key={`${item.crop}-${item.season}`}
                  className="p-3 rounded-2xl border border-slate-200/70 bg-slate-50/50 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">{item.crop}</div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      Season: <Badge variant="outline" className="py-0 px-1.5 text-[9px] font-bold">{item.season}</Badge>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-xs font-black text-emerald-700">{item.yieldPerAcre} Q/Acre</div>
                    <div className="text-[10px] text-slate-500">{item.totalYieldQuintals} Qtl / {item.totalAreaAcres} Acre</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 flex items-start gap-2 text-xs text-emerald-900">
          <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-snug text-[11px]">
            <span className="font-bold">Agronomy Benchmark:</span> Comparing Quintals/Acre across crop cycles helps select the highest-performing crop cultivars for upcoming seasons.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
