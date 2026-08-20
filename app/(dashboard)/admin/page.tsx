"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, AlertCircle, RefreshCw, Lock, ShieldX } from "lucide-react";
import { PageContainer } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminKpiCards } from "@/components/admin/AdminKpiCards";
import { AdminFeatureUsage } from "@/components/admin/AdminFeatureUsage";
import { AdminDiseaseInsights } from "@/components/admin/AdminDiseaseInsights";
import { AdminSystemHealth } from "@/components/admin/AdminSystemHealth";
import { AdminRecentActivity } from "@/components/admin/AdminRecentActivity";
import {
  AdminTimeRange,
  IAdminOverviewData,
  IAdminOverviewResponse,
} from "@/types/admin";

export default function AdminDashboardPage() {
  const [selectedRange, setSelectedRange] = useState<AdminTimeRange>("7d");
  const [data, setData] = useState<IAdminOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<number | null>(null);

  const fetchAdminOverview = useCallback(
    async (range: AdminTimeRange = selectedRange) => {
      setIsLoading(true);
      setErrorMessage(null);
      setErrorCode(null);

      try {
        const res = await fetch(`/api/admin/overview?range=${range}&t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        });

        const json: IAdminOverviewResponse = await res.json();

        if (res.ok && json.success && json.data) {
          setData(json.data);
        } else {
          setErrorCode(res.status);
          if (res.status === 401) {
            setErrorMessage("Unauthorized. Please sign in to access the admin dashboard.");
          } else if (res.status === 403) {
            setErrorMessage("Administrator access is required. Your account does not have administrative privileges.");
          } else if (res.status === 429) {
            setErrorMessage("Too many requests. Please wait a moment and try again.");
          } else {
            setErrorMessage(json.error || "Unable to load admin dashboard data. Please try again.");
          }
        }
      } catch (err) {
        console.error("Error loading admin overview:", err);
        setErrorCode(500);
        setErrorMessage("Unable to connect to admin dashboard server. Please check network connection.");
      } finally {
        setIsLoading(false);
      }
    },
    [selectedRange]
  );

  useEffect(() => {
    fetchAdminOverview(selectedRange);
  }, [fetchAdminOverview, selectedRange]);

  const handleRangeChange = (newRange: AdminTimeRange) => {
    setSelectedRange(newRange);
  };

  const handleRefresh = () => {
    fetchAdminOverview(selectedRange);
  };

  const rangeLabels: Record<AdminTimeRange, string> = {
    "24h": "24 hours",
    "7d": "7 days",
    "30d": "30 days",
    all: "all time",
  };

  return (
    <PageContainer className="space-y-6 pb-12">
      {/* Admin Header Bar */}
      <AdminHeader
        selectedRange={selectedRange}
        onRangeChange={handleRangeChange}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        generatedAt={data?.generatedAt}
      />

      {/* 1. Loading Skeleton State */}
      {isLoading && (
        <div className="space-y-6">
          {/* KPI Skeletons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="h-28 rounded-3xl bg-slate-100/90 animate-pulse border border-slate-200/60 p-4 space-y-2"
              >
                <div className="h-3 bg-slate-200 rounded-md w-1/2" />
                <div className="h-7 bg-slate-200 rounded-md w-2/3" />
                <div className="h-3 bg-slate-200 rounded-md w-3/4" />
              </div>
            ))}
          </div>

          {/* Main Grid Skeletons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 rounded-3xl bg-slate-100/90 animate-pulse border border-slate-200/60 p-5" />
            <div className="h-80 rounded-3xl bg-slate-100/90 animate-pulse border border-slate-200/60 p-5" />
          </div>
        </div>
      )}

      {/* 2. Error State */}
      {!isLoading && errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-4 max-w-md mx-auto my-8 shadow-sm"
        >
          <div className="p-4 w-16 h-16 rounded-3xl bg-rose-100 text-rose-700 mx-auto flex items-center justify-center border border-rose-200/80">
            {errorCode === 403 ? <ShieldX className="w-8 h-8 text-rose-600" /> : <AlertCircle className="w-8 h-8 text-amber-600" />}
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-extrabold text-slate-900">
              {errorCode === 403 ? "Access Denied" : "Admin Overview Error"}
            </h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {errorMessage}
            </p>
          </div>

          <Button
            variant="emerald"
            size="sm"
            onClick={handleRefresh}
            className="rounded-xl gap-2 font-bold text-xs shadow-sm mt-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </Button>
        </motion.div>
      )}

      {/* 3. Dashboard Content (Loaded State) */}
      {!isLoading && !errorMessage && data && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Executive KPI Cards */}
          <AdminKpiCards
            stats={data.kpiStats}
            timeRangeLabel={rangeLabels[selectedRange]}
          />

          {/* 2-Column Main Intelligence Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left Column: Feature Adoption & Disease Insights */}
            <div className="space-y-6">
              <AdminFeatureUsage usage={data.featureUsage} />
              <AdminDiseaseInsights insights={data.diseaseInsights} />
            </div>

            {/* Right Column: System Health Matrix & Recent Activity Stream */}
            <div className="space-y-6">
              <AdminSystemHealth health={data.systemHealth} />
              <AdminRecentActivity activities={data.recentActivity} />
            </div>
          </div>
        </motion.div>
      )}
    </PageContainer>
  );
}
