import mongoose, { Schema, Document, Model } from "mongoose";
import { CropScheduleStatus } from "@/types/crop-schedule";
import { FarmActivityType } from "@/types/farm-diary";

export interface ICropScheduleModel extends Document {
  clerkId: string;
  crop: string;
  field: string;
  cultivatedArea: number;
  sowingDate: Date;
  scheduledDate: Date;
  activityType: FarmActivityType;
  title: string;
  description: string;
  status: CropScheduleStatus;
  stageIndex: number;
  farmDiaryEntryId?: string | null;
  completedAt?: Date | null;
  cost: number;
  quantity: number;
  quantityUnit: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const CropScheduleSchema = new Schema<ICropScheduleModel>(
  {
    clerkId: {
      type: String,
      required: true,
      index: true,
    },
    crop: {
      type: String,
      required: [true, "Crop name is required"],
      trim: true,
      maxlength: [50, "Crop name cannot exceed 50 characters"],
      index: true,
    },
    field: {
      type: String,
      required: [true, "Field name is required"],
      trim: true,
      maxlength: [50, "Field name cannot exceed 50 characters"],
    },
    cultivatedArea: {
      type: Number,
      required: true,
      default: 1,
      min: [0.01, "Cultivated area must be greater than 0"],
    },
    sowingDate: {
      type: Date,
      required: [true, "Sowing date is required"],
    },
    scheduledDate: {
      type: Date,
      required: [true, "Scheduled activity date is required"],
      index: true,
    },
    activityType: {
      type: String,
      required: true,
      enum: [
        "Sowing",
        "Irrigation",
        "Fertilization",
        "Pest Control",
        "Weeding",
        "Crop Inspection",
        "Harvest",
        "Field Preparation",
        "Other",
      ],
    },
    title: {
      type: String,
      required: [true, "Activity title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      default: "",
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    status: {
      type: String,
      required: true,
      enum: ["scheduled", "completed", "skipped"],
      default: "scheduled",
      index: true,
    },
    stageIndex: {
      type: Number,
      default: 0,
    },
    farmDiaryEntryId: {
      type: String,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    cost: {
      type: Number,
      default: 0,
      min: [0, "Cost cannot be negative"],
    },
    quantity: {
      type: Number,
      default: 0,
      min: [0, "Quantity cannot be negative"],
    },
    quantityUnit: {
      type: String,
      default: "",
      maxlength: [20, "Quantity unit cannot exceed 20 characters"],
    },
    notes: {
      type: String,
      default: "",
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
    collection: "cropSchedules",
  }
);

// Compound indexes for efficient timeline and filter queries
CropScheduleSchema.index({ clerkId: 1, scheduledDate: 1 });
CropScheduleSchema.index({ clerkId: 1, status: 1 });
CropScheduleSchema.index({ clerkId: 1, crop: 1 });

const CropSchedule: Model<ICropScheduleModel> =
  mongoose.models.CropSchedule ||
  mongoose.model<ICropScheduleModel>("CropSchedule", CropScheduleSchema);

export default CropSchedule;
