export interface IFarmHealthBreakdown {
  cropHealthScore: number;
  soilHealthScore: number;
  diseaseRiskScore: number;
  weatherStabilityScore: number;
  irrigationScore: number;
}

export interface IFarmHealthData {
  hasEnoughData: boolean;
  overallScore: number | null;
  status: "Excellent" | "Good" | "Moderate" | "Needs Attention" | "Insufficient data";
  breakdown: IFarmHealthBreakdown | null;
}

export interface IAnalyticsStats {
  cropReportsCount: number;
  diseaseAnalysesCount: number;
  weatherChecksCount: number;
  conversationsCount: number;
  soilRecommendationsCount: number;
}

export interface ICropHealthDistribution {
  healthyCount: number;
  healthyPercentage: number;
  moderateRiskCount: number;
  moderateRiskPercentage: number;
  highRiskCount: number;
  highRiskPercentage: number;
  totalFieldsAnalyzed: number;
}

export interface IDiseaseBreakdownItem {
  name: string;
  count: number;
  percentage: number;
  severity: "Healthy" | "High" | "Medium" | "Low";
}

export interface IRecentDiseaseScan {
  id: string;
  disease: string;
  severity: "Healthy" | "High" | "Medium" | "Low";
  confidence: string;
  imageUrl?: string;
  timestamp: string;
  createdAtISO: string;
}

export interface IDiseaseAnalyticsData {
  totalAnalyses: number;
  healthyCount: number;
  healthyPercentage: number;
  diseaseDetectedCount: number;
  diseaseDetectedPercentage: number;
  highestDetectedDisease: string;
  breakdown: IDiseaseBreakdownItem[];
  recentDiseaseScans?: IRecentDiseaseScan[];
}

export interface IWeatherTrendItem {
  day: string;
  dateStr: string;
  temp: number;
  humidity: number;
  rainProb: number;
  city: string;
}

export interface IWeatherAnalyticsData {
  hasData: boolean;
  avgTemperature: number | null;
  avgHumidity: number | null;
  avgRainProbability: number | null;
  weatherChecksCount: number;
  recentCity: string | null;
  trend: IWeatherTrendItem[];
}

export interface ISoilCropInsightsData {
  hasData: boolean;
  mostRecommendedCrop: string;
  averageSoilScore: string;
  mostCommonFertilizer: string;
  irrigationRecommendation: string;
}

export interface IRecentActivityItem {
  id: string;
  type: "disease" | "soil" | "weather" | "chat";
  title: string;
  subtitle: string;
  timestamp: string;
  createdAtISO: string;
}

export interface IAnalyticsResponse {
  success: boolean;
  error?: string;
  farmHealth: IFarmHealthData;
  stats: IAnalyticsStats;
  cropHealth: ICropHealthDistribution;
  diseaseAnalytics: IDiseaseAnalyticsData;
  weatherAnalytics: IWeatherAnalyticsData;
  soilCropInsights: ISoilCropInsightsData;
  aiInsights: string[];
  recentActivities: IRecentActivityItem[];
}
