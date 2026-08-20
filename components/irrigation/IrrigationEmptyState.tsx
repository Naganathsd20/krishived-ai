"use client";

import React from "react";
import { Droplets, Sprout, CloudRain, Zap, Calculator, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const IrrigationEmptyState: React.FC = () => {
  return (
    <Card variant="glass" className="border-emerald-200/60 p-8 text-center space-y-6">
      <CardContent className="p-0 space-y-6 max-w-md mx-auto">
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-200/80 shadow-md">
          <Droplets className="w-10 h-10 text-emerald-600" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 animate-ping" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-extrabold text-slate-900">
            Irrigation Water Requirement Calculator
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Fill in your crop, cultivated field area, irrigation method, and pump flow rate in the form to generate an automated FAO-56 crop water recommendation.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 gap-3 text-left pt-2">
          <div className="p-3 rounded-2xl bg-white/80 border border-slate-200/60 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Sprout className="w-3.5 h-3.5 text-emerald-600" />
              <span>FAO-56 Crop Kc</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Agronomic coefficients for Wheat, Paddy, Cotton, Tomato, and 12+ crops.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/80 border border-slate-200/60 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <CloudRain className="w-3.5 h-3.5 text-sky-600" />
              <span>Rainfall Credit</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Live weather telemetry deducts effective rainfall from irrigation need.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/80 border border-slate-200/60 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Pump Presets</span>
            </div>
            <p className="text-[11px] text-slate-500">
              3 HP, 5 HP, 7.5 HP presets or custom flow rate in Litres/hour.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/80 border border-slate-200/60 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Duration Hours</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Calculates exact recommended pump run time in hours and minutes.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
