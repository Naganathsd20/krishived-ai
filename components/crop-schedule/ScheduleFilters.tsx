"use client";

import React from "react";
import { Search, Filter, Sprout, MapPin, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CropScheduleStatus } from "@/types/crop-schedule";

interface ScheduleFiltersProps {
  selectedCrop: string;
  setSelectedCrop: (val: string) => void;
  selectedField: string;
  setSelectedField: (val: string) => void;
  selectedStatus: string;
  setSelectedStatus: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  availableCrops: string[];
  availableFields: string[];
  onResetFilters: () => void;
}

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "All" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Due Today", value: "Due Today" },
  { label: "Overdue", value: "Overdue" },
  { label: "Completed", value: "completed" },
  { label: "Skipped", value: "skipped" },
];

export const ScheduleFilters: React.FC<ScheduleFiltersProps> = ({
  selectedCrop,
  setSelectedCrop,
  selectedField,
  setSelectedField,
  selectedStatus,
  setSelectedStatus,
  searchQuery,
  setSearchQuery,
  availableCrops,
  availableFields,
  onResetFilters,
}) => {
  const hasActiveFilters =
    selectedCrop !== "All Crops" ||
    selectedField !== "All Fields" ||
    selectedStatus !== "All" ||
    searchQuery !== "";

  return (
    <div className="space-y-4 p-5 rounded-3xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-sm">
      {/* Top Search Bar & Reset Action */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Field */}
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, crops, activity titles, or notes..."
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

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            className="rounded-2xl border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold gap-1 px-3 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </Button>
        )}
      </div>

      {/* Dropdown Filters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Crop Filter Dropdown */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Sprout className="w-3 h-3 text-emerald-600" />
            Filter by Crop
          </label>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-100/80 border border-slate-200/60 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
          >
            <option value="All Crops">All Crops</option>
            {availableCrops.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Field Filter Dropdown */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-600" />
            Filter by Field / Plot
          </label>
          <select
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-100/80 border border-slate-200/60 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
          >
            <option value="All Fields">All Fields</option>
            {availableFields.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter Dropdown */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3 h-3 text-emerald-600" />
            Filter Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-100/80 border border-slate-200/60 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
          >
            {STATUS_OPTIONS.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
