import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import FarmDiary from "@/models/FarmDiary";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { FarmActivityType } from "@/types/farm-diary";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    const rateLimit = checkRateLimit(`farm-diary-get:${userId}:${clientIp}`, 30, 60 * 1000);

    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const crop = searchParams.get("crop")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "15", 10)));
    const skip = (page - 1) * limit;

    // Build filter query
    const filterQuery: any = { clerkId: userId };

    if (category && category !== "All Categories") {
      filterQuery.activityType = category;
    }

    if (crop && crop !== "All Crops") {
      filterQuery.crop = { $regex: new RegExp(`^${crop}$`, "i") };
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      filterQuery.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { crop: searchRegex },
        { field: searchRegex },
        { notes: searchRegex },
      ];
    }

    const [entries, total, allUserEntries] = await Promise.all([
      FarmDiary.find(filterQuery)
        .sort({ activityDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FarmDiary.countDocuments(filterQuery),
      FarmDiary.find({ clerkId: userId }).select("cost activityDate crop").lean(),
    ]);

    // Calculate Summary Stats
    const totalEntries = allUserEntries.length;
    const totalExpenses = allUserEntries.reduce((acc, curr) => acc + (curr.cost || 0), 0);
    const latestActivityDate = allUserEntries.length > 0 && allUserEntries[0].activityDate
      ? new Date(allUserEntries[0].activityDate).toISOString()
      : null;

    // Find top active crop
    const cropCounts: Record<string, number> = {};
    allUserEntries.forEach((e) => {
      if (e.crop) {
        cropCounts[e.crop] = (cropCounts[e.crop] || 0) + 1;
      }
    });

    let topCrop: string | null = null;
    let maxCount = 0;
    Object.entries(cropCounts).forEach(([cropName, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topCrop = cropName;
      }
    });

    return NextResponse.json({
      success: true,
      entries,
      stats: {
        totalEntries,
        totalExpenses,
        latestActivityDate,
        topCrop,
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/farm-diary:", error);
    return NextResponse.json(
      { success: false, error: sanitizeErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in to add diary entries." },
        { status: 401 }
      );
    }

    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`farm-diary-post:${userId}:${clientIp}`, 15, 60 * 1000);

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

    const {
      activityType,
      title,
      description = "",
      crop = "",
      field = "",
      activityDate,
      quantity = 0,
      quantityUnit = "",
      cost = 0,
      notes = "",
    } = body;

    // Input Validations
    if (!title || typeof title !== "string" || !title.trim() || title.trim().length < 3) {
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

    if (!activityType || !VALID_ACTIVITY_TYPES.includes(activityType as FarmActivityType)) {
      return NextResponse.json(
        { success: false, error: `Invalid activity type. Allowed: ${VALID_ACTIVITY_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    const parsedDate = activityDate ? new Date(activityDate) : new Date();
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid activity date format." },
        { status: 400 }
      );
    }

    const numQuantity = typeof quantity === "number" ? Math.max(0, quantity) : 0;
    const numCost = typeof cost === "number" ? Math.max(0, cost) : 0;

    await connectDB();

    const newEntry = await FarmDiary.create({
      clerkId: userId,
      activityType,
      title: title.trim(),
      description: typeof description === "string" ? description.trim().substring(0, 500) : "",
      crop: typeof crop === "string" ? crop.trim().substring(0, 50) : "",
      field: typeof field === "string" ? field.trim().substring(0, 50) : "",
      activityDate: parsedDate,
      quantity: numQuantity,
      quantityUnit: typeof quantityUnit === "string" ? quantityUnit.trim().substring(0, 20) : "",
      cost: numCost,
      notes: typeof notes === "string" ? notes.trim().substring(0, 500) : "",
    });

    return NextResponse.json({
      success: true,
      entry: newEntry,
    });
  } catch (error) {
    console.error("Error in POST /api/farm-diary:", error);
    return NextResponse.json(
      { success: false, error: sanitizeErrorMessage(error) },
      { status: 500 }
    );
  }
}
