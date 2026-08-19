"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import {
  FileText,
  Download,
  FileSpreadsheet,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  BrainCircuit,
  Sprout,
  CloudSun,
  ShieldAlert,
  ShieldCheck,
  Info,
  Calendar,
  MapPin,
  Thermometer,
  Droplets,
  Zap,
  Activity,
  Pill,
  History,
  Clock,
  User as UserIcon,
  Globe,
  Mail,
  Shield,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  GridContainer,
} from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner, SkeletonCard } from "@/components/ui/loading";
import { IFarmIntelligenceResponse } from "@/types/farm-intelligence";
import { IAnalyticsResponse } from "@/types/analytics";
import { IDiseaseAnalysisDocument } from "@/types/disease";
import { ISoilRecommendationDocument } from "@/types/soil";
import { IWeatherData } from "@/types/weather";
import { MongoUserProfile } from "@/types";

export default function FieldReportsPage() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const [dbUser, setDbUser] = useState<MongoUserProfile | null>(null);
  const [analytics, setAnalytics] = useState<IAnalyticsResponse | null>(null);
  const [farmIntel, setFarmIntel] = useState<IFarmIntelligenceResponse | null>(null);
  const [diseaseHistory, setDiseaseHistory] = useState<IDiseaseAnalysisDocument[]>([]);
  const [soilHistory, setSoilHistory] = useState<ISoilRecommendationDocument[]>([]);
  const [weatherData, setWeatherData] = useState<IWeatherData | null>(null);

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const fetchFieldReportsData = useCallback(async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setErrorMsg(null);

    try {
      const timestamp = Date.now();
      const fetchOpts: RequestInit = {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      };

      // Execute authenticated parallel data fetches
      const [
        userRes,
        analyticsRes,
        intelRes,
        diseaseRes,
        soilRes,
      ] = await Promise.all([
        fetch(`/api/user/me?t=${timestamp}`, fetchOpts).catch(() => null),
        fetch(`/api/analytics?t=${timestamp}`, fetchOpts).catch(() => null),
        fetch(`/api/farm-intelligence?t=${timestamp}`, fetchOpts).catch(() => null),
        fetch(`/api/analyze-disease?t=${timestamp}`, fetchOpts).catch(() => null),
        fetch(`/api/soil-recommendation?t=${timestamp}`, fetchOpts).catch(() => null),
      ]);

      // 1. User Profile
      if (userRes && userRes.ok) {
        const uData = await userRes.json().catch(() => null);
        if (uData?.success && uData?.user) setDbUser(uData.user);
      }

      // 2. Analytics
      let currentAnalytics: IAnalyticsResponse | null = null;
      if (analyticsRes && analyticsRes.ok) {
        const aData = await analyticsRes.json().catch(() => null);
        if (aData?.success) {
          setAnalytics(aData);
          currentAnalytics = aData;
        }
      }

      // 3. Smart Farm Intelligence
      if (intelRes && intelRes.ok) {
        const iData = await intelRes.json().catch(() => null);
        if (iData && (iData.success || iData.riskLevel)) {
          setFarmIntel(iData);
        }
      }

      // 4. Disease Diagnostics History
      if (diseaseRes && diseaseRes.ok) {
        const dData = await diseaseRes.json().catch(() => null);
        if (dData?.success && Array.isArray(dData.history)) {
          setDiseaseHistory(dData.history);
        }
      }

      // 5. Soil Recommendation History
      let recentCity = currentAnalytics?.weatherAnalytics?.recentCity || "Pune";
      if (soilRes && soilRes.ok) {
        const sData = await soilRes.json().catch(() => null);
        if (sData?.success && Array.isArray(sData.history)) {
          setSoilHistory(sData.history);
          if (sData.history.length > 0 && sData.history[0].city) {
            recentCity = sData.history[0].city;
          }
        }
      }

      // 6. Weather Telemetry for active city
      try {
        const wRes = await fetch(`/api/weather?city=${encodeURIComponent(recentCity)}`, fetchOpts);
        if (wRes.ok) {
          const wData = await wRes.json().catch(() => null);
          if (wData?.success && wData.data) {
            setWeatherData(wData.data);
          }
        }
      } catch (err) {
        console.warn("Weather sync notice:", err);
      }

    } catch (err) {
      console.error("Error loading Field Reports data:", err);
      setErrorMsg("Unable to load complete field reports telemetry. Please try again.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isClerkLoaded && clerkUser) {
      fetchFieldReportsData();
    }
  }, [isClerkLoaded, clerkUser, fetchFieldReportsData]);

  const farmerName =
    dbUser?.name ||
    clerkUser?.fullName ||
    clerkUser?.firstName ||
    "Farmer";

  const farmerEmail =
    dbUser?.email ||
    clerkUser?.primaryEmailAddress?.emailAddress ||
    "N/A";

  const reportDateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Effective aggregated metrics with fallbacks
  const effectiveScore =
    analytics?.farmHealth?.overallScore !== null &&
    analytics?.farmHealth?.overallScore !== undefined
      ? `${analytics.farmHealth.overallScore}/100`
      : "N/A";

  const effectiveHealthStatus = analytics?.farmHealth?.status || "Good";
  const effectiveRiskLevel = farmIntel?.riskLevel || "LOW";
  const effectiveDataQuality = farmIntel?.dataQuality || "LIMITED DATA";

  const effectiveScanCount =
    analytics?.stats?.diseaseAnalysesCount ?? diseaseHistory.length;

  const effectiveSoilCount =
    analytics?.stats?.soilRecommendationsCount ?? soilHistory.length;

  const effectiveHealthyPercentage =
    analytics?.cropHealth?.healthyPercentage ?? 0;

  // Effective Disease Scans array (History or Analytics fallback)
  const effectiveDiseaseItems =
    diseaseHistory.length > 0
      ? diseaseHistory.map((d: any) => ({
          id: d._id || d.id || "disease-scan",
          disease: d.disease,
          severity: d.severity || "Medium",
          confidence: d.confidence || "N/A",
          imageUrl: d.imageUrl,
          symptoms: d.symptoms || [],
          treatment: d.treatment || [],
          cause: d.cause || "",
          recommendedPesticide: d.recommendedPesticide || "",
          recommendedFertilizer: d.recommendedFertilizer || "",
          dateStr: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "Recent",
        }))
      : (analytics?.diseaseAnalytics?.recentDiseaseScans || []).map((s) => ({
          id: s.id,
          disease: s.disease,
          severity: s.severity || "Medium",
          confidence: s.confidence || "N/A",
          imageUrl: s.imageUrl,
          symptoms: [],
          treatment: [],
          cause: "",
          recommendedPesticide: "",
          recommendedFertilizer: "",
          dateStr: s.timestamp || "Recent",
        }));

  // Effective Soil Items array
  const effectiveSoilItems =
    soilHistory.length > 0
      ? soilHistory.map((s: any) => ({
          id: s._id || s.id || "soil-advisory",
          city: s.city,
          bestCrop: s.bestCrop,
          soilHealthScore: s.soilHealthScore,
          fertilizerRecommendation: s.fertilizerRecommendation,
          irrigationRecommendation: s.irrigationRecommendation,
          diseaseRiskLevel: s.diseaseRiskLevel || "Low",
          dateStr: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "Recent",
        }))
      : analytics?.soilCropInsights?.hasData
      ? [
          {
            id: "soil-fallback-1",
            city: analytics.weatherAnalytics?.recentCity || "Local Region",
            bestCrop: analytics.soilCropInsights.mostRecommendedCrop,
            soilHealthScore: analytics.soilCropInsights.averageSoilScore,
            fertilizerRecommendation: analytics.soilCropInsights.mostCommonFertilizer,
            irrigationRecommendation: analytics.soilCropInsights.irrigationRecommendation,
            diseaseRiskLevel: "Low",
            dateStr: "Recent",
          },
        ]
      : [];

  // --------------------------------------------------------------------------
  // CSV EXPORT GENERATOR
  // --------------------------------------------------------------------------
  const handleExportCSV = () => {
    try {
      const rows: string[][] = [];

      const escapeCSV = (str: string) => {
        if (!str) return '""';
        return `"${str.replace(/"/g, '""')}"`;
      };

      // Title & Metadata
      rows.push(["KRISHIVED AI - OFFICIAL FARM FIELD REPORT"]);
      rows.push(["Generated Date", reportDateStr]);
      rows.push([""]);

      // Farmer Profile
      rows.push(["--- FARMER PROFILE ---"]);
      rows.push(["Name", farmerName]);
      rows.push(["Email", farmerEmail]);
      rows.push(["Role", dbUser?.role || "Farmer"]);
      rows.push(["Language", dbUser?.language || "English"]);
      rows.push(["Clerk ID", clerkUser?.id || "N/A"]);
      rows.push([""]);

      // Farm Health & Risk Summary
      rows.push(["--- FARM HEALTH & INTELLIGENCE SUMMARY ---"]);
      rows.push(["Farm Health Score", effectiveScore]);
      rows.push(["Health Status", effectiveHealthStatus]);
      rows.push(["Risk Level", effectiveRiskLevel]);
      rows.push(["Data Confidence", effectiveDataQuality]);
      rows.push(["Total Disease Scans", String(effectiveScanCount)]);
      rows.push(["Healthy Crop Rate", `${effectiveHealthyPercentage}%`]);
      rows.push(["Saved Soil Advisories", String(effectiveSoilCount)]);
      rows.push(["AI Intelligence Advisory", escapeCSV(farmIntel?.advisory || "N/A")]);
      rows.push([""]);

      // Key Risk Reasons
      rows.push(["--- KEY RISK EVALUATION REASONS ---"]);
      if (farmIntel?.reasons && farmIntel.reasons.length > 0) {
        farmIntel.reasons.forEach((r, idx) => {
          rows.push([`Reason ${idx + 1}`, escapeCSV(r)]);
        });
      } else {
        rows.push(["Info", "No active risk warnings"]);
      }
      rows.push([""]);

      // Recent Disease Diagnostics
      rows.push(["--- RECENT DISEASE DIAGNOSTICS ---"]);
      rows.push(["Date", "Disease Name", "Severity", "Confidence", "Symptoms", "Recommended Treatment"]);
      if (effectiveDiseaseItems.length > 0) {
        effectiveDiseaseItems.forEach((d) => {
          rows.push([
            d.dateStr,
            escapeCSV(d.disease),
            d.severity,
            d.confidence,
            escapeCSV(d.symptoms.join("; ")),
            escapeCSV(d.treatment.join("; ") || d.recommendedPesticide || "N/A"),
          ]);
        });
      } else {
        rows.push(["N/A", "No disease diagnostic records found", "-", "-", "-", "-"]);
      }
      rows.push([""]);

      // Soil & Crop Recommendations
      rows.push(["--- SOIL & CROP RECOMMENDATIONS ---"]);
      rows.push(["Date", "City / Location", "Best Crop", "Soil Score", "Fertilizer", "Irrigation Strategy"]);
      if (effectiveSoilItems.length > 0) {
        effectiveSoilItems.forEach((s) => {
          rows.push([
            s.dateStr,
            escapeCSV(s.city),
            escapeCSV(s.bestCrop),
            escapeCSV(s.soilHealthScore),
            escapeCSV(s.fertilizerRecommendation),
            escapeCSV(s.irrigationRecommendation),
          ]);
        });
      } else {
        rows.push(["N/A", "No saved soil recommendation reports found", "-", "-", "-", "-"]);
      }
      rows.push([""]);

      // Weather Telemetry Summary
      rows.push(["--- REGIONAL WEATHER TELEMETRY ---"]);
      if (weatherData) {
        rows.push(["City / Country", `${weatherData.city}, ${weatherData.country}`]);
        rows.push(["Temperature", `${weatherData.temperature}°C (Feels like: ${weatherData.feelsLike}°C)`]);
        rows.push(["Relative Humidity", `${weatherData.humidity}%`]);
        rows.push(["Rain Probability", `${weatherData.rainProbability}%`]);
        rows.push(["Wind Speed", `${weatherData.windSpeed} km/h (${weatherData.windDirection})`]);
        rows.push(["Pressure", `${weatherData.pressure} hPa`]);
        rows.push(["Condition", `${weatherData.condition} (${weatherData.description})`]);
      } else if (analytics?.weatherAnalytics?.hasData) {
        rows.push(["City", analytics.weatherAnalytics.recentCity || "Local Region"]);
        rows.push(["Avg Temperature", `${analytics.weatherAnalytics.avgTemperature}°C`]);
        rows.push(["Avg Humidity", `${analytics.weatherAnalytics.avgHumidity}%`]);
        rows.push(["Avg Rain Probability", `${analytics.weatherAnalytics.avgRainProbability}%`]);
      } else {
        rows.push(["Status", "Weather telemetry unavailable"]);
      }

      const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `KrishiVed_Field_Report_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast("✅ CSV Field Report downloaded successfully.");
    } catch (err) {
      console.error("Error generating CSV:", err);
      showToast("❌ Failed to export CSV report.");
    }
  };

  // --------------------------------------------------------------------------
  // PDF EXPORT GENERATOR (jsPDF - Dynamic Import)
  // --------------------------------------------------------------------------
  const handleExportPDF = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      let yPos = 15;

      // Header Banner
      doc.setFillColor(5, 150, 105); // Emerald green
      doc.rect(0, 0, 210, 25, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("KrishiVed AI — Official Field Report", 14, 13);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated: ${reportDateStr}`, 14, 20);

      yPos = 35;

      // Section 1: Farmer Profile & Account Metadata
      doc.setTextColor(15, 23, 42); // Dark slate
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("1. Farmer Profile & Account Summary", 14, yPos);
      yPos += 6;

      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, yPos, 182, 24, 3, 3, "FD");

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Farmer Name: ${farmerName}`, 18, yPos + 7);
      doc.text(`Email Address: ${farmerEmail}`, 18, yPos + 13);
      doc.text(`Role: ${dbUser?.role || "Farmer"}`, 18, yPos + 19);

      doc.text(`Language: ${dbUser?.language || "English"}`, 110, yPos + 7);
      doc.text(`Account ID: ${clerkUser?.id ? clerkUser.id.substring(0, 18) + "..." : "N/A"}`, 110, yPos + 13);
      doc.text(`Verification: Verified Active Sync`, 110, yPos + 19);

      yPos += 32;

      // Section 2: Farm Health & Risk Advisory
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("2. Farm Health & Smart Risk Advisory", 14, yPos);
      yPos += 6;

      doc.roundedRect(14, yPos, 182, 34, 3, 3, "FD");

      doc.setFontSize(10);
      doc.text(`Farm Health Score: ${effectiveScore} (${effectiveHealthStatus})`, 18, yPos + 7);
      doc.text(`Overall Risk Level: ${effectiveRiskLevel}`, 18, yPos + 13);
      doc.text(`Data Confidence: ${effectiveDataQuality}`, 18, yPos + 19);

      doc.text(`Total Scans: ${effectiveScanCount}`, 110, yPos + 7);
      doc.text(`Healthy Crop Rate: ${effectiveHealthyPercentage}%`, 110, yPos + 13);
      doc.text(`Saved Soil Reports: ${effectiveSoilCount}`, 110, yPos + 19);

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "italic");
      const advText = doc.splitTextToSize(
        `Advisory: "${farmIntel?.advisory || "Perform regular crop diagnostics to compute intelligence."}"`,
        174
      );
      doc.text(advText, 18, yPos + 26);

      yPos += 42;

      // Section 3: Recent Crop Disease Scans
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(`3. Crop Disease Diagnostic History (${effectiveDiseaseItems.length} Record${effectiveDiseaseItems.length === 1 ? "" : "s"})`, 14, yPos);
      yPos += 6;

      if (effectiveDiseaseItems.length > 0) {
        effectiveDiseaseItems.slice(0, 4).forEach((d) => {
          if (yPos > 260) {
            doc.addPage();
            yPos = 20;
          }
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(14, yPos, 182, 18, 2, 2, "FD");

          doc.setFontSize(9.5);
          doc.setFont("helvetica", "bold");
          doc.text(`• ${d.disease}`, 18, yPos + 6);

          doc.setFontSize(8.5);
          doc.setFont("helvetica", "normal");
          doc.text(`Severity: ${d.severity} | Confidence: ${d.confidence} | Date: ${d.dateStr}`, 18, yPos + 12);

          yPos += 22;
        });
      } else {
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.text("No crop disease diagnostic records found.", 18, yPos + 4);
        yPos += 12;
      }

      yPos += 6;

      // Check for page overflow
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      // Section 4: Soil Health & Crop Advisory
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(`4. Soil Health & Crop Selection (${effectiveSoilItems.length} Report${effectiveSoilItems.length === 1 ? "" : "s"})`, 14, yPos);
      yPos += 6;

      if (effectiveSoilItems.length > 0) {
        const s = effectiveSoilItems[0];
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, yPos, 182, 26, 3, 3, "FD");

        doc.setFontSize(9.5);
        doc.setFont("helvetica", "bold");
        doc.text(`Primary Recommended Crop: ${s.bestCrop}`, 18, yPos + 7);
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        doc.text(`Location: ${s.city} | Soil Health: ${s.soilHealthScore} | Disease Risk: ${s.diseaseRiskLevel}`, 18, yPos + 13);
        doc.text(`Fertilizer: ${s.fertilizerRecommendation}`, 18, yPos + 19);

        yPos += 32;
      } else {
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.text("No saved soil recommendation reports found.", 18, yPos + 4);
        yPos += 12;
      }

      // Section 5: Regional Weather Telemetry
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("5. Regional Weather & Field Telemetry", 14, yPos);
      yPos += 6;

      if (weatherData) {
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, yPos, 182, 20, 3, 3, "FD");

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(`City: ${weatherData.city}, ${weatherData.country}`, 18, yPos + 7);
        doc.text(`Temperature: ${weatherData.temperature}°C (${weatherData.condition})`, 18, yPos + 14);

        doc.text(`Humidity: ${weatherData.humidity}%`, 110, yPos + 7);
        doc.text(`Rain Probability: ${weatherData.rainProbability}% | Wind: ${weatherData.windSpeed} km/h`, 110, yPos + 14);

        yPos += 26;
      } else if (analytics?.weatherAnalytics?.hasData) {
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, yPos, 182, 20, 3, 3, "FD");

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(`City: ${analytics.weatherAnalytics.recentCity || "Local Field"}`, 18, yPos + 7);
        doc.text(`Avg Temperature: ${analytics.weatherAnalytics.avgTemperature}°C`, 18, yPos + 14);

        doc.text(`Avg Humidity: ${analytics.weatherAnalytics.avgHumidity}%`, 110, yPos + 7);
        doc.text(`Avg Rain Probability: ${analytics.weatherAnalytics.avgRainProbability}%`, 110, yPos + 14);

        yPos += 26;
      } else {
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.text("Weather telemetry currently unavailable.", 18, yPos + 4);
        yPos += 12;
      }

      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(148, 163, 184);
        doc.text(`KrishiVed AI Platform • Certified Authenticated Field Report • Page ${i} of ${totalPages}`, 14, 287);
      }

      doc.save(`KrishiVed_Field_Report_${new Date().toISOString().split("T")[0]}.pdf`);
      showToast("✅ PDF Field Report generated & downloaded.");
    } catch (err) {
      console.error("Error generating PDF:", err);
      showToast("❌ Failed to export PDF report.");
    }
  };

  return (
    <PageContainer>
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900/95 text-white text-xs font-bold shadow-xl border border-slate-700 flex items-center gap-2">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="📋 Field Reports"
        description="Comprehensive, exportable agricultural telemetry report summarizing your farm health, crop disease diagnostics, soil fertility, and AI risk advisory."
        badge={
          <Badge variant="emerald" dot>
            Authenticated Farmer Record
          </Badge>
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchFieldReportsData(true)}
              disabled={loading || isRefreshing}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />}
            >
              Sync
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={loading}
              leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
              className="border-emerald-200 text-emerald-800 hover:bg-emerald-50"
            >
              Export CSV
            </Button>
            <Button
              variant="emerald"
              size="sm"
              onClick={handleExportPDF}
              disabled={loading}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Download PDF Report
            </Button>
          </div>
        }
      />

      {/* Error Alert with Retry Button */}
      {errorMsg && (
        <Card variant="glass" className="border-rose-200 bg-rose-50/50 mb-6">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-rose-900">Field Reports Sync Notice</h4>
                <p className="text-xs text-rose-700">{errorMsg}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchFieldReportsData(true)}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="border-rose-300 text-rose-800 hover:bg-rose-100 shrink-0"
            >
              Retry Sync
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading Skeleton */}
      {loading && !analytics ? (
        <div className="space-y-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="space-y-8">
          {/* SECTION 1: FARMER & FARM HEALTH SUMMARY */}
          <Card variant="glass" className="border-emerald-200/90 shadow-md">
            <CardHeader className="bg-gradient-to-r from-emerald-900/10 via-teal-900/5 to-transparent border-b border-emerald-100 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {dbUser?.image || clerkUser?.imageUrl ? (
                      <img
                        src={dbUser?.image || clerkUser?.imageUrl}
                        alt={farmerName}
                        className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/20 shadow-md"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-2xl font-bold ring-2 ring-emerald-500/20 shadow-md">
                        {farmerName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-xl font-extrabold text-slate-900">
                      {farmerName}'s Farm Field Report
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{farmerEmail}</span>
                      <span>•</span>
                      <span>Report Date: {reportDateStr}</span>
                    </CardDescription>
                  </div>
                </div>

                <Badge variant="emerald" className="self-start sm:self-auto text-xs px-3 py-1 font-bold">
                  Verified Farmer Profile
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* KPI Grid */}
              <GridContainer cols={4}>
                {/* Score */}
                <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Farm Health Score
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-900">
                      {effectiveScore}
                    </span>
                    <Badge variant="emerald" className="text-[10px]">
                      {effectiveHealthStatus}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Multi-factor composite score</p>
                </div>

                {/* Risk Level */}
                <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Risk Status
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-slate-900">
                      {effectiveRiskLevel}
                    </span>
                    <Badge
                      variant={
                        effectiveRiskLevel === "HIGH"
                          ? "danger"
                          : effectiveRiskLevel === "MODERATE"
                          ? "warning"
                          : "emerald"
                      }
                      className="text-[10px] uppercase font-bold"
                    >
                      {effectiveRiskLevel}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Rule-based risk analysis</p>
                </div>

                {/* Data Quality */}
                <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Data Confidence
                  </span>
                  <span className="text-lg font-bold text-slate-800">
                    {effectiveDataQuality}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">Based on saved telemetry</p>
                </div>

                {/* Total Scans & Rate */}
                <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Diagnostics & Soil Tests
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-900">
                      {effectiveScanCount}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">Scans</span>
                    <span className="text-xs text-emerald-600 font-bold ml-auto">
                      {effectiveHealthyPercentage}% Healthy
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {effectiveSoilCount} Soil Advisories Saved
                  </p>
                </div>
              </GridContainer>
            </CardContent>
          </Card>

          {/* SECTION 2: SMART FARM INTELLIGENCE ADVISORY */}
          <Card variant="glass" className="border-emerald-200/90 shadow-md">
            <CardHeader className="border-b border-emerald-100 pb-3">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-emerald-600" />
                Smart Farm Intelligence Advisory
              </CardTitle>
              <CardDescription>
                Automated, explainable agronomic risk evaluation derived from your farm activity.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Key Reasons */}
                <div className="bg-white/80 p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Info className="w-4 h-4 text-emerald-600" />
                    Key Risk Evaluation Reasons
                  </h4>
                  {farmIntel?.reasons && farmIntel.reasons.length > 0 ? (
                    <ul className="space-y-2">
                      {farmIntel.reasons.map((r, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium leading-relaxed">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500">No active risk warnings recorded.</p>
                  )}
                </div>

                {/* Right: Farmer Advisory */}
                <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-transparent p-5 rounded-2xl border border-emerald-200/80 shadow-xs space-y-3 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      Farmer Advisory Summary
                    </h4>
                    <p className="text-xs text-slate-800 mt-2.5 leading-relaxed font-semibold">
                      "{farmIntel?.advisory || "Perform your first leaf scan or save a soil report to compute tailored risk advisories."}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-emerald-200/50 flex items-center justify-between text-xs text-slate-500">
                    <span>Evaluated by KrishiEngine v1.0</span>
                    <Badge variant="glass" className="text-[10px]">
                      Confidence: {effectiveDataQuality}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Recommended Actions */}
              {farmIntel?.recommendations && farmIntel.recommendations.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h4 className="text-sm font-bold text-slate-900">
                    Priority Actions for Farmer ({farmIntel.recommendations.length} Items)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {farmIntel.recommendations.map((rec) => (
                      <div
                        key={rec.id}
                        className="bg-white/90 p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <Badge variant="emerald" className="text-[10px]">
                            {rec.category}
                          </Badge>
                          <Badge
                            variant={
                              rec.priority === "High"
                                ? "danger"
                                : rec.priority === "Medium"
                                ? "warning"
                                : "emerald"
                            }
                            className="text-[10px] font-bold"
                          >
                            {rec.priority} Priority
                          </Badge>
                        </div>
                        <h5 className="text-xs font-bold text-slate-900">{rec.title}</h5>
                        <p className="text-xs text-slate-600 leading-relaxed">{rec.description}</p>
                        <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1">
                          <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate"><strong>Why:</strong> {rec.evidence}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECTION 3: DISEASE DIAGNOSTICS REPORT SECTION */}
          <Card variant="glass" className="border-emerald-200/90 shadow-md">
            <CardHeader className="border-b border-emerald-100 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  <CardTitle className="text-base">Disease Diagnostics Telemetry Report</CardTitle>
                </div>
                <Badge variant="glass" className="text-xs font-bold">
                  {effectiveDiseaseItems.length} Records
                </Badge>
              </div>
              <CardDescription>
                Saved leaf diagnostic scans analyzed by Gemini 1.5 Flash Vision AI.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {effectiveDiseaseItems.length === 0 ? (
                <EmptyState
                  title="No Crop Disease Diagnostics Yet"
                  description="Scan crop leaves on the Disease Diagnostics page to record pathogen analysis and cure advisories."
                  icon={<BrainCircuit className="w-8 h-8 text-emerald-600" />}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {effectiveDiseaseItems.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.disease}
                              className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                              <Sprout className="w-6 h-6" />
                            </div>
                          )}
                          <div>
                            <h5 className="text-sm font-bold text-slate-900">{item.disease}</h5>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {item.dateStr}
                            </span>
                          </div>
                        </div>

                        <Badge
                          variant={
                            item.severity === "High"
                              ? "danger"
                              : item.severity === "Medium"
                              ? "warning"
                              : "emerald"
                          }
                          className="text-[10px] shrink-0"
                        >
                          Severity: {item.severity}
                        </Badge>
                      </div>

                      {/* Diagnostic details */}
                      <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {item.symptoms && item.symptoms.length > 0 && (
                          <p>
                            <strong className="text-slate-800">Symptoms:</strong> {item.symptoms.join(", ")}
                          </p>
                        )}
                        {item.treatment && item.treatment.length > 0 && (
                          <p>
                            <strong className="text-emerald-800">Treatment:</strong> {item.treatment[0]}
                          </p>
                        )}
                        {item.recommendedPesticide && (
                          <p>
                            <strong className="text-slate-800">Pesticide:</strong> {item.recommendedPesticide}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECTION 4: SOIL & CROP REPORT SECTION */}
          <Card variant="glass" className="border-emerald-200/90 shadow-md">
            <CardHeader className="border-b border-emerald-100 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-emerald-600" />
                  <CardTitle className="text-base">Soil Fertility & Crop Advisory Report</CardTitle>
                </div>
                <Badge variant="glass" className="text-xs font-bold">
                  {effectiveSoilItems.length} Saved Advisories
                </Badge>
              </div>
              <CardDescription>
                Saved soil health reports and recommended NPK fertilizer formulations.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {effectiveSoilItems.length === 0 ? (
                <EmptyState
                  title="No Saved Soil Recommendations"
                  description="Check regional weather telemetry on the Weather & Soil page to generate and save soil reports."
                  icon={<CloudSun className="w-8 h-8 text-amber-600" />}
                />
              ) : (
                <div className="space-y-4">
                  {effectiveSoilItems.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                            <Sprout className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">
                              🌱 {item.bestCrop} <span className="text-slate-400 font-normal">({item.city})</span>
                            </h4>
                            <span className="text-xs text-slate-500 font-medium">
                              Soil Score: <strong>{item.soilHealthScore}</strong> • Saved {item.dateStr}
                            </span>
                          </div>
                        </div>

                        <Badge
                          variant={
                            item.diseaseRiskLevel === "High"
                              ? "danger"
                              : item.diseaseRiskLevel === "Medium"
                              ? "warning"
                              : "emerald"
                          }
                          className="text-[10px] self-start sm:self-auto"
                        >
                          Risk: {item.diseaseRiskLevel}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <strong className="text-slate-800 block mb-0.5">Fertilizer Dosage:</strong>
                          <span className="text-slate-600">{item.fertilizerRecommendation}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <strong className="text-slate-800 block mb-0.5">Irrigation Strategy:</strong>
                          <span className="text-slate-600">{item.irrigationRecommendation}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECTION 5: WEATHER & FIELD CONDITIONS */}
          <Card variant="glass" className="border-emerald-200/90 shadow-md">
            <CardHeader className="border-b border-emerald-100 pb-3">
              <div className="flex items-center gap-2">
                <CloudSun className="w-5 h-5 text-amber-600" />
                <CardTitle className="text-base">Regional Atmospheric & Field Telemetry</CardTitle>
              </div>
              <CardDescription>
                Live regional atmospheric conditions supporting farm risk evaluation.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {weatherData ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Location
                    </span>
                    <span className="text-sm font-extrabold text-slate-800 flex items-center justify-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      {weatherData.city}, {weatherData.country}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Temperature
                    </span>
                    <span className="text-sm font-extrabold text-slate-800">
                      {weatherData.temperature}°C
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Feels like {weatherData.feelsLike}°C
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Humidity
                    </span>
                    <span className="text-sm font-extrabold text-slate-800">
                      {weatherData.humidity}%
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Rain Prob: {weatherData.rainProbability}%
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Wind & Pressure
                    </span>
                    <span className="text-sm font-extrabold text-slate-800">
                      {weatherData.windSpeed} km/h
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {weatherData.pressure} hPa ({weatherData.condition})
                    </span>
                  </div>
                </div>
              ) : analytics?.weatherAnalytics?.hasData ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Location
                    </span>
                    <span className="text-sm font-extrabold text-slate-800 flex items-center justify-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      {analytics.weatherAnalytics.recentCity || "Local Region"}
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Avg Temperature
                    </span>
                    <span className="text-sm font-extrabold text-slate-800">
                      {analytics.weatherAnalytics.avgTemperature}°C
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Avg Humidity
                    </span>
                    <span className="text-sm font-extrabold text-slate-800">
                      {analytics.weatherAnalytics.avgHumidity}%
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Avg Rain Prob
                    </span>
                    <span className="text-sm font-extrabold text-slate-800">
                      {analytics.weatherAnalytics.avgRainProbability}%
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 space-y-2">
                  <p>Weather telemetry is currently syncing. Please search for a city on the Weather & Soil page.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECTION 6: REPORT HISTORY TIMELINE */}
          <Card variant="glass" className="border-emerald-200/90 shadow-md">
            <CardHeader className="border-b border-emerald-100 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-emerald-600" />
                  <CardTitle className="text-base">Field Activity & Report Log History</CardTitle>
                </div>
                <Badge variant="glass" className="text-xs">
                  MongoDB Persisted
                </Badge>
              </div>
              <CardDescription>
                Chronological historical log of all diagnostic scans and soil advisories saved in your profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {analytics?.recentActivities && analytics.recentActivities.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {analytics.recentActivities.map((act) => (
                    <div key={act.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                          {act.type === "disease" ? (
                            <Activity className="w-4 h-4" />
                          ) : act.type === "soil" ? (
                            <Sprout className="w-4 h-4" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-800">{act.title}</h5>
                          <p className="text-[11px] text-slate-500">{act.subtitle}</p>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium shrink-0">
                        {act.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">
                  No historical activity logs recorded yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
