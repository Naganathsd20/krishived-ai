export type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "INSUFFICIENT DATA";
export type DataQuality = "HIGH CONFIDENCE" | "MODERATE CONFIDENCE" | "LIMITED DATA";

export interface IFarmActionRecommendation {
  id: string;
  title: string;
  description: string;
  category: "Disease" | "Weather" | "Soil" | "Monitoring";
  priority: "High" | "Medium" | "Low";
  evidence: string;
}

export interface IFarmIntelligenceFactors {
  disease: {
    totalRecords: number;
    recentDisease: string | null;
    recentSeverity: "Low" | "Medium" | "High" | null;
    highRiskCount: number;
    moderateRiskCount: number;
    diseaseDetectedCount: number;
    lastScanDate: string | null;
  };
  weather: {
    hasData: boolean;
    city: string | null;
    temperature: number | null;
    humidity: number | null;
    rainProbability: number | null;
    condition: string | null;
    lastCheckedDate: string | null;
  };
  soil: {
    hasData: boolean;
    soilHealthScore: string | null;
    bestCrop: string | null;
    fertilizerRecommendation: string | null;
    irrigationRecommendation: string | null;
    diseaseRiskLevel: "Low" | "Medium" | "High" | null;
    lastReportDate: string | null;
  };
  farmHealth: {
    overallScore: number | null;
    status: string;
    hasEnoughData: boolean;
  };
}

export interface IFarmIntelligenceResponse {
  success: boolean;
  riskLevel: RiskLevel;
  dataQuality: DataQuality;
  reasons: string[];
  advisory: string;
  recommendations: IFarmActionRecommendation[];
  factors: IFarmIntelligenceFactors;
  error?: string;
}
