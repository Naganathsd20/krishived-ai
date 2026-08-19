import mongoose, { Schema, Document, Model } from "mongoose";
import { FarmActivityType } from "@/types/farm-diary";

export interface IFarmDiaryModel extends Document {
  clerkId: string;
  activityType: FarmActivityType;
  title: string;
  description: string;
  crop: string;
  field: string;
  activityDate: Date;
  quantity: number;
  quantityUnit: string;
  cost: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const FarmDiarySchema = new Schema<IFarmDiaryModel>(
  {
    clerkId: {
      type: String,
      required: true,
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
      index: true,
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
    crop: {
      type: String,
      default: "",
      maxlength: [50, "Crop name cannot exceed 50 characters"],
    },
    field: {
      type: String,
      default: "",
      maxlength: [50, "Field name cannot exceed 50 characters"],
    },
    activityDate: {
      type: Date,
      required: [true, "Activity date is required"],
      default: Date.now,
      index: true,
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
    cost: {
      type: Number,
      default: 0,
      min: [0, "Cost cannot be negative"],
    },
    notes: {
      type: String,
      default: "",
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
    collection: "farmDiaries",
  }
);

// Compound index for user timeline queries
FarmDiarySchema.index({ clerkId: 1, activityDate: -1 });

const FarmDiary: Model<IFarmDiaryModel> =
  mongoose.models.FarmDiary ||
  mongoose.model<IFarmDiaryModel>("FarmDiary", FarmDiarySchema);

export default FarmDiary;
