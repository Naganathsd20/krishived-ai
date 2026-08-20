import mongoose, { Schema, Document, Model } from "mongoose";
import { AgricultureCenterType } from "@/types/agriculture-center";

export interface IAgricultureCenterModel extends Document {
  name: string;
  type: AgricultureCenterType;
  address: string;
  district: string;
  state: string;
  pincode?: string;
  phone?: string;
  email?: string;
  website?: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  officialSource: string;
  sourceUrl?: string;
  isVerified: boolean;
  lastVerified: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AgricultureCenterSchema = new Schema<IAgricultureCenterModel>(
  {
    name: {
      type: String,
      required: [true, "Center name is required"],
      trim: true,
      maxlength: [150, "Center name cannot exceed 150 characters"],
      index: true,
    },
    type: {
      type: String,
      required: [true, "Center type is required"],
      enum: ["KVK", "GovtOffice", "University", "SoilLab", "FarmerService"],
      index: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      maxlength: [300, "Address cannot exceed 300 characters"],
    },
    district: {
      type: String,
      required: [true, "District is required"],
      trim: true,
      maxlength: [100, "District name cannot exceed 100 characters"],
      index: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
      maxlength: [100, "State name cannot exceed 100 characters"],
      index: true,
    },
    pincode: {
      type: String,
      default: "",
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
    },
    website: {
      type: String,
      default: "",
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    officialSource: {
      type: String,
      required: true,
      default: "ICAR / Ministry of Agriculture & Farmers Welfare, Govt of India",
    },
    sourceUrl: {
      type: String,
      default: "https://kvk.icar.gov.in",
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    lastVerified: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "agricultureCenters",
  }
);

// Compound index for state, district, and type queries
AgricultureCenterSchema.index({ state: 1, district: 1, type: 1 });

// Geospatial index for 2D distance queries
AgricultureCenterSchema.index({ location: "2dsphere" });

const AgricultureCenter: Model<IAgricultureCenterModel> =
  mongoose.models.AgricultureCenter ||
  mongoose.model<IAgricultureCenterModel>("AgricultureCenter", AgricultureCenterSchema);

export default AgricultureCenter;
