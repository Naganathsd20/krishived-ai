export interface IHarvestLog {
  _id: string;
  clerkId: string;
  crop: string;
  season: string;
  harvestDate: string;
  cultivatedArea: number;
  areaUnit: string;
  totalYield: number;
  yieldUnit: string;
  yieldPerArea: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IHarvestLogInput {
  crop: string;
  season: string;
  harvestDate: string;
  cultivatedArea: number;
  areaUnit: string;
  totalYield: number;
  yieldUnit: string;
  notes?: string;
}
