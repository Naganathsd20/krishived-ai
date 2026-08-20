export type AreaUnit = "Acre" | "Hectare";

export type IrrigationMethod =
  | "Drip"
  | "Sprinkler"
  | "Flood"
  | "Furrow"
  | "Center Pivot";

export type SoilType =
  | "Sandy"
  | "Loam"
  | "Clay"
  | "Silty Loam"
  | "Clay Loam"
  | "Black Cotton";

export type PumpHPPreset = 1 | 2 | 3 | 5 | 7.5 | 10;

export type FlowRateSource =
  | "user_provided"
  | "preset_1hp"
  | "preset_2hp"
  | "preset_3hp"
  | "preset_5hp"
  | "preset_7.5hp"
  | "preset_10hp"
  | "preset_custom";

export interface IIrrigationRequest {
  crop: string;
  area: number;
  areaUnit: AreaUnit;
  irrigationMethod: IrrigationMethod;
  pumpHP?: number;
  flowRate?: number; // Litres / hour
  soilType?: SoilType;
  location?: string;
}

export interface IIrrigationWeatherSummary {
  city: string;
  country: string;
  temperature: number;
  humidity: number;
  condition: string;
  description: string;
  rainProbability: number;
  estimatedRainfallMm: number;
  updatedAt: string;
  isWeatherAvailable: boolean;
  freshness: string;
}

export interface IIrrigationCalculationResult {
  crop: string;
  area: number;
  areaUnit: AreaUnit;
  areaInSqMeters: number;
  areaInAcres: number;
  areaInHectares: number;
  irrigationMethod: IrrigationMethod;
  soilType: SoilType;
  methodEfficiency: number; // e.g. 0.90 for Drip
  soilFactor: number; // e.g. 1.0 for Loam
  cropKc: number; // FAO-56 Crop Coefficient
  referenceET0MmPerDay: number; // Reference Evapotranspiration
  dailyETcDepthMm: number; // ETc = ET0 * Kc
  estimatedCropWaterReqLitres: number; // ETc depth * Area in m²
  grossWaterReqBeforeRainLitres: number; // adjusted for efficiency and soil
  forecastRainfallMm: number;
  effectiveRainfallMm: number; // forecast * 0.75 (FAO/USDA factor)
  effectiveRainfallLitres: number; // effective rainfall in Litres across field area
  netWaterReqLitres: number; // max(0, grossWater - effectiveRainfall)
  pumpHP: number | null;
  pumpFlowRateLph: number; // Litres / hour
  isFlowRatePreset: boolean;
  flowRateSource: FlowRateSource;
  irrigationDurationHours: number;
  irrigationDurationMinutes: number;
  irrigationDurationFormatted: string; // e.g. "1 hr 15 mins" or "45 mins"
  weatherData: IIrrigationWeatherSummary;
  dataFreshness: string;
  assumptions: string[];
  warnings: string[];
  disclaimer: string;
  calculatedAt: string;
}

export interface IIrrigationResponse {
  success: boolean;
  data?: IIrrigationCalculationResult;
  error?: string;
}
