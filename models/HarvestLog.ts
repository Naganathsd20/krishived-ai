import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHarvestLogModel extends Document {
  clerkId: string;
  crop: string;
  season: string;
  harvestDate: Date;
  cultivatedArea: number;
  areaUnit: string;
  totalYield: number;
  yieldUnit: string;
  yieldPerArea: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const HarvestLogSchema = new Schema<IHarvestLogModel>(
  {
    clerkId: {
      type: String,
      required: true,
      index: true,
    },
    crop: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    season: {
      type: String,
      required: true,
      trim: true,
      enum: ["Kharif", "Rabi", "Zaid", "Whole Year"],
      default: "Kharif",
    },
    harvestDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    cultivatedArea: {
      type: Number,
      required: true,
      min: [0.01, "Cultivated area must be greater than 0"],
    },
    areaUnit: {
      type: String,
      required: true,
      enum: ["Acre", "Hectare", "Guntha", "Bigha"],
      default: "Acre",
    },
    totalYield: {
      type: Number,
      required: true,
      min: [0.01, "Total yield must be greater than 0"],
    },
    yieldUnit: {
      type: String,
      required: true,
      enum: ["Quintal", "Kg", "Tonne"],
      default: "Quintal",
    },
    yieldPerArea: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const HarvestLog: Model<IHarvestLogModel> =
  mongoose.models.HarvestLog ||
  mongoose.model<IHarvestLogModel>("HarvestLog", HarvestLogSchema);

export default HarvestLog;
