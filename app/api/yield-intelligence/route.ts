import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import HarvestLog from "@/models/HarvestLog";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

function sanitizeErrorMessage(rawError: unknown): string {
  if (typeof rawError === "string") {
    if (rawError.includes("Mongo") || rawError.includes("API key") || rawError.includes("connect")) {
      return "Unable to process harvest log request. Please try again.";
    }
    return rawError;
  }
  if (rawError instanceof Error) {
    const msg = rawError.message;
    if (msg.includes("Mongo") || msg.includes("API key") || msg.includes("connect")) {
      return "Unable to process harvest log request. Please try again.";
    }
    return msg;
  }
  return "Failed to process harvest log request.";
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`yield-intel-get:${userId}:${clientIp}`, 30, 60 * 1000);

    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    await connectDB();

    const harvestLogs = await HarvestLog.find({ clerkId: userId })
      .sort({ harvestDate: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      harvestLogs,
    });
  } catch (error) {
    console.error("Error in GET /api/yield-intelligence:", error);
    const sanitizedMsg = sanitizeErrorMessage(error);
    return NextResponse.json(
      { success: false, error: sanitizedMsg },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in to log harvest records." },
        { status: 401 }
      );
    }

    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`yield-intel-post:${userId}:${clientIp}`, 15, 60 * 1000);

    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request payload." },
        { status: 400 }
      );
    }

    const { crop, season, harvestDate, cultivatedArea, areaUnit, totalYield, yieldUnit, notes } = body;

    // Input Validation
    if (!crop || typeof crop !== "string" || !crop.trim() || crop.trim().length > 100) {
      return NextResponse.json(
        { success: false, error: "Valid crop name (max 100 characters) is required." },
        { status: 400 }
      );
    }

    const validSeasons = ["Kharif", "Rabi", "Zaid", "Whole Year"];
    const seasonVal = typeof season === "string" && validSeasons.includes(season.trim()) ? season.trim() : "Kharif";

    const parsedDate = harvestDate ? new Date(harvestDate) : new Date();
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "Valid harvest date is required." },
        { status: 400 }
      );
    }

    const areaNum = Number(cultivatedArea);
    if (isNaN(areaNum) || areaNum <= 0) {
      return NextResponse.json(
        { success: false, error: "Cultivated area must be a positive number greater than 0." },
        { status: 400 }
      );
    }

    const yieldNum = Number(totalYield);
    if (isNaN(yieldNum) || yieldNum <= 0) {
      return NextResponse.json(
        { success: false, error: "Total yield must be a positive number greater than 0." },
        { status: 400 }
      );
    }

    const validAreaUnits = ["Acre", "Hectare", "Guntha", "Bigha"];
    const areaUnitVal = typeof areaUnit === "string" && validAreaUnits.includes(areaUnit.trim()) ? areaUnit.trim() : "Acre";

    const validYieldUnits = ["Quintal", "Kg", "Tonne"];
    const yieldUnitVal = typeof yieldUnit === "string" && validYieldUnits.includes(yieldUnit.trim()) ? yieldUnit.trim() : "Quintal";

    const notesVal = typeof notes === "string" ? notes.trim().substring(0, 500) : "";

    // Yield Per Area calculation
    const yieldPerArea = Math.round((yieldNum / areaNum) * 100) / 100;

    await connectDB();

    const createdRecord = await HarvestLog.create({
      clerkId: userId,
      crop: crop.trim(),
      season: seasonVal,
      harvestDate: parsedDate,
      cultivatedArea: areaNum,
      areaUnit: areaUnitVal,
      totalYield: yieldNum,
      yieldUnit: yieldUnitVal,
      yieldPerArea,
      notes: notesVal,
    });

    return NextResponse.json(
      {
        success: true,
        harvestLog: createdRecord,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/yield-intelligence:", error);
    const sanitizedMsg = sanitizeErrorMessage(error);
    return NextResponse.json(
      { success: false, error: sanitizedMsg },
      { status: 500 }
    );
  }
}
