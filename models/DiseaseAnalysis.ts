import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDiseaseAnalysisModel extends Document {
  clerkId: string;
  imageUrl: string;
  disease: string;
  confidence: string;
  severity: "Low" | "Medium" | "High";
  symptoms: string[];
  cause: string;
  treatment: string[];
  prevention: string[];
  recommendedFertilizer: string;
  recommendedPesticide: string;
  immediateActions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const DiseaseAnalysisSchema = new Schema<IDiseaseAnalysisModel>(
  {
    clerkId: {
      type: String,
      required: true,
      index: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    disease: {
      type: String,
      required: true,
    },
    confidence: {
      type: String,
      required: true,
      default: "92%",
    },
    severity: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    symptoms: {
      type: [String],
      default: [],
    },
    cause: {
      type: String,
      default: "",
    },
    treatment: {
      type: [String],
      default: [],
    },
    prevention: {
      type: [String],
      default: [],
    },
    recommendedFertilizer: {
      type: String,
      default: "",
    },
    recommendedPesticide: {
      type: String,
      default: "",
    },
    immediateActions: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const DiseaseAnalysis: Model<IDiseaseAnalysisModel> =
  mongoose.models.DiseaseAnalysis ||
  mongoose.model<IDiseaseAnalysisModel>("DiseaseAnalysis", DiseaseAnalysisSchema);

export default DiseaseAnalysis;
