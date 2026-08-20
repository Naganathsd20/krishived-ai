import {
  AreaUnit,
  FlowRateSource,
  IIrrigationCalculationResult,
  IIrrigationRequest,
  IIrrigationWeatherSummary,
  IrrigationMethod,
  SoilType,
} from "@/types/irrigation";
import { IWeatherData } from "@/types/weather";

// --- FAO-56 Crop Evapotranspiration Coefficients (Kc) for common crops ---
const CROP_KC_MAP: Record<string, number> = {
  wheat: 1.15,
  paddy: 1.2,
  rice: 1.2,
  cotton: 1.15,
  tomato: 1.15,
  sugarcane: 1.25,
  maize: 1.15,
  corn: 1.15,
  groundnut: 1.05,
  peanut: 1.05,
  mustard: 1.0,
  onion: 1.05,
  potato: 1.1,
  soybean: 1.1,
  pulses: 0.95,
  gram: 0.95,
  chickpea: 0.95,
  chili: 1.05,
  chilli: 1.05,
  banana: 1.2,
  mango: 0.9,
  vegetables: 1.0,
  fruits: 1.05,
};

// --- Irrigation Method Application Efficiency Factors (Ea) ---
const METHOD_EFFICIENCY_MAP: Record<IrrigationMethod, number> = {
  Drip: 0.9,
  Sprinkler: 0.75,
  "Center Pivot": 0.8,
  Furrow: 0.6,
  Flood: 0.5,
};

// --- Soil Retention / Percolation Factors (Sf) ---
const SOIL_FACTOR_MAP: Record<SoilType, number> = {
  Sandy: 1.15, // Higher percolation loss; requires slightly higher application depth
  Loam: 1.0, // Baseline balanced retention
  "Silty Loam": 1.0,
  Clay: 0.95, // High moisture retention capacity
  "Clay Loam": 0.98,
  "Black Cotton": 0.95, // High swelling clay retention
};

// --- Standard Pump HP to Flow Rate Presets (Litres/hour) ---
const HP_PRESETS: Record<number, { flowRate: number; source: FlowRateSource }> = {
  1: { flowRate: 5000, source: "preset_1hp" },
  2: { flowRate: 10000, source: "preset_2hp" },
  3: { flowRate: 15000, source: "preset_3hp" },
  5: { flowRate: 25000, source: "preset_5hp" },
  7.5: { flowRate: 38000, source: "preset_7.5hp" },
  10: { flowRate: 50000, source: "preset_10hp" },
};

// FAO/USDA Effective Rainfall Factor (75% of rainfall converted to effective soil moisture)
const EFFECTIVE_RAINFALL_FACTOR = 0.75;

/**
 * Returns the FAO-56 mid-season crop evapotranspiration coefficient (Kc).
 */
export function getCropKc(cropName: string): number {
  const normalized = (cropName || "").trim().toLowerCase();
  for (const [key, kc] of Object.entries(CROP_KC_MAP)) {
    if (normalized === key || normalized.includes(key)) {
      return kc;
    }
  }
  return 1.0; // Default baseline Kc
}

/**
 * Derives Reference Evapotranspiration (ETo in mm/day) based on ambient temperature & humidity.
 * Uses a safe simplified Hargreaves/Penman thermal approximation bounded between 3.0 and 7.0 mm/day.
 */
export function calculateReferenceETo(
  temp: number,
  humidity: number
): number {
  if (isNaN(temp) || isNaN(humidity)) {
    return 4.5; // Standard Indian mid-season reference ETo (mm/day)
  }

  // Base ET0 estimated from mean daily temperature and relative humidity
  let et0 = 4.5 + (temp - 25) * 0.1 - (humidity - 60) * 0.03;
  if (et0 < 3.0) et0 = 3.0;
  if (et0 > 7.0) et0 = 7.0;

  return Math.round(et0 * 100) / 100;
}

/**
 * Estimates 24-hour rainfall depth (mm) from weather telemetry.
 * Strictly uses real/cached telemetry without fabricating unverified rain.
 */
export function estimateRainfallFromWeather(weather: IWeatherData | null): number {
  if (!weather) return 0;

  const condition = (weather.condition || "").toLowerCase();
  const desc = (weather.description || "").toLowerCase();
  const rainProb = weather.rainProbability || 0;

  if (condition.includes("heavy rain") || desc.includes("heavy rain")) {
    return 25.0;
  }
  if (condition.includes("thunderstorm") || desc.includes("thunderstorm")) {
    return 20.0;
  }
  if (condition.includes("rain") || desc.includes("rain") || condition.includes("drizzle")) {
    if (rainProb > 70) return 10.0;
    if (rainProb > 40) return 5.0;
    return 2.5;
  }

  if (rainProb >= 80) return 6.0;
  if (rainProb >= 60) return 3.0;

  return 0;
}

