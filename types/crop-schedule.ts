import { FarmActivityType } from "@/types/farm-diary";

export type CropScheduleStatus = "scheduled" | "completed" | "skipped";

export interface ICropStageTemplate {
  stageIndex: number;
  stageName: string;
  activityType: FarmActivityType;
  offsetDaysStart: number;
  offsetDaysEnd: number;
  title: string;
  description: string;
  recommendedAction: string;
}

export interface ICropScheduleItem {
  _id?: string;
  clerkId: string;
  crop: string;
  field: string;
  cultivatedArea: number;
  sowingDate: string | Date;
  scheduledDate: string | Date;
  activityType: FarmActivityType;
  title: string;
  description: string;
  status: CropScheduleStatus;
  stageIndex: number;
  farmDiaryEntryId?: string | null;
  completedAt?: string | Date | null;
  cost: number;
  quantity: number;
  quantityUnit: string;
  notes: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ICreateCropScheduleInput {
  crop: string;
  field: string;
  cultivatedArea: number;
  sowingDate: string;
  notes?: string;
}

export interface IUpdateCropScheduleInput {
  status?: CropScheduleStatus;
  scheduledDate?: string;
  cost?: number;
  quantity?: number;
  quantityUnit?: string;
  notes?: string;
  syncToFarmDiary?: boolean;
}

export interface ICropScheduleStats {
  totalSchedules: number;
  pendingCount: number;
  completedCount: number;
  skippedCount: number;
  dueTodayCount: number;
}

export interface ICropSchedulePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ICropScheduleResponse {
  success: boolean;
  error?: string;
  schedule?: ICropScheduleItem;
  schedules?: ICropScheduleItem[];
  stats?: ICropScheduleStats;
  pagination?: ICropSchedulePagination;
  availableCrops?: string[];
  availableFields?: string[];
}
