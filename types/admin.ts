export type AdminTimeRange = "24h" | "7d" | "30d" | "all";

export interface IAdminKpiStats {
  totalUsers: number;
  newUsersInRange: number;
  activeUsersInRange: number;
  totalPlatformActivities: number;
}

export interface IAdminFeatureUsage {
  diseaseScans: number;
  aiConversations: number;
  soilAdvisories: number;
  farmDiaryEntries: number;
  cropSchedules: number;
  harvestLogs: number;
}

export interface IAdminDiseaseInsight {
  disease: string;
  count: number;
  percentage: number;
}

export interface IAdminRecentActivity {
  id: string;
  activityType: string;
  title: string;
  crop: string;
  timestamp: string;
  location: string;
}

export interface IAdminServiceHealth {
  name: string;
  status: "Operational" | "Degraded" | "Unconfigured";
  details: string;
  lastChecked: string;
}

export interface IAdminSystemHealth {
  overallStatus: "Operational" | "Degraded";
  database: IAdminServiceHealth;
  weatherApi: IAdminServiceHealth;
  geminiAi: IAdminServiceHealth;
  cloudinary: IAdminServiceHealth;
}

export interface IAdminOverviewData {
  timeRange: AdminTimeRange;
  kpiStats: IAdminKpiStats;
  featureUsage: IAdminFeatureUsage;
  diseaseInsights: IAdminDiseaseInsight[];
  recentActivity: IAdminRecentActivity[];
  systemHealth: IAdminSystemHealth;
  dataFreshness: string;
  generatedAt: string;
}

export interface IAdminOverviewResponse {
  success: boolean;
  data?: IAdminOverviewData;
  error?: string;
}

export interface IAdminAuthResult {
  isAuthorized: boolean;
  status: number;
  error?: string;
  userId?: string;
  userRole?: string;
}
