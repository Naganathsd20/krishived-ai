import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { analyzeCropImage } from "@/lib/gemini";
import DiseaseAnalysis from "@/models/DiseaseAnalysis";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { success: false, error: "Image URL is required for AI disease analysis." },
        { status: 400 }
      );
    }

    // 1. Perform Gemini AI Vision Analysis
    const aiResult = await analyzeCropImage(imageUrl);

    // 2. Connect to MongoDB
    await connectDB();

    // 3. Save Analysis Record to MongoDB
    const analysisRecord = await DiseaseAnalysis.create({
      clerkId: userId,
      imageUrl,
      disease: aiResult.disease,
      confidence: aiResult.confidence,
      severity: aiResult.severity,
      symptoms: aiResult.symptoms,
      cause: aiResult.cause,
      treatment: aiResult.treatment,
      prevention: aiResult.prevention,
      recommendedFertilizer: aiResult.recommendedFertilizer,
      recommendedPesticide: aiResult.recommendedPesticide,
      immediateActions: aiResult.immediateActions,
    });

    return NextResponse.json({
      success: true,
      analysis: analysisRecord,
    });
  } catch (error) {
    console.error("Error in POST /api/analyze-disease:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to analyze crop disease.";
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

    const history = await DiseaseAnalysis.find({ clerkId: userId })
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error("Error in GET /api/analyze-disease:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch analysis history.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
