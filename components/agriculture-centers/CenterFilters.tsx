"use client";

import React, { useState } from "react";
import {
  Search,
  MapPin,
  Filter,
  Navigation,
  RotateCcw,
  Compass,
  Info,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AgricultureCenterType } from "@/types/agriculture-center";

interface CenterFiltersProps {
  selectedState: string;
  setSelectedState: (val: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (val: string) => void;
  selectedType: AgricultureCenterType | "All";
  setSelectedType: (val: AgricultureCenterType | "All") => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  radiusKm: number;
  setRadiusKm: (val: number) => void;
  userCoords: { lat: number; lng: number } | null;
  onEnableLocation: () => void;
  onClearLocation: () => void;
  onResetFilters: () => void;
  availableStates: string[];
  availableDistricts: string[];
  isGeoLoading: boolean;
  geoError: string | null;
}

const CENTER_TYPES: { label: string; value: AgricultureCenterType | "All" }[] = [
  { label: "All Centers", value: "All" },
  { label: "KVKs (Krishi Vigyan Kendras)", value: "KVK" },
  { label: "Govt Agriculture Offices", value: "GovtOffice" },
  { label: "Agri Universities & ICAR", value: "University" },
  { label: "Soil Testing Labs", value: "SoilLab" },
  { label: "Farmer Support Centers", value: "FarmerService" },
];

const RADIUS_OPTIONS = [5, 10, 25, 50, 100];

export const CenterFilters: React.FC<CenterFiltersProps> = ({
  selectedState,
  setSelectedState,
  selectedDistrict,
  setSelectedDistrict,
  selectedType,
  setSelectedType,
  searchQuery,
  setSearchQuery,
  radiusKm,
  setRadiusKm,
  userCoords,
  onEnableLocation,
  onClearLocation,
  onResetFilters,
  availableStates,
  availableDistricts,
  isGeoLoading,
  geoError,
}) => {
  const [showGpsDisclosure, setShowGpsDisclosure] = useState<boolean>(false);

  const hasActiveFilters =
    selectedState !== "All States" ||
    selectedDistrict !== "All Districts" ||
    selectedType !== "All" ||
    searchQuery !== "" ||
    userCoords !== null;

  return (
    <div className="space-y-4 p-5 rounded-3xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-sm">
      {/* Top Bar: Search Input & GPS Location Button */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Field */}
        <div className="relative w-full md:flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by center name, city, or address..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100/80 border border-slate-200/60 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* GPS Geolocation Toggle & Action */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          {userCoords ? (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-2xl text-xs">
              <Compass className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span className="font-extrabold text-emerald-900">GPS Active</span>
              <button
                onClick={onClearLocation}
                className="text-[10px] font-bold text-emerald-700 underline hover:text-emerald-900 ml-1"
              >
                Clear GPS
              </button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled={isGeoLoading}
              onClick={() => setShowGpsDisclosure(true)}
              className="rounded-2xl border-emerald-200 text-emerald-800 hover:bg-emerald-50 text-xs font-bold gap-1.5 w-full md:w-auto"
            >
              <Navigation className={`w-3.5 h-3.5 text-emerald-600 ${isGeoLoading ? "animate-spin" : ""}`} />
              <span>{isGeoLoading ? "Locating..." : "Use Current Location"}</span>
            </Button>
          )}

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="rounded-2xl border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold gap-1 px-3"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* GPS Disclosure Banner */}
      {showGpsDisclosure && !userCoords && (
        <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200/80 space-y-2 text-xs text-sky-900">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 font-bold">
              <Info className="w-4 h-4 text-sky-600 shrink-0" />
              <span>Browser Geolocation Notice</span>
            </div>
            <button
              onClick={() => setShowGpsDisclosure(false)}
              className="text-[10px] font-bold text-sky-700 hover:text-sky-900"
            >
              Dismiss
            </button>
          </div>
          <p className="text-[11px] leading-relaxed text-sky-800">
            Your location will be used ephemerally to compute distances to nearby Krishi Vigyan Kendras, Government offices, and Soil Testing Labs. Your coordinates are never stored on our database.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="emerald"
              size="sm"
              onClick={() => {
                setShowGpsDisclosure(false);
                onEnableLocation();
              }}
              className="rounded-xl text-xs font-bold px-3 py-1"
            >
              Grant Permission & Locate
            </Button>
          </div>
        </div>
      )}

      {geoError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
          {geoError} — Reverting to State/District manual search.
        </div>
      )}

      {/* Dropdown Filters & Radius Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* State Dropdown */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-600" />
            Select State
          </label>
          <select
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedDistrict("All Districts");
            }}
            className="w-full px-3 py-2 rounded-xl bg-slate-100/80 border border-slate-200/60 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
          >
            <option value="All States">All States</option>
            {availableStates.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* District Dropdown */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3 h-3 text-emerald-600" />
            Select District
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-100/80 border border-slate-200/60 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
          >
            <option value="All Districts">All Districts</option>
            {availableDistricts.map((dst) => (
              <option key={dst} value={dst}>
                {dst}
              </option>
            ))}
          </select>
        </div>

        {/* Distance Radius Filter (Active when GPS is present) */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Compass className="w-3 h-3 text-emerald-600" />
            Search Radius (km)
          </label>
          <select
            value={radiusKm}
            onChange={(e) => setRadiusKm(parseInt(e.target.value, 10))}
            className="w-full px-3 py-2 rounded-xl bg-slate-100/80 border border-slate-200/60 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
          >
            {RADIUS_OPTIONS.map((r) => (
              <option key={r} value={r}>
                Within {r} km
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Center Type Pill Selector */}
      <div className="space-y-1.5 pt-1">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <Building2 className="w-3 h-3 text-emerald-600" />
          Filter Center Category
        </label>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CENTER_TYPES.map((t) => {
            const isSelected = selectedType === t.value;
            return (
              <button
                key={t.value}
                onClick={() => setSelectedType(t.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
