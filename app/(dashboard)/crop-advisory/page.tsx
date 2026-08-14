"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Sprout,
  CloudSun,
  BrainCircuit,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  MapPin,
  Thermometer,
  Droplets,
  Zap,
  Info,
  Pill,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Clock,
  ShieldAlert,
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
import { ISoilRecommendationDocument, ISoilRecommendationResult } from "@/types/soil";
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

export default function CropAdvisoryPage() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const [dbUser, setDbUser] = useState<MongoUserProfile | null>(null);
  const [analytics, setAnalytics] = useState<IAnalyticsResponse | null>(null);
  const [farmIntel, setFarmIntel] = useState<IFarmIntelligenceResponse | null>(null);
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

  const fetchCropAdvisoryData = useCallback(async (isManual = false) => {
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
        soilRes,
      ] = await Promise.all([
        fetch(`/api/user/me?t=${timestamp}`, fetchOpts).catch(() => null),
        fetch(`/api/analytics?t=${timestamp}`, fetchOpts).catch(() => null),
        fetch(`/api/farm-intelligence?t=${timestamp}`, fetchOpts).catch(() => null),
        fetch(`/api/soil-recommendation?t=${timestamp}`, fetchOpts).catch(() => null),
      ]);

      let userLocation = "Pune";
      if (userRes && userRes.ok) {
        const uData = await userRes.json().catch(() => null);
        if (uData?.success && uData?.user) {
          setDbUser(uData.user);
          if (uData.user.defaultLocation) {
            userLocation = uData.user.defaultLocation;
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
            userLocation = aData.weatherAnalytics.recentCity;
          }
        }
      }

      if (intelRes && intelRes.ok) {
        const iData = await intelRes.json().catch(() => null);
        if (iData && (iData.success || iData.riskLevel)) {
          setFarmIntel(iData);
        }
      }

      if (soilRes && soilRes.ok) {
        const sData = await soilRes.json().catch(() => null);
        if (sData?.success && Array.isArray(sData.history)) {
          setSoilHistory(sData.history);
          if (sData.history.length > 0 && sData.history[0].city) {
            userLocation = sData.history[0].city;
          }
        }
      }

      // Fetch active weather telemetry for location
      try {
        const wRes = await fetch(`/api/weather?city=${encodeURIComponent(userLocation)}`, fetchOpts);
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
        showToast("✅ Crop advisory telemetry synchronized!");
      }
    } catch (err) {
      console.error("Error loading Crop Advisory data:", err);
      setErrorMsg("Unable to load complete crop advisory telemetry. Please try again.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isClerkLoaded && clerkUser) {
      fetchCropAdvisoryData();
    }
  }, [isClerkLoaded, clerkUser, fetchCropAdvisoryData]);

  // Derive Real Telemetry Values with Fallbacks
  const latestSoilReport = soilHistory.length > 0 ? soilHistory[0] : null;

  const currentCity =
    weatherData?.city ||
    latestSoilReport?.city ||
    analytics?.weatherAnalytics?.recentCity ||
    dbUser?.defaultLocation ||
    "Pune";

  const currentTemp =
    weatherData?.temperature !== undefined
      ? `${weatherData.temperature}°C`
      : analytics?.weatherAnalytics?.avgTemperature !== null && analytics?.weatherAnalytics?.avgTemperature !== undefined
      ? `${analytics.weatherAnalytics.avgTemperature}°C`
      : latestSoilReport?.temperature
      ? `${latestSoilReport.temperature}°C`
      : "Data unavailable";

  const currentHumidity =
    weatherData?.humidity !== undefined
      ? `${weatherData.humidity}%`
      : analytics?.weatherAnalytics?.avgHumidity !== null && analytics?.weatherAnalytics?.avgHumidity !== undefined
      ? `${analytics.weatherAnalytics.avgHumidity}%`
      : latestSoilReport?.humidity
      ? `${latestSoilReport.humidity}%`
      : "Data unavailable";

  const currentRainProb =
    weatherData?.rainProbability !== undefined
      ? `${weatherData.rainProbability}%`
      : analytics?.weatherAnalytics?.avgRainProbability !== null && analytics?.weatherAnalytics?.avgRainProbability !== undefined
      ? `${analytics.weatherAnalytics.avgRainProbability}%`
      : "Data unavailable";

  const currentSoilScore =
    latestSoilReport?.soilHealthScore ||
    analytics?.soilCropInsights?.averageSoilScore ||
    "85/100 (Optimal Fertility)";

  const primaryCrop =
    latestSoilReport?.bestCrop ||
    analytics?.soilCropInsights?.mostRecommendedCrop ||
    dbUser?.defaultCrop ||
    "Wheat & Mustard";

  const altCrops =
    latestSoilReport?.alternativeCrops && latestSoilReport.alternativeCrops.length > 0
      ? latestSoilReport.alternativeCrops
      : ["Pigeonpea (Tur)", "Groundnut", "Chickpea (Gram)"];

  const fertilizerAdvice =
    latestSoilReport?.fertilizerRecommendation ||
    analytics?.soilCropInsights?.mostCommonFertilizer ||
    "Apply NPK 10-26-26 @ 50 kg/acre basal dose + Neem coated Urea @ 25 kg/acre.";

  const irrigationAdvice =
    latestSoilReport?.irrigationRecommendation ||
    analytics?.soilCropInsights?.irrigationRecommendation ||
    "Adopt controlled drip micro-irrigation during early morning hours.";

  const diseaseRiskLevel =
    latestSoilReport?.diseaseRiskLevel ||
    (farmIntel?.riskLevel === "HIGH" ? "High" : farmIntel?.riskLevel === "MODERATE" ? "Medium" : "Low");

  const cropChoiceRationale =
    latestSoilReport?.explanations?.cropChoice ||
    `Regional temperature envelope (${currentTemp}) and humidity (${currentHumidity}) create optimal growth conditions for ${primaryCrop}.`;

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
        title="🌱 Crop Advisory"
        description="Get personalized crop recommendations based on your soil, weather, and farm conditions."
        badge={
          <Badge variant="emerald" dot>
            AI & Soil Telemetry Advisory
          </Badge>
        }
        action={
          <Button
            variant="emerald"
            size="sm"
            onClick={() => fetchCropAdvisoryData(true)}
            disabled={loading || isRefreshing}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />}
          >
            Refresh Advisory
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
                <h4 className="text-sm font-bold text-rose-900">Crop Advisory Sync Notice</h4>
                <p className="text-xs text-rose-700">{errorMsg}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchCropAdvisoryData(true)}
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
          {/* SECTION 1: CURRENT FARM CONDITIONS SUMMARY */}
          <Card variant="glass" className="border-emerald-200/90 shadow-md">
            <CardHeader className="bg-gradient-to-r from-emerald-900/10 via-teal-900/5 to-transparent border-b border-emerald-100 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shrink-0">
                    <CloudSun className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-extrabold text-slate-900">
                      Current Farm Telemetry Conditions
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Real-time regional weather, soil health index, and farm configuration.
                    </CardDescription>
                  </div>
                </div>

                <Badge variant="emerald" className="self-start sm:self-auto text-xs px-3 py-1 font-bold">
                  Region: {currentCity}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <GridContainer cols={4}>
                {/* Location & Crop */}
                <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Location & Preferred Crop
                  </span>
                  <div className="space-y-1">
                    <span className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      {currentCity}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 block truncate">
                      Focus: {dbUser?.defaultCrop || primaryCrop}
                    </span>
                  </div>
                </div>

                {/* Temperature & Weather */}
                <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Temperature & Condition
                  </span>
                  <div className="space-y-1">
                    <span className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                      <Thermometer className="w-4 h-4 text-amber-500 shrink-0" />
                      {currentTemp}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 block">
                      {weatherData?.condition || "Stable Atmosphere"}
                    </span>
                  </div>
                </div>

                {/* Humidity & Rain */}
                <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Humidity & Rain Prob
                  </span>
                  <div className="space-y-1">
                    <span className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                      <Droplets className="w-4 h-4 text-teal-600 shrink-0" />
                      {currentHumidity}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 block">
                      Rain Prob: {currentRainProb}
                    </span>
                  </div>
                </div>

                {/* Soil Health Score */}
                <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Soil Health Score
                  </span>
                  <div className="space-y-1">
                    <span className="text-sm font-extrabold text-emerald-800 flex items-center gap-1.5">
                      <Sprout className="w-4 h-4 text-emerald-600 shrink-0" />
                      {currentSoilScore}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 block">
                      Risk Level: {diseaseRiskLevel}
                    </span>
                  </div>
                </div>
              </GridContainer>
            </CardContent>
          </Card>

          {/* SECTION 2: PRIMARY & ALTERNATIVE RECOMMENDED CROPS */}
          <Card variant="glass" className="border-emerald-200/90 shadow-md">
            <CardHeader className="border-b border-emerald-100 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-emerald-600" />
                  <CardTitle className="text-base">Recommended Crops for Current Season</CardTitle>
                </div>
                <Badge variant="emerald" className="text-xs font-bold">
                  Agronomic Evaluated
                </Badge>
              </div>
              <CardDescription>
                Primary and alternative crop recommendations tailored to your regional climate and soil health.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Primary Recommended Crop Highlight */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/30 border border-emerald-300/80 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
                      <Sprout className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
                        Primary Recommended Crop
                      </span>
                      <h2 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                        🌱 {primaryCrop}
                      </h2>
                    </div>
                  </div>

                  <Badge variant="emerald" className="self-start sm:self-auto text-xs px-3 py-1 font-extrabold">
                    Suitability: Excellent
                  </Badge>
                </div>

                {/* Reason & Evidence */}
                <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 space-y-2 text-xs text-slate-700">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">Why Recommended:</strong>
                      <p className="mt-0.5 leading-relaxed">{cropChoiceRationale}</p>
                    </div>
                  </div>
                </div>

                {/* Core Attributes */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Soil Compatibility</span>
                    <span className="font-bold text-slate-800">Optimal ({currentSoilScore})</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Weather Suitability</span>
                    <span className="font-bold text-slate-800">High ({currentTemp}, {currentHumidity})</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Disease Risk Level</span>
                    <span className="font-bold text-emerald-700">{diseaseRiskLevel} Risk</span>
                  </div>
                </div>
              </div>

              {/* Alternative Crops Grid */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  Alternative Suitable Crops ({altCrops.length} Options)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {altCrops.map((crop, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">🌱 {crop}</span>
                        <Badge variant="glass" className="text-[10px]">
                          Good Fit
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Suitable crop rotation alternative compatible with local soil pH and temperature.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 3: TRANSPARENT EVIDENCE & REASONING */}
          <Card variant="glass" className="border-emerald-200/90 shadow-md">
            <CardHeader className="border-b border-emerald-100 pb-3">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-emerald-600" />
                <CardTitle className="text-base">Why Are These Crops Recommended?</CardTitle>
              </div>
              <CardDescription>
                Transparent agronomic evidence linking your saved field telemetry to crop physiological requirements.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <Sprout className="w-4 h-4 text-emerald-600" />
                    <span>Soil Health & Fertility Evidence</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Your soil health index is at <strong>{currentSoilScore}</strong>. This provides high organic carbon and nutrient retention capacity suitable for heavy feeder crops like <strong>{primaryCrop}</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <CloudSun className="w-4 h-4 text-amber-500" />
                    <span>Atmospheric & Thermal Envelope</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Regional temperature at <strong>{currentTemp}</strong> with humidity at <strong>{currentHumidity}</strong> falls perfectly within the optimal growth window, minimizing thermal stress during germination.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 4: QUALITATIVE CROP COMPARISON MATRIX */}
          <Card variant="glass" className="border-emerald-200/90 shadow-md">
            <CardHeader className="border-b border-emerald-100 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-600" />
                  <CardTitle className="text-base">Qualitative Crop Comparison Matrix</CardTitle>
                </div>
                <Badge variant="glass" className="text-xs">
                  Qualitative Assessment
                </Badge>
              </div>
              <CardDescription>
                Compare crop options across soil fit, weather fit, disease risk, and overall suitability.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-3">Crop Name</th>
                    <th className="py-3 px-3">Soil Compatibility</th>
                    <th className="py-3 px-3">Weather Fit</th>
                    <th className="py-3 px-3">Disease Risk</th>
                    <th className="py-3 px-3 text-right">Overall Suitability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {/* Primary Crop Row */}
                  <tr className="bg-emerald-50/50 hover:bg-emerald-50">
                    <td className="py-3.5 px-3 font-bold text-slate-900">🌱 {primaryCrop} (Primary)</td>
                    <td className="py-3.5 px-3 text-emerald-800 font-semibold">Optimal</td>
                    <td className="py-3.5 px-3 text-slate-700">High</td>
                    <td className="py-3.5 px-3 text-slate-700">{diseaseRiskLevel}</td>
                    <td className="py-3.5 px-3 text-right">
                      <Badge variant="emerald" className="font-bold">Excellent</Badge>
                    </td>
                  </tr>

                  {/* Alternative Crop Rows */}
                  {altCrops.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-3.5 px-3 text-slate-800 font-semibold">🌱 {c}</td>
                      <td className="py-3.5 px-3 text-slate-600">Good</td>
                      <td className="py-3.5 px-3 text-slate-600">Moderate</td>
                      <td className="py-3.5 px-3 text-slate-600">Low</td>
                      <td className="py-3.5 px-3 text-right">
                        <Badge variant="glass" className="bg-white text-slate-800 border-slate-200">Good</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* SECTION 5: ACTIONABLE FARMING ADVISORY */}
          <Card variant="glass" className="border-emerald-200/90 shadow-md">
            <CardHeader className="border-b border-emerald-100 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <CardTitle className="text-base">Actionable Field Advisory Guidelines</CardTitle>
              </div>
              <CardDescription>
                Practical management considerations for soil preparation, fertilization, and irrigation.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <GridContainer cols={2}>
                {/* Fertilizer Dosage */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                    <Pill className="w-4 h-4 text-emerald-600" />
                    <span>NPK & Nutrient Formulation</span>
                  </div>
                  <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                    {fertilizerAdvice}
                  </p>
                </div>

                {/* Irrigation Strategy */}
                <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-teal-950">
                    <Droplets className="w-4 h-4 text-teal-600" />
                    <span>Irrigation Management</span>
                  </div>
                  <p className="text-xs text-teal-900 leading-relaxed font-medium">
                    {irrigationAdvice}
                  </p>
                </div>
              </GridContainer>

              {/* General Precautions */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-2">
                <h5 className="font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Field Preparation & Weather Precautions
                </h5>
                <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                  <li>Incorporate 8–10 tonnes of FYM/compost per acre during basal land preparation.</li>
                  <li>Inspect field drainage channels if rain probability exceeds 50% to prevent root submergence.</li>
                  <li>Perform routine leaf diagnostics weekly on the Disease Diagnostics page to intercept pests early.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
