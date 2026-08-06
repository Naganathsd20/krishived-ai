"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sprout,
  Droplets,
  Pill,
  HelpCircle,
  Zap,
  Calendar,
  MapPin,
  Thermometer,
  Wind,
  Gauge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GridContainer } from "@/components/layout/container";
import { ISoilRecommendationDocument } from "@/types/soil";

interface ViewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: ISoilRecommendationDocument | null;
}

export const ViewDetailsModal: React.FC<ViewDetailsModalProps> = ({
  isOpen,
  onClose,
  recommendation,
}) => {
  if (!isOpen || !recommendation) return null;

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "High":
        return <Badge variant="danger">Disease Risk: High</Badge>;
      case "Medium":
        return <Badge variant="warning">Disease Risk: Medium</Badge>;
      default:
        return <Badge variant="emerald">Disease Risk: Low</Badge>;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-3xl bg-white/95 backdrop-blur-xl border border-emerald-200/80 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col my-auto"
        >
          {/* Modal Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/50 via-white to-teal-50/40">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Saved AI Soil Advisory
                  </span>
                  <span className="text-xs text-slate-400">• {recommendation.city}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {recommendation.bestCrop}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
            {/* Meta Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>{recommendation.city}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-amber-500" />
                  <span>{recommendation.temperature}°C, {recommendation.humidity}% Humidity</span>
                </div>
                <div className="flex items-center gap-1.5 hidden sm:flex">
                  <Wind className="w-4 h-4 text-blue-500" />
                  <span>{recommendation.windSpeed} km/h</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getRiskBadge(recommendation.diseaseRiskLevel)}
                <Badge variant="glass" className="bg-emerald-100 text-emerald-900 border-emerald-300 font-bold">
                  {recommendation.soilHealthScore}
                </Badge>
              </div>
            </div>

            {/* Alternative Crops */}
            {recommendation.alternativeCrops.length > 0 && (
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Alternative Recommended Crops:
                </span>
                <div className="flex flex-wrap gap-2">
                  {recommendation.alternativeCrops.map((crop, idx) => (
                    <Badge key={idx} variant="glass" className="text-xs bg-slate-100 text-slate-800 border-slate-200">
                      🌱 {crop}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations Grid */}
            <GridContainer cols={2}>
              {/* Irrigation */}
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80 space-y-2">
                <div className="flex items-center gap-2 text-teal-900 font-bold text-xs uppercase tracking-wider">
                  <Droplets className="w-4 h-4 text-teal-600" />
                  <span>Irrigation Strategy</span>
                </div>
                <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                  {recommendation.irrigationRecommendation}
                </p>
              </div>

              {/* Fertilizer */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                  <Pill className="w-4 h-4 text-emerald-600" />
                  <span>Fertilizer & NPK Dosage</span>
                </div>
                <p className="text-xs font-semibold text-emerald-950 leading-relaxed">
                  {recommendation.fertilizerRecommendation}
                </p>
              </div>
            </GridContainer>

            {/* Scientific Rationale */}
            {recommendation.explanations && (
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200/70 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-indigo-900 font-bold uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4 text-indigo-600" />
                  <span>Agronomic Scientific Rationale</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  {recommendation.explanations.cropChoice}
                </p>
              </div>
            )}

            {/* Field Tips */}
            {recommendation.farmingTips.length > 0 && (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Practical Field Operation Tips</span>
                </div>
                <ul className="space-y-1.5">
                  {recommendation.farmingTips.map((tip, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Saved Date */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Saved on: {recommendation.createdAt ? new Date(recommendation.createdAt).toLocaleString() : "Recent"}</span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">ID: {recommendation._id}</span>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close Report
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
