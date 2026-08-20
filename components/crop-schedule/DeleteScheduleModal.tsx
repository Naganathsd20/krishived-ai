"use client";

import React from "react";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { ICropScheduleItem } from "@/types/crop-schedule";

interface DeleteScheduleModalProps {
  schedule: ICropScheduleItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
  isSubmitting: boolean;
}

export const DeleteScheduleModal: React.FC<DeleteScheduleModalProps> = ({
  schedule,
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}) => {
  if (!schedule) return null;

  const handleDelete = async () => {
    try {
      await onConfirm(schedule._id!);
      onClose();
    } catch (err) {
      console.error("Error deleting schedule:", err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Schedule Task"
      description="Are you sure you want to delete this schedule task? This action cannot be undone."
      size="sm"
    >
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Confirm Task Deletion</span>
          </div>
          <p className="text-[11px] leading-relaxed text-rose-800">
            Task: <strong>{schedule.title}</strong> ({schedule.crop} • {schedule.field}) will be removed from your activity schedule.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-xl text-xs font-bold border-slate-200 text-slate-700"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="danger"
            size="sm"
            disabled={isSubmitting}
            onClick={handleDelete}
            className="rounded-xl text-xs font-bold gap-1.5 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Task</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
