export type TimeRangeOption = "7d" | "30d" | "3m" | "6m" | "1y" | "all";

export interface IKPISummary {
  totalExpenses: number;
  totalActivities: number;
  totalHarvests: number;
  totalProductionQuintals: number;
  avgYieldPerAcre: number;
  avgSoilScore: number | null;
  diseaseScanCount: number;
}

export interface IYieldCropEfficiency {
  crop: string;
  season: string;
  totalYieldQuintals: number;
  totalAreaAcres: number;
  yieldPerAcre: number;
  harvestCount: number;
}

export interface ICropProductivityComparison {
  crop: string;
  totalYieldQuintals: number;
  totalAreaAcres: number;
  avgYieldPerAcre: number;
  harvestCount: number;
}

export interface IYieldAnalytics {
  hasData: boolean;
  totalHarvests: number;
  totalProductionQuintals: number;
  totalAreaAcres: number;
  avgYieldPerAcre: number;
  byCropAndSeason: IYieldCropEfficiency[];
  cropComparison: ICropProductivityComparison[];
}

export interface IActivityCostByType {
  activityType: string;
  totalCost: number;
  count: number;
  percentage: number;
}

export interface ICropCost {
  crop: string;
  totalCost: number;
  count: number;
}

export interface ICostTrendPoint {
  periodLabel: string;
  dateISO: string;
  cost: number;
  count: number;
}

export interface IExpenseAnalytics {
  hasData: boolean;
  totalExpenses: number;
  activityCount: number;
  byActivity: IActivityCostByType[];
  byCrop: ICropCost[];
  costTrends: ICostTrendPoint[];
}

export interface IActivityTrendPoint {
  periodLabel: string;
  dateISO: string;
  activityCount: number;
  totalCost: number;
}

export interface IActivityTrends {
  hasData: boolean;
  hasEnoughTrendData: boolean;
  trend: IActivityTrendPoint[];
  byType: { activityType: string; count: number }[];
}

export interface IDiseaseSeverityDist {
  Low: number;
  Medium: number;
  High: number;
}

export interface IDiseaseFrequency {
  disease: string;
  count: number;
  percentage: number;
  severity: "Low" | "Medium" | "High" | "Healthy";
}

export interface IDiseaseTrendPoint {
  periodLabel: string;
  dateISO: string;
  scanCount: number;
  highRiskCount: number;
}

export interface IDiseaseAnalytics {
  hasData: boolean;
  hasEnoughTrendData: boolean;
  totalScans: number;
  diseaseDetectedCount: number;
  healthyCount: number;
  healthyPercentage: number;
  severityDistribution: IDiseaseSeverityDist;
  topDiseases: IDiseaseFrequency[];
  incidentsTrend: IDiseaseTrendPoint[];
}

export interface ISoilHealthTrendPoint {
  dateISO: string;
  score: number;
  city: string;
}

export interface ISoilWeatherAnalytics {
  hasData: boolean;
  hasEnoughTrendData: boolean;
  avgSoilHealthScore: number | null;
  soilHealthStatus: string;
  avgTemperature: number | null;
  avgHumidity: number | null;
  avgRainProbability: number | null;
  weatherConditions: { condition: string; count: number }[];
  recommendedCrops: { crop: string; count: number }[];
  soilProgression: ISoilHealthTrendPoint[];
}

export interface IDataQualityMetadata {
  hasHarvestData: boolean;
  hasDiaryData: boolean;
  hasDiseaseData: boolean;
  hasSoilData: boolean;
  hasEnoughTrendData: boolean;
  status: "OPTIMAL_DATA" | "INSUFFICIENT_DATA" | "NO_DATA";
  notes: string[];
}

export interface IAdvancedAnalyticsResponse {
  success: boolean;
  error?: string;
  timeRange?: TimeRangeOption;
  selectedCrop?: string;
  period?: { startISO: string; endISO: string };
  kpiSummary?: IKPISummary;
  yieldAnalytics?: IYieldAnalytics;
  expenseAnalytics?: IExpenseAnalytics;
  activityTrends?: IActivityTrends;
  diseaseAnalytics?: IDiseaseAnalytics;
  soilWeatherAnalytics?: ISoilWeatherAnalytics;
  dataQuality?: IDataQualityMetadata;
}
