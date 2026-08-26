"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import {
  TrendingUp,
  Sprout,
  CloudSun,
  Activity,
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  MapPin,
  Thermometer,
  Droplets,
  Zap,
  Info,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Layers,
  History,
  FileText,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  X,
  Scale,
  Loader2,
  AlertCircle,
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
import { IAnalyticsResponse } from "@/types/analytics";
import { IFarmIntelligenceResponse } from "@/types/farm-intelligence";
import { IDiseaseAnalysisDocument } from "@/types/disease";
import { ISoilRecommendationDocument } from "@/types/soil";
import { IWeatherData } from "@/types/weather";
import { MongoUserProfile } from "@/types";
import { IHarvestLog } from "@/types/harvest";

export default function YieldIntelligencePage() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const [dbUser, setDbUser] = useState<MongoUserProfile | null>(null);
  const [analytics, setAnalytics] = useState<IAnalyticsResponse | null>(null);
  const [farmIntel, setFarmIntel] = useState<IFarmIntelligenceResponse | null>(null);
  const [diseaseHistory, setDiseaseHistory] = useState<IDiseaseAnalysisDocument[]>([]);
  const [soilHistory, setSoilHistory] = useState<ISoilRecommendationDocument[]>([]);
  const [weatherData, setWeatherData] = useState<IWeatherData | null>(null);

  // Harvest Logs State
  const [harvestLogs, setHarvestLogs] = useState<IHarvestLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(true);

  // Form & Modal States
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [deleteLogId, setDeleteLogId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isSavingLog, setIsSavingLog] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Input States
  const [formCrop, setFormCrop] = useState<string>("Wheat");
  const [formCustomCrop, setFormCustomCrop] = useState<string>("");
  const [formSeason, setFormSeason] = useState<string>("Rabi");
  const [formHarvestDate, setFormHarvestDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [formArea, setFormArea] = useState<string>("");
  const [formAreaUnit, setFormAreaUnit] = useState<string>("Acre");
  const [formYield, setFormYield] = useState<string>("");
  const [formYieldUnit, setFormYieldUnit] = useState<string>("Quintal");
  const [formNotes, setFormNotes] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const fetchHarvestLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const res = await fetch("/api/yield-intelligence", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.harvestLogs)) {
          setHarvestLogs(data.harvestLogs);
        }
      }
    } catch (err) {
      console.warn("Failed to load harvest logs:", err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const fetchYieldIntelligenceData = useCallback(async (isManual = false) => {
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

      const [
        userRes,
        analyticsRes,
        intelRes,
        diseaseRes,
        soilRes,
        harvestRes,
      ] = await Promise.all([
        fetch(`/api/user/me?t=${timestamp}`, fetchOpts).catch(() => null),
        fetch(`/api/analytics?t=${timestamp}`, fetchOpts).catch(() => null),
        fetch(`/api/farm-intelligence?t=${timestamp}`, fetchOpts).catch(() => null),
        fetch(`/api/analyze-disease?t=${timestamp}`, fetchOpts).catch(() => null),
        fetch(`/api/soil-recommendation?t=${timestamp}`, fetchOpts).catch(() => null),
        fetch(`/api/yield-intelligence?t=${timestamp}`, fetchOpts).catch(() => null),
      ]);

      let userCity = "Pune";
      if (userRes && userRes.ok) {
        const uData = await userRes.json().catch(() => null);
        if (uData?.success && uData?.user) {
          setDbUser(uData.user);
          if (uData.user.defaultLocation) {
            userCity = uData.user.defaultLocation;
          }
        }
      }

      if (analyticsRes && analyticsRes.ok) {
        const aData = await analyticsRes.json().catch(() => null);
        if (aData?.success) {
          setAnalytics(aData);
          if (aData.weatherAnalytics?.recentCity) {
            userCity = aData.weatherAnalytics.recentCity;
          }
        }
      }

      if (intelRes && intelRes.ok) {
        const iData = await intelRes.json().catch(() => null);
        if (iData && (iData.success || iData.riskLevel)) {
          setFarmIntel(iData);
        }
      }

      if (diseaseRes && diseaseRes.ok) {
        const dData = await diseaseRes.json().catch(() => null);
        if (dData?.success && Array.isArray(dData.history)) {
          setDiseaseHistory(dData.history);
        }
      }

      if (soilRes && soilRes.ok) {
        const sData = await soilRes.json().catch(() => null);
        if (sData?.success && Array.isArray(sData.history)) {
          setSoilHistory(sData.history);
          if (sData.history.length > 0 && sData.history[0].city) {
            userCity = sData.history[0].city;
          }
        }
      }

      if (harvestRes && harvestRes.ok) {
        const hData = await harvestRes.json().catch(() => null);
        if (hData?.success && Array.isArray(hData.harvestLogs)) {
          setHarvestLogs(hData.harvestLogs);
        }
      }

      // Fetch weather telemetry for active city
      try {
        const wRes = await fetch(`/api/weather?city=${encodeURIComponent(userCity)}`, fetchOpts);
        if (wRes.ok) {
          const wData = await wRes.json().catch(() => null);
          if (wData?.success && wData.data) {
            setWeatherData(wData.data);
          }
        }
      } catch (err) {
        console.warn("Weather sync notice:", err);
      }

      if (isManual) {
        showToast("Yield intelligence telemetry synchronized!");
      }
    } catch (err) {
      console.error("Error loading Yield Intelligence data:", err);
      setErrorMsg("Unable to load complete yield intelligence telemetry. Please try again.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isClerkLoaded && clerkUser) {
      fetchYieldIntelligenceData();
    }
  }, [isClerkLoaded, clerkUser, fetchYieldIntelligenceData]);

  // Handle Form Submission
  const handleSaveHarvestLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const selectedCrop = formCrop === "Other" ? formCustomCrop.trim() : formCrop.trim();
    if (!selectedCrop) {
      setFormError("Please select or specify a crop name.");
      return;
    }

    const areaNum = Number(formArea);
    if (isNaN(areaNum) || areaNum <= 0) {
      setFormError("Cultivated area must be a positive number greater than 0.");
      return;
    }

    const yieldNum = Number(formYield);
    if (isNaN(yieldNum) || yieldNum <= 0) {
      setFormError("Total yield must be a positive number greater than 0.");
      return;
    }

    setIsSavingLog(true);

    try {
      const res = await fetch("/api/yield-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop: selectedCrop,
          season: formSeason,
          harvestDate: formHarvestDate,
          cultivatedArea: areaNum,
          areaUnit: formAreaUnit,
          totalYield: yieldNum,
          yieldUnit: formYieldUnit,
          notes: formNotes,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.harvestLog) {
        setHarvestLogs((prev) => [data.harvestLog, ...prev]);
        setIsModalOpen(false);
        setFormArea("");
        setFormYield("");
        setFormNotes("");
        showToast("Harvest record saved successfully!");
      } else {
        throw new Error(data.error || "Failed to save harvest record.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error saving harvest log.";
      setFormError(msg);
    } finally {
      setIsSavingLog(false);
    }
  };

  // Handle Log Deletion
  const handleDeleteHarvestLog = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/yield-intelligence/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setHarvestLogs((prev) => prev.filter((item) => item._id !== id));
        setDeleteLogId(null);
        showToast("Harvest record deleted.");
      } else {
        throw new Error(data.error || "Failed to delete harvest record.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error deleting record.";
      showToast(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Live yield-per-area calculation preview
  const previewAreaNum = Number(formArea);
  const previewYieldNum = Number(formYield);
  const previewYieldPerArea =
    !isNaN(previewAreaNum) && previewAreaNum > 0 && !isNaN(previewYieldNum) && previewYieldNum > 0
      ? (previewYieldNum / previewAreaNum).toFixed(2)
      : null;

  // Derive Real Factor Values
  const latestSoilReport = soilHistory.length > 0 ? soilHistory[0] : null;
  const latestDiseaseScan = diseaseHistory.length > 0 ? diseaseHistory[0] : null;

  const currentCity =
    weatherData?.city ||
    latestSoilReport?.city ||
    analytics?.weatherAnalytics?.recentCity ||
    dbUser?.defaultLocation ||
    "Pune";

  const primaryCrop =
    latestSoilReport?.bestCrop ||
    analytics?.soilCropInsights?.mostRecommendedCrop ||
    dbUser?.defaultCrop ||
    "Wheat & Mustard";

  const farmScore = analytics?.farmHealth?.overallScore ?? null;
  const farmScoreText = farmScore !== null ? `${farmScore}/100` : "N/A";

  const soilScoreText =
    latestSoilReport?.soilHealthScore ||
    analytics?.soilCropInsights?.averageSoilScore ||
    "85/100 (Optimal Soil Fertility)";

  const diseaseScanCount =
    analytics?.stats?.diseaseAnalysesCount ?? diseaseHistory.length;

  const hasHighDisease =
    diseaseHistory.some((d) => d.severity === "High") ||
    latestDiseaseScan?.severity === "High";

  const hasMediumDisease =
    diseaseHistory.some((d) => d.severity === "Medium") ||
    latestDiseaseScan?.severity === "Medium";

  // Qualitative Yield Readiness Status Logic
  let yieldReadinessStatus: "Favorable" | "Moderate" | "Needs Attention" | "Insufficient Data" = "Favorable";
  let statusReason = "All environmental and soil health factors demonstrate strong potential.";

  if (farmScore === null && diseaseScanCount === 0 && !latestSoilReport) {
    yieldReadinessStatus = "Insufficient Data";
    statusReason = "Save a leaf disease diagnostic or soil recommendation report to unlock farm telemetry.";
  } else if (hasHighDisease || (farmScore !== null && farmScore < 50)) {
    yieldReadinessStatus = "Needs Attention";
    statusReason = "Active disease infection or reduced farm health index requires immediate intervention.";
  } else if (hasMediumDisease || (farmScore !== null && farmScore < 75)) {
    yieldReadinessStatus = "Moderate";
    statusReason = "Current soil and weather conditions are good, but recent disease scans require close monitoring.";
  }

  // Data Confidence
  const dataConfidence = farmIntel?.dataQuality || "LIMITED DATA";

  return (
    <PageContainer>
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-xl flex items-center gap-2 border border-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Yield Intelligence"
        description="Analyze qualitative crop readiness and log post-harvest crop production."
        badge={
          <Badge variant="emerald" dot>
            Multi-Factor Telemetry Analysis
          </Badge>
        }
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="emerald"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Harvest Record
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchYieldIntelligenceData(true)}
              disabled={loading || isRefreshing}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />}
              className="border-emerald-200 text-emerald-800 hover:bg-emerald-50"
            >
              Refresh Telemetry
            </Button>
          </div>
        }
      />

      {/* Error Alert */}
      {errorMsg && (
        <Card variant="glass" className="border-rose-200 bg-rose-50/50 mb-6">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-rose-900">Yield Intelligence Sync Notice</h4>
                <p className="text-xs text-rose-700">{errorMsg}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchYieldIntelligenceData(true)}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="border-rose-300 text-rose-800 hover:bg-rose-100 shrink-0"
            >
              Retry Sync
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-6 max-w-5xl mx-auto">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="max-w-5xl mx-auto space-y-8">
          {/* SECTION 1: CROP PERFORMANCE & READINESS OVERVIEW */}
          <Card variant="glass" className="border-emerald-200/90 shadow-md">
            <CardHeader className="bg-gradient-to-r from-emerald-900/10 via-teal-900/5 to-transparent border-b border-emerald-100 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-black text-slate-900">
                      Crop Readiness & Production Outlook
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-600">
                      Calculated qualitative index for {primaryCrop} in {currentCity}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-bold border-slate-300">
                    <MapPin className="w-3 h-3 text-emerald-600 mr-1" />
                    {currentCity}
                  </Badge>
                  <Badge variant="emerald" className="text-xs font-bold">
                    <Sprout className="w-3 h-3 mr-1" />
                    {primaryCrop}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Readiness Status Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-200/80 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Readiness Status
                    </span>
                    {yieldReadinessStatus === "Favorable" && (
                      <Badge variant="emerald" className="gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Favorable
                      </Badge>
                    )}
                    {yieldReadinessStatus === "Moderate" && (
                      <Badge variant="warning" className="gap-1">
                        <Activity className="w-3 h-3" /> Moderate
                      </Badge>
                    )}
                    {yieldReadinessStatus === "Needs Attention" && (
                      <Badge variant="danger" className="gap-1">
                        <AlertTriangle className="w-3 h-3" /> Needs Attention
                      </Badge>
                    )}
                    {yieldReadinessStatus === "Insufficient Data" && (
                      <Badge variant="info" className="gap-1">
                        <Info className="w-3 h-3" /> Insufficient Data
                      </Badge>
                    )}
                  </div>
                  <div className="text-2xl font-black text-slate-900 my-2">
                    {yieldReadinessStatus}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {statusReason}
                  </p>
                </div>

                {/* Farm Health Index */}
                <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Farm Health Score
                    </span>
                    <Activity className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-black text-emerald-800 my-1">
                    {farmScoreText}
                  </div>
                  <p className="text-xs text-slate-600">
                    Calculated from overall crop health, disease risk, and soil parameters.
                  </p>
                </div>

                {/* Telemetry Confidence */}
                <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Data Confidence
                    </span>
                    <BrainCircuit className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-xl font-black text-slate-900 my-1">
                    {dataConfidence}
                  </div>
                  <p className="text-xs text-slate-600">
                    Based on user-saved soil advisories and crop disease scans.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 2: MULTI-FACTOR ANALYSIS BREAKDOWN */}
          <Card variant="glass" className="border-slate-200 shadow-md">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                Contributing Yield Factors
              </CardTitle>
              <CardDescription className="text-xs text-slate-600">
                Key environmental, soil, and crop health metrics influencing harvest potential.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Weather Factor */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white/70 space-y-2">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <CloudSun className="w-4 h-4 text-amber-500" /> Weather
                    </span>
                    <Badge variant="emerald" className="text-[10px]">Optimal</Badge>
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {weatherData ? `${weatherData.temperature}°C • ${weatherData.condition}` : "26°C • Clear"}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Humidity: {weatherData?.humidity ?? 65}% • Rain Prob: {weatherData?.rainProbability ?? 20}%
                  </p>
                </div>

                {/* Soil Health Factor */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white/70 space-y-2">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Sprout className="w-4 h-4 text-emerald-600" /> Soil Fertility
                    </span>
                    <Badge variant="emerald" className="text-[10px]">High</Badge>
                  </div>
                  <div className="text-sm font-bold text-slate-900 truncate">
                    {soilScoreText}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    Rec. Fertilizer: {latestSoilReport?.fertilizerRecommendation || "NPK 19-19-19"}
                  </p>
                </div>

                {/* Disease Pressure Factor */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white/70 space-y-2">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-teal-600" /> Disease Pressure
                    </span>
                    {hasHighDisease ? (
                      <Badge variant="danger" className="text-[10px]">High Risk</Badge>
                    ) : hasMediumDisease ? (
                      <Badge variant="warning" className="text-[10px]">Moderate</Badge>
                    ) : (
                      <Badge variant="emerald" className="text-[10px]">Low Risk</Badge>
                    )}
                  </div>
                  <div className="text-sm font-bold text-slate-900 truncate">
                    {latestDiseaseScan ? latestDiseaseScan.disease : "No Active Outbreak"}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {diseaseScanCount} total diagnostic scans logged
                  </p>
                </div>

                {/* Irrigation Factor */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white/70 space-y-2">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Droplets className="w-4 h-4 text-blue-500" /> Irrigation
                    </span>
                    <Badge variant="emerald" className="text-[10px]">Stable</Badge>
                  </div>
                  <div className="text-sm font-bold text-slate-900 truncate">
                    {latestSoilReport?.irrigationRecommendation || "Moderate Drip Irrigation"}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Water availability index optimal
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 3: RECORDED HARVEST HISTORY */}
          <Card variant="glass" className="border-emerald-200/90 shadow-md">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <History className="w-4 h-4 text-emerald-600" />
                    Recorded Harvest History
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-600">
                    Post-harvest records logged by farmer with calculated yield-per-area metrics.
                  </CardDescription>
                </div>
                <Button
                  variant="emerald"
                  size="sm"
                  onClick={() => setIsModalOpen(true)}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add Record
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {isLoadingLogs ? (
                <div className="p-8 text-center">
                  <Spinner size="md" className="mx-auto text-emerald-600 mb-2" />
                  <p className="text-xs text-slate-500 font-medium">Loading harvest history...</p>
                </div>
              ) : harvestLogs.length === 0 ? (
                <EmptyState
                  icon={<Sprout className="w-10 h-10 text-emerald-500" />}
                  title="No Harvest Records Yet"
                  description="Log your actual harvest yield after each cropping season to build your historical production record."
                  actionLabel="Log First Harvest"
                  onAction={() => setIsModalOpen(true)}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {harvestLogs.map((log) => {
                    const formattedDate = new Date(log.harvestDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    });

                    return (
                      <div
                        key={log._id}
                        className="p-5 rounded-2xl border border-slate-200/90 bg-white/80 hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-slate-900 text-base">
                                  {log.crop}
                                </span>
                                <Badge variant="emerald" className="text-[10px] py-0 px-2">
                                  {log.season}
                                </Badge>
                              </div>
                              <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                {formattedDate}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteLogId(log._id)}
                              className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 h-8 w-8 p-0 rounded-xl"
                              title="Delete record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              <span className="text-[10px] text-slate-500 font-bold uppercase block">
                                Cultivated Area
                              </span>
                              <span className="font-bold text-slate-900">
                                {log.cultivatedArea} {log.areaUnit}
                              </span>
                            </div>
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              <span className="text-[10px] text-slate-500 font-bold uppercase block">
                                Total Yield
                              </span>
                              <span className="font-bold text-slate-900">
                                {log.totalYield} {log.yieldUnit}
                              </span>
                            </div>
                          </div>

                          {/* Calculated Yield Per Area Metric */}
                          <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/70 flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                              <Scale className="w-3.5 h-3.5 text-emerald-600" />
                              Yield per Area:
                            </span>
                            <span className="text-xs font-black text-emerald-800">
                              {log.yieldPerArea} {log.yieldUnit} / {log.areaUnit}
                            </span>
                          </div>

                          {log.notes && (
                            <p className="text-xs text-slate-600 bg-slate-50/60 p-2.5 rounded-xl border border-slate-100 italic">
                              "{log.notes}"
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ADD HARVEST RECORD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-900/5 to-transparent">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Sprout className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-900 text-base">Add Post-Harvest Record</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHarvestLog} className="p-6 space-y-4 overflow-y-auto flex-1">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Crop & Season */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Crop <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formCrop}
                    onChange={(e) => setFormCrop(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Wheat">Wheat</option>
                    <option value="Rice (Paddy)">Rice (Paddy)</option>
                    <option value="Cotton">Cotton</option>
                    <option value="Sugarcane">Sugarcane</option>
                    <option value="Maize">Maize</option>
                    <option value="Soybeans">Soybeans</option>
                    <option value="Mustard">Mustard</option>
                    <option value="Gram (Chickpea)">Gram (Chickpea)</option>
                    <option value="Tomato">Tomato</option>
                    <option value="Potato">Potato</option>
                    <option value="Other">Other (Custom)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cropping Season <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formSeason}
                    onChange={(e) => setFormSeason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Kharif">Kharif (Monsoon)</option>
                    <option value="Rabi">Rabi (Winter)</option>
                    <option value="Zaid">Zaid (Summer)</option>
                    <option value="Whole Year">Whole Year</option>
                  </select>
                </div>
              </div>

              {formCrop === "Other" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Specify Custom Crop Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Groundnut, Turmeric..."
                    value={formCustomCrop}
                    onChange={(e) => setFormCustomCrop(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              {/* Harvest Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Harvest Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={formHarvestDate}
                  onChange={(e) => setFormHarvestDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Cultivated Area & Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cultivated Area <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="e.g. 5"
                    value={formArea}
                    onChange={(e) => setFormArea(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Area Unit</label>
                  <select
                    value={formAreaUnit}
                    onChange={(e) => setFormAreaUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Acre">Acre</option>
                    <option value="Hectare">Hectare</option>
                    <option value="Guntha">Guntha</option>
                    <option value="Bigha">Bigha</option>
                  </select>
                </div>
              </div>

              {/* Total Yield & Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Total Yield <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="e.g. 120"
                    value={formYield}
                    onChange={(e) => setFormYield(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Yield Unit</label>
                  <select
                    value={formYieldUnit}
                    onChange={(e) => setFormYieldUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Quintal">Quintal</option>
                    <option value="Kg">Kg</option>
                    <option value="Tonne">Tonne</option>
                  </select>
                </div>
              </div>

              {/* Live Yield-Per-Area Preview */}
              {previewYieldPerArea && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-emerald-600" /> Calculated Productivity:
                  </span>
                  <span className="font-black text-emerald-800">
                    {previewYieldPerArea} {formYieldUnit} / {formAreaUnit}
                  </span>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notes / Observations (Optional)
                </label>
                <textarea
                  rows={2}
                  maxLength={500}
                  placeholder="e.g., Used organic fertilizer, timely irrigation..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSavingLog}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="emerald"
                  size="sm"
                  disabled={isSavingLog}
                  leftIcon={isSavingLog ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : undefined}
                >
                  {isSavingLog ? "Saving Record..." : "Save Harvest Record"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteLogId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Delete Harvest Record?</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteLogId(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDeleteHarvestLog(deleteLogId)}
                disabled={isDeleting}
                leftIcon={isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : undefined}
              >
                {isDeleting ? "Deleting..." : "Delete Record"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
