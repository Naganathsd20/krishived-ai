"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Settings,
  Globe,
  MapPin,
  Sprout,
  Bell,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
  ShieldCheck,
  User as UserIcon,
  Mail,
  Info,
  Check,
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
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Spinner, SkeletonCard } from "@/components/ui/loading";
import { MongoUserProfile, NotificationSettings } from "@/types";

const LANGUAGE_OPTIONS = [
  { value: "English", label: "English (Default)" },
  { value: "Hindi", label: "हिंदी (Hindi)" },
  { value: "Kannada", label: "ಕನ್ನಡ (Kannada)" },
  { value: "Marathi", label: "मराठी (Marathi)" },
  { value: "Telugu", label: "తెలుగు (Telugu)" },
];

const CROP_OPTIONS = [
  "Wheat & Mustard",
  "Soybean & Hybrid Maize",
  "Paddy / Rice",
  "Cotton & Sorghum",
  "Turmeric (Haldi)",
  "Tomato & Vegetables",
  "Pigeon Pea (Tur / Arhar)",
  "Chickpea (Gram)",
];

const LOCATION_PRESETS = ["Pune", "Mandya", "Mysuru", "Nagpur", "Nashik", "Bengaluru", "Delhi"];

export default function SettingsPage() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const [dbUser, setDbUser] = useState<MongoUserProfile | null>(null);

  // Form State
  const [language, setLanguage] = useState("English");
  const [defaultLocation, setDefaultLocation] = useState("Pune");
  const [defaultCrop, setDefaultCrop] = useState("Wheat & Mustard");
  const [notifications, setNotifications] = useState<NotificationSettings>({
    diseaseAlerts: true,
    weatherAlerts: true,
    soilAdvisories: true,
  });

  // UI States
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Reset Modal State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const fetchPreferences = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const timestamp = Date.now();
      const res = await fetch(`/api/user/preferences?t=${timestamp}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        if (data.user) setDbUser(data.user);
        if (data.preferences) {
          setLanguage(data.preferences.language || "English");
          setDefaultLocation(data.preferences.defaultLocation || "Pune");
          setDefaultCrop(data.preferences.defaultCrop || "Wheat & Mustard");
          if (data.preferences.notificationPreferences) {
            setNotifications(data.preferences.notificationPreferences);
          }
        }
      } else {
        setErrorMsg(data?.error || "Unable to load preferences. Please try again.");
      }
    } catch (err) {
      console.error("Error loading preferences:", err);
      setErrorMsg("Unable to load preferences. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isClerkLoaded && clerkUser) {
      fetchPreferences();
    }
  }, [isClerkLoaded, clerkUser, fetchPreferences]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!defaultLocation.trim()) {
      setErrorMsg("Default location cannot be empty.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language,
          defaultLocation: defaultLocation.trim(),
          defaultCrop,
          notificationPreferences: notifications,
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        if (data.user) setDbUser(data.user);
        showToast("Preferences saved successfully!");
      } else {
        setErrorMsg(data?.error || "Failed to save preferences. Please try again.");
      }
    } catch (err) {
      console.error("Error saving preferences:", err);
      setErrorMsg("Failed to save preferences. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmReset = () => {
    setLanguage("English");
    setDefaultLocation("Pune");
    setDefaultCrop("Wheat & Mustard");
    setNotifications({
      diseaseAlerts: true,
      weatherAlerts: true,
      soilAdvisories: true,
    });
    setIsResetModalOpen(false);
    showToast("Preferences reset to defaults. Click 'Save Preferences' to persist changes.");
  };

  const farmerName =
    dbUser?.name ||
    clerkUser?.fullName ||
    clerkUser?.firstName ||
    "Farmer";

  const farmerEmail =
    dbUser?.email ||
    clerkUser?.primaryEmailAddress?.emailAddress ||
    "N/A";

  return (
    <PageContainer>
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-xl flex items-center gap-2 border border-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset Preferences to Defaults?"
        description="Are you sure you want to reset your form values to application defaults?"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsResetModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="emerald"
              size="sm"
              onClick={handleConfirmReset}
            >
              Confirm Reset
            </Button>
          </>
        }
      >
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs leading-relaxed space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Reset Notice</span>
          </div>
          <p>
            This will reset language to English, location to Pune, crop to Wheat & Mustard, and turn all notification alerts ON. Your account records will remain completely intact.
          </p>
        </div>
      </Modal>

      {/* Page Header */}
      <PageHeader
        title="Settings & Preferences"
        description="Manage your farm preferences and personalize your KrishiVed AI experience."
        badge={
          <Badge variant="emerald" dot>
            Farmer Preferences
          </Badge>
        }
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsResetModalOpen(true)}
              disabled={loading || isSaving}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset to Defaults
            </Button>
            <Button
              variant="emerald"
              size="sm"
              onClick={handleSave}
              isLoading={isSaving}
              disabled={loading}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Preferences
            </Button>
          </div>
        }
      />

      {/* Error Alert */}
      {errorMsg && (
        <Card variant="glass" className="border-rose-200 bg-rose-50/50 mb-6">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-rose-900">Preferences Notice</h4>
                <p className="text-xs text-rose-700">{errorMsg}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPreferences}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="border-rose-300 text-rose-800 hover:bg-rose-100 shrink-0"
            >
              Retry Sync
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-6 max-w-4xl mx-auto">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <form onSubmit={handleSave} className="max-w-4xl mx-auto space-y-8">
          {/* SECTION 1: FARMER PROFILE SUMMARY CARD */}
          <Card variant="glass" className="border-emerald-200/90 shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-center sm:text-left">
                  {dbUser?.image || clerkUser?.imageUrl ? (
                    <img
                      src={dbUser?.image || clerkUser?.imageUrl}
                      alt={farmerName}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/20 shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-2xl font-bold ring-2 ring-emerald-500/20 shadow-md">
                      {farmerName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{farmerName}</h3>
                    <p className="text-xs text-slate-500 font-medium">{farmerEmail}</p>
                    <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                      Role: {dbUser?.role || "Farmer"}
                    </span>
                  </div>
                </div>

                <Badge variant="emerald" className="px-3 py-1 text-xs font-bold">
                  Verified Farmer Identity
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 2: LANGUAGE & LOCATION PREFERENCES */}
          <GridContainer cols={2}>
            {/* Language Preference */}
            <Card variant="glass" className="border-emerald-200/90 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-600" />
                  <CardTitle className="text-base">Platform Language</CardTitle>
                </div>
                <CardDescription>
                  Select your primary language for KrishiMitra AI consultation and system guidance.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        language === opt.value
                          ? "bg-emerald-50/90 border-emerald-500 text-emerald-950 font-bold shadow-xs"
                          : "bg-white/80 border-slate-200/80 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <span className="text-xs">{opt.label}</span>
                      <input
                        type="radio"
                        name="language"
                        value={opt.value}
                        checked={language === opt.value}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="accent-emerald-600 w-4 h-4"
                      />
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Default Location Preference */}
            <Card variant="glass" className="border-emerald-200/90 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-600" />
                  <CardTitle className="text-base">Default Field Location</CardTitle>
                </div>
                <CardDescription>
                  Set your primary farming city or village for automatic weather & atmospheric telemetry lookup.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Primary Farming City / Region"
                  value={defaultLocation}
                  onChange={(e) => setDefaultLocation(e.target.value)}
                  placeholder="e.g. Pune, Mandya, Mysuru"
                  leftIcon={<MapPin className="w-4 h-4 text-emerald-600" />}
                  required
                />

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Quick City Presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {LOCATION_PRESETS.map((city) => (
                      <button
                        type="button"
                        key={city}
                        onClick={() => setDefaultLocation(city)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-colors ${
                          defaultLocation.toLowerCase() === city.toLowerCase()
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                  Note: Telemetry syncs regional weather forecasts without exposing precise GPS coordinates.
                </p>
              </CardContent>
            </Card>
          </GridContainer>

          {/* SECTION 3: DEFAULT CROP PREFERENCE */}
          <Card variant="glass" className="border-emerald-200/90 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-600" />
                <CardTitle className="text-base">Default Primary Crop Focus</CardTitle>
              </div>
              <CardDescription>
                Select your primary cultivated crop to personalize soil recommendations and NPK fertilizer calculations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {CROP_OPTIONS.map((crop) => (
                  <button
                    type="button"
                    key={crop}
                    onClick={() => setDefaultCrop(crop)}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                      defaultCrop === crop
                        ? "bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500 text-emerald-950 font-extrabold shadow-sm ring-2 ring-emerald-500/20"
                        : "bg-white/80 border-slate-200/80 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Sprout className="w-4 h-4 text-emerald-600" />
                      {defaultCrop === crop && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </div>
                    <span className="text-xs leading-snug">{crop}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SECTION 4: NOTIFICATION PREFERENCES */}
          <Card variant="glass" className="border-emerald-200/90 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-600" />
                <CardTitle className="text-base">Agricultural Notification & Alert Controls</CardTitle>
              </div>
              <CardDescription>
                Enable or disable automated risk notification advisories for your farm profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Toggle 1: Disease Alerts */}
              <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 flex items-center justify-between gap-4">
                <div>
                  <h5 className="text-xs font-bold text-slate-900">Crop Disease Pathogen Alerts</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Receive urgent treatment advisories when leaf diagnostic scans detect high severity pathogens.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      diseaseAlerts: !prev.diseaseAlerts,
                    }))
                  }
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 ${
                    notifications.diseaseAlerts ? "bg-emerald-600" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                      notifications.diseaseAlerts ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 2: Weather Alerts */}
              <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 flex items-center justify-between gap-4">
                <div>
                  <h5 className="text-xs font-bold text-slate-900">Weather & Humidity Alerts</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Receive field moisture warnings when humidity exceeds 75% or high precipitation is expected.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      weatherAlerts: !prev.weatherAlerts,
                    }))
                  }
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 ${
                    notifications.weatherAlerts ? "bg-emerald-600" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                      notifications.weatherAlerts ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 3: Soil Advisories */}
              <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 flex items-center justify-between gap-4">
                <div>
                  <h5 className="text-xs font-bold text-slate-900">Soil Fertility & NPK Advisories</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Receive seasonal recommendations for optimal NPK fertilizer dosage and organic compost timing.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      soilAdvisories: !prev.soilAdvisories,
                    }))
                  }
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 ${
                    notifications.soilAdvisories ? "bg-emerald-600" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                      notifications.soilAdvisories ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* SAVE / ACTIONS FOOTER BAR */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/80">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsResetModalOpen(true)}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Reset to Defaults
            </Button>

            <Button
              type="submit"
              variant="emerald"
              size="lg"
              isLoading={isSaving}
              leftIcon={<Save className="w-5 h-5" />}
              className="w-full sm:w-auto px-8 shadow-lg shadow-emerald-600/25"
            >
              Save Preferences
            </Button>
          </div>
        </form>
      )}
    </PageContainer>
  );
}
