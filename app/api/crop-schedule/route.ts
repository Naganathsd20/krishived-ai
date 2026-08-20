import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import CropSchedule from "@/models/CropSchedule";
import { getCropStageTemplates } from "@/lib/agronomy-templates";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { ICropScheduleResponse, CropScheduleStatus } from "@/types/crop-schedule";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function sanitizeErrorMessage(rawError: unknown): string {
  if (typeof rawError === "string") {
    if (rawError.includes("Mongo") || rawError.includes("ECONNREFUSED") || rawError.includes("connect")) {
      return "Unable to process crop schedule request. Please try again.";
    }
    return rawError;
  }
  if (rawError instanceof Error) {
    const msg = rawError.message;
    if (msg.includes("Mongo") || msg.includes("ECONNREFUSED") || msg.includes("connect")) {
      return "Unable to process crop schedule request. Please try again.";
    }
    return msg;
  }
  return "Failed to process crop schedule request.";
}

// GET /api/crop-schedule — List authenticated user's crop schedules
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in to view crop schedules." },
        { status: 401 }
      );
    }

    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`crop-schedule-get:${userId}:${clientIp}`, 30, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const cropParam = searchParams.get("crop")?.trim() || "";
    const fieldParam = searchParams.get("field")?.trim() || "";
    const statusParam = searchParams.get("status")?.trim() || "";
    const searchParam = searchParams.get("search")?.trim() || "";
    const pageParam = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limitParam = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "30", 10)));
    const skip = (pageParam - 1) * limitParam;

    const filterQuery: any = { clerkId: userId };

    if (cropParam && cropParam !== "All Crops") {
      filterQuery.crop = { $regex: new RegExp(`^${cropParam}$`, "i") };
    }

    if (fieldParam && fieldParam !== "All Fields") {
      filterQuery.field = { $regex: new RegExp(`^${fieldParam}$`, "i") };
    }

    if (statusParam && statusParam !== "All") {
      filterQuery.status = statusParam;
    }

    if (searchParam) {
      const sanitizedSearch = searchParam.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(sanitizedSearch, "i");
      filterQuery.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { crop: searchRegex },
        { field: searchRegex },
        { notes: searchRegex },
      ];
    }

    const [schedules, total, allUserSchedules] = await Promise.all([
      CropSchedule.find(filterQuery)
        .sort({ scheduledDate: 1, stageIndex: 1 })
        .skip(skip)
        .limit(limitParam)
        .lean(),
      CropSchedule.countDocuments(filterQuery),
      CropSchedule.find({ clerkId: userId }).select("status scheduledDate crop field").lean(),
    ]);

    // Calculate Summary Stats
    const totalSchedules = allUserSchedules.length;
    let pendingCount = 0;
    let completedCount = 0;
    let skippedCount = 0;
    let dueTodayCount = 0;

    const todayStr = new Date().toISOString().split("T")[0];

    allUserSchedules.forEach((item: any) => {
      if (item.status === "completed") completedCount++;
      else if (item.status === "skipped") skippedCount++;
      else pendingCount++;

      if (item.status === "scheduled" && item.scheduledDate) {
        const itemDateStr = new Date(item.scheduledDate).toISOString().split("T")[0];
        if (itemDateStr === todayStr) dueTodayCount++;
      }
    });

    // Available Distinct Crops & Fields for Filter Dropdowns
    const availableCrops = Array.from(new Set(allUserSchedules.map((s: any) => s.crop).filter(Boolean))).sort();
    const availableFields = Array.from(new Set(allUserSchedules.map((s: any) => s.field).filter(Boolean))).sort();

    const responsePayload: ICropScheduleResponse = {
      success: true,
      schedules: schedules.map((doc: any) => ({
        ...doc,
        _id: doc._id.toString(),
        sowingDate: new Date(doc.sowingDate).toISOString(),
        scheduledDate: new Date(doc.scheduledDate).toISOString(),
        completedAt: doc.completedAt ? new Date(doc.completedAt).toISOString() : null,
      })),
      stats: {
        totalSchedules,
        pendingCount,
        completedCount,
        skippedCount,
        dueTodayCount,
      },
      pagination: {
        page: pageParam,
        limit: limitParam,
        total,
        totalPages: Math.ceil(total / limitParam) || 1,
      },
      availableCrops,
      availableFields,
    };

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/crop-schedule:", error);
    return NextResponse.json(
      { success: false, error: sanitizeErrorMessage(error) },
      { status: 500 }
    );
  }
}

// POST /api/crop-schedule — Create a new stage-by-stage crop schedule plan
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in to create crop schedules." },
        { status: 401 }
      );
    }

    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`crop-schedule-post:${userId}:${clientIp}`, 15, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please wait a moment and try again." },
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

    const { crop, field, cultivatedArea = 1, sowingDate, notes = "" } = body;

    // 1. Input Validation: Crop & Field Name
    if (!crop || typeof crop !== "string" || !crop.trim() || crop.trim().length > 50) {
      return NextResponse.json(
        { success: false, error: "Valid crop name (max 50 characters) is required." },
        { status: 400 }
      );
    }

    if (!field || typeof field !== "string" || !field.trim() || field.trim().length > 50) {
      return NextResponse.json(
        { success: false, error: "Valid field name (max 50 characters) is required." },
        { status: 400 }
      );
    }

    const areaNum = Number(cultivatedArea);
    if (isNaN(areaNum) || areaNum <= 0) {
      return NextResponse.json(
        { success: false, error: "Cultivated area must be a positive number greater than 0." },
        { status: 400 }
      );
    }

    // 2. Sowing Date Range Validation (-180 days to +90 days)
    if (!sowingDate) {
      return NextResponse.json(
        { success: false, error: "Sowing date is required." },
        { status: 400 }
      );
    }

    const parsedSowingDate = new Date(sowingDate);
    if (isNaN(parsedSowingDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid sowing date format." },
        { status: 400 }
      );
    }

    const now = new Date();
    const minSowingDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    const maxSowingDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    if (parsedSowingDate < minSowingDate || parsedSowingDate > maxSowingDate) {
      return NextResponse.json(
        {
          success: false,
          error: "Sowing date must be within the last 180 days or next 90 days.",
        },
        { status: 400 }
      );
    }

    const notesVal = typeof notes === "string" ? notes.trim().substring(0, 500) : "";

    await connectDB();

    // Retrieve agronomy stage templates for requested crop
    const stageTemplates = getCropStageTemplates(crop.trim());

    // Construct schedule documents for each agronomic stage
    const docsToCreate = stageTemplates.map((tmpl) => {
      const scheduledDate = new Date(
        parsedSowingDate.getTime() + tmpl.offsetDaysStart * 24 * 60 * 60 * 1000
      );

      return {
        clerkId: userId,
        crop: crop.trim(),
        field: field.trim(),
        cultivatedArea: areaNum,
        sowingDate: parsedSowingDate,
        scheduledDate,
        activityType: tmpl.activityType,
        title: tmpl.title,
        description: `${tmpl.description} Recommended action: ${tmpl.recommendedAction}`,
        status: "scheduled" as CropScheduleStatus,
        stageIndex: tmpl.stageIndex,
        cost: 0,
        quantity: 0,
        quantityUnit: "",
        notes: notesVal,
      };
    });

    const createdSchedules = await CropSchedule.insertMany(docsToCreate);

    return NextResponse.json(
      {
        success: true,
        schedules: createdSchedules,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/crop-schedule:", error);
    return NextResponse.json(
      { success: false, error: sanitizeErrorMessage(error) },
      { status: 500 }
    );
  }
}
