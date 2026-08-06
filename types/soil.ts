export interface ISoilRecommendationResult {
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
}

export interface ISoilRecommendationDocument extends ISoilRecommendationResult {
  _id?: string;
  clerkId: string;
  createdAt?: string | Date;
}
