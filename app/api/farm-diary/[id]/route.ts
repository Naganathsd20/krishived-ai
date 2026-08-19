import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import FarmDiary from "@/models/FarmDiary";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { FarmActivityType } from "@/types/farm-diary";

const VALID_ACTIVITY_TYPES: FarmActivityType[] = [
  "Sowing",
  "Irrigation",
  "Fertilization",
  "Pest Control",
  "Weeding",
  "Crop Inspection",
  "Harvest",
  "Field Preparation",
  "Other",
];

function sanitizeErrorMessage(rawError: unknown): string {
  if (typeof rawError === "string") {
    if (rawError.includes("Mongo") || rawError.includes("ECONNREFUSED")) {
      return "Unable to connect to farm diary service. Please try again.";
    }
    return rawError;
  }
  if (rawError instanceof Error) {
    const msg = rawError.message;
    if (msg.includes("Mongo") || msg.includes("ECONNREFUSED") || msg.includes("connect")) {
      return "Unable to connect to farm diary service. Please try again.";
    }
    return msg;
  }
  return "An unexpected error occurred.";
}

export async function GET(
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
        { success: false, error: "Valid entry ID is required." },
        { status: 400 }
      );
    }

    await connectDB();

    const entry = await FarmDiary.findOne({ _id: id, clerkId: userId }).lean();

    if (!entry) {
      return NextResponse.json(
        { success: false, error: "Diary entry not found or unauthorized." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      entry,
    });
  } catch (error) {
    console.error("Error in GET /api/farm-diary/[id]:", error);
    return NextResponse.json(
      { success: false, error: sanitizeErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`farm-diary-put:${userId}:${clientIp}`, 15, 60 * 1000);

    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, error: "Valid entry ID is required." },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request payload." },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify ownership
    const existingEntry = await FarmDiary.findOne({ _id: id, clerkId: userId });

    if (!existingEntry) {
      return NextResponse.json(
        { success: false, error: "Diary entry not found or unauthorized." },
        { status: 404 }
      );
    }

    const {
      activityType,
      title,
      description,
      crop,
      field,
      activityDate,
      quantity,
      quantityUnit,
      cost,
      notes,
    } = body;

    // Optional updates validation
    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim() || title.trim().length < 3) {
        return NextResponse.json(
          { success: false, error: "Activity title must be at least 3 characters long." },
          { status: 400 }
        );
      }
      if (title.trim().length > 100) {
        return NextResponse.json(
          { success: false, error: "Activity title cannot exceed 100 characters." },
          { status: 400 }
        );
      }
      existingEntry.title = title.trim();
    }

    if (activityType !== undefined) {
      if (!VALID_ACTIVITY_TYPES.includes(activityType as FarmActivityType)) {
        return NextResponse.json(
          { success: false, error: `Invalid activity type. Allowed: ${VALID_ACTIVITY_TYPES.join(", ")}` },
          { status: 400 }
        );
      }
      existingEntry.activityType = activityType;
    }

    if (activityDate !== undefined) {
      const parsedDate = new Date(activityDate);
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { success: false, error: "Invalid activity date format." },
          { status: 400 }
        );
      }
      existingEntry.activityDate = parsedDate;
    }

    if (description !== undefined) {
      existingEntry.description = typeof description === "string" ? description.trim().substring(0, 500) : "";
    }

    if (crop !== undefined) {
      existingEntry.crop = typeof crop === "string" ? crop.trim().substring(0, 50) : "";
    }

    if (field !== undefined) {
      existingEntry.field = typeof field === "string" ? field.trim().substring(0, 50) : "";
    }

    if (quantity !== undefined) {
      existingEntry.quantity = typeof quantity === "number" ? Math.max(0, quantity) : 0;
    }

    if (quantityUnit !== undefined) {
      existingEntry.quantityUnit = typeof quantityUnit === "string" ? quantityUnit.trim().substring(0, 20) : "";
    }

    if (cost !== undefined) {
      existingEntry.cost = typeof cost === "number" ? Math.max(0, cost) : 0;
    }

    if (notes !== undefined) {
      existingEntry.notes = typeof notes === "string" ? notes.trim().substring(0, 500) : "";
    }

    await existingEntry.save();

    return NextResponse.json({
      success: true,
      entry: existingEntry,
    });
  } catch (error) {
    console.error("Error in PUT /api/farm-diary/[id]:", error);
    return NextResponse.json(
      { success: false, error: sanitizeErrorMessage(error) },
      { status: 500 }
    );
  }
}

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

    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`farm-diary-del:${userId}:${clientIp}`, 15, 60 * 1000);

    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, error: "Valid entry ID is required." },
        { status: 400 }
      );
    }

    await connectDB();

    const result = await FarmDiary.deleteOne({ _id: id, clerkId: userId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Diary entry not found or unauthorized." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Diary entry deleted successfully.",
    });
  } catch (error) {
    console.error("Error in DELETE /api/farm-diary/[id]:", error);
    return NextResponse.json(
      { success: false, error: sanitizeErrorMessage(error) },
      { status: 500 }
    );
  }
}
