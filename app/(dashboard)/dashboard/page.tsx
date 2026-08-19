"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sprout,
  BrainCircuit,
  TrendingUp,
  CloudSun,
  Sparkles,
  ArrowUpRight,
  User as UserIcon,
  Globe,
  Shield,
  Bot,
  BarChart3,
  RefreshCw,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Activity,
  FileText,
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
import { SkeletonCard, Spinner } from "@/components/ui/loading";
import { SmartFarmIntelligenceCard } from "@/components/dashboard/SmartFarmIntelligenceCard";
import { MongoUserProfile } from "@/types";

interface AnalyticsData {
  farmHealth: {
    hasEnoughData: boolean;
    overallScore: number | null;
    status: string;
    breakdown: {
      cropHealthScore: number;
      soilHealthScore: number;
      diseaseRiskScore: number;
      weatherStabilityScore: number;
      irrigationScore: number;
    } | null;
  };
  stats: {
    cropReportsCount: number;
    diseaseAnalysesCount: number;
    weatherChecksCount: number;
    conversationsCount: number;
    soilRecommendationsCount: number;
  };
  cropHealth: {
    healthyCount: number;
    healthyPercentage: number;
    moderateRiskCount: number;
    moderateRiskPercentage: number;
    highRiskCount: number;
    highRiskPercentage: number;
    totalFieldsAnalyzed: number;
  };
  diseaseAnalytics: {
    totalAnalyses: number;
    healthyCount: number;
    healthyPercentage: number;
    diseaseDetectedCount: number;
    diseaseDetectedPercentage: number;
    highestDetectedDisease: string;
    breakdown: Array<{ name: string; count: number; percentage: number; severity: string }>;
    recentDiseaseScans?: Array<{
      id: string;
      disease: string;
      severity: string;
      confidence: string;
      imageUrl?: string;
      timestamp: string;
      createdAtISO: string;
    }>;
  };
  weatherAnalytics: {
    hasData: boolean;
    avgTemperature: number | null;
    avgHumidity: number | null;
    avgRainProbability: number | null;
    weatherChecksCount: number;
    recentCity: string | null;
    trend: Array<{ day: string; dateStr: string; temp: number; humidity: number; rainProb: number; city: string }>;
  };
  soilCropInsights: {
    hasData: boolean;
    mostRecommendedCrop: string;
    averageSoilScore: string;
    mostCommonFertilizer: string;
    irrigationRecommendation: string;
  };
  aiInsights: string[];
  recentActivities: Array<{
    id: string;
    type: "disease" | "soil" | "chat";
    title: string;
    subtitle: string;
    timestamp: string;
    createdAtISO: string;
  }>;
}

function sanitizeErrorMessage(rawMsg?: string): string {
  if (!rawMsg) return "Unable to load farm analytics. Please try again.";
  if (
    rawMsg.includes("Mongo") ||
    rawMsg.includes("ECONNREFUSED") ||
    rawMsg.includes("connect") ||
    rawMsg.includes("Atlas") ||
    rawMsg.includes("URI") ||
    rawMsg.includes("localhost")
  ) {
    return "Unable to connect to farm service. Please try again.";
  }
  return rawMsg;
}

