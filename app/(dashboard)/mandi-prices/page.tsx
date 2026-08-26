"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Store,
  RefreshCw,
  Search,
  Filter,
  MapPin,
  Tag,
  Calendar,
  Building2,
  BadgeIndianRupee,
  CheckCircle2,
  AlertTriangle,
  Info,
  RotateCcw,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Layers,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
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
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner, SkeletonCard } from "@/components/ui/loading";
import { IMandiPrice, IMandiPriceResponse } from "@/types/mandi";

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

export default function MandiPricesPage() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();

  // Filters State
  const [stateFilter, setStateFilter] = useState<string>("Karnataka");
  const [districtFilter, setDistrictFilter] = useState<string>("Dharwad");
  const [commodityFilter, setCommodityFilter] = useState<string>("Wheat");
  const [marketFilter, setMarketFilter] = useState<string>("");

  // Data State
  const [mandiData, setMandiData] = useState<IMandiPriceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const initialFetchedRef = React.useRef(false);

  // Fetch Farmer Default Preferences & Initial Mandi Prices on mount
  useEffect(() => {
    if (!isClerkLoaded || !clerkUser || initialFetchedRef.current) return;
    initialFetchedRef.current = true;

    async function loadFarmerPreferencesAndFetch() {
      let initialDistrict = "Dharwad";
      let initialCommodity = "Wheat";

      try {
        const res = await fetch("/api/user/preferences");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.preferences) {
            if (
              data.preferences.defaultLocation &&
              KARNATAKA_DISTRICTS.includes(data.preferences.defaultLocation)
            ) {
              initialDistrict = data.preferences.defaultLocation;
              setDistrictFilter(initialDistrict);
            }
            if (data.preferences.defaultCrop) {
              initialCommodity = data.preferences.defaultCrop.split("&")[0].trim();
              setCommodityFilter(initialCommodity);
            }
          }
        }
      } catch {
        // Fallback to default filters
      }

      fetchMandiPricesData({
        state: "Karnataka",
        district: initialDistrict,
        commodity: initialCommodity,
        market: "",
      });
    }

    loadFarmerPreferencesAndFetch();
  }, [isClerkLoaded, clerkUser]);

  const fetchMandiPricesData = async (
    overrideFilters?: { state?: string; district?: string; commodity?: string; market?: string },
    isManual = false
  ) => {
    if (isManual) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setErrorMsg(null);

    const st = overrideFilters?.state ?? stateFilter;
    const dist = overrideFilters?.district ?? districtFilter;
    const comm = overrideFilters?.commodity ?? commodityFilter;
    const mkt = overrideFilters?.market ?? marketFilter;

    try {
      const query = new URLSearchParams();
      if (st.trim() && st !== "All States") {
        query.set("state", st.trim());
      }
      if (dist.trim()) {
        query.set("district", dist.trim());
      }
      if (comm.trim()) {
        query.set("commodity", comm.trim());
      }
      if (mkt.trim()) {
        query.set("market", mkt.trim());
      }

      const res = await fetch(`/api/mandi-prices?${query.toString()}`);
      const data: IMandiPriceResponse = await res.json();

      if (res.ok && data.success) {
        setMandiData(data);
      } else {
        setMandiData(data);
        setErrorMsg(data.error || "Unable to fetch mandi market prices.");
      }

      if (isManual) {
        showToast("✅ Mandi prices synchronized from Agmarknet.");
      }
    } catch (err) {
      console.error("Error loading mandi prices:", err);
      const msg = err instanceof Error ? err.message : "Failed to load mandi prices telemetry.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMandiPricesData();
  };

  const handleResetFilters = () => {
    const defaultState = "Karnataka";
    const defaultDistrict = "Dharwad";
    const defaultCommodity = "Wheat";
    const defaultMarket = "";

    setStateFilter(defaultState);
    setDistrictFilter(defaultDistrict);
    setCommodityFilter(defaultCommodity);
    setMarketFilter(defaultMarket);

    fetchMandiPricesData({
      state: defaultState,
      district: defaultDistrict,
      commodity: defaultCommodity,
      market: defaultMarket,
    });
  };

  // Calculate Summary Statistics from actual returned records
  const pricesList = mandiData?.prices || [];
  const hasPrices = pricesList.length > 0;

  let modalAvg = 0;
  let highestPriceItem: IMandiPrice | null = null;
  let lowestPriceItem: IMandiPrice | null = null;

  if (hasPrices) {
    const totalModalSum = pricesList.reduce((acc, curr) => acc + curr.modalPrice, 0);
    modalAvg = Math.round(totalModalSum / pricesList.length);

    highestPriceItem = [...pricesList].sort((a, b) => b.modalPrice - a.modalPrice)[0];
    lowestPriceItem = [...pricesList].sort((a, b) => a.modalPrice - b.modalPrice)[0];
  }

  return (
    <PageContainer>
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-xl flex items-center gap-2 border border-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="🏛️ APMC Mandi Market Prices"
        description="Official daily agricultural market arrivals and price telemetry from Agmarknet."
        badge={
          <Badge variant="emerald" dot>
            Government of India OGD Sync
          </Badge>
        }
        action={
          <Button
            variant="emerald"
            size="sm"
            onClick={() => fetchMandiPricesData(undefined, true)}
            disabled={loading || isRefreshing}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />}
          >
            Refresh Prices
          </Button>
        }
      />

      {/* Error Alert Banner */}
      {errorMsg && (
        <Card variant="glass" className="border-rose-200 bg-rose-50/50 mb-6">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-rose-900">Mandi Price Sync Notice</h4>
                <p className="text-xs text-rose-700">{errorMsg}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchMandiPricesData(undefined, true)}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="border-rose-300 text-rose-800 hover:bg-rose-100 shrink-0"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* INTERACTIVE FILTER TOOLBAR */}
        <Card variant="glass" className="border-emerald-200/90 shadow-md">
          <CardHeader className="bg-gradient-to-r from-emerald-900/10 via-teal-900/5 to-transparent border-b border-emerald-100 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-600" />
                Mandi Market Filters
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="text-xs text-slate-500 hover:text-emerald-700 h-8 px-2"
                leftIcon={<RotateCcw className="w-3 h-3" />}
              >
                Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* State */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">State</label>
                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Karnataka">Karnataka</option>
                </select>
              </div>

              {/* District */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">District</label>
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {KARNATAKA_DISTRICTS.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>

              {/* Commodity */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Crop / Commodity</label>
                <input
                  type="text"
                  placeholder="e.g. Wheat, Rice, Soybean"
                  value={commodityFilter}
                  onChange={(e) => setCommodityFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              {/* Market / Search Button */}
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Market (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. APMC Mandi"
                    value={marketFilter}
                    onChange={(e) => setMarketFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
                <Button
                  type="submit"
                  variant="emerald"
                  size="sm"
                  disabled={loading}
                  className="h-[38px] px-4 font-bold text-xs shrink-0"
                  leftIcon={<Search className="w-3.5 h-3.5" />}
                >
                  Search
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* SUMMARY KPI WIDGETS (Only displayed when actual records return) */}
        {hasPrices && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-200/80">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Regional Modal Average
                </span>
                <BadgeIndianRupee className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-black text-emerald-900 my-1">
                ₹ {modalAvg.toLocaleString("en-IN")} <span className="text-xs font-normal text-slate-600">/ Quintal</span>
              </div>
              <span className="text-[11px] text-slate-500">
                Calculated across {pricesList.length} APMC markets
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Highest Price Mandi
                </span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-black text-slate-900 my-1">
                ₹ {highestPriceItem?.modalPrice.toLocaleString("en-IN")}{" "}
                <span className="text-xs font-normal text-slate-600">/ Qtl</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-bold truncate block">
                {highestPriceItem?.market} ({highestPriceItem?.district})
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Lowest Price Mandi
                </span>
                <TrendingDown className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-xl font-black text-slate-900 my-1">
                ₹ {lowestPriceItem?.modalPrice.toLocaleString("en-IN")}{" "}
                <span className="text-xs font-normal text-slate-600">/ Qtl</span>
              </div>
              <span className="text-[11px] text-amber-700 font-bold truncate block">
                {lowestPriceItem?.market} ({lowestPriceItem?.district})
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Reporting Mandis
                </span>
                <Building2 className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-xl font-black text-slate-900 my-1">
                {pricesList.length} Markets
              </div>
              <span className="text-[11px] text-slate-500">
                Official Agmarknet arrivals logged
              </span>
            </div>
          </div>
        )}

        {/* MARKET PRICE CARDS GRID */}
        <Card variant="glass" className="border-slate-200/90 shadow-md">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Store className="w-4 h-4 text-emerald-600" />
                  Mandi Commodity Price Records
                </CardTitle>
                <CardDescription className="text-xs text-slate-600">
                  Daily APMC market prices reported by Agmarknet. Unit standard: Rs. / Quintal (100 Kg).
                </CardDescription>
              </div>
              {hasPrices && mandiData?.dataFreshness && (
                <Badge variant="emerald" className="text-xs font-bold">
                  {mandiData.dataFreshness}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : !hasPrices ? (
              <EmptyState
                icon={<Store className="w-10 h-10 text-slate-400" />}
                title="No Mandi Prices Found"
                description="No market arrivals found for your selected state, district, or crop filters."
                actionLabel="Reset Search Filters"
                onAction={handleResetFilters}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pricesList.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl border border-slate-200/90 bg-white/80 hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-black text-slate-900 text-base block">
                            {item.commodity}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            Variety: {item.variety}
                          </span>
                        </div>
                        <Badge
                          variant={
                            item.dataFreshness === "Live Agmarknet Data"
                              ? "emerald"
                              : item.dataFreshness === "Recent Data (1-3 Days Ago)"
                              ? "warning"
                              : "glass"
                          }
                          className="text-[10px] py-0 px-2 shrink-0"
                        >
                          {item.dataFreshness}
                        </Badge>
                      </div>

                      {/* Mandi & Location */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                          <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{item.market} Mandi</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {item.district}, {item.state}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {item.arrivalDate}
                          </span>
                        </div>
                      </div>

                      {/* Modal Price Highlight */}
                      <div className="p-3 rounded-xl bg-emerald-50/90 border border-emerald-200/80 flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                          <BadgeIndianRupee className="w-4 h-4 text-emerald-600" />
                          Modal Price:
                        </span>
                        <span className="text-base font-black text-emerald-900">
                          ₹ {item.modalPrice.toLocaleString("en-IN")}{" "}
                          <span className="text-[10px] font-normal text-slate-600">/ Quintal</span>
                        </span>
                      </div>

                      {/* Min / Max Range */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Min Price</span>
                          <span className="font-bold text-slate-800">
                            ₹ {item.minPrice.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Max Price</span>
                          <span className="font-bold text-slate-800">
                            ₹ {item.maxPrice.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Source: {item.source}</span>
                      <span>Unit: {item.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* OFFICIAL SOURCE ATTRIBUTION NOTE */}
        <div className="p-4 rounded-2xl bg-slate-900 text-slate-300 border border-slate-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Source Attribution:</strong> Official Directorate of Marketing & Inspection (Agmarknet), Ministry of Agriculture and Farmers Welfare via Government of India Open Data Portal (data.gov.in).
            </span>
          </div>
          <Badge variant="emerald" className="text-[10px] font-bold shrink-0">
            Agmarknet Telemetry
          </Badge>
        </div>
      </div>
    </PageContainer>
  );
}
