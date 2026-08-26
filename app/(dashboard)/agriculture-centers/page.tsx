"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  RefreshCw,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Landmark,
} from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AgricultureCenterCard } from "@/components/agriculture-centers/AgricultureCenterCard";
import { CenterFilters } from "@/components/agriculture-centers/CenterFilters";
import { CenterDetailsModal } from "@/components/agriculture-centers/CenterDetailsModal";
import {
  AgricultureCenterType,
  IAgricultureCenter,
  IAgricultureCenterResponse,
} from "@/types/agriculture-center";

const KARNATAKA_DISTRICTS = [
  "Bagalkot",
  "Ballari",
  "Belagavi",
  "Bengaluru Rural",
  "Bengaluru Urban",
  "Bidar",
  "Chamarajanagar",
  "Chikkaballapur",
  "Chikkamagaluru",
  "Chitradurga",
  "Dakshina Kannada",
  "Davanagere",
  "Dharwad",
  "Gadag",
  "Hassan",
  "Haveri",
  "Kalaburagi",
  "Kodagu",
  "Kolar",
  "Koppal",
  "Mandya",
  "Mysuru",
  "Raichur",
  "Ramanagara",
  "Shivamogga",
  "Tumakuru",
  "Udupi",
  "Uttara Kannada",
  "Vijayapura",
  "Yadgir",
  "Vijayanagara",
];

const MAHARASHTRA_DISTRICTS = [
  "Ahmednagar / Ahilyanagar",
  "Akola",
  "Amravati",
  "Aurangabad / Chhatrapati Sambhajinagar",
  "Beed",
  "Bhandara",
  "Buldhana",
  "Chandrapur",
  "Dhule",
  "Gadchiroli",
  "Gondia",
  "Hingoli",
  "Jalgaon",
  "Jalna",
  "Kolhapur",
  "Latur",
  "Mumbai City",
  "Mumbai Suburban",
  "Nagpur",
  "Nanded",
  "Nandurbar",
  "Nashik",
  "Osmanabad / Dharashiv",
  "Palghar",
  "Parbhani",
  "Pune",
  "Raigad",
  "Ratnagiri",
  "Sangli",
  "Satara",
  "Sindhudurg",
  "Solapur",
  "Thane",
  "Wardha",
  "Washim",
  "Yavatmal",
];

