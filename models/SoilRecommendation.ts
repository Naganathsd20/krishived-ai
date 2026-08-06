import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISoilRecommendationModel extends Document {
  clerkId: string;
  city: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  rainProbability: number;
  weatherCondition: string;
  soilHealthScore: string;
  bestCrop: string;
  alternativeCrops: string[];
  irrigationRecommendation: string;
  fertilizerRecommendation: string;
  diseaseRiskLevel: "Low" | "Medium" | "High";
  farmingTips: string[];
  explanations: {
    cropChoice: string;
    irrigation: string;
    fertilizer: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SoilRecommendationSchema = new Schema<ISoilRecommendationModel>(
  {
    clerkId: {
      type: String,
      required: true,
      index: true,
    },
    city: {
      type: String,
      required: true,
    },
    temperature: {
      type: Number,
      required: true,
    },
    humidity: {
      type: Number,
      required: true,
    },
    windSpeed: {
      type: Number,
      required: true,
    },
    pressure: {
      type: Number,
      required: true,
    },
    rainProbability: {
      type: Number,
      required: true,
    },
    weatherCondition: {
      type: String,
      required: true,
    },
    soilHealthScore: {
      type: String,
      required: true,
      default: "85/100 (Optimal Fertility)",
    },
    bestCrop: {
      type: String,
      required: true,
    },
    alternativeCrops: {
      type: [String],
      default: [],
    },
    irrigationRecommendation: {
      type: String,
      required: true,
    },
    fertilizerRecommendation: {
      type: String,
      required: true,
    },
    diseaseRiskLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },
    farmingTips: {
      type: [String],
      default: [],
    },
    explanations: {
      cropChoice: { type: String, default: "" },
      irrigation: { type: String, default: "" },
      fertilizer: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
    collection: "soilRecommendations",
  }
);

const SoilRecommendation: Model<ISoilRecommendationModel> =
  mongoose.models.SoilRecommendation ||
  mongoose.model<ISoilRecommendationModel>(
    "SoilRecommendation",
    SoilRecommendationSchema
  );

export default SoilRecommendation;
