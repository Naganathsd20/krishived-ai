"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Landmark,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  RotateCcw,
  ExternalLink,
  FileText,
  ShieldCheck,
  Building2,
  Users,
  Calendar,
  PhoneCall,
  Sparkles,
  ChevronRight,
  X,
  Award,
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
import { Modal } from "@/components/ui/modal";
import { Spinner, SkeletonCard } from "@/components/ui/loading";
import { IGovernmentScheme, ISchemeResponse, SchemeCategory } from "@/types/scheme";

export default function GovernmentSchemesPage() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All Categories");
  const [stateFilter, setStateFilter] = useState<string>("All States");
  const [farmerTypeFilter, setFarmerTypeFilter] = useState<string>("all");

  // Data State
  const [schemesData, setSchemesData] = useState<ISchemeResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Selected Scheme Modal State
  const [selectedScheme, setSelectedScheme] = useState<IGovernmentScheme | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const fetchSchemes = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const query = new URLSearchParams();
      if (searchTerm.trim()) query.set("search", searchTerm.trim());
      if (categoryFilter && categoryFilter !== "All Categories") query.set("category", categoryFilter);
      if (stateFilter && stateFilter !== "All States") query.set("state", stateFilter);
      if (farmerTypeFilter && farmerTypeFilter !== "all") query.set("farmerType", farmerTypeFilter);

      const res = await fetch(`/api/government-schemes?${query.toString()}`);
      const data: ISchemeResponse = await res.json();

      if (res.ok && data.success) {
        setSchemesData(data);
      } else {
        setSchemesData(data);
        setErrorMsg(data.error || "Unable to load government schemes catalog.");
      }
    } catch (err) {
      console.error("Error loading government schemes:", err);
      setErrorMsg("Failed to connect to schemes service.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, categoryFilter, stateFilter, farmerTypeFilter]);

  useEffect(() => {
    if (isClerkLoaded && clerkUser) {
      fetchSchemes();
    }
  }, [isClerkLoaded, clerkUser, fetchSchemes]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSchemes();
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("All Categories");
    setStateFilter("All States");
    setFarmerTypeFilter("all");
  };

  const handleOpenDetails = (scheme: IGovernmentScheme) => {
    setSelectedScheme(scheme);
    setIsModalOpen(true);
  };

  const schemesList = schemesData?.schemes || [];
  const categoriesList = schemesData?.categories || [
    "Income Support",
    "Crop Insurance",
    "Financial Assistance",
    "Irrigation / Solar",
    "Agriculture Infrastructure",
    "Soil / Fertilizer",
    "Equipment & Machinery",
    "Farmer Welfare",
  ];
  const statesList = schemesData?.states || ["Central", "Maharashtra", "Punjab", "Uttar Pradesh"];

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader
        title="Government Agriculture Schemes"
        description="Official Government of India and State agricultural subsidy, insurance, and financial support schemes."
        badge={
          <Badge variant="emerald" dot>
            myScheme.gov.in Verified
          </Badge>
        }
      />

      {/* Error Alert Banner */}
      {errorMsg && (
        <Card variant="glass" className="border-rose-200 bg-rose-50/50 mb-6">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-rose-900">Schemes Catalog Notice</h4>
                <p className="text-xs text-rose-700">{errorMsg}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSchemes}
              className="border-rose-300 text-rose-800 hover:bg-rose-100 shrink-0"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* INTERACTIVE SEARCH & FILTER TOOLBAR */}
        <Card variant="glass" className="border-emerald-200/90 shadow-md">
          <CardHeader className="bg-gradient-to-r from-emerald-900/10 via-teal-900/5 to-transparent border-b border-emerald-100 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-600" />
                Find Agricultural Schemes
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="text-xs text-slate-500 hover:text-emerald-700 h-8 px-2"
                leftIcon={<RotateCcw className="w-3 h-3" />}
              >
                Reset Filters
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <form onSubmit={handleSearchSubmit} className="space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search schemes by name, ministry, or crop purpose (e.g. PM-KISAN, Solar Pump, Crop Insurance)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-24 py-2.5 rounded-2xl border border-slate-200 text-base sm:text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
                <Button
                  type="submit"
                  variant="emerald"
                  size="sm"
                  disabled={loading}
                  className="absolute right-1.5 top-1 px-4 font-bold text-xs"
                >
                  Search
                </Button>
              </div>

              {/* Filter Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {/* Category */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Scheme Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="All Categories">All Categories</option>
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* State / Central */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Jurisdiction / State</label>
                  <select
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="All States">All Jurisdictions</option>
                    {statesList.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target Farmer */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Target Farmer Type</label>
                  <select
                    value={farmerTypeFilter}
                    onChange={(e) => setFarmerTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="all">All Farmer Types</option>
                    <option value="Small & Marginal Farmers">Small & Marginal Farmers</option>
                    <option value="Tenant Farmers">Tenant Farmers</option>
                    <option value="Sharecroppers">Sharecroppers</option>
                    <option value="All Farmers">All Farmers</option>
                  </select>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* SCHEMES CARDS GRID */}
        <Card variant="glass" className="border-slate-200/90 shadow-md">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-emerald-600" />
                  Verified Government Schemes Catalog
                </CardTitle>
                <CardDescription className="text-xs text-slate-600">
                  Verified central and state government agricultural schemes compiled from myScheme.gov.in.
                </CardDescription>
              </div>
              <Badge variant="emerald" className="text-xs font-bold">
                {schemesList.length} Verified Schemes
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : schemesList.length === 0 ? (
              <EmptyState
                icon={<Landmark className="w-10 h-10 text-slate-400" />}
                title="No Government Schemes Found"
                description="No verified government schemes match your search or filter criteria."
                actionLabel="Reset Search Filters"
                onAction={handleResetFilters}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {schemesList.map((scheme) => (
                  <div
                    key={scheme.id}
                    className="p-5 rounded-3xl border border-slate-200/90 bg-white/80 hover:shadow-lg transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant="emerald" className="text-[10px] font-bold">
                            {scheme.category}
                          </Badge>
                          <Badge
                            variant={scheme.schemeLevel === "Central" ? "glass" : "warning"}
                            className="text-[10px] font-bold"
                          >
                            {scheme.schemeLevel === "Central" ? "Central Govt" : `State: ${scheme.state}`}
                          </Badge>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {scheme.shortName}
                        </span>
                      </div>

                      {/* Title & Ministry */}
                      <div>
                        <h3 className="text-base font-bold text-slate-900 leading-snug">
                          {scheme.name}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{scheme.ministry}</span>
                        </p>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {scheme.description}
                      </p>

                      {/* Key Benefit Highlight */}
                      {scheme.benefits.length > 0 && (
                        <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/60">
                          <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block mb-1">
                            Key Benefit
                          </span>
                          <p className="text-xs text-emerald-800 font-medium">
                            {scheme.benefits[0]}
                          </p>
                        </div>
                      )}

                      {/* Target Farmers Badges */}
                      <div className="flex flex-wrap items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400 mr-1" />
                        {scheme.farmerType.map((ft, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium"
                          >
                            {ft}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-400 font-medium">
                        Updated: {scheme.lastUpdated}
                      </span>
                      <Button
                        variant="emerald"
                        size="sm"
                        onClick={() => handleOpenDetails(scheme)}
                        rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                      >
                        View Full Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* OFFICIAL SOURCE DISCLAIMER BANNER */}
        <div className="p-4 rounded-2xl bg-slate-900 text-slate-300 border border-slate-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Source Attribution:</strong> Scheme criteria and eligibility rules are compiled directly from myScheme.gov.in & Ministry of Agriculture & Farmers Welfare official guidelines.
            </span>
          </div>
          <Badge variant="emerald" className="text-[10px] font-bold shrink-0">
            myScheme.gov.in
          </Badge>
        </div>
      </div>

      {/* SCHEME DETAILS MODAL */}
      {selectedScheme && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedScheme.shortName}
          size="lg"
        >
          <div className="space-y-6 text-slate-800">
            {/* Modal Header Badge Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Badge variant="emerald" className="text-xs font-bold">
                  {selectedScheme.category}
                </Badge>
                <Badge variant="glass" className="text-xs font-bold">
                  {selectedScheme.schemeLevel === "Central" ? "Central Government Scheme" : `State Scheme (${selectedScheme.state})`}
                </Badge>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                Updated: {selectedScheme.lastUpdated}
              </span>
            </div>

            {/* Scheme Name & Ministry */}
            <div>
              <h2 className="text-xl font-black text-slate-900 leading-snug">
                {selectedScheme.name}
              </h2>
              <p className="text-xs text-emerald-800 font-semibold mt-1">
                {selectedScheme.ministry} • {selectedScheme.department}
              </p>
            </div>

            {/* Overview */}
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-emerald-600" />
                Scheme Purpose & Overview
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed p-3 rounded-2xl bg-slate-50 border border-slate-100">
                {selectedScheme.description}
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                Key Benefits & Subsidies
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {selectedScheme.benefits.map((b, idx) => (
                  <li key={idx} className="flex items-start gap-2 p-2 rounded-xl bg-emerald-50/50 border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Eligibility */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                Eligibility Criteria
              </h4>
              <ul className="space-y-1 text-xs text-slate-700">
                {selectedScheme.eligibility.map((el, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                    <span>{el}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Required Documents */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-600" />
                Required Documents Checklist
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {selectedScheme.requiredDocuments.map((doc, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="font-medium text-slate-800">{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Application Process */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-600" />
                Application Process & Steps
              </h4>
              <ol className="space-y-1.5 text-xs text-slate-700 list-decimal list-inside pl-1">
                {selectedScheme.applicationProcess.map((step, idx) => (
                  <li key={idx} className="leading-relaxed font-medium">
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* Helpline */}
            {selectedScheme.helpline && (
              <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <PhoneCall className="w-4 h-4 text-emerald-600" />
                  Government Support Helpline:
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {selectedScheme.helpline}
                </span>
              </div>
            )}

            {/* Official Portal Notice & Redirect CTA */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                <strong>Notice:</strong> You will be directed to the official government portal (<code>{selectedScheme.officialUrl}</code>). All official applications, status tracking, and document uploads must be completed directly on the government site.
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </Button>
                <a
                  href={selectedScheme.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 transition-all"
                >
                  <span>Visit Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
}
