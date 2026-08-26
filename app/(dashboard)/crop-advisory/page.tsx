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
import { MongoUserProfile } from "@/types";

// Helper functions for validating telemetry data & crop-specific agronomics
function isInvalidString(str: string | null | undefined): boolean {
  if (!str || typeof str !== "string") return true;
  const cleaned = str.trim().toUpperCase();
  return (
    !cleaned ||
    cleaned === "N/A" ||
    cleaned === "NA" ||
    cleaned === "DATA UNAVAILABLE" ||
    cleaned === "UNDEFINED" ||
    cleaned === "NULL"
  );
}

function getValidString(...candidates: (string | null | undefined)[]): string | null {
  for (const c of candidates) {
    if (!isInvalidString(c)) {
      return (c as string).trim();
    }
  }
  return null;
}

function getCropFertilizerAdvisory(cropName: string): string {
  const c = cropName.toLowerCase();
  if (c.includes("wheat") || c.includes("mustard")) {
    return "Apply NPK 120:60:40 kg/ha (DAP 50 kg/acre + MOP 25 kg/acre basal dose, followed by Neem-coated Urea top-dressing in 2 splits at CRI and Jointing stages).";
  }
  if (c.includes("maize") || c.includes("corn") || c.includes("soybean")) {
    return "Apply DAP 50 kg/acre + MOP 25 kg/acre + Zinc Sulphate 10 kg/acre basal dose; top-dress Urea 45 kg at Knee-High and 30 kg at Tasseling stage.";
  }
  if (c.includes("paddy") || c.includes("rice")) {
    return "Apply DAP 50 kg/acre + Zinc Sulphate 10 kg/acre at final puddling; top-dress Urea 35 kg at tillering and 25 kg at panicle initiation.";
  }
  if (c.includes("cotton") || c.includes("sorghum") || c.includes("jowar")) {
    return "Apply NPK 80:40:40 kg/ha with basal DAP 50 kg/acre + MOP 25 kg/acre; top-dress Urea at 30 and 60 days post-sowing.";
  }
  if (c.includes("tomato")) {
    return "Apply FYM 10 t/acre + NPK 19:19:19 during vegetative stage, switching to 13:0:45 + Calcium Nitrate during fruit setting.";
  }
  if (c.includes("turmeric")) {
    return "Apply FYM 10–12 t/acre + NPK 25:25:50 kg/acre in 3 split doses at 30, 60, and 90 days after rhizome planting.";
  }
  return "Incorporate 8–10 tonnes FYM/acre during land prep + balanced NPK 10-26-26 as per local soil test guidelines.";
}

function getCropIrrigationAdvisory(cropName: string): string {
  const c = cropName.toLowerCase();
  if (c.includes("wheat") || c.includes("mustard")) {
    return "Apply 4 to 6 critical irrigations at 15 to 20 day intervals, starting at Crown Root Initiation (CRI stage ~21 days after sowing).";
  }
  if (c.includes("maize") || c.includes("corn") || c.includes("soybean")) {
    return "Maintain moderate soil moisture. Irrigate during critical Knee-High (25-30 days) and Tasseling/Silking (50-60 days) stages. Avoid standing water.";
  }
  if (c.includes("paddy") || c.includes("rice")) {
    return "Maintain 2–3 cm standing water during early tillering, then adopt Alternate Wetting & Drying (AWD) to conserve water while maintaining yield.";
  }
  if (c.includes("cotton") || c.includes("sorghum") || c.includes("jowar")) {
    return "Provide 3 to 5 irrigations at critical square formation and flowering stages. Avoid excess moisture near harvesting.";
  }
  if (c.includes("tomato")) {
    return "Adopt controlled drip micro-irrigation (30–45 mins daily) to maintain 60–70% soil moisture and prevent fruit cracking.";
  }
  if (c.includes("turmeric")) {
    return "Provide 15 to 20 irrigations at 7 to 10 day intervals. Ensure raised beds and proper field drainage to prevent rhizome rot.";
  }
  return "Adopt controlled drip micro-irrigation during early morning hours to maintain 60–70% field capacity moisture.";
}

function getCropAlternativeOptions(primaryCropName: string): string[] {
  const c = primaryCropName.toLowerCase();
  if (c.includes("wheat") || c.includes("mustard")) {
    return ["Chickpea (Gram)", "Mustard", "Barley"];
  }
  if (c.includes("maize") || c.includes("soybean")) {
    return ["Pigeonpea (Tur)", "Groundnut", "Chickpea (Gram)"];
  }
  if (c.includes("paddy") || c.includes("rice")) {
    return ["Hybrid Maize", "Soybean", "Black Gram (Urad)"];
  }
  if (c.includes("cotton") || c.includes("sorghum") || c.includes("jowar")) {
    return ["Pigeonpea (Tur)", "Groundnut", "Sunflower"];
  }
  if (c.includes("tomato")) {
    return ["Chili", "Brinjal", "Capsicum"];
  }
  if (c.includes("turmeric")) {
    return ["Ginger", "Garlic", "Onion"];
  }
  return ["Pigeonpea (Tur)", "Groundnut", "Chickpea (Gram)"];
}

