"use client";

import React, { useState } from "react";
import { CheckCircle2, DollarSign, Package, BookOpen, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { ICropScheduleItem } from "@/types/crop-schedule";

interface CompleteScheduleModalProps {
  schedule: ICropScheduleItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    id: string,
    data: { cost: number; quantity: number; quantityUnit: string; notes: string }
  ) => Promise<void>;
  isSubmitting: boolean;
}

const QUANTITY_UNITS = ["Kg", "Quintal", "Tonne", "Litre", "Bags", "Hours", "Units"];

export const CompleteScheduleModal: React.FC<CompleteScheduleModalProps> = ({
  schedule,
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}) => {
  const [cost, setCost] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [quantityUnit, setQuantityUnit] = useState<string>("Kg");
  const [notes, setNotes] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!schedule) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);

    const costNum = Math.max(0, parseFloat(cost) || 0);
    const quantityNum = Math.max(0, parseFloat(quantity) || 0);

    try {
      await onConfirm(schedule._id!, {
        cost: costNum,
        quantity: quantityNum,
        quantityUnit: quantityNum > 0 ? quantityUnit : "",
        notes: notes.trim(),
      });

      setSuccessMsg("Activity completed and automatically synced to your Farm Diary.");
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Error completing activity:", err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Mark Completed: ${schedule.title}`}
      description={`${schedule.crop} • ${schedule.field} • ${schedule.activityType}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1 text-xs text-slate-700">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Farm Diary Integration</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-600">
            Completing this schedule task will automatically log an activity entry into your Farm Diary with the expense and quantities entered below.
          </p>
        </div>

        {/* Expense Amount */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Expense Cost (₹ INR)
          </label>
          <input
            type="number"
            min="0"
            step="10"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="e.g. 1500 (Optional)"
            className="w-full px-3 py-2 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        {/* Quantity Used / Harvested */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-emerald-600" /> Quantity Used / Harvested
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 50"
              className="w-full px-3 py-2 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Unit</label>
            <select
              value={quantityUnit}
              onChange={(e) => setQuantityUnit(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
            >
              {QUANTITY_UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Completion Notes */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Completion Notes</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Applied 2 bags Urea in morning hours. Weather clear."
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
                <span>Completing & Syncing...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Complete Task</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
