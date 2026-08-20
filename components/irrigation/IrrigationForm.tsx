"use client";

import React, { useState } from "react";
import {
  Sprout,
  Maximize2,
  Gauge,
  Zap,
  MapPin,
  RotateCcw,
  Sparkles,
  Droplets,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AreaUnit, IIrrigationRequest, IrrigationMethod, SoilType } from "@/types/irrigation";

interface IrrigationFormProps {
  onSubmit: (request: IIrrigationRequest) => void;
  onReset: () => void;
  isLoading: boolean;
  userDefaultLocation?: string;
  userDefaultCrop?: string;
}

const COMMON_CROPS = [
  "Wheat",
  "Paddy",
  "Cotton",
  "Tomato",
  "Sugarcane",
  "Maize",
  "Groundnut",
  "Mustard",
  "Onion",
  "Potato",
  "Soybean",
  "Pulses",
  "Chili",
  "Banana",
];

const HP_PRESET_OPTIONS = [
  { hp: 1, label: "1 HP (5,000 L/hr est.)", flow: 5000 },
  { hp: 2, label: "2 HP (10,000 L/hr est.)", flow: 10000 },
  { hp: 3, label: "3 HP (15,000 L/hr est.)", flow: 15000 },
  { hp: 5, label: "5 HP (25,000 L/hr est.) — Most Common", flow: 25000 },
  { hp: 7.5, label: "7.5 HP (38,000 L/hr est.)", flow: 38000 },
  { hp: 10, label: "10 HP (50,000 L/hr est.)", flow: 50000 },
];

