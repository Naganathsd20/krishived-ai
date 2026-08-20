import { calculateIrrigation, estimateRainfallFromWeather, formatIrrigationDuration, getCropKc } from "../lib/irrigation";
import { IIrrigationRequest } from "../types/irrigation";
import { IWeatherData } from "../types/weather";

console.log("==================================================");
console.log("RUNNING PHASE 16 STEP 2 BACKEND IRRIGATION TESTS");
console.log("==================================================\n");

let passedCount = 0;
let totalCount = 0;

function assert(condition: boolean, testName: string) {
  totalCount++;
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passedCount++;
  } else {
    console.error(`[FAIL] ${testName}`);
  }
}

// Mock Weather Data
const mockDryWeather: IWeatherData = {
  city: "Pune",
  country: "IN",
  temperature: 30,
  feelsLike: 31,
  tempMin: 24,
  tempMax: 34,
  condition: "Clear",
  description: "clear sky",
  icon: "01d",
  humidity: 45,
  windSpeed: 10,
  windDirection: "NW",
  pressure: 1012,
  visibility: 10,
  rainProbability: 10,
  sunrise: "06:00 AM",
  sunset: "06:30 PM",
  uvIndex: 7,
  updatedAt: "10:00 AM",
};

const mockRainyWeather: IWeatherData = {
  ...mockDryWeather,
  condition: "Light Rain",
  description: "light rain shower",
  rainProbability: 85,
};

// Test 1: Crop Kc lookup
assert(getCropKc("Wheat") === 1.15, "Crop Kc for Wheat is 1.15");
assert(getCropKc("Paddy") === 1.20, "Crop Kc for Paddy is 1.20");
assert(getCropKc("UnknownCrop") === 1.0, "Crop Kc fallback is 1.0");

// Test 2: Pump HP presets vs custom flow rate
const req3hp: IIrrigationRequest = {
  crop: "Wheat",
  area: 2,
  areaUnit: "Acre",
  irrigationMethod: "Drip",
  pumpHP: 3,
};
const res3hp = calculateIrrigation(req3hp, mockDryWeather);
assert(res3hp.pumpFlowRateLph === 15000, "3 HP preset converts to 15,000 L/hr");
assert(res3hp.isFlowRatePreset === true, "3 HP preset is flagged as preset");

const req5hp: IIrrigationRequest = {
  crop: "Wheat",
  area: 2,
  areaUnit: "Acre",
  irrigationMethod: "Drip",
  pumpHP: 5,
};
const res5hp = calculateIrrigation(req5hp, mockDryWeather);
assert(res5hp.pumpFlowRateLph === 25000, "5 HP preset converts to 25,000 L/hr");

const req75hp: IIrrigationRequest = {
  crop: "Wheat",
  area: 2,
  areaUnit: "Acre",
  irrigationMethod: "Drip",
  pumpHP: 7.5,
};
const res75hp = calculateIrrigation(req75hp, mockDryWeather);
assert(res75hp.pumpFlowRateLph === 38000, "7.5 HP preset converts to 38,000 L/hr");

// Test 3: Farmer-provided exact flow rate takes precedence over pump HP
const reqCustomFlow: IIrrigationRequest = {
  crop: "Cotton",
  area: 1,
  areaUnit: "Hectare",
  irrigationMethod: "Drip",
  pumpHP: 5,
  flowRate: 30000,
};
const resCustomFlow = calculateIrrigation(reqCustomFlow, mockDryWeather);
assert(resCustomFlow.pumpFlowRateLph === 30000, "Farmer-provided flow rate of 30,000 L/hr is preferred over 5 HP preset");
assert(resCustomFlow.isFlowRatePreset === false, "Farmer-provided flow rate is marked as not preset");
assert(resCustomFlow.flowRateSource === "user_provided", "flowRateSource is user_provided");

// Test 4: Rainfall adjustment
const resRainy = calculateIrrigation(req3hp, mockRainyWeather);
assert(resRainy.forecastRainfallMm > 0, "Forecast rainfall detected in rainy weather");
assert(resRainy.effectiveRainfallMm === resRainy.forecastRainfallMm * 0.75, "75% effective rainfall factor applied");
assert(resRainy.netWaterReqLitres < res3hp.netWaterReqLitres, "Net water requirement is reduced by effective rainfall");

// Test 5: Division by zero safety & zero net water requirement
const zeroFlowDuration = formatIrrigationDuration(0);
assert(zeroFlowDuration.includes("0 mins"), "Zero duration formatted safely without error");

// Test 6: Weather unavailable fallback
const resNoWeather = calculateIrrigation(req3hp, null);
assert(resNoWeather.weatherData.isWeatherAvailable === false, "Weather unavailable flag set correctly");
assert(resNoWeather.warnings.length > 0, "Warning included when weather data is unavailable");
assert(!isNaN(resNoWeather.netWaterReqLitres) && isFinite(resNoWeather.netWaterReqLitres), "Calculation is finite and safe when weather is null");

// Test 7: Unit conversion accuracy
assert(res3hp.areaInSqMeters === 8093.71, "2 Acres correctly converted to 8,093.71 m²");

console.log(`\n==================================================`);
console.log(`TEST SUMMARY: ${passedCount} / ${totalCount} PASSED`);
console.log(`==================================================\n`);

if (passedCount !== totalCount) {
  process.exit(1);
}
