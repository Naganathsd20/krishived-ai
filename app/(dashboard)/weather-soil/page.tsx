"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CloudSun,
  Sprout,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sparkles,
  Droplets,
  Zap,
  BookmarkPlus,
  History,
  Clock,
  Pill,
  HelpCircle,
  Eye,
  Trash2,
  Check,
  MapPin,
  Thermometer,
  Calendar,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  GridContainer,
} from "@/components/layout/container";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/weather/SearchBar";
import { WeatherCard } from "@/components/weather/WeatherCard";
import { WeatherDetailCard } from "@/components/weather/WeatherDetailCard";
import { ViewDetailsModal } from "@/components/soil/ViewDetailsModal";
import { DeleteConfirmModal } from "@/components/soil/DeleteConfirmModal";
import { IWeatherData } from "@/types/weather";
import { ISoilRecommendationDocument, ISoilRecommendationResult } from "@/types/soil";

export default function WeatherSoilPage() {
  const [currentCity, setCurrentCity] = useState("Pune");
  const [weatherData, setWeatherData] = useState<IWeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"weather" | "soil" | "history">("weather");

  // AI Soil Recommendation State
  const [soilResult, setSoilResult] = useState<ISoilRecommendationResult | null>(null);
  const [isGeneratingSoil, setIsGeneratingSoil] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Saved Soil History State
  const [soilHistory, setSoilHistory] = useState<ISoilRecommendationDocument[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Modal States
  const [viewModalRec, setViewModalRec] = useState<ISoilRecommendationDocument | null>(null);
  const [deleteModalRecId, setDeleteModalRecId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSoilHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch("/api/soil-recommendation");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.history)) {
          setSoilHistory(data.history);
        }
      }
    } catch (err) {
      console.error("Failed to load soil history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadWeatherAndSoil = async (city: string) => {
    setIsLoadingWeather(true);
    setErrorMsg(null);
    setSoilResult(null);

    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      const data = await res.json();

      if (res.ok && data.success && data.data) {
        setWeatherData(data.data);
        setCurrentCity(data.data.city);

        // Automatically trigger AI Soil Recommendation for the region
        generateSoilAnalysis(data.data);
      } else {
        throw new Error(data.error || `Could not find weather data for "${city}".`);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch weather telemetry.";
      setErrorMsg(message);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const generateSoilAnalysis = async (weather: IWeatherData) => {
    setIsGeneratingSoil(true);
    try {
      const res = await fetch("/api/soil-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weather }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.recommendation) {
        setSoilResult(data.recommendation);
      }
    } catch (err) {
      console.error("Error generating soil recommendation:", err);
    } finally {
      setIsGeneratingSoil(false);
    }
  };

  useEffect(() => {
    loadWeatherAndSoil("Pune");
    fetchSoilHistory();
  }, []);

  const handleSearchSubmit = (city: string) => {
    loadWeatherAndSoil(city);
  };

  // Check if current soil recommendation is already saved in history
  const isCurrentSaved = Boolean(
    soilResult &&
      soilHistory.some(
        (item) => item.city.toLowerCase() === soilResult.city.toLowerCase()
      )
  );

  const handleSaveRecommendation = async () => {
    if (!soilResult) return;

    if (isCurrentSaved) {
      setToastMsg("Recommendation already saved.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/soil-recommendation/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(soilResult),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.alreadySaved) {
          setToastMsg("Recommendation already saved.");
        } else {
          setToastMsg("Soil recommendation saved successfully!");
        }
        await fetchSoilHistory();
      } else {
        throw new Error(data.error || "Failed to save recommendation.");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save recommendation.";
      setErrorMsg(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalRecId) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/soil-recommendation/${deleteModalRecId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setToastMsg("✅ Recommendation deleted successfully.");
        // Immediately refresh list & update count
        setSoilHistory((prev) => prev.filter((item) => item._id !== deleteModalRecId));
        setDeleteModalRecId(null);
      } else {
        throw new Error(data.error || "Failed to delete recommendation.");
      }
    } catch (err) {
      setToastMsg("❌ Failed to delete recommendation.");
    } finally {
      setIsDeleting(false);
    }
  };

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
    <PageContainer>
      {/* View Details Modal */}
      <ViewDetailsModal
        isOpen={Boolean(viewModalRec)}
        onClose={() => setViewModalRec(null)}
        recommendation={viewModalRec}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteModalRecId)}
        onClose={() => setDeleteModalRecId(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />

      {/* Page Header */}
      <PageHeader
        title="🌦️ Weather & AI Soil Intelligence"
        description="Real-time atmospheric telemetry, micro-climate insights, and Google Gemini AI soil health & crop advisory engine."
        badge={
          <Badge variant="emerald" dot>
            Gemini AI Powered
          </Badge>
        }
      />

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Search Bar & City Selector */}
        <SearchBar onSearch={handleSearchSubmit} isLoading={isLoadingWeather} />

        {/* Toast Notification */}
        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span className="text-sm font-semibold">{toastMsg}</span>
              </div>
              <button
                onClick={() => setToastMsg(null)}
                className="text-xs underline font-medium hover:opacity-80"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Switcher */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <Button
              variant={activeTab === "weather" ? "emerald" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("weather")}
              leftIcon={<CloudSun className="w-4 h-4" />}
            >
              Weather Telemetry
            </Button>
            <Button
              variant={activeTab === "soil" ? "emerald" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("soil")}
              leftIcon={<Sprout className="w-4 h-4" />}
            >
              AI Soil & Crop Advisory
            </Button>
            <Button
              variant={activeTab === "history" ? "emerald" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("history")}
              leftIcon={<History className="w-4 h-4" />}
            >
              Saved Reports ({soilHistory.length})
            </Button>
          </div>

          {weatherData && (
            <Badge variant="glass" className="hidden md:inline-flex text-xs">
              Region: {weatherData.city}, {weatherData.country}
            </Badge>
          )}
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-sm"
            >
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Tab Content */}
        {activeTab === "weather" && (
          isLoadingWeather ? (
            <Card variant="glass" className="p-8 text-center flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              <span className="text-sm font-semibold text-slate-600">
                Fetching live atmospheric telemetry for "{currentCity}"...
              </span>
            </Card>
          ) : weatherData ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <WeatherCard weather={weatherData} />
              <WeatherDetailCard weather={weatherData} />
            </motion.div>
          ) : null
        )}

        {activeTab === "soil" && (
          isGeneratingSoil ? (
            <Card variant="glass" className="p-8 text-center flex flex-col items-center justify-center space-y-4 bg-gradient-to-r from-emerald-900 to-teal-900 text-white">
              <Sparkles className="w-10 h-10 text-emerald-400 animate-spin" />
              <div>
                <h4 className="text-lg font-bold">Gemini AI Generating Soil & Crop Report...</h4>
                <p className="text-xs text-emerald-200 mt-1">
                  Correlating temperature ({weatherData?.temperature}°C), humidity ({weatherData?.humidity}%), and atmospheric pressure with soil fertility indexes...
                </p>
              </div>
            </Card>
          ) : soilResult ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Top Summary Card */}
              <Card variant="glass" className="border-emerald-200 bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/20 shadow-xl p-6 sm:p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-100 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 shrink-0">
                      <Sprout className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                          AI Agronomic Soil Report
                        </span>
                        <span className="text-xs text-slate-400">• {soilResult.city} Region</span>
                      </div>
                      <h2 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                        Recommended: {soilResult.bestCrop}
                      </h2>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {getRiskBadge(soilResult.diseaseRiskLevel)}
                    <Badge variant="glass" className="bg-emerald-100 text-emerald-900 border-emerald-300 font-bold">
                      {soilResult.soilHealthScore}
                    </Badge>

                    {/* Improved Save Button State */}
                    {isCurrentSaved ? (
                      <Button
                        variant="emerald"
                        size="sm"
                        disabled
                        leftIcon={<Check className="w-4 h-4 text-emerald-700" />}
                        className="bg-emerald-100/90 text-emerald-800 border border-emerald-300/80 cursor-not-allowed shadow-none"
                      >
                        ✓ Saved
                      </Button>
                    ) : (
                      <Button
                        variant="emerald"
                        size="sm"
                        onClick={handleSaveRecommendation}
                        isLoading={isSaving}
                        leftIcon={<BookmarkPlus className="w-4 h-4" />}
                      >
                        Save Recommendation
                      </Button>
                    )}
                  </div>
                </div>

                {/* Alternative Crops */}
                <div className="mt-6 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Alternative Recommended Crops:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {soilResult.alternativeCrops.map((crop, idx) => (
                      <Badge key={idx} variant="glass" className="text-xs bg-white text-slate-800 border-slate-200">
                        🌱 {crop}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Detail Recommendations Grid */}
              <GridContainer cols={2}>
                {/* Irrigation Strategy Card */}
                <Card variant="glass">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Droplets className="w-5 h-5 text-teal-600" />
                      <CardTitle>Irrigation Strategy</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm font-bold text-slate-900 leading-relaxed">
                      {soilResult.irrigationRecommendation}
                    </p>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
                      <strong className="text-slate-800">Telemetry Reason:</strong> {soilResult.explanations?.irrigation}
                    </div>
                  </CardContent>
                </Card>

                {/* Fertilizer Formulation Card */}
                <Card variant="glass">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Pill className="w-5 h-5 text-emerald-600" />
                      <CardTitle>Fertilizer & NPK Dosage</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm font-bold text-emerald-950 leading-relaxed">
                      {soilResult.fertilizerRecommendation}
                    </p>
                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-900">
                      <strong className="text-emerald-950">Nutrient Rationale:</strong> {soilResult.explanations?.fertilizer}
                    </div>
                  </CardContent>
                </Card>
              </GridContainer>

              {/* Explanations & Practical Farming Tips */}
              <GridContainer cols={2}>
                {/* Scientific Explanation */}
                <Card variant="glass">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-indigo-600" />
                      <CardTitle>Agronomic Scientific Rationale</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs text-slate-600 leading-relaxed">
                    <p>
                      <strong className="text-slate-900">Crop Choice Rationale:</strong> {soilResult.explanations?.cropChoice}
                    </p>
                  </CardContent>
                </Card>

                {/* Practical Farming Tips */}
                <Card variant="glass">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-500" />
                      <CardTitle>Practical Field Operations Tips</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {soilResult.farmingTips.map((tip, idx) => (
                        <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </GridContainer>
            </motion.div>
          ) : null
        )}

        {/* Saved History Tab */}
        {activeTab === "history" && (
          <Card variant="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-emerald-600" />
                  <CardTitle>Saved Soil Reports</CardTitle>
                </div>
                <Badge variant="glass" className="text-xs">
                  {soilHistory.length} Saved Records
                </Badge>
              </div>
              <CardDescription>
                View your previously saved AI soil and crop recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Loading saved soil reports...</span>
                </div>
              ) : soilHistory.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No saved soil recommendations yet. Search for a location and save your first recommendation.
                </div>
              ) : (
                <div className="space-y-4">
                  {soilHistory.map((item, idx) => (
                    <div
                      key={item._id || idx}
                      className="p-5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs hover:border-emerald-400 transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        {/* Title & Meta Info */}
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                            <Sprout className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-extrabold text-slate-900">
                                🌱 {item.bestCrop}
                              </h4>
                              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                                {item.city}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium mt-1">
                              <span className="flex items-center gap-1">
                                <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                                🌡 {item.temperature}°C, {item.humidity}% humidity
                              </span>
                              <span>•</span>
                              <span className="text-emerald-700 font-semibold">
                                🌱 {item.soilHealthScore}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-slate-400">
                                <Calendar className="w-3.5 h-3.5" />
                                📅 {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Recent"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {getRiskBadge(item.diseaseRiskLevel)}
                        </div>
                      </div>

                      {/* Summary Excerpt */}
                      <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                        <strong className="text-slate-800">Irrigation:</strong> {item.irrigationRecommendation}
                      </div>

                      {/* Card Action Buttons (Requirement #6) */}
                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setViewModalRec(item)}
                          leftIcon={<Eye className="w-4 h-4 text-emerald-600" />}
                          className="hover:bg-emerald-50 hover:border-emerald-300 text-xs font-semibold"
                        >
                          View Details
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteModalRecId(item._id || null)}
                          leftIcon={<Trash2 className="w-4 h-4" />}
                          className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 text-xs font-semibold transition-all hover:scale-105"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
