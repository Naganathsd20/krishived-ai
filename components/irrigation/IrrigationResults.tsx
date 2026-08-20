"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Droplets,
  CloudRain,
  Clock,
  Gauge,
  Info,
  AlertTriangle,
  CheckCircle2,
  CloudSun,
  ShieldAlert,
  Zap,
  TrendingDown,
  FileCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IIrrigationCalculationResult } from "@/types/irrigation";

interface IrrigationResultsProps {
  data: IIrrigationCalculationResult;
}

export const IrrigationResults: React.FC<IrrigationResultsProps> = ({ data }) => {
  const {
    crop,
    area,
    areaUnit,
    areaInSqMeters,
    irrigationMethod,
    soilType,
    methodEfficiency,
    soilFactor,
    cropKc,
    referenceET0MmPerDay,
    dailyETcDepthMm,
    estimatedCropWaterReqLitres,
    grossWaterReqBeforeRainLitres,
    forecastRainfallMm,
    effectiveRainfallMm,
    effectiveRainfallLitres,
    netWaterReqLitres,
    pumpHP,
    pumpFlowRateLph,
    isFlowRatePreset,
    flowRateSource,
    irrigationDurationHours,
    irrigationDurationMinutes,
    irrigationDurationFormatted,
    weatherData,
    dataFreshness,
    assumptions,
    warnings,
    disclaimer,
  } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* 1. Primary KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Estimated Crop Water Need */}
        <Card variant="glass" className="p-4 border-emerald-200/80 bg-emerald-50/20">
          <CardContent className="p-0 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-emerald-800 font-bold">
              <span>Gross Water Need</span>
              <Droplets className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-950 font-mono tracking-tight">
              {grossWaterReqBeforeRainLitres.toLocaleString()} <span className="text-xs font-semibold text-emerald-700">L</span>
            </div>
            <p className="text-[11px] text-emerald-700/90 font-medium">
              Daily ETc: <strong className="font-mono">{dailyETcDepthMm} mm</strong> across {area} {areaUnit}
            </p>
          </CardContent>
        </Card>

        {/* Rainfall Contribution */}
        <Card variant="glass" className="p-4 border-sky-200/80 bg-sky-50/20">
          <CardContent className="p-0 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-sky-800 font-bold">
              <span>Rainfall Credit</span>
              <CloudRain className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-extrabold text-sky-950 font-mono tracking-tight">
              {effectiveRainfallLitres.toLocaleString()} <span className="text-xs font-semibold text-sky-700">L</span>
            </div>
            <p className="text-[11px] text-sky-700/90 font-medium">
              {forecastRainfallMm > 0 ? (
                <span>
                  Rain: <strong className="font-mono">{forecastRainfallMm} mm</strong> (75% eff: {effectiveRainfallMm} mm)
                </span>
              ) : (
                "No rain expected today"
              )}
            </p>
          </CardContent>
        </Card>

        {/* Net Irrigation Requirement */}
        <Card variant="glass" className="p-4 border-teal-200/80 bg-gradient-to-br from-teal-50/50 to-emerald-50/50">
          <CardContent className="p-0 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-teal-900 font-bold">
              <span>Net Irrigation Need</span>
              <TrendingDown className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-extrabold text-teal-950 font-mono tracking-tight">
              {netWaterReqLitres.toLocaleString()} <span className="text-xs font-semibold text-teal-700">L</span>
            </div>
            <p className="text-[11px] text-teal-700 font-medium">
              {netWaterReqLitres === 0 ? "Rain satisfies crop demand" : "Required net water volume"}
            </p>
          </CardContent>
        </Card>

        {/* Estimated Duration */}
        <Card variant="glass" className="p-4 border-amber-200/80 bg-amber-50/20">
          <CardContent className="p-0 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-amber-900 font-bold">
              <span>Estimated Duration</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl font-extrabold text-amber-950 font-mono tracking-tight">
              {irrigationDurationFormatted}
            </div>
            <p className="text-[11px] text-amber-800 font-medium">
              Flow: <strong className="font-mono">{pumpFlowRateLph.toLocaleString()} L/hr</strong>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2. Weather Telemetry & Freshness Card */}
      <Card variant="glass" className="border-slate-200/80">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
                <CloudSun className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Live Weather Telemetry ({weatherData.city})
                </CardTitle>
                <CardDescription className="text-xs">
                  Server weather evaluation at calculation time
                </CardDescription>
              </div>
            </div>

            <Badge
              variant={weatherData.isWeatherAvailable ? "emerald" : "outline"}
              className="text-[10px] px-2 py-0.5"
            >
              {dataFreshness}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 text-xs">
            <div>
              <span className="text-slate-500 font-medium block text-[11px]">Condition</span>
              <strong className="text-slate-900 font-semibold">{weatherData.condition}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium block text-[11px]">Temperature</span>
              <strong className="text-slate-900 font-mono font-semibold">{weatherData.temperature}°C</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium block text-[11px]">Humidity</span>
              <strong className="text-slate-900 font-mono font-semibold">{weatherData.humidity}%</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium block text-[11px]">Rain Probability</span>
              <strong className="text-slate-900 font-mono font-semibold">{weatherData.rainProbability}%</strong>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Pump & Agronomic Parameters Breakdown */}
      <Card variant="glass" className="border-slate-200/80">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                <Gauge className="w-4 h-4" />
              </div>
              <CardTitle className="text-base font-bold text-slate-900">
                Agronomic & Pump Capacity Breakdown
              </CardTitle>
            </div>

            <Badge
              variant={isFlowRatePreset ? "info" : "emerald"}
              className="text-[10px] px-2.5 py-0.5 font-bold"
            >
              {isFlowRatePreset ? `Estimated ${pumpHP || ""} HP Preset` : "Farmer-Provided Flow Rate"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-2 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/50">
              <span className="text-slate-500 text-[11px] block font-medium">Crop Coefficient (Kc)</span>
              <strong className="text-slate-900 font-mono text-sm">{cropKc}</strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/50">
              <span className="text-slate-500 text-[11px] block font-medium">Reference ETo</span>
              <strong className="text-slate-900 font-mono text-sm">{referenceET0MmPerDay} mm/day</strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/50">
              <span className="text-slate-500 text-[11px] block font-medium">Method Efficiency (Ea)</span>
              <strong className="text-slate-900 font-mono text-sm">{Math.round(methodEfficiency * 100)}% ({irrigationMethod})</strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/50">
              <span className="text-slate-500 text-[11px] block font-medium">Soil Retention (Sf)</span>
              <strong className="text-slate-900 font-mono text-sm">{soilFactor} ({soilType})</strong>
            </div>
          </div>

          {/* Interpretation Summary */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white space-y-2 shadow-md">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
              <FileCheck className="w-4 h-4" />
              <span>Irrigation Summary & Farmer Interpretation</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              For your <strong className="text-white">{area} {areaUnit}</strong> field of{" "}
              <strong className="text-white">{crop}</strong> using <strong className="text-white">{irrigationMethod}</strong>,
              the total net water requirement is <strong className="text-emerald-300 font-mono">{netWaterReqLitres.toLocaleString()} Litres</strong>.
              At your delivery capacity of <strong className="text-emerald-300 font-mono">{pumpFlowRateLph.toLocaleString()} L/hr</strong>,
              we recommend operating your pump for approximately <strong className="text-emerald-300">{irrigationDurationFormatted}</strong> today.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 4. Non-blocking Warnings & Data Quality Banners */}
      {warnings && warnings.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Calculation Notes & Warnings</span>
          </div>
          <ul className="space-y-1 pl-6 list-disc text-xs text-amber-800/90 font-medium">
            {warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 5. Assumptions List */}
      {assumptions && assumptions.length > 0 && (
        <Card variant="glass" className="border-slate-200/60 p-4">
          <CardContent className="p-0 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Info className="w-4 h-4 text-sky-600" />
              <span>Agronomic Model Assumptions</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
              {assumptions.map((a, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* 6. Agronomic Disclaimer Notice */}
      <div className="p-3.5 rounded-2xl bg-slate-100/70 border border-slate-200/60 flex items-start gap-2.5 text-[11px] text-slate-500 leading-relaxed">
        <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>{disclaimer}</span>
      </div>
    </motion.div>
  );
};
