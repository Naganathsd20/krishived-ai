import {
  calculateIrrigation,
  calculateReferenceETo,
  estimateRainfallFromWeather,
  formatIrrigationDuration,
  getCropKc,
} from "../lib/irrigation";
import { IIrrigationRequest } from "../types/irrigation";
import { IWeatherData } from "../types/weather";

console.log("==================================================");
console.log("PHASE 16 STEP 4: AUDIT & REGRESSION TEST SUITE");
console.log("==================================================\n");

let passed = 0;
let total = 0;

function assert(condition: boolean, title: string) {
  total++;
  if (condition) {
    console.log(`[PASS] ${title}`);
    passed++;
  } else {
    console.error(`[FAIL] ${title}`);
  }
}

// Mock Telemetry Data
const mockDryWeather: IWeatherData = {
  city: "Pune",
  country: "IN",
  temperature: 32,
  feelsLike: 33,
  tempMin: 25,
  tempMax: 36,
  condition: "Clear",
  description: "clear sky",
  icon: "01d",
  humidity: 40,
  windSpeed: 12,
  windDirection: "NW",
  pressure: 1010,
  visibility: 10,
  rainProbability: 5,
  sunrise: "06:00 AM",
  sunset: "06:30 PM",
  uvIndex: 8,
  updatedAt: "11:00 AM",
};

const mockHeavyRainWeather: IWeatherData = {
  ...mockDryWeather,
  condition: "Heavy Rain",
  description: "heavy rain showers",
  rainProbability: 95,
};

// 1. Crop Evapotranspiration (Kc) Lookup Tests
assert(getCropKc("Wheat") === 1.15, "Wheat Kc coefficient = 1.15");
assert(getCropKc("Paddy") === 1.2, "Paddy Kc coefficient = 1.20");
assert(getCropKc("Cotton") === 1.15, "Cotton Kc coefficient = 1.15");
assert(getCropKc("Tomato") === 1.15, "Tomato Kc coefficient = 1.15");
assert(getCropKc("Sugarcane") === 1.25, "Sugarcane Kc coefficient = 1.25");
assert(getCropKc("UnknownCrop") === 1.0, "Unknown crop fallback Kc = 1.00");

// 2. Pump HP Presets Tests
const req3hp: IIrrigationRequest = {
  crop: "Wheat",
  area: 2,
  areaUnit: "Acre",
  irrigationMethod: "Drip",
  pumpHP: 3,
};
const res3hp = calculateIrrigation(req3hp, mockDryWeather);
assert(res3hp.pumpFlowRateLph === 15000, "3 HP preset -> 15,000 L/hr");

const req5hp: IIrrigationRequest = {
  crop: "Wheat",
  area: 2,
  areaUnit: "Acre",
  irrigationMethod: "Drip",
  pumpHP: 5,
};
const res5hp = calculateIrrigation(req5hp, mockDryWeather);
assert(res5hp.pumpFlowRateLph === 25000, "5 HP preset -> 25,000 L/hr");

const req75hp: IIrrigationRequest = {
  crop: "Wheat",
  area: 2,
  areaUnit: "Acre",
  irrigationMethod: "Drip",
  pumpHP: 7.5,
};
const res75hp = calculateIrrigation(req75hp, mockDryWeather);
assert(res75hp.pumpFlowRateLph === 38000, "7.5 HP preset -> 38,000 L/hr");

// 3. Custom Flow Rate Preference Test
const reqCustom: IIrrigationRequest = {
  crop: "Wheat",
  area: 2,
  areaUnit: "Acre",
  irrigationMethod: "Drip",
  pumpHP: 5,
  flowRate: 35000,
};
const resCustom = calculateIrrigation(reqCustom, mockDryWeather);
assert(resCustom.pumpFlowRateLph === 35000, "Farmer-provided flow rate of 35,000 L/hr overrides 5 HP preset");
assert(resCustom.isFlowRatePreset === false, "Custom flow rate flagged as isFlowRatePreset: false");

// 4. Area Unit Conversions
assert(res3hp.areaInSqMeters === 8093.71, "2 Acres = 8093.71 m²");
const reqHectare: IIrrigationRequest = {
  crop: "Wheat",
  area: 1,
  areaUnit: "Hectare",
  irrigationMethod: "Drip",
  pumpHP: 5,
};
const resHectare = calculateIrrigation(reqHectare, mockDryWeather);
assert(resHectare.areaInSqMeters === 10000, "1 Hectare = 10,000 m²");

// 5. Effective Rainfall Credit & Heavy Rain Test
const resHeavyRain = calculateIrrigation(req3hp, mockHeavyRainWeather);
assert(resHeavyRain.forecastRainfallMm === 25, "Heavy rain forecast detected (25 mm)");
assert(resHeavyRain.effectiveRainfallMm === 18.75, "75% effective rainfall factor = 18.75 mm");
assert(resHeavyRain.netWaterReqLitres === 0, "Net water requirement reduced to 0 during heavy rain");
assert(resHeavyRain.irrigationDurationMinutes === 0, "Irrigation duration reduced to 0 mins during heavy rain");

// 6. Null Weather Telemetry (No Rain Fabrication Test)
const resNullWeather = calculateIrrigation(req3hp, null);
assert(resNullWeather.weatherData.isWeatherAvailable === false, "Null weather marked as unavailable");
assert(resNullWeather.forecastRainfallMm === 0, "No rainfall fabricated when weather telemetry is null");
assert(resNullWeather.warnings.length > 0, "Warning added when weather telemetry is null");

// 7. Numeric Safety Tests
assert(!isNaN(res3hp.netWaterReqLitres) && isFinite(res3hp.netWaterReqLitres), "Net water req is finite number");
assert(!isNaN(res3hp.irrigationDurationHours) && isFinite(res3hp.irrigationDurationHours), "Duration hours is finite number");
assert(res3hp.netWaterReqLitres >= 0, "Net water req is non-negative");

console.log("\n==================================================");
console.log(`AUDIT RESULTS: ${passed} / ${total} PASSED`);
console.log("==================================================\n");

if (passed !== total) {
  process.exit(1);
}
