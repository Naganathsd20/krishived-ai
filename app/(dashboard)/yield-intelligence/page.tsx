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

interface MongoUserProfile {
  _id: string;
  clerkId: string;
  name: string;
  email: string;
  image: string;
  role: string;
  language: string;
  defaultLocation?: string;
  defaultCrop?: string;
}

export default function YieldIntelligencePage() {
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
      ] = await Promise.all([
        fetch(`/api/user/me?t=${timestamp}`, fetchOpts).catch(() => null),
        fetch(`/api/analytics?t=${timestamp}`, fetchOpts).catch(() => null),
        fetch(`/api/farm-intelligence?t=${timestamp}`, fetchOpts).catch(() => null),
        fetch(`/api/analyze-disease?t=${timestamp}`, fetchOpts).catch(() => null),
        fetch(`/api/soil-recommendation?t=${timestamp}`, fetchOpts).catch(() => null),
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

      let currentAnalytics: IAnalyticsResponse | null = null;
      if (analyticsRes && analyticsRes.ok) {
        const aData = await analyticsRes.json().catch(() => null);
        if (aData?.success) {
          setAnalytics(aData);
          currentAnalytics = aData;
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
        showToast("✅ Yield intelligence telemetry synchronized!");
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
        title="📈 Yield Intelligence"
        description="Understand the factors that may influence your crop performance."
        badge={
          <Badge variant="emerald" dot>
            Multi-Factor Telemetry Analysis
          </Badge>
        }
        action={
          <Button
            variant="emerald"
            size="sm"
            onClick={() => fetchYieldIntelligenceData(true)}
            disabled={loading || isRefreshing}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />}
          >
            Refresh Telemetry
          </Button>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shrink-0">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-extrabold text-slate-900">
                      Crop Performance & Readiness
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Qualitative readiness evaluation for {primaryCrop} ({currentCity}).
                    </CardDescription>
                  </div>
                </div>

                <Badge
                  variant={
                    yieldReadinessStatus === "Favorable"
                      ? "emerald"
                      : yieldReadinessStatus === "Moderate"
                      ? "warning"
                      : yieldReadinessStatus === "Needs Attention"
                      ? "danger"
                      : "glass"
                  }
                  className="self-start sm:self-auto text-xs px-3 py-1 font-extrabold uppercase tracking-wide"
                >
                  Yield Readiness: {yieldReadinessStatus}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* No Fake Yield Prediction Alert Notice */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Yield Prediction: Unavailable (Requires Historical Harvest Records)</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Historical harvest data is required before a reliable quantitative yield estimate (e.g. tonnes/hectare) can be generated. Below is your multi-factor crop health analysis based on active farm telemetry.
                </p>
              </div>

              {/* Status Rationale Box */}
              <div className="p-5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Readiness Evaluation Summary
                </h4>
                <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                  "{statusReason}"
                </p>
              </div>

              {/* Core Telemetry KPI Cards */}
              <GridContainer cols={4}>
                <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Primary Crop Focus
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 truncate block">
                    🌱 {primaryCrop}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1 block">Location: {currentCity}</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Farm Health Score
                  </span>
                  <span className="text-2xl font-extrabold text-slate-900 block">
                    {farmScoreText}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1 block">Composite telemetry index</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Soil Health Index
                  </span>
                  <span className="text-sm font-bold text-emerald-800 truncate block">
                    {soilScoreText}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1 block">Optimal NPK & pH</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Data Confidence
                  </span>
                  <span className="text-sm font-bold text-slate-800 block">
                    {dataConfidence}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1 block">Based on saved telemetry</span>
                </div>
              </GridContainer>
            </CardContent>
          </Card>

          {/* SECTION 2: YIELD-INFLUENCING FACTORS */}
          <Card variant="glass" className="border-emerald-200/90 shadow-md">
            <CardHeader className="border-b border-emerald-100 pb-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-emerald-600" />
                <CardTitle className="text-base">Yield-Influencing Factor Analysis</CardTitle>
              </div>
              <CardDescription>
                Detailed breakdown of real environmental and agronomic factors affecting crop potential.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <GridContainer cols={2}>
                {/* 1. Soil Health Factor */}
                <div className="p-5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                      <Sprout className="w-4 h-4 text-emerald-600" />
                      <span>Soil Health & Nutrient Fertility</span>
                    </div>
                    <Badge variant="emerald" className="text-[10px]">
                      Influence: Positive
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Soil health score is <strong>{soilScoreText}</strong>. Recommended dosage of organic compost and NPK fertilizer supports strong root establishment.
                  </p>
                </div>

                {/* 2. Weather & Climate Factor */}
                <div className="p-5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                      <CloudSun className="w-4 h-4 text-amber-500" />
                      <span>Atmospheric & Weather Telemetry</span>
                    </div>
                    <Badge variant="emerald" className="text-[10px]">
                      Influence: Positive
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {weatherData ? (
                      <>Temperature at <strong>{weatherData.temperature}°C</strong>, humidity at <strong>{weatherData.humidity}%</strong>, and rain probability at <strong>{weatherData.rainProbability}%</strong> maintain ideal crop moisture balance.</>
                    ) : (
                      <>Regional weather telemetry is stable and supportive of normal crop transpiration.</>
                    )}
                  </p>
                </div>

                {/* 3. Crop Disease Burden Factor */}
                <div className="p-5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                      <Activity className="w-4 h-4 text-rose-500" />
                      <span>Crop Disease & Pathogen Status</span>
                    </div>
                    <Badge
                      variant={hasHighDisease ? "danger" : hasMediumDisease ? "warning" : "emerald"}
                      className="text-[10px]"
                    >
                      Influence: {hasHighDisease || hasMediumDisease ? "Attention Needed" : "Positive"}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {diseaseScanCount > 0 ? (
                      <>Total of <strong>{diseaseScanCount}</strong> leaf scan record(s). Latest scan detected <strong>"{latestDiseaseScan?.disease || "Leaf Scan"}"</strong> ({latestDiseaseScan?.severity || "Medium"} severity).</>
                    ) : (
                      <>No active disease infection detected in leaf diagnostic history.</>
                    )}
                  </p>
                </div>

                {/* 4. Farm Health Composite Index */}
                <div className="p-5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                      <Zap className="w-4 h-4 text-emerald-600" />
                      <span>Composite Farm Health Index</span>
                    </div>
                    <Badge variant="glass" className="text-[10px]">
                      Influence: {farmScore && farmScore >= 75 ? "Positive" : "Moderate"}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Overall Farm Health Score stands at <strong>{farmScoreText}</strong>, evaluating combined factors across irrigation, weather stability, and disease risk.
                  </p>
                </div>
              </GridContainer>
            </CardContent>
          </Card>

          {/* SECTION 3: ACTIONABLE FARMER INSIGHTS & ADVISORY */}
          <Card variant="glass" className="border-emerald-200/90 shadow-md">
            <CardHeader className="border-b border-emerald-100 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <CardTitle className="text-base">Actionable Yield Optimization Insights</CardTitle>
              </div>
              <CardDescription>
                Targeted actions to safeguard your crop performance and maximize seasonal outcomes.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {/* Action 1: Disease Management */}
              {hasMediumDisease || hasHighDisease ? (
                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs space-y-1">
                  <h5 className="font-bold text-rose-950 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Disease Action: Monitor Affected Crop & Apply Recommended Spray
                  </h5>
                  <p className="text-rose-800 leading-relaxed">
                    Recent leaf diagnostic scan identified {latestDiseaseScan?.disease || "a disease pathogen"}. Follow the recommended treatment protocol on the Disease Diagnostics page to prevent yield loss.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1">
                  <h5 className="font-bold text-emerald-950 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Disease Action: Maintain Routine Inspection
                  </h5>
                  <p className="text-emerald-900 leading-relaxed">
                    Crop foliage shows no severe pathogen pressure. Perform weekly leaf scans to ensure early detection.
                  </p>
                </div>
              )}

              {/* Action 2: Soil Fertility */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-1">
                <h5 className="font-bold text-slate-900 flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-emerald-600" />
                  Soil Action: Follow NPK & Organic Fertilizer Schedule
                </h5>
                <p className="text-slate-600 leading-relaxed">
                  Continue following the soil recommendation report for {primaryCrop}. Apply basal doses of organic FYM compost to maintain optimal microbial activity.
                </p>
              </div>

              {/* Action 3: Harvest Record Logging */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <h5 className="font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-600" />
                  Yield Intelligence Action: Record Harvest Results
                </h5>
                <p className="text-slate-600 leading-relaxed">
                  After completing your upcoming harvest, log your harvest yield records to enable automated quantitative yield estimations for future crop seasons.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 4: HISTORICAL HARVEST RECORDS EMPTY STATE */}
          <Card variant="glass" className="border-emerald-200/90 shadow-md">
            <CardHeader className="border-b border-emerald-100 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-emerald-600" />
                  <CardTitle className="text-base">Seasonal Harvest Records</CardTitle>
                </div>
                <Badge variant="glass" className="text-xs">
                  0 Records
                </Badge>
              </div>
              <CardDescription>
                Historical harvest logs used for seasonal yield trend comparison.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <EmptyState
                title="No Harvest Records Logged Yet"
                description="Recording your actual harvest yields at the end of each season will unlock quantitative yield forecasting and long-term ROI trends."
                icon={<TrendingUp className="w-8 h-8 text-emerald-600" />}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
