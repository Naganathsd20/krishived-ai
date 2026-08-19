import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import HarvestLog from "@/models/HarvestLog";

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

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, error: "Harvest log ID is required." },
        { status: 400 }
      );
    }

    await connectDB();

    const record = await HarvestLog.findById(id);

    if (!record) {
      return NextResponse.json(
        { success: false, error: "Harvest log record not found." },
        { status: 404 }
      );
    }

    // Security check: User can only delete their own record
    if (record.clerkId !== userId) {
      return NextResponse.json(
        { success: false, error: "Forbidden. You can only delete your own harvest records." },
        { status: 403 }
      );
    }

    await HarvestLog.deleteOne({ _id: id, clerkId: userId });

    return NextResponse.json({
      success: true,
      message: "Harvest log record deleted successfully.",
    });
  } catch (error) {
    console.error("Error in DELETE /api/yield-intelligence/[id]:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete harvest record.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
