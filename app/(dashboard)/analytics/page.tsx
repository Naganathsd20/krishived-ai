"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { BarChart3, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { FarmHealthCard } from "@/components/analytics/FarmHealthCard";
import { AnalyticsStatCards } from "@/components/analytics/AnalyticsStatCards";
import { CropHealthChart } from "@/components/analytics/CropHealthChart";
import { DiseaseAnalyticsCard } from "@/components/analytics/DiseaseAnalyticsCard";
import { WeatherAnalyticsCard } from "@/components/analytics/WeatherAnalyticsCard";
import { SoilCropInsightsCard } from "@/components/analytics/SoilCropInsightsCard";
import { AIFarmInsightsCard } from "@/components/analytics/AIFarmInsightsCard";
import { RecentActivityList } from "@/components/analytics/RecentActivityList";
import { IAnalyticsResponse } from "@/types/analytics";

export default function AnalyticsPage() {
  const [data, setData] = useState<IAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAnalyticsData = useCallback(async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    } else if (!data) {
      setIsLoading(true);
    }
    setErrorMsg(null);

    try {
      // Append cache-busting timestamp parameter & no-store headers to ensure fresh MongoDB fetch
      const res = await fetch(`/api/analytics?t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });

      const json: IAnalyticsResponse = await res.json();

      if (res.ok && json.success) {
        setData(json);
      } else {
        throw new Error(json.error || "Unable to load farm analytics. Please try again.");
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
      const msg = err instanceof Error ? err.message : "Unable to load farm analytics. Please try again.";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [data]);

  useEffect(() => {
    fetchAnalyticsData(false);
  }, []);

  return (
    <PageContainer className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Farm Analytics"
        description="Understand your farm health, crop activity, disease trends, and agricultural insights in one place."
        badge={
          <Badge variant="emerald" className="gap-1.5 px-3 py-1 text-xs font-bold">
            <BarChart3 className="w-3.5 h-3.5" />
            Live Database Sync
          </Badge>
        }
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="emerald"
              size="sm"
              disabled={isLoading || isRefreshing}
              className="rounded-xl shadow-md gap-1.5 text-xs font-bold transition-all"
              onClick={() => fetchAnalyticsData(true)}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>{isRefreshing ? "Refreshing..." : "Refresh Metrics"}</span>
            </Button>
          </div>
        }
      />

      {/* Initial Loading State */}
      {isLoading && !data && (
        <div className="py-24 text-center space-y-4">
          <div className="relative flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
            <div className="absolute w-14 h-14 rounded-full border-4 border-emerald-200 animate-ping opacity-25" />
          </div>
          <div className="text-base font-extrabold text-slate-800 tracking-tight">
            Loading farm analytics...
          </div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Fetching real-time crop diagnostics, saved soil recommendations, weather checks, and AI conversations.
          </p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && errorMsg && !data && (
        <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200/80 text-center space-y-4 max-w-lg mx-auto my-12">
          <div className="p-3 w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-rose-900">
              Unable to load farm analytics. Please try again.
            </h3>
            <p className="text-xs text-rose-700">{errorMsg}</p>
          </div>
          <Button
            variant="emerald"
            size="sm"
            onClick={() => fetchAnalyticsData(true)}
            className="rounded-xl gap-2 font-bold text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </Button>
        </div>
      )}

      {/* Real Data Render */}
      {data && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* 1. Farm Health Overview (Large Score Card) */}
          <section>
            <FarmHealthCard data={data.farmHealth} />
          </section>

          {/* 2. Key Statistics Cards (5 Cards Grid) */}
          <section>
            <AnalyticsStatCards stats={data.stats} />
          </section>

          {/* 3 & 4. Crop Health & Disease Analytics */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <CropHealthChart data={data.cropHealth} />
            <DiseaseAnalyticsCard data={data.diseaseAnalytics} />
          </section>

          {/* 5 & 6. Weather Analytics & Soil/Crop Insights */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <WeatherAnalyticsCard data={data.weatherAnalytics} />
            <SoilCropInsightsCard data={data.soilCropInsights} />
          </section>

          {/* 7 & 8. AI Farm Insights & Recent Activity */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <AIFarmInsightsCard insights={data.aiInsights} />
            <RecentActivityList activities={data.recentActivities} />
          </section>
        </motion.div>
      )}
    </PageContainer>
  );
}
