import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { generateSoilRecommendation } from "@/lib/gemini";
import SoilRecommendation from "@/models/SoilRecommendation";
import { IWeatherData } from "@/types/weather";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { weather } = body as { weather: IWeatherData };

    if (!weather || !weather.city) {
      return NextResponse.json(
        { success: false, error: "Weather telemetry data is required." },
        { status: 400 }
      );
    }

    // 1. Generate Soil Recommendation using Gemini AI
    const recommendation = await generateSoilRecommendation(weather);

    return NextResponse.json({
      success: true,
      recommendation,
    });
  } catch (error) {
    console.error("Error in POST /api/soil-recommendation:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to generate soil recommendation.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
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
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to fetch saved soil recommendations.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
