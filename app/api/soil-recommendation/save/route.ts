import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import SoilRecommendation from "@/models/SoilRecommendation";
import { ISoilRecommendationResult } from "@/types/soil";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in to save reports." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = body as ISoilRecommendationResult;

    if (!data || !data.city || !data.bestCrop) {
      return NextResponse.json(
        { success: false, error: "Invalid soil recommendation payload." },
        { status: 400 }
      );
    }

    await connectDB();

    // Check duplicate recommendation for logged-in Clerk user and city
    const existing = await SoilRecommendation.findOne({
      clerkId: userId,
      city: { $regex: new RegExp(`^${data.city.trim()}$`, "i") },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        alreadySaved: true,
        savedRecord: existing,
        message: "Recommendation already saved.",
      });
    }

    const savedRecord = await SoilRecommendation.create({
      clerkId: userId,
      city: data.city,
      temperature: data.temperature,
      humidity: data.humidity,
      windSpeed: data.windSpeed,
      pressure: data.pressure,
      rainProbability: data.rainProbability,
      weatherCondition: data.weatherCondition,
      soilHealthScore: data.soilHealthScore,
      bestCrop: data.bestCrop,
      alternativeCrops: data.alternativeCrops,
      irrigationRecommendation: data.irrigationRecommendation,
      fertilizerRecommendation: data.fertilizerRecommendation,
      diseaseRiskLevel: data.diseaseRiskLevel,
      farmingTips: data.farmingTips,
      explanations: data.explanations,
    });

    return NextResponse.json({
      success: true,
      alreadySaved: false,
      savedRecord,
    });
  } catch (error) {
    console.error("Error in POST /api/soil-recommendation/save:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to save recommendation.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