export const IrrigationForm: React.FC<IrrigationFormProps> = ({
  onSubmit,
  onReset,
  isLoading,
  userDefaultLocation = "Pune",
  userDefaultCrop = "Wheat",
}) => {
  const [crop, setCrop] = useState<string>(userDefaultCrop || "Wheat");
  const [customCrop, setCustomCrop] = useState<string>("");
  const [isCustomCrop, setIsCustomCrop] = useState<boolean>(false);

  const [area, setArea] = useState<string>("2");
  const [areaUnit, setAreaUnit] = useState<AreaUnit>("Acre");
  const [irrigationMethod, setIrrigationMethod] = useState<IrrigationMethod>("Drip");
  const [soilType, setSoilType] = useState<SoilType>("Loam");
  const [location, setLocation] = useState<string>(userDefaultLocation);

  // Pump Capacity Mode: "preset" vs "custom"
  const [pumpMode, setPumpMode] = useState<"preset" | "custom">("preset");
  const [selectedHP, setSelectedHP] = useState<number>(5);
  const [customFlowRate, setCustomFlowRate] = useState<string>("25000");

  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const activeCrop = isCustomCrop ? customCrop.trim() : crop.trim();
    if (!activeCrop) {
      setFormError("Please specify a valid crop name.");
      return;
    }

    const areaNum = parseFloat(area);
    if (isNaN(areaNum) || areaNum <= 0) {
      setFormError("Field area must be a positive number greater than 0.");
      return;
    }

    if (areaNum > 10000) {
      setFormError("Field area cannot exceed 10,000 acres/hectares.");
      return;
    }

    let payloadHP: number | undefined = undefined;
    let payloadFlowRate: number | undefined = undefined;

    if (pumpMode === "preset") {
      payloadHP = selectedHP;
    } else {
      const flowNum = parseFloat(customFlowRate);
      if (isNaN(flowNum) || flowNum <= 0) {
        setFormError("Please enter a valid positive pump flow rate in Litres/hour.");
        return;
      }
      payloadFlowRate = flowNum;
      if (selectedHP > 0) payloadHP = selectedHP;
    }

    onSubmit({
      crop: activeCrop,
      area: areaNum,
      areaUnit,
      irrigationMethod,
      pumpHP: payloadHP,
      flowRate: payloadFlowRate,
      soilType,
      location: location.trim() || "Pune",
    });
  };

  const handleFormReset = () => {
    setCrop(userDefaultCrop || "Wheat");
    setCustomCrop("");
    setIsCustomCrop(false);
    setArea("2");
    setAreaUnit("Acre");
    setIrrigationMethod("Drip");
    setSoilType("Loam");
    setLocation(userDefaultLocation || "Pune");
    setPumpMode("preset");
    setSelectedHP(5);
    setCustomFlowRate("25000");
    setFormError(null);
    onReset();
  };

  return (
    <Card variant="glass" className="border-emerald-200/60 shadow-glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-emerald-100/80 text-emerald-700">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">
                Irrigation Calculator Parameters
              </CardTitle>
              <CardDescription className="text-xs">
                Enter your crop, field area, pump flow, and soil characteristics
              </CardDescription>
            </div>
          </div>
          <Badge variant="emerald" className="gap-1 px-2.5 py-1 text-[11px] font-bold">
            <Sparkles className="w-3 h-3" />
            FAO-56 Engine
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {formError && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* 1. Crop Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sprout className="w-3.5 h-3.5 text-emerald-600" />
              <span>Target Crop</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={isCustomCrop ? "Other" : crop}
                onChange={(e) => {
                  if (e.target.value === "Other") {
                    setIsCustomCrop(true);
                  } else {
                    setIsCustomCrop(false);
                    setCrop(e.target.value);
                  }
                }}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white/90 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              >
                {COMMON_CROPS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="Other">Other Custom Crop...</option>
              </select>

              {isCustomCrop && (
                <input
                  type="text"
                  placeholder="Enter crop name (e.g. Garlic, Barley)"
                  value={customCrop}
                  onChange={(e) => setCustomCrop(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white/90 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              )}
            </div>
          </div>

          {/* 2. Field Area & Unit */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Field Area & Unit</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="10000"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="2.0"
                className="col-span-2 h-10 px-3 rounded-xl border border-slate-200 bg-white/90 text-xs font-bold text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
              <select
                value={areaUnit}
                onChange={(e) => setAreaUnit(e.target.value as AreaUnit)}
                className="h-10 px-3 rounded-xl border border-slate-200 bg-white/90 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              >
                <option value="Acre">Acres</option>
                <option value="Hectare">Hectares</option>
              </select>
            </div>
          </div>

          {/* 3. Irrigation Method & Soil Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-sky-600" />
                <span>Irrigation Method</span>
              </label>
              <select
                value={irrigationMethod}
                onChange={(e) => setIrrigationMethod(e.target.value as IrrigationMethod)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white/90 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              >
                <option value="Drip">Drip Irrigation (~90% Efficiency)</option>
                <option value="Sprinkler">Sprinkler System (~75% Efficiency)</option>
                <option value="Center Pivot">Center Pivot (~80% Efficiency)</option>
                <option value="Furrow">Furrow Irrigation (~60% Efficiency)</option>
                <option value="Flood">Flood / Surface (~50% Efficiency)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-amber-600" />
                <span>Soil Texture</span>
              </label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value as SoilType)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white/90 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              >
                <option value="Loam">Loam (Optimal Balance)</option>
                <option value="Sandy">Sandy (High Drainage / Low Holding)</option>
                <option value="Clay">Clay (High Water Retention)</option>
                <option value="Silty Loam">Silty Loam (Rich Alluvial)</option>
                <option value="Clay Loam">Clay Loam (Heavy Fertile)</option>
                <option value="Black Cotton">Black Cotton (Deep Swelling Clay)</option>
              </select>
            </div>
          </div>

          {/* 4. Pump Capacity & Flow Rate UX */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Pump Capacity & Delivery Flow Rate</span>
              </label>

              {/* Pump Mode Switcher */}
              <div className="flex items-center p-0.5 rounded-xl bg-slate-200/70 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setPumpMode("preset")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    pumpMode === "preset"
                      ? "bg-white text-emerald-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  HP Presets
                </button>
                <button
                  type="button"
                  onClick={() => setPumpMode("custom")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    pumpMode === "custom"
                      ? "bg-white text-emerald-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Custom L/hr
                </button>
              </div>
            </div>

            {pumpMode === "preset" ? (
              <div className="space-y-1.5">
                <select
                  value={selectedHP}
                  onChange={(e) => setSelectedHP(parseFloat(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                >
                  {HP_PRESET_OPTIONS.map((item) => (
                    <option key={item.hp} value={item.hp}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>
                    Preset uses estimated baseline flow rate of{" "}
                    <strong className="text-slate-700">
                      {HP_PRESET_OPTIONS.find((p) => p.hp === selectedHP)?.flow.toLocaleString()}{" "}
                      L/hour
                    </strong>
                    .
                  </span>
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="relative">
                  <input
                    type="number"
                    step="500"
                    min="1000"
                    max="1000000"
                    value={customFlowRate}
                    onChange={(e) => setCustomFlowRate(e.target.value)}
                    placeholder="25000"
                    className="w-full h-10 px-3 pr-20 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                  <span className="absolute right-3 top-2.5 text-[11px] font-bold text-slate-400">
                    Litres/hour
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-sky-600 shrink-0" />
                  <span>
                    Exact farmer-provided flow rate takes full precedence over standard HP estimates.
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* 5. Location Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>Farm Location (For Live Weather Telemetry)</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Pune, Nashik, Ludhiana"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white/90 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={handleFormReset}
              className="rounded-xl border-slate-200 text-xs font-bold gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </Button>

            <Button
              type="submit"
              variant="emerald"
              size="sm"
              disabled={isLoading}
              className="flex-1 rounded-xl shadow-md text-xs font-bold gap-2 py-2.5"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Computing Water Requirements...</span>
                </>
              ) : (
                <>
                  <Droplets className="w-4 h-4" />
                  <span>Calculate Irrigation Plan</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
