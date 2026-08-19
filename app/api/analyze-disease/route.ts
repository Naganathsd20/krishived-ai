import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { analyzeCropImage } from "@/lib/gemini";
import DiseaseAnalysis from "@/models/DiseaseAnalysis";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

function sanitizeErrorMessage(rawError: unknown): string {
  if (typeof rawError === "string") {
    if (rawError.includes("Mongo") || rawError.includes("API key") || rawError.includes("GEMINI")) {
      return "Unable to complete crop disease analysis. Please try again.";
    }
    return rawError;
  }
  if (rawError instanceof Error) {
    const msg = rawError.message;
    if (msg.includes("Mongo") || msg.includes("API key") || msg.includes("GEMINI") || msg.includes("connect")) {
      return "Unable to complete crop disease analysis. Please try again.";
    }
    return msg;
  }
  return "Failed to analyze crop disease. Please try again.";
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in to run disease diagnostics." },
        { status: 401 }
      );
    }

    // Rate Limiting: 10 requests per minute per user/IP
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`analyze-disease:${userId}:${clientIp}`, 10, 60 * 1000);

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

    const { imageUrl } = body;

    // Input Validation: imageUrl string format and length checks
    if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.trim()) {
      return NextResponse.json(
        { success: false, error: "Valid crop image URL or data payload is required." },
        { status: 400 }
      );
    }

    if (imageUrl.length > 5000000) { // 5MB max string limit
      return NextResponse.json(
        { success: false, error: "Image data string exceeds allowable payload limit." },
        { status: 400 }
      );
    }

    // 1. Perform Gemini AI Vision Analysis
    const aiResult = await analyzeCropImage(imageUrl.trim());

    // 2. Connect to MongoDB
    await connectDB();

    // 3. Save Analysis Record to MongoDB
    const analysisRecord = await DiseaseAnalysis.create({
      clerkId: userId,
      imageUrl: imageUrl.trim(),
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

    // Rate Limiting: 30 history requests per minute
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`analyze-disease-get:${userId}:${clientIp}`, 30, 60 * 1000);

    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
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
    const sanitizedMsg = sanitizeErrorMessage(error);
    return NextResponse.json(
      { success: false, error: sanitizedMsg },
      { status: 500 }
    );
  }
}
