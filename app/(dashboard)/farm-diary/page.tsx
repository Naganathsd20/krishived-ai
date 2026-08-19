"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  RotateCcw,
  Calendar,
  IndianRupee,
  Sprout,
  Trash2,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  Tag,
  MapPin,
  Clock,
  FileText,
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
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { Spinner, SkeletonCard } from "@/components/ui/loading";
import {
  IFarmDiaryEntry,
  IFarmDiaryResponse,
  FarmActivityType,
} from "@/types/farm-diary";

const ACTIVITY_CATEGORIES: FarmActivityType[] = [
  "Sowing",
  "Irrigation",
  "Fertilization",
  "Pest Control",
  "Weeding",
  "Crop Inspection",
  "Harvest",
  "Field Preparation",
  "Other",
];

const CATEGORY_BADGE_VARIANTS: Record<
  FarmActivityType,
  "emerald" | "info" | "warning" | "danger" | "glass"
> = {
  Sowing: "emerald",
  Irrigation: "info",
  Fertilization: "emerald",
  "Pest Control": "danger",
  Weeding: "warning",
  "Crop Inspection": "info",
  Harvest: "emerald",
  "Field Preparation": "glass",
  Other: "glass",
};

export default function FarmDiaryPage() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();

  // Filter States
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All Categories");
  const [cropFilter, setCropFilter] = useState<string>("All Crops");

  // Data States
  const [diaryData, setDiaryData] = useState<IFarmDiaryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<IFarmDiaryEntry | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form Field States
  const [formTitle, setFormTitle] = useState<string>("");
  const [formActivityType, setFormActivityType] = useState<FarmActivityType>("Sowing");
  const [formActivityDate, setFormActivityDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [formCrop, setFormCrop] = useState<string>("");
  const [formField, setFormField] = useState<string>("");
  const [formQuantity, setFormQuantity] = useState<string>("");
  const [formQuantityUnit, setFormQuantityUnit] = useState<string>("");
  const [formCost, setFormCost] = useState<string>("");
  const [formDescription, setFormDescription] = useState<string>("");
  const [formNotes, setFormNotes] = useState<string>("");

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDiary = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const query = new URLSearchParams();
      if (searchTerm.trim()) query.set("search", searchTerm.trim());
      if (categoryFilter && categoryFilter !== "All Categories")
        query.set("category", categoryFilter);
      if (cropFilter && cropFilter !== "All Crops") query.set("crop", cropFilter);

      const res = await fetch(`/api/farm-diary?${query.toString()}`);
      const data: IFarmDiaryResponse = await res.json();

      if (res.ok && data.success) {
        setDiaryData(data);
      } else {
        setDiaryData(data);
        setErrorMsg(data.error || "Unable to load farm diary entries.");
      }
    } catch (err) {
      console.error("Error loading farm diary:", err);
      setErrorMsg("Failed to connect to farm diary service.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, categoryFilter, cropFilter]);

  useEffect(() => {
    if (isClerkLoaded && clerkUser) {
      fetchDiary();
    }
  }, [isClerkLoaded, clerkUser, fetchDiary]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("All Categories");
    setCropFilter("All Crops");
  };

  const handleOpenAddModal = () => {
    setEditingEntry(null);
    setFormTitle("");
    setFormActivityType("Sowing");
    setFormActivityDate(new Date().toISOString().substring(0, 10));
    setFormCrop("");
    setFormField("");
    setFormQuantity("");
    setFormQuantityUnit("");
    setFormCost("");
    setFormDescription("");
    setFormNotes("");
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (entry: IFarmDiaryEntry) => {
    setEditingEntry(entry);
    setFormTitle(entry.title);
    setFormActivityType(entry.activityType);
    setFormActivityDate(
      new Date(entry.activityDate).toISOString().substring(0, 10)
    );
    setFormCrop(entry.crop || "");
    setFormField(entry.field || "");
    setFormQuantity(entry.quantity ? String(entry.quantity) : "");
    setFormQuantityUnit(entry.quantityUnit || "");
    setFormCost(entry.cost ? String(entry.cost) : "");
    setFormDescription(entry.description || "");
    setFormNotes(entry.notes || "");
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!formTitle.trim() || formTitle.trim().length < 3) {
      setModalError("Activity title must be at least 3 characters long.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: formTitle.trim(),
        activityType: formActivityType,
        activityDate: formActivityDate,
        crop: formCrop.trim(),
        field: formField.trim(),
        quantity: formQuantity ? parseFloat(formQuantity) || 0 : 0,
        quantityUnit: formQuantityUnit.trim(),
        cost: formCost ? parseFloat(formCost) || 0 : 0,
        description: formDescription.trim(),
        notes: formNotes.trim(),
      };

      const url = editingEntry
        ? `/api/farm-diary/${editingEntry._id}`
        : "/api/farm-diary";
      const method = editingEntry ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setIsModalOpen(false);
        fetchDiary();
      } else {
        setModalError(result.error || "Failed to save diary entry.");
      }
    } catch (err) {
      console.error("Error submitting diary entry:", err);
      setModalError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this diary activity entry?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/farm-diary/${id}`, { method: "DELETE" });
      const result = await res.json();

      if (res.ok && result.success) {
        fetchDiary();
      } else {
        alert(result.error || "Failed to delete entry.");
      }
    } catch (err) {
      console.error("Error deleting entry:", err);
      alert("Failed to delete entry. Please check network connection.");
    } finally {
      setDeletingId(null);
    }
  };

  const entriesList = diaryData?.entries || [];
  const stats = diaryData?.stats;

  // Extract unique crop names for filter dropdown
  const uniqueCrops = Array.from(
    new Set(entriesList.map((e) => e.crop).filter(Boolean))
  );

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader
        title="📖 Farmer Activity Diary"
        description="Record and review your daily field operations, crop inputs, irrigation, and farming expenses."
        badge={
          <Badge variant="emerald" dot>
            Chronological Farm History
          </Badge>
        }
        action={
          <Button
            variant="emerald"
            onClick={handleOpenAddModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add New Activity
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
                <h4 className="text-sm font-bold text-rose-900">Diary Service Issue</h4>
                <p className="text-xs text-rose-700">{errorMsg}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDiary}
              className="border-rose-300 text-rose-800 hover:bg-rose-100 shrink-0"
            >
              Retry Sync
            </Button>
          </CardContent>
        </Card>
      )}

      {/* SUMMARY KPI CARDS */}
      <GridContainer cols={4} className="mb-8">
        {/* KPI 1: Total Recorded Activities */}
        <Card variant="glass" hoverEffect>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Logged Activities
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          {loading ? (
            <div className="h-9 w-24 bg-slate-200/60 rounded-lg animate-pulse my-1" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {stats?.totalEntries ?? 0}
              </span>
              <Badge variant="emerald" className="text-[10px]">
                Recorded
              </Badge>
            </div>
          )}
          <p className="text-xs text-slate-400 mt-2">
            Total field operations saved in diary
          </p>
        </Card>

        {/* KPI 2: Total Farm Expenses */}
        <Card variant="glass" hoverEffect>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Farm Input Expenses
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-100/80 text-amber-700 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          {loading ? (
            <div className="h-9 w-24 bg-slate-200/60 rounded-lg animate-pulse my-1" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">
                ₹{(stats?.totalExpenses ?? 0).toLocaleString("en-IN")}
              </span>
              <Badge variant="warning" className="text-[10px]">
                Total Cost
              </Badge>
            </div>
          )}
          <p className="text-xs text-slate-400 mt-2">
            Sum of seeds, fertilizer, water & labor costs
          </p>
        </Card>

        {/* KPI 3: Latest Activity Date */}
        <Card variant="glass" hoverEffect>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Latest Recorded Date
            </span>
            <div className="w-9 h-9 rounded-2xl bg-teal-100/80 text-teal-700 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          {loading ? (
            <div className="h-9 w-24 bg-slate-200/60 rounded-lg animate-pulse my-1" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-slate-900 truncate max-w-[160px]">
                {stats?.latestActivityDate
                  ? new Date(stats.latestActivityDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "No Entries"}
              </span>
            </div>
          )}
          <p className="text-xs text-slate-400 mt-2">
            Date of most recent activity entry
          </p>
        </Card>

        {/* KPI 4: Top Active Crop */}
        <Card variant="glass" hoverEffect>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Primary Active Crop
            </span>
            <div className="w-9 h-9 rounded-2xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center">
              <Sprout className="w-5 h-5" />
            </div>
          </div>
          {loading ? (
            <div className="h-9 w-24 bg-slate-200/60 rounded-lg animate-pulse my-1" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-extrabold text-slate-900 truncate max-w-[160px]">
                {stats?.topCrop || "General Field"}
              </span>
            </div>
          )}
          <p className="text-xs text-slate-400 mt-2">
            Most frequently logged crop in diary
          </p>
        </Card>
      </GridContainer>

      {/* FILTER & SEARCH TOOLBAR */}
      <Card variant="glass" className="border-emerald-200/90 shadow-md mb-8">
        <CardHeader className="bg-gradient-to-r from-emerald-900/5 via-teal-900/5 to-transparent border-b border-emerald-100 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-600" />
              Search & Filter Diary Log
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
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search Bar */}
            <div className="relative col-span-1 sm:col-span-1">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Search Keywords</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search title, field, notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Activity Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="All Categories">All Categories</option>
                {ACTIVITY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Crop Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Crop Filter</label>
              <select
                value={cropFilter}
                onChange={(e) => setCropFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="All Crops">All Crops</option>
                {uniqueCrops.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CHRONOLOGICAL TIMELINE / FEED */}
      <Card variant="glass" className="border-slate-200/90 shadow-md">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              Chronological Activity Timeline
            </CardTitle>
            <Badge variant="emerald" className="text-xs font-bold">
              {entriesList.length} Entries
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : entriesList.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="w-10 h-10 text-slate-400" />}
              title="No Diary Entries Found"
              description="Record your first farm operation or reset active filters."
              actionLabel="Add First Activity"
              onAction={handleOpenAddModal}
            />
          ) : (
            <div className="space-y-4">
              {entriesList.map((entry) => (
                <div
                  key={entry._id}
                  className="p-5 rounded-3xl border border-slate-200/90 bg-white/90 hover:shadow-md transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    {/* Top Row: Category Badge & Date */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          CATEGORY_BADGE_VARIANTS[entry.activityType] || "emerald"
                        }
                        className="text-[10px] font-bold"
                      >
                        {entry.activityType}
                      </Badge>
                      <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(entry.activityDate).toLocaleDateString(
                          "en-IN",
                          {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-slate-900">
                      {entry.title}
                    </h3>

                    {/* Description */}
                    {entry.description && (
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {entry.description}
                      </p>
                    )}

                    {/* Context Chips: Crop, Field, Quantity, Cost */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      {entry.crop && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-100">
                          <Sprout className="w-3 h-3 text-emerald-600" />
                          {entry.crop}
                        </span>
                      )}
                      {entry.field && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {entry.field}
                        </span>
                      )}
                      {(entry.quantity ?? 0) > 0 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-teal-50 text-teal-800 text-[11px] font-semibold border border-teal-100">
                          <Tag className="w-3 h-3 text-teal-600" />
                          {entry.quantity} {entry.quantityUnit || "units"}
                        </span>
                      )}
                      {(entry.cost ?? 0) > 0 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200/60">
                          <IndianRupee className="w-3 h-3 text-amber-600" />
                          ₹{(entry.cost ?? 0).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>

                    {/* Notes */}
                    {entry.notes && (
                      <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-start gap-2">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>
                          <strong>Notes:</strong> {entry.notes}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEditModal(entry)}
                      className="text-slate-600 hover:text-emerald-700 h-8 px-2"
                      leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={deletingId === entry._id}
                      onClick={() => handleDeleteEntry(entry._id)}
                      className="text-slate-400 hover:text-rose-600 h-8 px-2"
                      leftIcon={<Trash2 className="w-3.5 h-3.5" />}
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

      {/* ADD / EDIT ACTIVITY MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEntry ? "Edit Farm Activity Entry" : "Record New Farm Activity"}
        size="lg"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4 text-slate-800">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Activity Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sowed Wheat seeds in North Plot A"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Activity Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={formActivityType}
                onChange={(e) =>
                  setFormActivityType(e.target.value as FarmActivityType)
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {ACTIVITY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Activity Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formActivityDate}
                onChange={(e) => setFormActivityDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            {/* Crop */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Crop</label>
              <input
                type="text"
                placeholder="e.g. Wheat, Mustard"
                value={formCrop}
                onChange={(e) => setFormCrop(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            {/* Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Field / Plot Name</label>
              <input
                type="text"
                placeholder="e.g. North Field Plot A"
                value={formField}
                onChange={(e) => setFormField(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Quantity</label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 50"
                value={formQuantity}
                onChange={(e) => setFormQuantity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            {/* Quantity Unit */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Quantity Unit</label>
              <input
                type="text"
                placeholder="e.g. kg, liters, hours, bags"
                value={formQuantityUnit}
                onChange={(e) => setFormQuantityUnit(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            {/* Cost */}
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Activity Expense (₹)</label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 1500"
                value={formCost}
                onChange={(e) => setFormCost(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            {/* Description */}
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                placeholder="Brief summary of inputs applied or task details..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white resize-none"
              />
            </div>

            {/* Notes */}
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Additional Observations / Notes</label>
              <textarea
                rows={2}
                placeholder="e.g. Soil was moist; next irrigation planned in 10 days..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white resize-none"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="emerald"
              size="sm"
              disabled={submitting}
              leftIcon={submitting ? <Spinner size="sm" /> : <CheckCircle2 className="w-4 h-4" />}
            >
              {editingEntry ? "Update Entry" : "Save Entry"}
            </Button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
}
