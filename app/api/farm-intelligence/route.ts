import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { calculateSmartFarmIntelligence } from "@/lib/farm-intelligence";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // 1. Clerk User Auth Verification
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Please sign in to view Smart Farm Intelligence.",
        },
        { status: 401 }
      );
    }

    // 2. Calculate Smart Farm Intelligence for Authenticated User
    const intelligence = await calculateSmartFarmIntelligence(userId);

    return NextResponse.json(intelligence);
  } catch (error) {
    console.error("Error in GET /api/farm-intelligence:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to compute Smart Farm Intelligence.";

    // Prevent exposing internal connection / DB error strings to user
    const sanitizedError =
      errorMessage.includes("Mongo") ||
      errorMessage.includes("ECONNREFUSED") ||
      errorMessage.includes("Atlas") ||
      errorMessage.includes("connect")
        ? "Unable to connect to farm intelligence service. Please try again."
        : errorMessage;

    return NextResponse.json(
      { success: false, error: sanitizedError },
      { status: 500 }
    );
  }
}
