"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BrainCircuit,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  Info,
  Sparkles,
  RefreshCw,
  ArrowRight,
  Sprout,
  CloudSun,
  Activity,
  CheckSquare,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loading";
import {
  IFarmIntelligenceResponse,
  IFarmActionRecommendation,
} from "@/types/farm-intelligence";

export function SmartFarmIntelligenceCard() {
  const [data, setData] = useState<IFarmIntelligenceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIntelligence = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const timestamp = Date.now();
      const res = await fetch(`/api/farm-intelligence?t=${timestamp}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });

      const result = await res.json().catch(() => null);

      if (res.ok && result?.success) {
        setData(result);
      } else {
        setError(
          result?.error || "Failed to load Smart Farm Intelligence data."
        );
      }
    } catch (err) {
      console.error("Error fetching Smart Farm Intelligence:", err);
      setError("An unexpected error occurred while loading farm intelligence.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIntelligence();
  }, [fetchIntelligence]);

  if (loading) {
    return (
      <Card variant="glass" className="border-emerald-200/80 mb-8 shadow-sm">
        <CardContent className="p-6 flex items-center justify-center gap-3">
          <Spinner size="md" />
          <span className="text-sm font-medium text-slate-600">
            Analyzing farm risk & generating smart intelligence...
          </span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="glass" className="border-rose-200 bg-rose-50/30 mb-8">
        <CardContent className="p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-rose-900">
                Farm Intelligence Sync Issue
              </h4>
              <p className="text-xs text-rose-700">{error}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchIntelligence}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            className="border-rose-300 text-rose-800 hover:bg-rose-100 shrink-0"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isInsufficient = data?.riskLevel === "INSUFFICIENT DATA";
  const riskLevel = data?.riskLevel || "INSUFFICIENT DATA";
  const dataQuality = data?.dataQuality || "LIMITED DATA";

  // Visual Styling variants based on Risk Level
  let riskBadgeVariant: "danger" | "warning" | "emerald" | "outline" = "outline";
  let riskHeaderBg = "bg-slate-50/80 border-slate-200";

  let riskIcon = <Info className="w-5 h-5 text-slate-600" />;

  if (riskLevel === "HIGH") {
    riskBadgeVariant = "danger";
    riskHeaderBg = "bg-rose-50/90 border-rose-200 text-rose-900";
    riskIcon = <ShieldAlert className="w-5 h-5 text-rose-600" />;
  } else if (riskLevel === "MODERATE") {
    riskBadgeVariant = "warning";
    riskHeaderBg = "bg-amber-50/90 border-amber-200 text-amber-900";
    riskIcon = <AlertCircle className="w-5 h-5 text-amber-600" />;
  } else if (riskLevel === "LOW") {
    riskBadgeVariant = "emerald";
    riskHeaderBg = "bg-emerald-50/90 border-emerald-200 text-emerald-900";
    riskIcon = <ShieldCheck className="w-5 h-5 text-emerald-600" />;
  }

  // Category Icon & Badge mapping helper
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "Disease":
        return <Badge variant="danger" className="text-[10px] gap-1"><BrainCircuit className="w-3 h-3" /> Disease Action</Badge>;
      case "Weather":
        return <Badge variant="warning" className="text-[10px] gap-1"><CloudSun className="w-3 h-3" /> Weather Action</Badge>;
      case "Soil":
        return <Badge variant="emerald" className="text-[10px] gap-1"><Sprout className="w-3 h-3" /> Soil & Crop Action</Badge>;
      default:
        return <Badge variant="info" className="text-[10px] gap-1"><Activity className="w-3 h-3" /> Monitoring</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "High":
        return <Badge variant="danger" className="text-[10px] font-bold">High Priority</Badge>;
      case "Medium":
        return <Badge variant="warning" className="text-[10px] font-bold">Medium Priority</Badge>;
      default:
        return <Badge variant="emerald" className="text-[10px] font-bold">Low Priority</Badge>;
    }
  };

  return (
    <Card variant="glass" className="border-emerald-200/90 shadow-md mb-8 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-emerald-900/5 via-teal-900/5 to-transparent border-b border-emerald-100 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shrink-0">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                Smart Farm Intelligence
                <Badge variant="emerald" className="text-[10px] uppercase font-bold tracking-wider">
                  AI Evaluated
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Rule-based explainable risk analysis & advisory derived from your real farm telemetry.
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Badge variant="outline" className="text-xs font-semibold bg-white/80 border-slate-200 text-slate-700">
              Quality: <span className="font-bold text-slate-900 ml-1">{dataQuality}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* INSUFFICIENT DATA EMPTY STATE */}
        {isInsufficient ? (
          <div className="p-6 rounded-2xl bg-slate-50/90 border border-dashed border-slate-300 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 mx-auto flex items-center justify-center">
              <Sprout className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto">
              <h4 className="text-base font-bold text-slate-900">
                Not enough farm data yet
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {data?.advisory ||
                  "Run a crop disease diagnostic scan or save a soil recommendation report to calculate smart farm intelligence and personalized risk advisories."}
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link href="/disease-detection">
                <Button variant="emerald" size="sm" leftIcon={<BrainCircuit className="w-4 h-4" />}>
                  Run Disease Diagnostic
                </Button>
              </Link>
              <Link href="/weather-soil">
                <Button variant="outline" size="sm" leftIcon={<Sprout className="w-4 h-4" />}>
                  Save Soil Report
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* OVERALL RISK BANNER */}
            <div className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${riskHeaderBg}`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/90 shadow-xs shrink-0">
                  {riskIcon}
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Overall Farm Risk Status
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xl font-black tracking-tight">
                      {riskLevel} RISK
                    </span>
                    <Badge variant={riskBadgeVariant} className="text-xs px-2.5 py-0.5 font-bold">
                      {riskLevel}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-600 bg-white/70 px-3 py-2 rounded-xl border border-white/60">
                Data Confidence: <span className="font-bold text-slate-800">{dataQuality}</span>
              </div>
            </div>

            {/* TWO COLUMNS: REASONS & ADVISORY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* KEY REASONS */}
              <div className="bg-white/80 p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Info className="w-4 h-4 text-emerald-600" />
                  Key Risk Evaluation Reasons
                </h4>

                {data?.reasons && data.reasons.length > 0 ? (
                  <ul className="space-y-2.5">
                    {data.reasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500">
                    No specific risk indicators recorded.
                  </p>
                )}
              </div>

              {/* RECOMMENDED ACTION / ADVISORY */}
              <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-transparent p-5 rounded-2xl border border-emerald-200/80 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Farmer Intelligence Advisory
                  </h4>
                  <p className="text-xs text-slate-800 mt-2.5 leading-relaxed font-semibold">
                    "{data?.advisory}"
                  </p>
                </div>

                <div className="pt-2 border-t border-emerald-200/50 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">
                    Based on trusted telemetry
                  </span>
                  <Link href="/analytics" className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
                    View Full Analytics <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* RECOMMENDED ACTIONS FOR FARMER WITH TRACEABLE EVIDENCE */}
            {data?.recommendations && data.recommendations.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    Recommended Actions for Farmer
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {data.recommendations.length} Action Items
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="bg-white/90 p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-colors flex flex-col justify-between space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        {getCategoryBadge(rec.category)}
                        {getPriorityBadge(rec.priority)}
                      </div>

                      <div>
                        <h5 className="text-xs font-bold text-slate-900 leading-snug">
                          {rec.title}
                        </h5>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {rec.description}
                        </p>
                      </div>

                      {/* TRACEABLE EVIDENCE FOOTER */}
                      <div className="pt-2 border-t border-slate-100/80 flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                        <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">
                          <span className="font-bold text-slate-700">Why:</span> {rec.evidence}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