/**
 * Formats duration in hours into a farmer-friendly human string.
 */
export function formatIrrigationDuration(totalMinutes: number): string {
  if (isNaN(totalMinutes) || totalMinutes <= 0) {
    return "0 mins (No irrigation required)";
  }

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (hours === 0) {
    return `${mins} min${mins === 1 ? "" : "s"}`;
  }
  if (mins === 0) {
    return `${hours} hr${hours === 1 ? "" : "s"}`;
  }

  return `${hours} hr${hours === 1 ? "" : "s"} ${mins} min${mins === 1 ? "" : "s"}`;
}

/**
 * Primary irrigation and water requirement calculation engine.
 */
export function calculateIrrigation(
  req: IIrrigationRequest,
  weather: IWeatherData | null
): IIrrigationCalculationResult {
  const assumptions: string[] = [];
  const warnings: string[] = [];

  // 1. Area & Unit Conversions
  const area = Math.max(0, req.area || 0);
  const unit: AreaUnit = req.areaUnit === "Hectare" ? "Hectare" : "Acre";

  let areaInSqMeters = 0;
  let areaInAcres = 0;
  let areaInHectares = 0;

  if (unit === "Acre") {
    areaInSqMeters = area * 4046.85642;
    areaInAcres = area;
    areaInHectares = area / 2.47105;
  } else {
    areaInSqMeters = area * 10000;
    areaInHectares = area;
    areaInAcres = area * 2.47105;
  }

  // 2. Irrigation Method & Efficiency
  const method: IrrigationMethod = req.irrigationMethod || "Drip";
  const methodEfficiency = METHOD_EFFICIENCY_MAP[method] || 0.9;
  assumptions.push(
    `Irrigation method efficiency for ${method} is set at ${Math.round(
      methodEfficiency * 100
    )}%.`
  );

  // 3. Soil Type & Retention Factor
  const soil: SoilType = req.soilType || "Loam";
  const soilFactor = SOIL_FACTOR_MAP[soil] || 1.0;
  if (soil !== "Loam") {
    assumptions.push(
      `Soil type ${soil} adjusts water application factor to ${soilFactor}.`
    );
  }

  // 4. Crop Kc & Evapotranspiration
  const cropName = (req.crop || "Generic Crop").trim();
  const cropKc = getCropKc(cropName);
  assumptions.push(
    `FAO-56 mid-season crop evapotranspiration coefficient (Kc) for ${cropName} is ${cropKc}.`
  );

  // 5. Weather Telemetry & Reference ETo
  let isWeatherAvailable = false;
  let referenceET0MmPerDay = 4.5;
  let forecastRainfallMm = 0;

  const weatherSummary: IIrrigationWeatherSummary = {
    city: req.location || weather?.city || "Pune",
    country: weather?.country || "IN",
    temperature: weather?.temperature ?? 26,
    humidity: weather?.humidity ?? 60,
    condition: weather?.condition ?? "Clear",
    description: weather?.description ?? "Clear skies",
    rainProbability: weather?.rainProbability ?? 0,
    estimatedRainfallMm: 0,
    updatedAt: weather?.updatedAt || new Date().toLocaleTimeString(),
    isWeatherAvailable: false,
    freshness: weather ? "Real-time telemetry / 10-min server cache" : "Unavailable",
  };

  if (weather) {
    isWeatherAvailable = true;
    weatherSummary.isWeatherAvailable = true;
    referenceET0MmPerDay = calculateReferenceETo(
      weather.temperature,
      weather.humidity
    );
    forecastRainfallMm = estimateRainfallFromWeather(weather);
    weatherSummary.estimatedRainfallMm = forecastRainfallMm;
  } else {
    warnings.push(
      "Live weather telemetry was unavailable for this location. Rainfall adjustment could not be reliably calculated and default reference ETo (4.5 mm/day) was used."
    );
  }

  // 6. Water Requirements (Litres)
  // Daily ETc depth in mm = ETo * Kc
  const dailyETcDepthMm = Math.round(referenceET0MmPerDay * cropKc * 1000) / 1000;

  // 1 mm depth over 1 m² area = 1 Litre of water
  const estimatedCropWaterReqLitres = areaInSqMeters * dailyETcDepthMm;

  // Gross water requirement before rainfall adjustment (factoring system efficiency & soil)
  const grossWaterReqBeforeRainLitres =
    (estimatedCropWaterReqLitres / methodEfficiency) * soilFactor;

  // 7. Effective Rainfall Contribution
  const effectiveRainfallMm = Math.round(forecastRainfallMm * EFFECTIVE_RAINFALL_FACTOR * 100) / 100;
  const effectiveRainfallLitres = effectiveRainfallMm * areaInSqMeters;

  if (forecastRainfallMm > 0) {
    assumptions.push(
      `Forecast rainfall of ${forecastRainfallMm} mm accounted with 75% effective soil water retention (${effectiveRainfallMm} mm effective).`
    );
  }

  // Net Irrigation Requirement (Litres)
  const netWaterReqLitres = Math.max(
    0,
    grossWaterReqBeforeRainLitres - effectiveRainfallLitres
  );

  // 8. Pump Flow Rate & Horsepower Logic
  let pumpHP: number | null = null;
  let pumpFlowRateLph = 0;
  let isFlowRatePreset = false;
  let flowRateSource: FlowRateSource = "preset_5hp";

  if (req.flowRate && !isNaN(req.flowRate) && req.flowRate > 0) {
    // Farmer provided exact flow rate
    pumpFlowRateLph = req.flowRate;
    isFlowRatePreset = false;
    flowRateSource = "user_provided";
    if (req.pumpHP && !isNaN(req.pumpHP) && req.pumpHP > 0) {
      pumpHP = req.pumpHP;
    }
    assumptions.push(
      `Using farmer-specified pump flow rate of ${pumpFlowRateLph.toLocaleString()} Litres/hour.`
    );
  } else if (req.pumpHP && !isNaN(req.pumpHP) && req.pumpHP > 0) {
    // Farmer provided pump HP
    pumpHP = req.pumpHP;
    isFlowRatePreset = true;
    const preset = HP_PRESETS[pumpHP];

    if (preset) {
      pumpFlowRateLph = preset.flowRate;
      flowRateSource = preset.source;
      assumptions.push(
        `Estimated pump flow rate of ${pumpFlowRateLph.toLocaleString()} L/hr based on standard ${pumpHP} HP pump preset.`
      );
    } else {
      // Custom HP estimation (approx. 5,000 L/hr per HP)
      pumpFlowRateLph = Math.round(pumpHP * 5000);
      flowRateSource = "preset_custom";
      assumptions.push(
        `Estimated pump flow rate of ${pumpFlowRateLph.toLocaleString()} L/hr based on custom ${pumpHP} HP rating.`
      );
    }
  } else {
    // Fallback default: 5 HP preset (25,000 L/hr)
    pumpHP = 5;
    pumpFlowRateLph = 25000;
    isFlowRatePreset = true;
    flowRateSource = "preset_5hp";
    assumptions.push(
      `No pump capacity specified; default preset of 5 HP (25,000 L/hr) was applied.`
    );
  }

  // 9. Irrigation Duration Calculation
  let durationHours = 0;
  let durationMinutes = 0;

  if (pumpFlowRateLph > 0 && netWaterReqLitres > 0) {
    durationHours = netWaterReqLitres / pumpFlowRateLph;
    durationMinutes = Math.round(durationHours * 60);
  }

  if (netWaterReqLitres === 0 && forecastRainfallMm > 0) {
    warnings.push(
      "Expected effective rainfall is sufficient to satisfy total crop water requirements today. Supplementary irrigation is not needed."
    );
  }

  const durationFormatted = formatIrrigationDuration(durationMinutes);

  // 10. Assemble Final Normalized Result
  return {
    crop: cropName,
    area: Math.round(area * 100) / 100,
    areaUnit: unit,
    areaInSqMeters: Math.round(areaInSqMeters * 100) / 100,
    areaInAcres: Math.round(areaInAcres * 100) / 100,
    areaInHectares: Math.round(areaInHectares * 100) / 100,
    irrigationMethod: method,
    soilType: soil,
    methodEfficiency,
    soilFactor,
    cropKc,
    referenceET0MmPerDay,
    dailyETcDepthMm,
    estimatedCropWaterReqLitres: Math.round(estimatedCropWaterReqLitres),
    grossWaterReqBeforeRainLitres: Math.round(grossWaterReqBeforeRainLitres),
    forecastRainfallMm: Math.round(forecastRainfallMm * 10) / 10,
    effectiveRainfallMm,
    effectiveRainfallLitres: Math.round(effectiveRainfallLitres),
    netWaterReqLitres: Math.round(netWaterReqLitres),
    pumpHP,
    pumpFlowRateLph,
    isFlowRatePreset,
    flowRateSource,
    irrigationDurationHours: Math.round(durationHours * 100) / 100,
    irrigationDurationMinutes: durationMinutes,
    irrigationDurationFormatted: durationFormatted,
    weatherData: weatherSummary,
    dataFreshness: isWeatherAvailable
      ? "Real-time weather telemetry integrated"
      : "Default agronomic parameters (Weather service unavailable)",
    assumptions,
    warnings,
    disclaimer:
      "Calculated values represent agronomic estimates for irrigation planning and decision support. Actual water requirements may vary with local microclimate, soil moisture level, field slope, and pump operating head.",
    calculatedAt: new Date().toISOString(),
  };
}
