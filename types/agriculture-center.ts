export type AgricultureCenterType =
  | "KVK"
  | "GovtOffice"
  | "University"
  | "SoilLab"
  | "FarmerService";

export interface IAgricultureCenter {
  _id?: string;
  name: string;
  type: AgricultureCenterType;
  address: string;
  district: string;
  state: string;
  pincode?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  officialSource: string;
  sourceUrl?: string | null;
  isVerified: boolean;
  lastVerified: string | Date;
  distanceKm?: number | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IAgricultureCenterFilter {
  state?: string;
  district?: string;
  type?: AgricultureCenterType | "All";
  search?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  page?: number;
  limit?: number;
}

export interface IAgricultureCenterPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IAgricultureCenterResponse {
  success: boolean;
  error?: string;
  centers?: IAgricultureCenter[];
  pagination?: IAgricultureCenterPagination;
  availableStates?: string[];
  availableDistricts?: string[];
}
