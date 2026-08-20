"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Filter,
  RefreshCw,
  Loader2,
  AlertCircle,
  Coins,
  Sprout,
  Tractor,
  TrendingUp,
  Activity,
  Bug,
  Award,
  RotateCcw,
  CheckCircle2,
  Info,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { YieldAnalyticsCard } from "@/components/analytics/YieldAnalyticsCard";
import { CostAnalyticsCard } from "@/components/analytics/CostAnalyticsCard";
import { ActivityTrendsCard } from "@/components/analytics/ActivityTrendsCard";
import { TimeRangeOption, IAdvancedAnalyticsResponse } from "@/types/advanced-analytics";

const TIME_RANGES: { label: string; value: TimeRangeOption }[] = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "3 Months", value: "3m" },
  { label: "6 Months", value: "6m" },
  { label: "1 Year", value: "1y" },
  { label: "All Time", value: "all" },
];

export const AdvancedAnalyticsTab: React.FC = () => {
  const [range, setRange] = useState<TimeRangeOption>("30d");
  const [selectedCrop, setSelectedCrop] = useState<string>("All");
  const [data, setData] = useState<IAdvancedAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAdvancedAnalytics = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMsg(null);

    try {
      const url = `/api/advanced-analytics?range=${range}&crop=${encodeURIComponent(selectedCrop)}&t=${Date.now()}`;
      const res = await fetch(url, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });

      const json: IAdvancedAnalyticsResponse = await res.json();

      if (res.ok && json.success) {
        setData(json);
      } else {
        throw new Error(json.error || "Unable to load advanced farm analytics.");
      }
    } catch (err) {
      console.error("Error fetching advanced analytics:", err);
      const msg = err instanceof Error ? err.message : "Unable to load advanced farm analytics.";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [range, selectedCrop]);

  useEffect(() => {
    fetchAdvancedAnalytics(false);
  }, [fetchAdvancedAnalytics]);

  // Derive unique list of crop filter options from response
  const availableCrops = useMemo(() => {
    const cropsSet = new Set<string>();
    cropsSet.add("All");

    if (data?.yieldAnalytics?.cropComparison) {
      data.yieldAnalytics.cropComparison.forEach((c) => cropsSet.add(c.crop));
    }
    if (data?.expenseAnalytics?.byCrop) {
      data.expenseAnalytics.byCrop.forEach((c) => cropsSet.add(c.crop));
    }
    return Array.from(cropsSet);
  }, [data]);

  const handleResetFilters = () => {
    setRange("30d");
    setSelectedCrop("All");
  };

  return (
    <div className="space-y-6">
      {/* 1. Filter Control Header Bar */}
      <div className="p-4 rounded-3xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Time Range Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            Time Range:
          </span>
          {TIME_RANGES.map((item) => {
            const isSelected = range === item.value;
            return (
              <button
                key={item.value}
                onClick={() => setRange(item.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Right Action Controls: Crop Filter & Buttons */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Crop Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200/60">
            <Filter className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {availableCrops.map((c) => (
                <option key={c} value={c}>
                  {c === "All" ? "All Crops" : c}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters Button */}
          {(range !== "30d" || selectedCrop !== "All") && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold gap-1 px-2.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </Button>
          )}

          {/* Refresh Button */}
          <Button
            variant="emerald"
            size="sm"
            disabled={isLoading || isRefreshing}
            onClick={() => fetchAdvancedAnalytics(true)}
            className="rounded-xl shadow-sm gap-1.5 text-xs font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Updating..." : "Refresh"}</span>
          </Button>
        </div>
      </div>

      {/* 2. Loading Skeleton State */}
      {isLoading && !data && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-slate-100 animate-pulse border border-slate-200/60" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 rounded-3xl bg-slate-100 animate-pulse border border-slate-200/60" />
            <div className="h-80 rounded-3xl bg-slate-100 animate-pulse border border-slate-200/60" />
          </div>
        </div>
      )}

      {/* 3. Error State */}
      {!isLoading && errorMsg && !data && (
        <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200/80 text-center space-y-4 max-w-lg mx-auto my-8">
          <div className="p-3 w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-rose-900">
              Unable to load advanced farm analytics
            </h3>
            <p className="text-xs text-rose-700">{errorMsg}</p>
          </div>
          <Button
            variant="emerald"
            size="sm"
            onClick={() => fetchAdvancedAnalytics(true)}
            className="rounded-xl gap-2 font-bold text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Query</span>
          </Button>
        </div>
      )}

      {/* 4. Real Data Render */}
      {data && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Data Quality / Coverage Warning Banner */}
          {data.dataQuality && data.dataQuality.status !== "OPTIMAL_DATA" && (
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/80 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-amber-900 uppercase tracking-wider">
                    Data Quality Notice
                  </span>
                  <Badge variant="warning" className="text-[9px] py-0 px-1.5 font-mono font-bold">
                    {data.dataQuality.status}
                  </Badge>
                </div>
                <div className="text-xs text-amber-800 leading-snug">
                  {data.dataQuality.notes.join(" • ")}
                </div>
              </div>
            </div>
          )}

          {/* KPI Summary Cards Grid (7 Metric Cards) */}
          {data.kpiSummary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              <Card variant="glass" className="p-3 border-slate-200/70 hover:border-amber-300 transition-colors">
                <CardContent className="p-0 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>Input Expenses</span>
                    <Coins className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <div className="text-lg font-black text-slate-900 font-mono">
                    ₹{data.kpiSummary.totalExpenses.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium truncate">Total Spent</div>
                </CardContent>
              </Card>

              <Card variant="glass" className="p-3 border-slate-200/70 hover:border-emerald-300 transition-colors">
                <CardContent className="p-0 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>Total Output</span>
                    <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="text-lg font-black text-slate-900 font-mono">
                    {data.kpiSummary.totalProductionQuintals} <span className="text-[10px] font-normal">Qtl</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium truncate">Harvest Yield</div>
                </CardContent>
              </Card>

              <Card variant="glass" className="p-3 border-slate-200/70 hover:border-emerald-300 transition-colors">
                <CardContent className="p-0 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>Avg Yield/Acre</span>
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="text-lg font-black text-emerald-700 font-mono">
                    {data.kpiSummary.avgYieldPerAcre} <span className="text-[10px] font-normal">Q/Ac</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium truncate">Yield Efficiency</div>
                </CardContent>
              </Card>

              <Card variant="glass" className="p-3 border-slate-200/70 hover:border-indigo-300 transition-colors">
                <CardContent className="p-0 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>Total Tasks</span>
                    <Activity className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <div className="text-lg font-black text-slate-900 font-mono">
                    {data.kpiSummary.totalActivities}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium truncate">Farm Diary Logs</div>
                </CardContent>
              </Card>

              <Card variant="glass" className="p-3 border-slate-200/70 hover:border-teal-300 transition-colors">
                <CardContent className="p-0 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>Soil Health</span>
                    <Award className="w-3.5 h-3.5 text-teal-600" />
                  </div>
                  <div className="text-lg font-black text-slate-900 font-mono">
                    {data.kpiSummary.avgSoilScore !== null ? `${data.kpiSummary.avgSoilScore}/100` : "N/A"}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium truncate">Avg Soil Rating</div>
                </CardContent>
              </Card>

              <Card variant="glass" className="p-3 border-slate-200/70 hover:border-rose-300 transition-colors">
                <CardContent className="p-0 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>Leaf Scans</span>
                    <Bug className="w-3.5 h-3.5 text-rose-600" />
                  </div>
                  <div className="text-lg font-black text-slate-900 font-mono">
                    {data.kpiSummary.diseaseScanCount}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium truncate">Disease Diagnostics</div>
                </CardContent>
              </Card>

              <Card variant="glass" className="p-3 border-slate-200/70 hover:border-emerald-300 transition-colors">
                <CardContent className="p-0 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>Harvests</span>
                    <Tractor className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="text-lg font-black text-slate-900 font-mono">
                    {data.kpiSummary.totalHarvests}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium truncate">Logged Records</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Visualizations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <YieldAnalyticsCard data={data.yieldAnalytics} />
            <CostAnalyticsCard data={data.expenseAnalytics} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <ActivityTrendsCard data={data.activityTrends} />

            {/* Pathogen Severity & Soil Health Progression Summary Card */}
            <Card variant="glass" className="border-slate-200/80">
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-teal-100 text-teal-700">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Pathogen Risk & Soil Health Progression
                      </h3>
                      <p className="text-xs text-slate-500">
                        Environmental telemetry & leaf diagnostics risk shift
                      </p>
                    </div>
                  </div>
                  <Badge variant="emerald" className="text-[10px] font-mono font-bold">
                    Telemetry Scanned
                  </Badge>
                </div>

                {/* Soil Health Average & Status */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Average Soil Health Score
                    </div>
                    <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                      {data.soilWeatherAnalytics?.avgSoilHealthScore !== null
                        ? `${data.soilWeatherAnalytics?.avgSoilHealthScore}/100`
                        : "No Data"}
                    </div>
                  </div>
                  <Badge
                    variant={
                      (data.soilWeatherAnalytics?.avgSoilHealthScore || 0) >= 80
                        ? "emerald"
                        : (data.soilWeatherAnalytics?.avgSoilHealthScore || 0) >= 60
                        ? "warning"
                        : "outline"
                    }
                    className="text-xs py-1 px-2.5 font-bold"
                  >
                    {data.soilWeatherAnalytics?.soilHealthStatus || "Insufficient Data"}
                  </Badge>
                </div>

                {/* Microclimate Telemetry Grid */}
                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div className="text-[10px] font-bold text-slate-400">AVG TEMP</div>
                    <div className="text-sm font-extrabold text-slate-800">
                      {data.soilWeatherAnalytics?.avgTemperature !== null
                        ? `${data.soilWeatherAnalytics?.avgTemperature}°C`
                        : "N/A"}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div className="text-[10px] font-bold text-slate-400">AVG HUMIDITY</div>
                    <div className="text-sm font-extrabold text-slate-800">
                      {data.soilWeatherAnalytics?.avgHumidity !== null
                        ? `${data.soilWeatherAnalytics?.avgHumidity}%`
                        : "N/A"}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div className="text-[10px] font-bold text-slate-400">RAIN PROB</div>
                    <div className="text-sm font-extrabold text-slate-800">
                      {data.soilWeatherAnalytics?.avgRainProbability !== null
                        ? `${data.soilWeatherAnalytics?.avgRainProbability}%`
                        : "N/A"}
                    </div>
                  </div>
                </div>

                {/* Disease Diagnostics Scan Ratio */}
                {data.diseaseAnalytics && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/60 flex items-center justify-between text-xs font-bold text-emerald-900">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Crop Diagnostics Health Rate</span>
                    </div>
                    <span className="font-mono font-black text-sm">
                      {data.diseaseAnalytics.healthyPercentage}% Healthy ({data.diseaseAnalytics.healthyCount}/{data.diseaseAnalytics.totalScans} Scans)
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}
    </div>
  );
};
