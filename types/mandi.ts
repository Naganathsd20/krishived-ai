export interface IMandiPrice {
  id: string;
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrivalDate: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  unit: string;
  dataFreshness: "Live Agmarknet Data" | "Recent Data (1-3 Days Ago)" | "Agmarknet Historical Data";
  source: string;
  updatedAt: string;
}

export interface IMandiPriceResponse {
  success: boolean;
  state?: string;
  district?: string;
  commodity?: string;
  market?: string;
  totalRecords: number;
  dataFreshness?: string;
  source?: string;
  prices: IMandiPrice[];
  error?: string;
}

export interface IAgmarknetRawRecord {
  state?: string;
  district?: string;
  market?: string;
  commodity?: string;
  variety?: string;
  arrival_date?: string;
  min_price?: string | number;
  max_price?: string | number;
  modal_price?: string | number;
}
