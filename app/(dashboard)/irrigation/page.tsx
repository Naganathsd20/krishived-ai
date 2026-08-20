"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Droplets, RefreshCw, AlertCircle, Sparkles, Sprout } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IrrigationForm } from "@/components/irrigation/IrrigationForm";
import { IrrigationResults } from "@/components/irrigation/IrrigationResults";
import { IrrigationEmptyState } from "@/components/irrigation/IrrigationEmptyState";
import { IrrigationModuleLinks } from "@/components/irrigation/IrrigationModuleLinks";
import { IIrrigationCalculationResult, IIrrigationRequest, IIrrigationResponse } from "@/types/irrigation";

export default function IrrigationPage() {
  const [calculationResult, setCalculationResult] = useState<IIrrigationCalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<IIrrigationRequest | null>(null);

  const handleCalculate = async (request: IIrrigationRequest) => {
    setIsLoading(true);
    setErrorMessage(null);
    setLastRequest(request);

    try {
      const res = await fetch("/api/irrigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      const json: IIrrigationResponse = await res.json();

      if (res.ok && json.success && json.data) {
        setCalculationResult(json.data);
      } else {
        const msg = json.error || "Unable to compute irrigation requirements.";
        setErrorMessage(msg);
      }
    } catch (err) {
      console.error("Error invoking /api/irrigation:", err);
      const msg = err instanceof Error ? err.message : "Failed to connect to irrigation calculation server.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCalculationResult(null);
    setErrorMessage(null);
    setLastRequest(null);
  };

  const handleRetry = () => {
    if (lastRequest) {
      handleCalculate(lastRequest);
    }
  };

  return (
    <PageContainer className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Irrigation Planning & Water Requirement"
        description="FAO-56 Crop Evapotranspiration (ETc) calculation engine. Computes precise net water requirements, rainfall credit adjustments, pump delivery flow rates, and operating durations."
        badge={
          <Badge variant="emerald" className="gap-1.5 px-3 py-1 text-xs font-bold">
            <Droplets className="w-3.5 h-3.5" />
            FAO-56 Irrigation Engine
          </Badge>
        }
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={handleReset}
              className="rounded-xl border-slate-200 text-xs font-bold gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Reset State</span>
            </Button>
          </div>
        }
      />

      {/* Main Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Farmer Input Form (5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-4">
          <IrrigationForm
            onSubmit={handleCalculate}
            onReset={handleReset}
            isLoading={isLoading}
            userDefaultLocation="Pune"
            userDefaultCrop="Wheat"
          />
        </div>

        {/* Right Column: Output / Results / Loading / Empty / Error (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-4">
          {/* 1. Loading Skeleton State */}
          {isLoading && (
            <div className="space-y-4">
              <div className="h-28 rounded-3xl bg-slate-100/90 animate-pulse border border-slate-200/60 p-5 flex items-center justify-between">
                <div className="space-y-2 w-2/3">
                  <div className="h-4 bg-slate-200 rounded-md w-1/2" />
                  <div className="h-6 bg-slate-200 rounded-md w-3/4" />
                </div>
                <div className="h-10 w-10 rounded-2xl bg-slate-200" />
              </div>
              <div className="h-48 rounded-3xl bg-slate-100/90 animate-pulse border border-slate-200/60 p-5 space-y-3">
                <div className="h-5 bg-slate-200 rounded-md w-1/3" />
                <div className="h-12 bg-slate-200 rounded-2xl w-full" />
                <div className="h-12 bg-slate-200 rounded-2xl w-full" />
              </div>
              <div className="h-40 rounded-3xl bg-slate-100/90 animate-pulse border border-slate-200/60 p-5" />
            </div>
          )}

          {/* 2. Error State */}
          {!isLoading && errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-3xl bg-rose-50 border border-rose-200/80 text-center space-y-4 max-w-lg mx-auto my-4 shadow-sm"
            >
              <div className="p-3 w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-rose-900">
                  Irrigation Calculation Failed
                </h3>
                <p className="text-xs text-rose-700 font-medium leading-relaxed">
                  {errorMessage}
                </p>
              </div>
              {lastRequest && (
                <Button
                  variant="emerald"
                  size="sm"
                  onClick={handleRetry}
                  className="rounded-xl gap-2 font-bold text-xs shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Calculation</span>
                </Button>
              )}
            </motion.div>
          )}

          {/* 3. Empty State (Before first calculation) */}
          {!isLoading && !errorMessage && !calculationResult && (
            <IrrigationEmptyState />
          )}

          {/* 4. Calculation Results Dashboard */}
          {!isLoading && !errorMessage && calculationResult && (
            <IrrigationResults data={calculationResult} />
          )}
        </div>
      </div>

      {/* Bottom Cross-Module Navigation */}
      <IrrigationModuleLinks />
    </PageContainer>
  );
}