export default function AgricultureCentersPage() {
  const [selectedState, setSelectedState] = useState<string>("Karnataka");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("All Districts");
  const [selectedType, setSelectedType] = useState<AgricultureCenterType | "All">("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [radiusKm, setRadiusKm] = useState<number>(50);
  const [page, setPage] = useState<number>(1);

  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isGeoLoading, setIsGeoLoading] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const [data, setData] = useState<IAgricultureCenterResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [selectedCenterModal, setSelectedCenterModal] = useState<IAgricultureCenter | null>(null);

  // Handle State Change: Immediately reset district to "All Districts" and reset page to 1
  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    setSelectedDistrict("All Districts");
    setPage(1);
  };

  // Fetch Agriculture Centers from API
  const fetchCenters = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMsg(null);

    try {
      const params = new URLSearchParams();
      params.append("state", selectedState);
      if (selectedDistrict && selectedDistrict !== "All Districts") {
        params.append("district", selectedDistrict);
      }
      if (selectedType && selectedType !== "All") params.append("type", selectedType);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());
      params.append("page", String(page));
      params.append("limit", "12");

      if (userCoords) {
        params.append("lat", String(userCoords.lat));
        params.append("lng", String(userCoords.lng));
        params.append("radius", String(radiusKm));
      }

      params.append("t", String(Date.now()));

      const res = await fetch(`/api/agriculture-centers?${params.toString()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });

      const json: IAgricultureCenterResponse = await res.json();

      if (res.ok && json.success) {
        setData(json);
      } else {
        throw new Error(json.error || "Unable to load agriculture centers.");
      }
    } catch (err) {
      console.error("Error fetching agriculture centers:", err);
      const msg = err instanceof Error ? err.message : "Unable to load agriculture centers.";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedState, selectedDistrict, selectedType, searchQuery, radiusKm, page, userCoords]);

  useEffect(() => {
    fetchCenters(false);
  }, [fetchCenters]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedDistrict, selectedType, searchQuery, radiusKm, userCoords]);

  // Browser Geolocation Handler
  const handleEnableLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    setIsGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        setIsGeoLoading(false);
      },
      (error) => {
        console.warn("Geolocation permission error:", error);
        let msg = "Unable to retrieve location.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "Location permission denied.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = "Location information is unavailable.";
        } else if (error.code === error.TIMEOUT) {
          msg = "Location request timed out.";
        }
        setGeoError(msg);
        setIsGeoLoading(false);
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleClearLocation = () => {
    setUserCoords(null);
    setGeoError(null);
  };

  const handleResetFilters = () => {
    setSelectedState("Karnataka");
    setSelectedDistrict("All Districts");
    setSelectedType("All");
    setSearchQuery("");
    setRadiusKm(50);
    setUserCoords(null);
    setGeoError(null);
    setPage(1);
  };

  const pagination = data?.pagination;
  const centers = data?.centers || [];
  const availableStates = ["Karnataka", "Maharashtra"];
  const availableDistricts = selectedState === "Maharashtra" ? MAHARASHTRA_DISTRICTS : KARNATAKA_DISTRICTS;

  return (
    <PageContainer className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Nearby Agriculture Support Centers"
        description="Discover official Krishi Vigyan Kendras (KVKs), Government Agriculture Department offices, Soil Testing Labs, and Agricultural Universities."
        badge={
          <Badge variant="emerald" className="gap-1.5 px-3 py-1 text-xs font-bold">
            <Building2 className="w-3.5 h-3.5" />
            Verified Government Catalog
          </Badge>
        }
        action={
          <Button
            variant="emerald"
            size="sm"
            disabled={isLoading || isRefreshing}
            onClick={() => fetchCenters(true)}
            className="rounded-xl shadow-md gap-1.5 text-xs font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Updating..." : "Refresh Catalog"}</span>
          </Button>
        }
      />

      {/* Filter Controls Bar */}
      <section>
        <CenterFilters
          selectedState={selectedState}
          setSelectedState={setSelectedState}
          selectedDistrict={selectedDistrict}
          setSelectedDistrict={setSelectedDistrict}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          radiusKm={radiusKm}
          setRadiusKm={setRadiusKm}
          userCoords={userCoords}
          onEnableLocation={handleEnableLocation}
          onClearLocation={handleClearLocation}
          onResetFilters={handleResetFilters}
          availableStates={availableStates}
          availableDistricts={availableDistricts}
          isGeoLoading={isGeoLoading}
          geoError={geoError}
        />
      </section>

      {/* Active Results Summary Indicator */}
      {pagination && !isLoading && (
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              Showing <strong className="text-slate-800">{centers.length}</strong> of{" "}
              <strong className="text-slate-800">{pagination.total}</strong> verified centers
              {userCoords ? ` within ${radiusKm} km radius` : ""}
            </span>
          </div>
          {pagination.totalPages > 1 && (
            <div className="font-mono text-slate-600 font-bold">
              Page {pagination.page} of {pagination.totalPages}
            </div>
          )}
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="h-64 rounded-3xl bg-slate-100/80 animate-pulse border border-slate-200/60 p-5 space-y-4"
            >
              <div className="h-4 bg-slate-200 rounded-lg w-1/3" />
              <div className="h-6 bg-slate-200 rounded-lg w-3/4" />
              <div className="h-12 bg-slate-200 rounded-2xl w-full" />
              <div className="h-10 bg-slate-200 rounded-2xl w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && errorMsg && (
        <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200/80 text-center space-y-4 max-w-lg mx-auto my-8">
          <div className="p-3 w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-rose-900">
              Unable to load agriculture centers
            </h3>
            <p className="text-xs text-rose-700">{errorMsg}</p>
          </div>
          <Button
            variant="emerald"
            size="sm"
            onClick={() => fetchCenters(true)}
            className="rounded-xl gap-2 font-bold text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Query</span>
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !errorMsg && centers.length === 0 && (
        <div className="py-16 text-center space-y-4 max-w-md mx-auto">
          <div className="p-4 w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200/80">
            <Landmark className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-800">
              No verified agriculture centers found
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No government centers matched your current location or filter criteria. Try selecting another state or expanding your search radius.
            </p>
          </div>
          <Button
            variant="emerald"
            size="sm"
            onClick={handleResetFilters}
            className="rounded-xl gap-2 font-bold text-xs shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </Button>
        </div>
      )}

      {/* Verified Centers Grid */}
      {!isLoading && !errorMsg && centers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
        >
          {centers.map((center) => (
            <AgricultureCenterCard
              key={center._id}
              center={center}
              onViewDetails={setSelectedCenterModal}
            />
          ))}
        </motion.div>
      )}

      {/* Pagination Bar */}
      {pagination && pagination.totalPages > 1 && !isLoading && (
        <div className="flex items-center justify-center gap-3 pt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            className="rounded-xl border-slate-200 text-xs font-bold gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          <div className="text-xs font-bold font-mono text-slate-700 px-3 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200/60">
            {page} / {pagination.totalPages}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
            className="rounded-xl border-slate-200 text-xs font-bold gap-1"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Details View Modal */}
      <CenterDetailsModal
        center={selectedCenterModal}
        isOpen={!!selectedCenterModal}
        onClose={() => setSelectedCenterModal(null)}
      />
    </PageContainer>
  );
}
