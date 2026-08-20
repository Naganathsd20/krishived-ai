import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { fetchWeatherData } from "@/lib/weather";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { calculateIrrigation } from "@/lib/irrigation";
import {
  AreaUnit,
  IIrrigationRequest,
  IIrrigationResponse,
  IrrigationMethod,
  SoilType,
} from "@/types/irrigation";

export const dynamic = "force-dynamic";

const VALID_AREA_UNITS: AreaUnit[] = ["Acre", "Hectare"];

const VALID_METHODS: IrrigationMethod[] = [
  "Drip",
  "Sprinkler",
  "Flood",
  "Furrow",
  "Center Pivot",
];

const VALID_SOIL_TYPES: SoilType[] = [
  "Sandy",
  "Loam",
  "Clay",
  "Silty Loam",
  "Clay Loam",
  "Black Cotton",
];

function sanitizeErrorMessage(rawError: unknown): string {
  if (typeof rawError === "string") {
    if (rawError.includes("API key") || rawError.includes("OpenWeather")) {
      return "Unable to retrieve weather data for irrigation calculation.";
    }
    return rawError;
  }
  if (rawError instanceof Error) {
    const msg = rawError.message;
    if (msg.includes("API key") || msg.includes("OpenWeather")) {
      return "Unable to retrieve weather data for irrigation calculation.";
    }
    return msg;
  }
  return "An unexpected error occurred while calculating irrigation requirements.";
}

export async function POST(request: Request) {
  try {
    // 1. Authentication Check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json<IIrrigationResponse>(
        {
          success: false,
          error: "Unauthorized. Please sign in to calculate irrigation requirements.",
        },
        { status: 401 }
      );
    }

    // 2. Rate Limiting Check
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(
      `irrigation-post:${userId}:${clientIp}`,
      20,
      60 * 1000
    );

    if (!rateLimit.success) {
      return NextResponse.json<IIrrigationResponse>(
        {
          success: false,
          error: "Too many requests. Please wait a moment before trying again.",
        },
        { status: 429 }
      );
    }

    // 3. Request Body Parsing
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json<IIrrigationResponse>(
        {
          success: false,
          error: "Invalid JSON request payload.",
        },
        { status: 400 }
      );
    }

    const {
      crop,
      area,
      areaUnit,
      irrigationMethod,
      pumpHP,
      flowRate,
      soilType,
      location,
    } = body;

    // 4. Strict Input Validation

    // Crop Name Validation
    if (!crop || typeof crop !== "string" || !crop.trim()) {
      return NextResponse.json<IIrrigationResponse>(
        { success: false, error: "Crop name is required." },
        { status: 400 }
      );
    }
    const sanitizedCrop = crop.trim().substring(0, 50);

    // Area Validation
    const areaNum = Number(area);
    if (isNaN(areaNum) || areaNum <= 0) {
      return NextResponse.json<IIrrigationResponse>(
        {
          success: false,
          error: "Field area must be a positive number greater than zero.",
        },
        { status: 400 }
      );
    }
    if (areaNum > 10000) {
      return NextResponse.json<IIrrigationResponse>(
        {
          success: false,
          error: "Field area exceeds maximum supported limit (10,000 acres/hectares).",
        },
        { status: 400 }
      );
    }

    // Area Unit Validation
    if (!areaUnit || !VALID_AREA_UNITS.includes(areaUnit as AreaUnit)) {
      return NextResponse.json<IIrrigationResponse>(
        {
          success: false,
          error: "Invalid area unit. Must be 'Acre' or 'Hectare'.",
        },
        { status: 400 }
      );
    }

    // Irrigation Method Validation
    if (
      !irrigationMethod ||
      !VALID_METHODS.includes(irrigationMethod as IrrigationMethod)
    ) {
      return NextResponse.json<IIrrigationResponse>(
        {
          success: false,
          error:
            "Invalid irrigation method. Supported options: Drip, Sprinkler, Flood, Furrow, Center Pivot.",
        },
        { status: 400 }
      );
    }

    // Pump Horsepower Validation (Optional)
    let validatedPumpHP: number | undefined = undefined;
    if (pumpHP !== undefined && pumpHP !== null && pumpHP !== "") {
      const hpNum = Number(pumpHP);
      if (isNaN(hpNum) || hpNum <= 0) {
        return NextResponse.json<IIrrigationResponse>(
          {
            success: false,
            error: "Pump horsepower (HP) must be a positive number greater than zero.",
          },
          { status: 400 }
        );
      }
      if (hpNum > 100) {
        return NextResponse.json<IIrrigationResponse>(
          {
            success: false,
            error: "Pump horsepower cannot exceed 100 HP.",
          },
          { status: 400 }
        );
      }
      validatedPumpHP = hpNum;
    }

    // Pump Flow Rate Validation (Optional)
    let validatedFlowRate: number | undefined = undefined;
    if (flowRate !== undefined && flowRate !== null && flowRate !== "") {
      const flowNum = Number(flowRate);
      if (isNaN(flowNum) || flowNum <= 0) {
        return NextResponse.json<IIrrigationResponse>(
          {
            success: false,
            error: "Pump flow rate must be a positive number greater than zero (Litres/hour).",
          },
          { status: 400 }
        );
      }
      if (flowNum > 1000000) {
        return NextResponse.json<IIrrigationResponse>(
          {
            success: false,
            error: "Pump flow rate exceeds maximum supported limit (1,000,000 L/hr).",
          },
          { status: 400 }
        );
      }
      validatedFlowRate = flowNum;
    }

    // Soil Type Validation (Optional)
    let validatedSoilType: SoilType = "Loam";
    if (soilType && typeof soilType === "string") {
      if (!VALID_SOIL_TYPES.includes(soilType as SoilType)) {
        return NextResponse.json<IIrrigationResponse>(
          {
            success: false,
            error:
              "Invalid soil type. Supported options: Sandy, Loam, Clay, Silty Loam, Clay Loam, Black Cotton.",
          },
          { status: 400 }
        );
      }
      validatedSoilType = soilType as SoilType;
    }

    // Location Validation (Optional)
    const targetLocation =
      typeof location === "string" && location.trim()
        ? location.trim().replace(/[^\w\s\-,.]/gi, "").substring(0, 50)
        : "Pune";

    // 5. Server Weather Telemetry Integration
    let weatherTelemetry = null;
    try {
      weatherTelemetry = await fetchWeatherData(targetLocation);
    } catch (weatherError) {
      console.warn("Irrigation route weather fetch warning:", weatherError);
      // Non-blocking: calculation engine handles null weather gracefully with fallback defaults
    }

    // 6. Execute Agronomic Irrigation Calculation
    const irrigationReq: IIrrigationRequest = {
      crop: sanitizedCrop,
      area: areaNum,
      areaUnit: areaUnit as AreaUnit,
      irrigationMethod: irrigationMethod as IrrigationMethod,
      pumpHP: validatedPumpHP,
      flowRate: validatedFlowRate,
      soilType: validatedSoilType,
      location: targetLocation,
    };

    const calculationResult = calculateIrrigation(
      irrigationReq,
      weatherTelemetry
    );

    // 7. Return Normalized Response
    return NextResponse.json<IIrrigationResponse>(
      {
        success: true,
        data: calculationResult,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in POST /api/irrigation:", error);
    const sanitizedMsg = sanitizeErrorMessage(error);

    return NextResponse.json<IIrrigationResponse>(
      {
        success: false,
        error: sanitizedMsg,
      },
      { status: 500 }
    );
  }
}
