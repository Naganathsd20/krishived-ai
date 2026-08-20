"use client";

import React, { useState, useEffect } from "react";
import { Calendar, DollarSign, Package, Edit2, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { ICropScheduleItem } from "@/types/crop-schedule";

interface EditScheduleModalProps {
  schedule: ICropScheduleItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    id: string,
    data: {
      scheduledDate?: string;
      cost?: number;
      quantity?: number;
      quantityUnit?: string;
      notes?: string;
    }
  ) => Promise<void>;
  isSubmitting: boolean;
}

export const EditScheduleModal: React.FC<EditScheduleModalProps> = ({
  schedule,
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}) => {
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [cost, setCost] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [quantityUnit, setQuantityUnit] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    if (schedule) {
      setScheduledDate(
        schedule.scheduledDate
          ? new Date(schedule.scheduledDate).toISOString().split("T")[0]
          : ""
      );
      setCost(schedule.cost > 0 ? String(schedule.cost) : "");
      setQuantity(schedule.quantity > 0 ? String(schedule.quantity) : "");
      setQuantityUnit(schedule.quantityUnit || "Kg");
      setNotes(schedule.notes || "");
    }
  }, [schedule]);

  if (!schedule) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const costNum = Math.max(0, parseFloat(cost) || 0);
    const quantityNum = Math.max(0, parseFloat(quantity) || 0);

    try {
      await onConfirm(schedule._id!, {
        scheduledDate,
        cost: costNum,
        quantity: quantityNum,
        quantityUnit,
        notes: notes.trim(),
      });
      onClose();
    } catch (err) {
      console.error("Error editing schedule:", err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Activity: ${schedule.title}`}
      description={`${schedule.crop} • ${schedule.field}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Scheduled Date */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Scheduled Date
          </label>
          <input
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
            required
          />
        </div>

        {/* Cost & Quantity */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Cost (₹)
            </label>
            <input
              type="number"
              min="0"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-emerald-600" /> Quantity
            </label>
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Task Notes</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
          />
        </div>

        {/* Footer Actions */}
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
            type="submit"
            variant="emerald"
            size="sm"
            disabled={isSubmitting}
            className="rounded-xl text-xs font-bold gap-1.5 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Edit2 className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
