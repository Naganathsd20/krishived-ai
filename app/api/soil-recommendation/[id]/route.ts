import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import SoilRecommendation from "@/models/SoilRecommendation";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Recommendation ID is required." },
        { status: 400 }
      );
    }

    await connectDB();

    // 1. Find record and verify ownership
    const record = await SoilRecommendation.findById(id);

    if (!record) {
      return NextResponse.json(
        { success: false, error: "Recommendation not found." },
        { status: 404 }
      );
    }

    // 2. Strict Security: Ensure user can only delete their own record
    if (record.clerkId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden. You can only delete your own recommendations.",
        },
        { status: 403 }
      );
    }

    // 3. Delete from MongoDB
    await SoilRecommendation.deleteOne({ _id: id, clerkId: userId });

    return NextResponse.json({
      success: true,
      message: "Recommendation deleted successfully.",
    });
  } catch (error) {
    console.error("Error in DELETE /api/soil-recommendation/[id]:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete recommendation.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
