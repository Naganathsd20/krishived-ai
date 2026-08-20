"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Ban,
  Sprout,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CropScheduleCard } from "@/components/crop-schedule/CropScheduleCard";
import { ScheduleFilters } from "@/components/crop-schedule/ScheduleFilters";
import { CreateScheduleModal } from "@/components/crop-schedule/CreateScheduleModal";
import { CompleteScheduleModal } from "@/components/crop-schedule/CompleteScheduleModal";
import { EditScheduleModal } from "@/components/crop-schedule/EditScheduleModal";
import { DeleteScheduleModal } from "@/components/crop-schedule/DeleteScheduleModal";
import {
  ICropScheduleItem,
  ICropScheduleResponse,
  ICreateCropScheduleInput,
} from "@/types/crop-schedule";

export default function CropSchedulePage() {
  const [selectedCrop, setSelectedCrop] = useState<string>("All Crops");
  const [selectedField, setSelectedField] = useState<string>("All Fields");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  const [data, setData] = useState<ICropScheduleResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [completingSchedule, setCompletingSchedule] = useState<ICropScheduleItem | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<ICropScheduleItem | null>(null);
  const [deletingSchedule, setDeletingSchedule] = useState<ICropScheduleItem | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState<boolean>(false);

  // Fetch Schedules from API
  const fetchSchedules = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setErrorMsg(null);

      try {
        const params = new URLSearchParams();
        if (selectedCrop && selectedCrop !== "All Crops") params.append("crop", selectedCrop);
        if (selectedField && selectedField !== "All Fields") params.append("field", selectedField);
        if (selectedStatus && selectedStatus !== "All" && selectedStatus !== "Overdue" && selectedStatus !== "Due Today") {
          params.append("status", selectedStatus);
        }
        if (searchQuery.trim()) params.append("search", searchQuery.trim());
        params.append("page", String(page));
        params.append("limit", "12");
        params.append("t", String(Date.now()));

        const res = await fetch(`/api/crop-schedule?${params.toString()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        });

        const json: ICropScheduleResponse = await res.json();

        if (res.ok && json.success) {
          // Client-side date filter refinement for Overdue or Due Today if selected
          let filteredSchedules = json.schedules || [];
          const todayStr = new Date().toISOString().split("T")[0];

          if (selectedStatus === "Overdue") {
            filteredSchedules = filteredSchedules.filter((s) => {
              const schedStr = new Date(s.scheduledDate).toISOString().split("T")[0];
              return s.status === "scheduled" && schedStr < todayStr;
            });
          } else if (selectedStatus === "Due Today") {
            filteredSchedules = filteredSchedules.filter((s) => {
              const schedStr = new Date(s.scheduledDate).toISOString().split("T")[0];
              return s.status === "scheduled" && schedStr === todayStr;
            });
          }

          setData({
            ...json,
            schedules: filteredSchedules,
          });
        } else {
          throw new Error(json.error || "Unable to load crop activity schedule.");
        }
      } catch (err) {
        console.error("Error fetching crop schedules:", err);
        const msg = err instanceof Error ? err.message : "Unable to load crop activity schedule.";
        setErrorMsg(msg);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [selectedCrop, selectedField, selectedStatus, searchQuery, page]
  );

  useEffect(() => {
    fetchSchedules(false);
  }, [fetchSchedules]);

  useEffect(() => {
    setPage(1);
  }, [selectedCrop, selectedField, selectedStatus, searchQuery]);

  // Actions: Create, Complete, Edit, Skip, Delete
  const handleCreateSchedule = async (input: ICreateCropScheduleInput) => {
    setIsSubmittingAction(true);
    try {
      const res = await fetch("/api/crop-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create crop schedule.");
      }

      await fetchSchedules(true);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleConfirmComplete = async (
    id: string,
    completeData: { cost: number; quantity: number; quantityUnit: string; notes: string }
  ) => {
    setIsSubmittingAction(true);
    try {
      const res = await fetch(`/api/crop-schedule/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "completed",
          ...completeData,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to mark activity completed.");
      }

      await fetchSchedules(true);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleSkipSchedule = async (schedule: ICropScheduleItem) => {
    try {
      const res = await fetch(`/api/crop-schedule/${schedule._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "skipped" }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        await fetchSchedules(true);
      }
    } catch (err) {
      console.error("Error skipping schedule:", err);
    }
  };

  const handleConfirmEdit = async (
    id: string,
    editData: {
      scheduledDate?: string;
      cost?: number;
      quantity?: number;
      quantityUnit?: string;
      notes?: string;
    }
  ) => {
    setIsSubmittingAction(true);
    try {
      const res = await fetch(`/api/crop-schedule/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update schedule task.");
      }

      await fetchSchedules(true);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleConfirmDelete = async (id: string) => {
    setIsSubmittingAction(true);
    try {
      const res = await fetch(`/api/crop-schedule/${id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to delete schedule task.");
      }

      await fetchSchedules(true);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleResetFilters = () => {
    setSelectedCrop("All Crops");
    setSelectedField("All Fields");
    setSelectedStatus("All");
    setSearchQuery("");
    setPage(1);
  };

  const pagination = data?.pagination;
  const stats = data?.stats;
  const schedules = data?.schedules || [];
  const availableCrops = data?.availableCrops || [];
  const availableFields = data?.availableFields || [];

  return (
    <PageContainer className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Smart Crop Activity Schedule"
        description="ICAR-aligned stage-by-stage agronomic activity planner. Sowing, irrigation, fertilization top-dressing, pest protection, and harvesting schedules."
        badge={
          <Badge variant="emerald" className="gap-1.5 px-3 py-1 text-xs font-bold">
            <Calendar className="w-3.5 h-3.5" />
            ICAR Agronomy Engine
          </Badge>
        }
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading || isRefreshing}
              onClick={() => fetchSchedules(true)}
              className="rounded-xl border-slate-200 text-xs font-bold gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>

            <Button
              variant="emerald"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="rounded-xl shadow-md gap-1.5 text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>Create Crop Schedule</span>
            </Button>
          </div>
        }
      />

      {/* Summary KPI Cards Grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Card variant="glass" className="p-3.5 border-slate-200/80">
            <CardContent className="p-0 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                <span>Total Tasks</span>
                <Calendar className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-extrabold text-slate-900 font-mono">
                {stats.totalSchedules}
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" className="p-3.5 border-amber-200/80 bg-amber-50/20">
            <CardContent className="p-0 space-y-1">
              <div className="flex items-center justify-between text-xs text-amber-700 font-bold">
                <span>Due Today</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-xl font-extrabold text-amber-900 font-mono">
                {stats.dueTodayCount}
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" className="p-3.5 border-sky-200/80 bg-sky-50/20">
            <CardContent className="p-0 space-y-1">
              <div className="flex items-center justify-between text-xs text-sky-700 font-bold">
                <span>Pending</span>
                <Sprout className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-xl font-extrabold text-sky-900 font-mono">
                {stats.pendingCount}
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" className="p-3.5 border-emerald-200/80 bg-emerald-50/20">
            <CardContent className="p-0 space-y-1">
              <div className="flex items-center justify-between text-xs text-emerald-700 font-bold">
                <span>Completed</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-extrabold text-emerald-900 font-mono">
                {stats.completedCount}
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" className="p-3.5 border-slate-200/80 bg-slate-50/40">
            <CardContent className="p-0 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                <span>Skipped</span>
                <Ban className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-xl font-extrabold text-slate-700 font-mono">
                {stats.skippedCount}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter Controls Bar */}
      <section>
        <ScheduleFilters
          selectedCrop={selectedCrop}
          setSelectedCrop={setSelectedCrop}
          selectedField={selectedField}
          setSelectedField={setSelectedField}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          availableCrops={availableCrops}
          availableFields={availableFields}
          onResetFilters={handleResetFilters}
        />
      </section>

      {/* Active Results Summary */}
      {pagination && !isLoading && (
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>
              Showing <strong className="text-slate-800">{schedules.length}</strong> of{" "}
              <strong className="text-slate-800">{pagination.total}</strong> scheduled activities
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
              Unable to load crop schedule
            </h3>
            <p className="text-xs text-rose-700">{errorMsg}</p>
          </div>
          <Button
            variant="emerald"
            size="sm"
            onClick={() => fetchSchedules(true)}
            className="rounded-xl gap-2 font-bold text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Query</span>
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !errorMsg && schedules.length === 0 && (
        <div className="py-16 text-center space-y-4 max-w-md mx-auto">
          <div className="p-4 w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200/80">
            <Calendar className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-800">
              No crop activities scheduled yet
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Create a crop activity schedule for your active field. Select your crop and sowing date, and KrishiVed AI will generate stage milestones automatically.
            </p>
          </div>
          <Button
            variant="emerald"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="rounded-xl gap-2 font-bold text-xs shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Schedule</span>
          </Button>
        </div>
      )}

      {/* Schedule Cards Grid */}
      {!isLoading && !errorMsg && schedules.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
        >
          {schedules.map((schedule) => (
            <CropScheduleCard
              key={schedule._id}
              schedule={schedule}
              onComplete={(s) => setCompletingSchedule(s)}
              onEdit={(s) => setEditingSchedule(s)}
              onDelete={(s) => setDeletingSchedule(s)}
              onSkip={handleSkipSchedule}
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

      {/* Modals */}
      <CreateScheduleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSchedule}
        isSubmitting={isSubmittingAction}
      />

      <CompleteScheduleModal
        schedule={completingSchedule}
        isOpen={!!completingSchedule}
        onClose={() => setCompletingSchedule(null)}
        onConfirm={handleConfirmComplete}
        isSubmitting={isSubmittingAction}
      />

      <EditScheduleModal
        schedule={editingSchedule}
        isOpen={!!editingSchedule}
        onClose={() => setEditingSchedule(null)}
        onConfirm={handleConfirmEdit}
        isSubmitting={isSubmittingAction}
      />

      <DeleteScheduleModal
        schedule={deletingSchedule}
        isOpen={!!deletingSchedule}
        onClose={() => setDeletingSchedule(null)}
        onConfirm={handleConfirmDelete}
        isSubmitting={isSubmittingAction}
      />
    </PageContainer>
  );
}