/**
 * Project standard agronomic suitability engine (lib/gemini.ts classification standard).
 * Calculates recommended crop based on location climate telemetry.
 */
function calculateTelemetryRecommendedCrop(
  temperature: number,
  humidity: number,
  rainProbability: number
): string {
  const isWarm = temperature >= 25;
  const isHumid = humidity >= 60;
  const isHighRain = rainProbability >= 40;

  if (isWarm) {
    if (isHumid) {
      return isHighRain ? "Paddy & Hybrid Rice" : "Soybean & Hybrid Maize";
    } else {
      return "Cotton & Sorghum (Jowar)";
    }
  } else {
    return "Wheat & Mustard";
  }
}

// List of supported farm locations
const SUPPORTED_LOCATIONS = [
  "Pune",
  "Karwar",
  "Dharwad",
  "Bengaluru",
  "Mangaluru",
  "Belagavi",
  "Hubballi",
  "Mumbai",
  "Nashik",
  "Mysuru",
  "Delhi",
  "Hyderabad",
  "Chennai",
  "Kolkata",
];

export default function CropAdvisoryPage() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const [dbUser, setDbUser] = useState<MongoUserProfile | null>(null);
  const [analytics, setAnalytics] = useState<IAnalyticsResponse | null>(null);
  const [farmIntel, setFarmIntel] = useState<IFarmIntelligenceResponse | null>(null);
  const [soilHistory, setSoilHistory] = useState<ISoilRecommendationDocument[]>([]);
  const [weatherData, setWeatherData] = useState<IWeatherData | null>(null);

  const [selectedCity, setSelectedCity] = useState<string>("Pune");
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const fetchWeatherForCity = useCallback(async (city: string) => {
    setIsWeatherLoading(true);
    try {
      const timestamp = Date.now();
      const wRes = await fetch(`/api/weather?city=${encodeURIComponent(city)}&t=${timestamp}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });
      if (wRes.ok) {
        const wData = await wRes.json().catch(() => null);
        if (wData?.success && wData.data) {
          setWeatherData(wData.data);
          return true;
        }
      }
    } catch (err) {
      console.warn("Weather fetch error:", err);
    } finally {
      setIsWeatherLoading(false);
    }
    return false;
  }, []);

  const handleLocationChange = async (newCity: string) => {
    setSelectedCity(newCity);
    setErrorMsg(null);
    const success = await fetchWeatherForCity(newCity);
    if (success) {
      showToast(`Telemetry updated for ${newCity}`);
    } else {
      setErrorMsg(`Unable to fetch real-time weather telemetry for ${newCity}. Please try again.`);
    }
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

      let initialCity = selectedCity || "Pune";
      if (userRes && userRes.ok) {
        const uData = await userRes.json().catch(() => null);
        if (uData?.success && uData?.user) {
          setDbUser(uData.user);
          if (uData.user.defaultLocation) {
            initialCity = uData.user.defaultLocation;
          }
        }
      }

      if (analyticsRes && analyticsRes.ok) {
        const aData = await analyticsRes.json().catch(() => null);
        if (aData?.success) {
          setAnalytics(aData);
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
        }
      }

      const activeTargetCity = selectedCity || initialCity;
      setSelectedCity(activeTargetCity);
      await fetchWeatherForCity(activeTargetCity);

      if (isManual) {
        showToast(`Crop advisory telemetry synchronized for ${activeTargetCity}!`);
      }
    } catch (err) {
      console.error("Error loading Crop Advisory data:", err);
      setErrorMsg("Unable to load complete crop advisory telemetry. Please try again.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedCity, fetchWeatherForCity]);

  useEffect(() => {
    if (isClerkLoaded && clerkUser) {
      fetchCropAdvisoryData();
    }
  }, [isClerkLoaded, clerkUser, fetchCropAdvisoryData]);

  // Derive Real Telemetry Values for Current Selected City
  const currentCity = weatherData?.city || selectedCity || "Pune";

  // Check if there is a saved soil report matching current selected location
  const matchingSoilReport = soilHistory.find(
    (s) => s.city && s.city.toLowerCase() === currentCity.toLowerCase()
  ) || (soilHistory.length > 0 && (!soilHistory[0].city || soilHistory[0].city.toLowerCase() === currentCity.toLowerCase()) ? soilHistory[0] : null);

  const currentTemp =
    weatherData?.temperature !== undefined
      ? `${weatherData.temperature}°C`
      : matchingSoilReport?.temperature
      ? `${matchingSoilReport.temperature}°C`
      : "25°C";

  const currentHumidity =
    weatherData?.humidity !== undefined
      ? `${weatherData.humidity}%`
      : matchingSoilReport?.humidity
      ? `${matchingSoilReport.humidity}%`
      : "55%";

  const currentRainProb =
    weatherData?.rainProbability !== undefined
      ? `${weatherData.rainProbability}%`
      : "15%";

  // Soil health score derivation
  const rawSoilScore = getValidString(matchingSoilReport?.soilHealthScore);
  const hasSoilData = !isInvalidString(rawSoilScore);
  const currentSoilScore = hasSoilData ? (rawSoilScore as string) : "No Saved Soil Test";

  // Location-based agronomic suitability calculation
  const tempNum = weatherData?.temperature ?? 25;
  const humNum = weatherData?.humidity ?? 55;
  const rainNum = weatherData?.rainProbability ?? 15;

  const telemetryCrop = calculateTelemetryRecommendedCrop(tempNum, humNum, rainNum);
  const rawSoilCrop = getValidString(matchingSoilReport?.bestCrop);

  // Primary Crop: Saved soil report for this specific city takes priority; otherwise use climate telemetry calculation
  const primaryCrop = rawSoilCrop || telemetryCrop;

  // Alternative crops derivation
  const rawAltCrops = matchingSoilReport?.alternativeCrops?.filter(
    (c) => !isInvalidString(c) && c.trim().toLowerCase() !== primaryCrop.toLowerCase()
  );
  const altCrops =
    rawAltCrops && rawAltCrops.length > 0
      ? rawAltCrops
      : getCropAlternativeOptions(primaryCrop);

  // Fertilizer Advice
  const rawFertilizer = getValidString(matchingSoilReport?.fertilizerRecommendation);
  const fertilizerAdvice = !isInvalidString(rawFertilizer)
    ? (rawFertilizer as string)
    : getCropFertilizerAdvisory(primaryCrop);

  // Irrigation Advice
  const rawIrrigation = getValidString(matchingSoilReport?.irrigationRecommendation);
  const irrigationAdvice = !isInvalidString(rawIrrigation)
    ? (rawIrrigation as string)
    : getCropIrrigationAdvisory(primaryCrop);

  const diseaseRiskLevel =
    matchingSoilReport?.diseaseRiskLevel ||
    (humNum >= 65 && tempNum > 26 ? "Medium" : farmIntel?.riskLevel === "HIGH" ? "High" : "Low");

  // Rationale
  const rawRationale = matchingSoilReport?.explanations?.cropChoice;
  const cropChoiceRationale = !isInvalidString(rawRationale)
    ? (rawRationale as string)
    : `Regional temperature envelope (${currentTemp}) and relative humidity (${currentHumidity}) in ${currentCity} create optimal growth conditions for ${primaryCrop}.`;

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
        title="Crop Advisory"
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
            disabled={loading || isRefreshing || isWeatherLoading}
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
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shrink-0">
                    <CloudSun className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-extrabold text-slate-900">
                      Current Farm Telemetry Conditions
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Real-time regional weather, soil health index, and active farm location.
                    </CardDescription>
                  </div>
                </div>

                {/* Farmer-Friendly Location Selector */}
                <div className="flex items-center gap-2 bg-white/90 p-1.5 px-3 rounded-2xl border border-emerald-300 shadow-xs self-start lg:self-auto">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <label htmlFor="farm-location-select" className="text-xs font-bold text-slate-700 whitespace-nowrap">
                    Select Farm Location:
                  </label>
                  <select
                    id="farm-location-select"
                    value={selectedCity}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    disabled={isWeatherLoading || isRefreshing}
                    className="text-xs font-bold text-emerald-950 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-300 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {SUPPORTED_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc} className="text-slate-900 bg-white">
                        {loc} {loc === dbUser?.defaultLocation ? "(Saved Default)" : ""}
                      </option>
                    ))}
                  </select>
                  {isWeatherLoading && (
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin shrink-0" />
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <GridContainer cols={4}>
                {/* Location & Crop */}
                <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Active Location & Crop Focus
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
                      {hasSoilData ? `Risk Level: ${diseaseRiskLevel}` : "Pending Soil Test Report"}
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
                        {primaryCrop}
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
                    <span className="font-bold text-slate-800">
                      {hasSoilData ? `Optimal (${currentSoilScore})` : "Good (Weather Optimized)"}
                    </span>
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
                        <span className="text-xs font-bold text-slate-900 truncate">{crop}</span>
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
                    {hasSoilData
                      ? `Your soil health index is at ${currentSoilScore}. This provides optimal organic carbon and nutrient retention capacity suitable for heavy feeder crops like ${primaryCrop}.`
                      : `No saved soil test report found. Recommendation is optimized using your registered crop focus (${primaryCrop}) and regional atmospheric weather telemetry. Run a test on the Weather & Soil page for personalized soil-based insights.`}
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
                    <td className="py-3.5 px-3 font-bold text-slate-900">{primaryCrop} (Primary)</td>
                    <td className="py-3.5 px-3 text-emerald-800 font-semibold">{hasSoilData ? "Optimal" : "Good"}</td>
                    <td className="py-3.5 px-3 text-slate-700">High</td>
                    <td className="py-3.5 px-3 text-slate-700">{diseaseRiskLevel}</td>
                    <td className="py-3.5 px-3 text-right">
                      <Badge variant="emerald" className="font-bold">Excellent</Badge>
                    </td>
                  </tr>

                  {/* Alternative Crop Rows */}
                  {altCrops.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-3.5 px-3 text-slate-800 font-semibold">{c}</td>
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

