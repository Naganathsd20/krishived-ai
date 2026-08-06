"use client";

import React, { useState } from "react";
import { Search, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch: (city: string) => void;
  isLoading?: boolean;
}

const POPULAR_FARMLANDS = [
  "Pune",
  "Nashik",
  "Punjab",
  "Bengaluru",
  "Hyderabad",
  "California",
];

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleChipClick = (city: string) => {
    setQuery(city);
    onSearch(city);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="relative flex-1">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by city or village name (e.g. Pune, Nashik, Punjab)..."
            className="w-full h-13 pl-12 pr-10 text-sm font-medium bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 shadow-sm transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <Button
          type="submit"
          variant="emerald"
          className="ml-2.5 h-13 px-6 rounded-2xl shadow-md shadow-emerald-600/20 shrink-0"
          isLoading={isLoading}
          leftIcon={<Search className="w-4 h-4" />}
        >
          Search Location
        </Button>
      </form>

      {/* Quick Location Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-semibold text-[11px] shrink-0">
          Popular Regions:
        </span>
        {POPULAR_FARMLANDS.map((city) => (
          <button
            key={city}
            type="button"
            onClick={() => handleChipClick(city)}
            className="px-3 py-1 rounded-xl bg-white/70 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-300 text-slate-600 hover:text-emerald-700 font-medium transition-all shrink-0"
          >
            {city}
          </button>
        ))}
      </div>
    </div>
  );
};
