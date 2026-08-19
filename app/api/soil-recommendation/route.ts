import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { generateSoilRecommendation } from "@/lib/gemini";
import SoilRecommendation from "@/models/SoilRecommendation";
import { IWeatherData } from "@/types/weather";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

function sanitizeErrorMessage(rawError: unknown): string {
  if (typeof rawError === "string") {
    if (rawError.includes("Mongo") || rawError.includes("API key") || rawError.includes("GEMINI")) {
      return "Unable to generate soil recommendation right now. Please try again.";
    }
    return rawError;
  }
  if (rawError instanceof Error) {
    const msg = rawError.message;
    if (msg.includes("Mongo") || msg.includes("API key") || msg.includes("GEMINI") || msg.includes("connect")) {
      return "Unable to generate soil recommendation right now. Please try again.";
    }
    return msg;
  }
  return "Failed to process soil recommendation request.";
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    // 1. Rate Limiting (15 requests per minute)
    const clientIp = getClientIp(request);
    const identifier = userId ? `soil-rec:${userId}:${clientIp}` : `soil-rec:${clientIp}`;
    const rateLimit = checkRateLimit(identifier, 15, 60 * 1000);

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

    const { weather } = body as { weather: IWeatherData };

    if (!weather || typeof weather !== "object" || !weather.city) {
      return NextResponse.json(
        { success: false, error: "Valid weather telemetry data is required." },
        { status: 400 }
      );
    }

    // 2. Generate Soil Recommendation using Gemini AI
    const recommendation = await generateSoilRecommendation(weather);

    return NextResponse.json({
      success: true,
      recommendation,
    });
  } catch (error) {
    console.error("Error in POST /api/soil-recommendation:", error);
    const sanitizedMsg = sanitizeErrorMessage(error);
    return NextResponse.json(
      { success: false, error: sanitizedMsg },
      { status: 500 }
    );
  }
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
    const rateLimit = checkRateLimit(`soil-rec-get:${userId}:${clientIp}`, 30, 60 * 1000);

    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    await connectDB();

    const history = await SoilRecommendation.find({ clerkId: userId })
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error("Error in GET /api/soil-recommendation:", error);
    const sanitizedMsg = sanitizeErrorMessage(error);
    return NextResponse.json(
      { success: false, error: sanitizedMsg },
      { status: 500 }
    );
  }
}
