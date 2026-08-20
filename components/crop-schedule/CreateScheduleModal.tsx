"use client";

import React, { useState } from "react";
import { Calendar, Sprout, MapPin, AlertCircle, Loader2, Info } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { ICreateCropScheduleInput } from "@/types/crop-schedule";

interface CreateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: ICreateCropScheduleInput) => Promise<void>;
  isSubmitting: boolean;
}

const COMMON_CROPS = [
  "Wheat",
  "Paddy",
  "Cotton",
  "Tomato",
  "Mustard",
  "Maize",
  "Soybean",
  "Sugarcane",
  "Gram",
  "Potato",
  "Custom",
];

export const CreateScheduleModal: React.FC<CreateScheduleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [selectedCropOption, setSelectedCropOption] = useState<string>("Wheat");
  const [customCropName, setCustomCropName] = useState<string>("");
  const [field, setField] = useState<string>("");
  const [cultivatedArea, setCultivatedArea] = useState<string>("1.0");
  const [sowingDate, setSowingDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState<string>("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const activeCropName =
      selectedCropOption === "Custom" ? customCropName.trim() : selectedCropOption;

    if (!activeCropName || activeCropName.length > 50) {
      setValidationError("Please enter a valid crop name (max 50 characters).");
      return;
    }

    if (!field.trim() || field.trim().length > 50) {
      setValidationError("Please enter a valid field name (max 50 characters).");
      return;
    }

    const areaNum = parseFloat(cultivatedArea);
    if (isNaN(areaNum) || areaNum <= 0) {
      setValidationError("Cultivated area must be a positive number greater than 0.");
      return;
    }

    if (!sowingDate) {
      setValidationError("Please select a sowing date.");
      return;
    }

    // Client-side Sowing Date Range Check (-180 days to +90 days)
    const selectedDateObj = new Date(sowingDate);
    if (isNaN(selectedDateObj.getTime())) {
      setValidationError("Invalid sowing date format.");
      return;
    }

    const now = new Date();
    const minSowingDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    const maxSowingDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    if (selectedDateObj < minSowingDate || selectedDateObj > maxSowingDate) {
      setValidationError("Sowing date must be within the last 180 days or next 90 days.");
      return;
    }

    try {
      await onSubmit({
        crop: activeCropName,
        field: field.trim(),
        cultivatedArea: areaNum,
        sowingDate,
        notes: notes.trim(),
      });
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create crop schedule.";
      setValidationError(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Smart Crop Activity Schedule"
      description="Select your crop, field, and sowing date. KrishiVed AI will automatically generate ICAR stage-by-stage task timelines."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {validationError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Crop Dropdown */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Sprout className="w-3.5 h-3.5 text-emerald-600" /> Select Crop
            </label>
            <select
              value={selectedCropOption}
              onChange={(e) => setSelectedCropOption(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
            >
              {COMMON_CROPS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Crop Name if selected */}
          {selectedCropOption === "Custom" && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Custom Crop Name</label>
              <input
                type="text"
                value={customCropName}
                onChange={(e) => setCustomCropName(e.target.value)}
                placeholder="e.g. Sunflower, Bajra, Onion"
                className="w-full px-3 py-2 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          )}

          {/* Field Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Field / Plot Name
            </label>
            <input
              type="text"
              value={field}
              onChange={(e) => setField(e.target.value)}
              placeholder="e.g. North Plot, Main Farm"
              className="w-full px-3 py-2 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              required
            />
          </div>

          {/* Cultivated Area */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Cultivated Area (Acres)</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={cultivatedArea}
              onChange={(e) => setCultivatedArea(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              required
            />
          </div>

          {/* Sowing Date */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Sowing / Planting Date
            </label>
            <input
              type="date"
              value={sowingDate}
              onChange={(e) => setSowingDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
              required
            />
          </div>
        </div>

        {/* Info Box */}
        <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 text-xs text-emerald-900 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <Info className="w-4 h-4 text-emerald-600" />
            <span>Automatic Stage Generator</span>
          </div>
          <p className="text-[11px] leading-relaxed text-emerald-800">
            Sowing date must be within the last 180 days or next 90 days. KrishiVed AI will automatically seed stage milestones for Irrigation, Fertilization, Pest Control, and Harvesting based on ICAR agronomic research.
          </p>
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Additional Field Notes (Optional)</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Drip irrigation installed, soil test completed"
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
                <span>Generating Schedule...</span>
              </>
            ) : (
              <>
                <Sprout className="w-3.5 h-3.5" />
                <span>Generate Crop Schedule</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
