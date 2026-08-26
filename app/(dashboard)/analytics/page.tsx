"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  RefreshCw,
  Loader2,
  AlertCircle,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
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
import { AdvancedAnalyticsTab } from "@/components/analytics/AdvancedAnalyticsTab";
import { IAnalyticsResponse } from "@/types/analytics";

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "advanced">("overview");
  const [data, setData] = useState<IAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);
  const [isExportingCSV, setIsExportingCSV] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const fetchAnalyticsData = useCallback(async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    } else if (!data) {
      setIsLoading(true);
    }
    setErrorMsg(null);

    try {
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

  // --------------------------------------------------------------------------
  // CSV EXPORT GENERATOR
  // --------------------------------------------------------------------------
  const handleExportCSV = () => {
    if (!data) return;
    setIsExportingCSV(true);
    try {
      const rows: string[][] = [];

      const escapeCSV = (str: string) => {
        if (!str) return '""';
        return `"${String(str).replace(/"/g, '""')}"`;
      };

      const dateStr = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      rows.push(["KrishiVed AI Platform — Farm Analytics Report"]);
      rows.push([`Generated: ${dateStr}`]);
      rows.push([]);

      rows.push(["1. FARM HEALTH SUMMARY"]);
      rows.push(["Metric", "Value"]);
      rows.push(["Farm Health Status", data.farmHealth?.status || "N/A"]);
      rows.push(["Overall Score", data.farmHealth?.overallScore !== null ? `${data.farmHealth?.overallScore}/100` : "N/A"]);
      rows.push(["Crop Health Score", `${data.farmHealth?.breakdown?.cropHealthScore ?? 0}/100`]);
      rows.push(["Soil Health Score", `${data.farmHealth?.breakdown?.soilHealthScore ?? 0}/100`]);
      rows.push(["Disease Risk Score", `${data.farmHealth?.breakdown?.diseaseRiskScore ?? 0}/100`]);
      rows.push(["Weather Stability Score", `${data.farmHealth?.breakdown?.weatherStabilityScore ?? 0}/100`]);
      rows.push(["Irrigation Score", `${data.farmHealth?.breakdown?.irrigationScore ?? 0}/100`]);
      rows.push([]);

      rows.push(["2. TELEMETRY & RECORDS COUNTS"]);
      rows.push(["Metric", "Count"]);
      rows.push(["Total Crop Diagnostics", String(data.stats?.diseaseAnalysesCount ?? 0)]);
      rows.push(["Saved Soil Reports", String(data.stats?.soilRecommendationsCount ?? 0)]);
      rows.push(["KrishiMitra AI Conversations", String(data.stats?.conversationsCount ?? 0)]);
      rows.push(["Weather Telemetry Checks", String(data.stats?.weatherChecksCount ?? 0)]);
      rows.push([]);

      rows.push(["3. CROP HEALTH DISTRIBUTION"]);
      rows.push(["Category", "Count", "Percentage"]);
      rows.push(["Healthy Crops", String(data.cropHealth?.healthyCount ?? 0), `${data.cropHealth?.healthyPercentage ?? 0}%`]);
      rows.push(["Moderate Risk Fields", String(data.cropHealth?.moderateRiskCount ?? 0), `${data.cropHealth?.moderateRiskPercentage ?? 0}%`]);
      rows.push(["High Risk Fields", String(data.cropHealth?.highRiskCount ?? 0), `${data.cropHealth?.highRiskPercentage ?? 0}%`]);
      rows.push([]);

      rows.push(["4. DETECTED DISEASES BREAKDOWN"]);
      rows.push(["Disease Name", "Occurrences", "Percentage", "Risk Level"]);
      (data.diseaseAnalytics?.breakdown || []).forEach((item) => {
        rows.push([item.name, String(item.count), `${item.percentage}%`, item.severity]);
      });
      rows.push([]);

      rows.push(["5. WEATHER & SOIL ADVISORIES"]);
      rows.push(["Regional Location", data.weatherAnalytics?.recentCity || "Pune"]);
      rows.push(["Average Temperature", data.weatherAnalytics?.avgTemperature !== null ? `${data.weatherAnalytics?.avgTemperature}°C` : "N/A"]);
      rows.push(["Average Humidity", data.weatherAnalytics?.avgHumidity !== null ? `${data.weatherAnalytics?.avgHumidity}%` : "N/A"]);
      rows.push(["Rain Probability", data.weatherAnalytics?.avgRainProbability !== null ? `${data.weatherAnalytics?.avgRainProbability}%` : "N/A"]);
      rows.push(["Most Recommended Crop", data.soilCropInsights?.mostRecommendedCrop || "N/A"]);
      rows.push(["Recommended Fertilizer", data.soilCropInsights?.mostCommonFertilizer || "N/A"]);
      rows.push(["Irrigation Advisory", data.soilCropInsights?.irrigationRecommendation || "N/A"]);
      rows.push([]);

      rows.push(["6. RECENT FARMING ACTIVITY LOG"]);
      rows.push(["Timestamp", "Activity Title", "Details"]);
      (data.recentActivities || []).forEach((act) => {
        rows.push([act.timestamp, act.title, act.subtitle]);
      });

      const csvContent = rows.map((r) => r.map(escapeCSV).join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `KrishiVed_Farm_Analytics_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast("CSV Farm Analytics report exported successfully.");
    } catch (err) {
      console.error("CSV Export Error:", err);
      showToast("Unable to generate your report. Please try again.");
    } finally {
      setIsExportingCSV(false);
    }
  };

  // --------------------------------------------------------------------------
  // PDF EXPORT GENERATOR (jsPDF - Dynamic Import)
  // --------------------------------------------------------------------------
  const handleExportPDF = async () => {
    if (!data) return;
    setIsExportingPDF(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const dateStr = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      let yPos = 15;

      // Header Banner
      doc.setFillColor(5, 150, 105); // Emerald 600
      doc.rect(0, 0, 210, 25, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("KrishiVed AI — Farm Analytics Report", 14, 13);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated Date: ${dateStr}`, 14, 20);

      yPos = 35;

      // 1. Farm Health Overview
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("1. Farm Health Overview", 14, yPos);
      yPos += 6;

      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, yPos, 182, 24, 3, 3, "FD");

      const scoreVal =
        data.farmHealth?.overallScore !== null && data.farmHealth?.overallScore !== undefined
          ? `${data.farmHealth.overallScore}/100`
          : "N/A";

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`Farm Health Score: ${scoreVal} (${data.farmHealth?.status || "N/A"})`, 18, yPos + 7);

      if (data.farmHealth?.breakdown) {
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        doc.text(
          `Crop Health: ${data.farmHealth.breakdown.cropHealthScore} | Soil Health: ${data.farmHealth.breakdown.soilHealthScore} | Disease Risk: ${data.farmHealth.breakdown.diseaseRiskScore}`,
          18,
          yPos + 13
        );
        doc.text(
          `Weather Stability: ${data.farmHealth.breakdown.weatherStabilityScore} | Irrigation Index: ${data.farmHealth.breakdown.irrigationScore}`,
          18,
          yPos + 19
        );
      }

      yPos += 32;

      // 2. Key Statistics
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("2. Key Statistics Summary", 14, yPos);
      yPos += 6;

      doc.roundedRect(14, yPos, 182, 22, 3, 3, "FD");

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Crop Diagnostics Scans: ${data.stats?.diseaseAnalysesCount ?? "N/A"}`, 18, yPos + 7);
      doc.text(`Saved Soil Recommendations: ${data.stats?.soilRecommendationsCount ?? "N/A"}`, 18, yPos + 14);

      doc.text(`Weather Telemetry Checks: ${data.stats?.weatherChecksCount ?? "N/A"}`, 110, yPos + 7);
      doc.text(`KrishiMitra AI Conversations: ${data.stats?.conversationsCount ?? "N/A"}`, 110, yPos + 14);

      yPos += 30;

      // 3. Crop Health Distribution
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("3. Crop Health Distribution", 14, yPos);
      yPos += 6;

      doc.roundedRect(14, yPos, 182, 20, 3, 3, "FD");

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Healthy Rate: ${data.cropHealth?.healthyPercentage ?? 0}% (${data.cropHealth?.healthyCount ?? 0} Fields)`,
        18,
        yPos + 7
      );
      doc.text(
        `Moderate Risk Rate: ${data.cropHealth?.moderateRiskPercentage ?? 0}% (${data.cropHealth?.moderateRiskCount ?? 0} Fields)`,
        18,
        yPos + 14
      );

      doc.text(
        `High Risk Rate: ${data.cropHealth?.highRiskPercentage ?? 0}% (${data.cropHealth?.highRiskCount ?? 0} Fields)`,
        110,
        yPos + 7
      );
      doc.text(`Total Analyzed: ${data.cropHealth?.totalFieldsAnalyzed ?? 0}`, 110, yPos + 14);

      yPos += 28;

      // 4. Disease Analytics
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("4. Disease Analytics & Pathogen Trends", 14, yPos);
      yPos += 6;

      doc.roundedRect(14, yPos, 182, 24, 3, 3, "FD");

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Total Scans: ${data.diseaseAnalytics?.totalAnalyses ?? 0}`, 18, yPos + 7);
      doc.text(`Healthy Scans: ${data.diseaseAnalytics?.healthyCount ?? 0}`, 18, yPos + 13);
      doc.text(`Highest Detected: ${data.diseaseAnalytics?.highestDetectedDisease || "None"}`, 18, yPos + 19);

      doc.text(`Disease Detected Count: ${data.diseaseAnalytics?.diseaseDetectedCount ?? 0}`, 110, yPos + 7);
      doc.text(`Disease Rate: ${data.diseaseAnalytics?.diseaseDetectedPercentage ?? 0}%`, 110, yPos + 13);

      yPos += 32;

      // Page overflow check
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      // 5. Weather Analytics & 6. Soil Insights
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("5. Weather Telemetry & Soil Crop Insights", 14, yPos);
      yPos += 6;

      doc.roundedRect(14, yPos, 182, 30, 3, 3, "FD");

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Location: ${data.weatherAnalytics?.recentCity || "N/A"}`, 18, yPos + 7);
      doc.text(
        `Avg Temp: ${data.weatherAnalytics?.avgTemperature !== null ? data.weatherAnalytics.avgTemperature + "°C" : "N/A"}`,
        18,
        yPos + 13
      );
      doc.text(
        `Avg Humidity: ${data.weatherAnalytics?.avgHumidity !== null ? data.weatherAnalytics.avgHumidity + "%" : "N/A"}`,
        18,
        yPos + 19
      );
      doc.text(
        `Avg Rain Prob: ${data.weatherAnalytics?.avgRainProbability !== null ? data.weatherAnalytics.avgRainProbability + "%" : "N/A"}`,
        18,
        yPos + 25
      );

      doc.text(`Most Recommended Crop: ${data.soilCropInsights?.mostRecommendedCrop || "N/A"}`, 105, yPos + 7);
      doc.text(`Average Soil Health: ${data.soilCropInsights?.averageSoilScore || "N/A"}`, 105, yPos + 13);
      doc.text(`NPK Fertilizer: ${data.soilCropInsights?.mostCommonFertilizer || "N/A"}`, 105, yPos + 19);

      yPos += 38;

      // 7. AI Farm Insights
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("6. Smart AI Farm Insights", 14, yPos);
      yPos += 6;

      if (data.aiInsights && data.aiInsights.length > 0) {
        data.aiInsights.forEach((insight) => {
          if (yPos > 265) {
            doc.addPage();
            yPos = 20;
          }
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(14, yPos, 182, 14, 2, 2, "FD");

          doc.setFontSize(8.5);
          doc.setFont("helvetica", "normal");
          const splitInsights = doc.splitTextToSize(`• ${insight}`, 174);
          doc.text(splitInsights, 18, yPos + 6);
          yPos += 18;
        });
      } else {
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.text("No AI farm insights currently available.", 18, yPos + 4);
        yPos += 12;
      }

      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(148, 163, 184);
        doc.text(`KrishiVed AI Platform • Farm Analytics Certified Report • Page ${i} of ${totalPages}`, 14, 287);
      }

      doc.save(`KrishiVed_Farm_Analytics_${new Date().toISOString().split("T")[0]}.pdf`);
      showToast("PDF Farm Analytics report generated & downloaded.");
    } catch (err) {
      console.error("PDF Export Error:", err);
      showToast("Unable to generate your report. Please try again.");
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <PageContainer className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900/95 text-white text-xs font-bold shadow-xl border border-slate-700 flex items-center gap-2">
          <span>{toastMsg}</span>
        </div>
      )}

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
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={isLoading || isExportingCSV || !data}
              isLoading={isExportingCSV}
              leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
              className="border-emerald-200 text-emerald-800 hover:bg-emerald-50 text-xs font-bold"
            >
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              disabled={isLoading || isExportingPDF || !data}
              isLoading={isExportingPDF}
              leftIcon={<Download className="w-4 h-4 text-emerald-600" />}
              className="border-emerald-200 text-emerald-800 hover:bg-emerald-50 text-xs font-bold"
            >
              Download PDF Report
            </Button>
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

      {/* Dual Tab Navigation Header */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/80 w-fit max-w-full overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("overview")}
          className={`relative px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "overview"
              ? "text-emerald-800"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {activeTab === "overview" && (
            <motion.div
              layoutId="activeAnalyticsTabPill"
              className="absolute inset-0 bg-white rounded-xl shadow-sm border border-emerald-200/60"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span>Overview Analytics</span>
          </span>
        </button>

        <button
          onClick={() => setActiveTab("advanced")}
          className={`relative px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "advanced"
              ? "text-emerald-800"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {activeTab === "advanced" && (
            <motion.div
              layoutId="activeAnalyticsTabPill"
              className="absolute inset-0 bg-white rounded-xl shadow-sm border border-emerald-200/60"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Advanced Analytics</span>
            <Badge variant="emerald" className="text-[9px] py-0 px-1.5 font-bold">New</Badge>
          </span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW ANALYTICS */}
      {activeTab === "overview" && (
        <div className="space-y-6">
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
        </div>
      )}

      {/* TAB 2: ADVANCED ANALYTICS */}
      {activeTab === "advanced" && <AdvancedAnalyticsTab />}
    </PageContainer>
  );
}