export default function OverviewPage() {
  const router = useRouter();
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const [dbUser, setDbUser] = useState<MongoUserProfile | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [userError, setUserError] = useState<string | null>(null);

  const fetchDashboardData = React.useCallback(async () => {
    setLoading(true);
    setAnalyticsError(null);
    setUserError(null);
    try {
      const timestamp = Date.now();
      const fetchOpts: RequestInit = {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      };

      const [userRes, analyticsRes] = await Promise.all([
        fetch(`/api/user/me?t=${timestamp}`, fetchOpts),
        fetch(`/api/analytics?t=${timestamp}`, fetchOpts),
      ]);

      // 1. Process User Profile Response
      if (userRes.ok) {
        const userData = await userRes.json().catch(() => null);
        if (userData?.success) {
          setDbUser(userData.user);
        } else {
          setUserError("Profile sync paused");
        }
      } else {
        setUserError("Profile sync paused");
      }

      // 2. Process Analytics Response
      const analyticsData = await analyticsRes.json().catch(() => null);

      if (analyticsRes.ok && analyticsData?.success) {
        setAnalytics(analyticsData);
      } else {
        const rawError = analyticsData?.error;
        const sanitizedMsg =
          analyticsRes.status === 401
            ? "Unauthorized. Please sign in to view dashboard data."
            : sanitizeErrorMessage(rawError);
        setAnalyticsError(sanitizedMsg);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setAnalyticsError("An unexpected error occurred while loading your dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isClerkLoaded && clerkUser) {
      fetchDashboardData();
    }
  }, [isClerkLoaded, clerkUser, fetchDashboardData]);

  const displayName =
    dbUser?.name ||
    clerkUser?.fullName ||
    clerkUser?.firstName ||
    "Farmer";

  const diseaseActivities =
    analytics?.diseaseAnalytics?.recentDiseaseScans &&
    analytics.diseaseAnalytics.recentDiseaseScans.length > 0
      ? analytics.diseaseAnalytics.recentDiseaseScans.map((d) => ({
          id: d.id,
          title: "Disease analysis completed",
          subtitle: `${d.disease} • Severity: ${d.severity}`,
          timestamp: d.timestamp,
        }))
      : analytics?.recentActivities?.filter((a) => a.type === "disease") || [];

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader
        title={`👋 Welcome ${displayName}`}
        description="Real-time smart agricultural intelligence, crop health telemetry, and AI advisory overview."
        badge={
          <Badge variant="emerald" dot>
            Authenticated Farmer Dashboard
          </Badge>
        }
        action={
          <Link href="/ai-assistant">
            <Button variant="emerald" leftIcon={<Bot className="w-4 h-4" />}>
              Ask KrishiMitra
            </Button>
          </Link>
        }
      />

      {/* Analytics Service Failure Banner with Retry */}
      {analyticsError && (
        <Card variant="glass" className="border-rose-200 bg-rose-50/50 mb-6">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-rose-900">Analytics Service Issue</h4>
                <p className="text-xs text-rose-700">{analyticsError}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboardData}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="border-rose-300 text-rose-800 hover:bg-rose-100 shrink-0"
            >
              Retry Sync
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Farmer Profile Card */}
      <div className="mb-8">
        <Card variant="glass" className="border-emerald-200/80 shadow-md">
          {loading && !dbUser && !clerkUser ? (
            <div className="p-6 flex items-center justify-center gap-3">
              <Spinner size="md" />
              <span className="text-sm font-medium text-slate-600">
                Synchronizing user profile...
              </span>
            </div>
          ) : (
            <div className="p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Profile Picture */}
              <div className="relative shrink-0">
                {dbUser?.image || clerkUser?.imageUrl ? (
                  <img
                    src={dbUser?.image || clerkUser?.imageUrl}
                    alt={displayName}
                    className="w-20 h-20 rounded-2xl object-cover ring-4 ring-emerald-500/20 shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-emerald-500/20 shadow-md">
                    {displayName.charAt(0)}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] text-white">
                  ✓
                </span>
              </div>

              {/* Profile Information */}
              <div className="flex-1 w-full text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {displayName}
                    </h3>
                    <p className="text-sm font-medium text-slate-500">
                      {dbUser?.email || clerkUser?.primaryEmailAddress?.emailAddress}
                    </p>
                  </div>
                </div>

                {/* Profile Meta Grid */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
                  <div className="bg-white/80 rounded-xl p-3 border border-slate-200/80 shadow-xs flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Role
                      </span>
                      <span className="text-sm font-bold text-slate-800">
                        {dbUser?.role || "Farmer"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/80 rounded-xl p-3 border border-slate-200/80 shadow-xs flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Language
                      </span>
                      <span className="text-sm font-bold text-slate-800">
                        {dbUser?.language || "English"}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-2 sm:col-span-1 bg-white/80 rounded-xl p-3 border border-slate-200/80 shadow-xs flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Account Status
                      </span>
                      <span className="text-sm font-bold text-emerald-600">
                        Verified
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Smart Farm Intelligence Card */}
      <SmartFarmIntelligenceCard />

      {/* Real KPI Cards */}

      <GridContainer cols={4}>
        {/* KPI 1: Total Disease Scans */}
        <Card variant="glass" hoverEffect>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Disease Scans
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5" />
            </div>
          </div>
          {loading ? (
            <div className="h-9 w-24 bg-slate-200/60 rounded-lg animate-pulse my-1" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {analytics?.stats?.diseaseAnalysesCount ?? 0}
              </span>
              <Badge variant="emerald" className="text-[10px]">
                {analytics?.diseaseAnalytics?.diseaseDetectedCount
                  ? `${analytics.diseaseAnalytics.diseaseDetectedCount} Detected`
                  : "All Clear"}
              </Badge>
            </div>
          )}
          <p className="text-xs text-slate-400 mt-2">
            Crop diagnostics performed by AI vision engine
          </p>
        </Card>

        {/* KPI 2: Healthy Crop Rate */}
        <Card variant="glass" hoverEffect>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Healthy Crop Rate
            </span>
            <div className="w-9 h-9 rounded-2xl bg-teal-100/80 text-teal-700 flex items-center justify-center">
              <Sprout className="w-5 h-5" />
            </div>
          </div>
          {loading ? (
            <div className="h-9 w-24 bg-slate-200/60 rounded-lg animate-pulse my-1" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {analytics?.cropHealth?.healthyPercentage ?? 0}%
              </span>
              <Badge variant="info" className="text-[10px]">
                {analytics?.cropHealth?.healthyCount ?? 0} Healthy Scans
              </Badge>
            </div>
          )}
          <p className="text-xs text-slate-400 mt-2">
            Percentage of diagnosed crops free of disease
          </p>
        </Card>

        {/* KPI 3: Saved Soil Recommendations */}
        <Card variant="glass" hoverEffect>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Saved Soil Advisories
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-100/80 text-amber-700 flex items-center justify-center">
              <CloudSun className="w-5 h-5" />
            </div>
          </div>
          {loading ? (
            <div className="h-9 w-24 bg-slate-200/60 rounded-lg animate-pulse my-1" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {analytics?.stats?.soilRecommendationsCount ?? 0}
              </span>
              <Badge variant="warning" className="text-[10px]">
                {analytics?.soilCropInsights?.hasData
                  ? `Top: ${analytics.soilCropInsights.mostRecommendedCrop}`
                  : "No Saved Tests"}
              </Badge>
            </div>
          )}
          <p className="text-xs text-slate-400 mt-2">
            Soil health tests & NPK fertilizer recommendations
          </p>
        </Card>

        {/* KPI 4: Farm Health Score */}
        <Card variant="gradient" hoverEffect>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Farm Health Score
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          {loading ? (
            <div className="h-9 w-24 bg-slate-200/60 rounded-lg animate-pulse my-1" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {analytics?.farmHealth?.overallScore !== null &&
                analytics?.farmHealth?.overallScore !== undefined
                  ? `${analytics.farmHealth.overallScore}/100`
                  : "N/A"}
              </span>
            </div>
          )}
          <p className="text-xs text-emerald-700 font-medium mt-2">
            Status: {analytics?.farmHealth?.status || "Insufficient data"}
          </p>
        </Card>
      </GridContainer>

      {/* Quick Actions Launcher */}
      <div className="pt-2">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          Quick Actions Launcher
        </h3>
        <GridContainer cols={4}>
          <Link href="/disease-detection" className="group">
            <Card variant="glass" className="h-full hover:border-emerald-300 transition-all p-5 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Disease Diagnostics
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Upload leaf photos for instant AI pathogen diagnosis & cure advisories.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-semibold text-emerald-600 gap-1 group-hover:translate-x-1 transition-transform">
                Launch Diagnostics <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Card>
          </Link>

          <Link href="/ai-assistant" className="group">
            <Card variant="glass" className="h-full hover:border-emerald-300 transition-all p-5 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Bot className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                  KrishiMitra Copilot
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Chat with multi-lingual AI assistant for personalized crop guidance.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-semibold text-teal-600 gap-1 group-hover:translate-x-1 transition-transform">
                Open KrishiMitra <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Card>
          </Link>

          <Link href="/weather-soil" className="group">
            <Card variant="glass" className="h-full hover:border-emerald-300 transition-all p-5 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <CloudSun className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                  Weather & Soil
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Real-time weather forecasts, soil health scores & fertilizer recommendations.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-semibold text-amber-600 gap-1 group-hover:translate-x-1 transition-transform">
                Check Weather & Soil <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Card>
          </Link>

          <Link href="/analytics" className="group">
            <Card variant="glass" className="h-full hover:border-emerald-300 transition-all p-5 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                  Farm Analytics
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Deep historical trends, disease breakdown graphs & comprehensive reports.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-semibold text-indigo-600 gap-1 group-hover:translate-x-1 transition-transform">
                View Farm Analytics <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Card>
          </Link>
        </GridContainer>
      </div>

      {/* Main Content Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        {/* Left Column (2/3 width on desktop) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Disease Diagnostics Activity */}
          <Card variant="glass" hoverEffect={false}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-emerald-600" />
                  Recent Disease Diagnostics
                </CardTitle>
                <CardDescription>
                  Latest leaf scan results & pathogen risk analysis.
                </CardDescription>
              </div>
              <Link href="/disease-detection">
                <Button variant="ghost" size="sm" className="text-emerald-700">
                  View All Scans
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  <SkeletonCard />
                </div>
              ) : diseaseActivities.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {diseaseActivities.slice(0, 5).map((activity) => (
                    <div
                      key={activity.id}
                      className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                          <Activity className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-slate-800">
                            {activity.title}
                          </h5>
                          <p className="text-xs text-slate-500">{activity.subtitle}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-medium text-slate-400 shrink-0">
                        {activity.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No Disease Diagnostics Yet"
                  description="Scan crop leaves with AI to detect diseases early and protect your yield."
                  icon={<BrainCircuit className="w-8 h-8 text-emerald-600" />}
                  actionLabel="Start New Diagnostic"
                  onAction={() => router.push("/disease-detection")}
                />
              )}
            </CardContent>
          </Card>

          {/* AI Advisory & Engine Highlights */}
          <Card variant="glass" hoverEffect={false}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                KrishiEngine AI Advisory Highlights
              </CardTitle>
              <CardDescription>
                Smart insights generated from your farm activity and soil telemetry.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
                  <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
                </div>
              ) : analytics?.aiInsights && analytics.aiInsights.length > 0 ? (
                <div className="space-y-3">
                  {analytics.aiInsights.map((insight, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 flex items-start gap-3"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {insight}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  Run your first crop disease scan or soil health check to unlock AI advisory insights.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1/3 width on desktop) */}
        <div className="space-y-8">
          {/* Weather & Soil Telemetry Summary */}
          <Card variant="glass" hoverEffect={false}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CloudSun className="w-5 h-5 text-amber-600" />
                Weather & Soil Telemetry
              </CardTitle>
              <CardDescription>
                Current field conditions and saved soil advisories.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <SkeletonCard />
              ) : analytics?.weatherAnalytics?.hasData || analytics?.soilCropInsights?.hasData ? (
                <div className="space-y-4">
                  {/* Weather Snippet */}
                  {analytics?.weatherAnalytics?.hasData && (
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-200/80">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-amber-900">
                          {analytics.weatherAnalytics.recentCity || "Local Region"}
                        </span>
                        <Badge variant="warning" className="text-[10px]">
                          Weather Sync
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                        <div className="bg-white/80 p-2 rounded-xl">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Temp</span>
                          <span className="text-xs font-extrabold text-slate-800">
                            {analytics.weatherAnalytics.avgTemperature !== null
                              ? `${analytics.weatherAnalytics.avgTemperature}°C`
                              : "N/A"}
                          </span>
                        </div>
                        <div className="bg-white/80 p-2 rounded-xl">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Humidity</span>
                          <span className="text-xs font-extrabold text-slate-800">
                            {analytics.weatherAnalytics.avgHumidity !== null
                              ? `${analytics.weatherAnalytics.avgHumidity}%`
                              : "N/A"}
                          </span>
                        </div>
                        <div className="bg-white/80 p-2 rounded-xl">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Rain</span>
                          <span className="text-xs font-extrabold text-slate-800">
                            {analytics.weatherAnalytics.avgRainProbability !== null
                              ? `${analytics.weatherAnalytics.avgRainProbability}%`
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Soil Snippet */}
                  {analytics?.soilCropInsights?.hasData && (
                    <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Top Crop Choice</span>
                        <span className="text-xs font-extrabold text-emerald-700">
                          {analytics.soilCropInsights.mostRecommendedCrop}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="text-xs font-bold text-slate-700">Soil Health Score</span>
                        <span className="text-xs font-extrabold text-slate-800">
                          {analytics.soilCropInsights.averageSoilScore}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="text-xs font-bold text-slate-700">Recommended Fertilizer</span>
                        <span className="text-xs font-semibold text-slate-600 text-right max-w-[140px] truncate">
                          {analytics.soilCropInsights.mostCommonFertilizer}
                        </span>
                      </div>
                    </div>
                  )}

                  <Link href="/weather-soil" className="block pt-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Full Weather & Soil Telemetry
                    </Button>
                  </Link>
                </div>
              ) : (
                <EmptyState
                  title="No Weather or Soil Telemetry"
                  description="Check local weather forecasts or test soil health to generate telemetry."
                  icon={<CloudSun className="w-8 h-8 text-amber-600" />}
                  actionLabel="Check Weather & Soil"
                  onAction={() => router.push("/weather-soil")}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
