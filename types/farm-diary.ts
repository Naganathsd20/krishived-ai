export type FarmActivityType =
  | "Sowing"
  | "Irrigation"
  | "Fertilization"
  | "Pest Control"
  | "Weeding"
  | "Crop Inspection"
  | "Harvest"
  | "Field Preparation"
  | "Other";

export interface IFarmDiaryEntry {
  _id: string;
  clerkId: string;
  activityType: FarmActivityType;
  title: string;
  description?: string;
  crop?: string;
  field?: string;
  activityDate: string; // ISO string
  quantity?: number;
  quantityUnit?: string;
  cost?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IFarmDiaryStats {
  totalEntries: number;
  totalExpenses: number;
  latestActivityDate: string | null;
  topCrop: string | null;
}

export interface IFarmDiaryResponse {
  success: boolean;
  entries?: IFarmDiaryEntry[];
  stats?: IFarmDiaryStats;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: string;
}
