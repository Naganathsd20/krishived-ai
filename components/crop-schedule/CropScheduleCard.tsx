"use client";

import React from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Ban,
  AlertTriangle,
  FileText,
  Edit2,
  Trash2,
  BookOpen,
  DollarSign,
  Package,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ICropScheduleItem } from "@/types/crop-schedule";

interface CropScheduleCardProps {
  schedule: ICropScheduleItem;
  onComplete: (schedule: ICropScheduleItem) => void;
  onEdit: (schedule: ICropScheduleItem) => void;
  onDelete: (schedule: ICropScheduleItem) => void;
  onSkip: (schedule: ICropScheduleItem) => void;
}

export const CropScheduleCard: React.FC<CropScheduleCardProps> = ({
  schedule,
  onComplete,
  onEdit,
  onDelete,
  onSkip,
}) => {
  const {
    crop,
    field,
    title,
    description,
    activityType,
    scheduledDate,
    status,
    farmDiaryEntryId,
    completedAt,
    cost,
    quantity,
    quantityUnit,
    notes,
    stageIndex,
  } = schedule;

  const todayStr = new Date().toISOString().split("T")[0];
  const scheduledDateObj = new Date(scheduledDate);
  const scheduledDateStr = scheduledDateObj.toISOString().split("T")[0];

  const isOverdue = status === "scheduled" && scheduledDateStr < todayStr;
  const isDueToday = status === "scheduled" && scheduledDateStr === todayStr;

  const formattedScheduledDate = scheduledDateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const formattedCompletedDate = completedAt
    ? new Date(completedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <Card
      variant="glass"
      className={`p-5 h-full flex flex-col justify-between border-slate-200/80 transition-all duration-300 shadow-sm hover:shadow-md ${
        status === "completed"
          ? "border-emerald-300 bg-emerald-50/30"
          : isOverdue
          ? "border-rose-300 bg-rose-50/20"
          : isDueToday
          ? "border-amber-300 bg-amber-50/20"
          : "hover:border-emerald-300"
      }`}
    >
      <CardContent className="p-0 space-y-4 flex-grow">
        {/* Header: Stage Badge, Crop/Field, and Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="emerald" className="text-[10px] font-extrabold py-0.5 px-2">
                Stage {stageIndex + 1}: {activityType}
              </Badge>
              <Badge variant="glass" className="text-[10px] font-bold text-slate-700">
                {crop} • {field}
              </Badge>
            </div>

            {/* Status Indicator Badge */}
            {status === "completed" ? (
              <Badge variant="emerald" className="text-[10px] font-bold gap-1 shrink-0">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Completed
              </Badge>
            ) : status === "skipped" ? (
              <Badge variant="outline" className="text-[10px] font-bold text-slate-400 gap-1 shrink-0">
                <Ban className="w-3 h-3 text-slate-400" />
                Skipped
              </Badge>
            ) : isOverdue ? (
              <Badge variant="danger" className="text-[10px] font-bold gap-1 shrink-0 animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                Overdue
              </Badge>
            ) : isDueToday ? (
              <Badge variant="warning" className="text-[10px] font-bold gap-1 shrink-0">
                <Clock className="w-3 h-3" />
                Due Today
              </Badge>
            ) : (
              <Badge variant="info" className="text-[10px] font-bold gap-1 shrink-0">
                <Calendar className="w-3 h-3" />
                Scheduled
              </Badge>
            )}
          </div>

          <h3 className="text-base font-extrabold text-slate-900 leading-snug">{title}</h3>
        </div>

        {/* Date & Details */}
        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-2 text-slate-700 font-bold">
            <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Scheduled: {formattedScheduledDate}</span>
          </div>

          {description && (
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/50">
              {description}
            </p>
          )}

          {/* Logged Cost or Quantities */}
          {(cost > 0 || quantity > 0 || notes) && (
            <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60 space-y-1 text-[11px]">
              {cost > 0 && (
                <div className="flex items-center justify-between text-emerald-900 font-bold">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-emerald-600" /> Cost:
                  </span>
                  <span>₹{cost.toLocaleString("en-IN")}</span>
                </div>
              )}
              {quantity > 0 && (
                <div className="flex items-center justify-between text-emerald-900 font-bold">
                  <span className="flex items-center gap-1">
                    <Package className="w-3 h-3 text-emerald-600" /> Quantity:
                  </span>
                  <span>
                    {quantity} {quantityUnit}
                  </span>
                </div>
              )}
              {notes && (
                <div className="text-slate-600 italic text-[11px] pt-0.5">
                  &quot;{notes}&quot;
                </div>
              )}
            </div>
          )}

          {/* Farm Diary Sync Badge */}
          {farmDiaryEntryId && (
            <div className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 pt-0.5">
              <BookOpen className="w-3 h-3 text-emerald-600" />
              <span>Logged in Farm Diary</span>
              {formattedCompletedDate && <span>• {formattedCompletedDate}</span>}
            </div>
          )}
        </div>
      </CardContent>

      {/* Footer Action Buttons */}
      <div className="pt-4 flex items-center justify-between gap-2 border-t border-slate-100 mt-4">
        {status === "scheduled" ? (
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 w-full">
            <Button
              variant="emerald"
              size="sm"
              onClick={() => onComplete(schedule)}
              className="flex-1 rounded-xl text-xs font-bold gap-1 shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Complete</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onSkip(schedule)}
              className="rounded-xl text-xs font-bold border-slate-200 text-slate-600 hover:bg-slate-100 px-2.5"
              title="Skip Task"
            >
              <Ban className="w-3.5 h-3.5" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(schedule)}
              className="rounded-xl text-xs font-bold border-slate-200 text-slate-600 hover:bg-slate-100 px-2.5"
              title="Edit Task"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(schedule)}
              className="rounded-xl text-xs font-bold border-rose-200 text-rose-600 hover:bg-rose-50 px-2.5"
              title="Delete Task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] font-bold text-slate-500 capitalize">
              Status: {status}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(schedule)}
                className="rounded-xl text-xs font-bold border-slate-200 text-slate-600 hover:bg-slate-100 px-2 py-1 h-7"
              >
                <Edit2 className="w-3 h-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(schedule)}
                className="rounded-xl text-xs font-bold border-rose-200 text-rose-600 hover:bg-rose-50 px-2 py-1 h-7"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
