import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import CropSchedule from "@/models/CropSchedule";
import FarmDiary from "@/models/FarmDiary";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { CropScheduleStatus } from "@/types/crop-schedule";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function sanitizeErrorMessage(rawError: unknown): string {
  if (typeof rawError === "string") {
    if (rawError.includes("Mongo") || rawError.includes("ECONNREFUSED") || rawError.includes("connect")) {
      return "Unable to process schedule request. Please try again.";
    }
    return rawError;
  }
  if (rawError instanceof Error) {
    const msg = rawError.message;
    if (msg.includes("Mongo") || msg.includes("ECONNREFUSED") || msg.includes("connect")) {
      return "Unable to process schedule request. Please try again.";
    }
    return msg;
  }
  return "Failed to process schedule request.";
}

// GET /api/crop-schedule/[id] — Retrieve single schedule task details
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
        { success: false, error: "Invalid schedule ID provided." },
        { status: 400 }
      );
    }

    await connectDB();

    const schedule = await CropSchedule.findOne({ _id: id, clerkId: userId }).lean();
    if (!schedule) {
      return NextResponse.json(
        { success: false, error: "Schedule task not found or access denied." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        schedule: {
          ...schedule,
          _id: schedule._id.toString(),
          sowingDate: new Date(schedule.sowingDate).toISOString(),
          scheduledDate: new Date(schedule.scheduledDate).toISOString(),
          completedAt: schedule.completedAt ? new Date(schedule.completedAt).toISOString() : null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/crop-schedule/[id]:", error);
    return NextResponse.json(
      { success: false, error: sanitizeErrorMessage(error) },
      { status: 500 }
    );
  }
}

// PUT /api/crop-schedule/[id] — Update task status & Farm Diary auto-sync (Idempotent)
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
    const rateLimit = checkRateLimit(`crop-schedule-put:${userId}:${clientIp}`, 20, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { id } = await params;
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid schedule ID provided." },
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

    const { status, cost, quantity, quantityUnit, notes, scheduledDate } = body;

    const VALID_STATUSES: CropScheduleStatus[] = ["scheduled", "completed", "skipped"];
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status. Must be 'scheduled', 'completed', or 'skipped'." },
        { status: 400 }
      );
    }

    await connectDB();

    const scheduleDoc = await CropSchedule.findOne({ _id: id, clerkId: userId });
    if (!scheduleDoc) {
      return NextResponse.json(
        { success: false, error: "Schedule task not found or access denied." },
        { status: 404 }
      );
    }

    // Number & String Input Sanitizations
    const numCost = cost !== undefined ? Math.max(0, Number(cost) || 0) : scheduleDoc.cost;
    const numQuantity = quantity !== undefined ? Math.max(0, Number(quantity) || 0) : scheduleDoc.quantity;
    const quantityUnitVal =
      quantityUnit !== undefined
        ? String(quantityUnit).trim().substring(0, 20)
        : scheduleDoc.quantityUnit;
    const notesVal =
      notes !== undefined ? String(notes).trim().substring(0, 500) : scheduleDoc.notes;

    if (scheduledDate) {
      const parsedDate = new Date(scheduledDate);
      if (!isNaN(parsedDate.getTime())) {
        scheduleDoc.scheduledDate = parsedDate;
      }
    }

    // FARM DIARY INTEGRATION & IDEMPOTENT COMPLETION WORKFLOW
    if (status === "completed") {
      if (scheduleDoc.farmDiaryEntryId) {
        // Idempotent: Task was previously completed & logged; update existing FarmDiary record
        await FarmDiary.findOneAndUpdate(
          { _id: scheduleDoc.farmDiaryEntryId, clerkId: userId },
          {
            cost: numCost,
            quantity: numQuantity,
            quantityUnit: quantityUnitVal,
            notes: notesVal || scheduleDoc.notes,
          }
        );
      } else {
        // First-time completion: Create new corresponding FarmDiary entry
        const diaryEntry = await FarmDiary.create({
          clerkId: userId,
          activityType: scheduleDoc.activityType,
          title: scheduleDoc.title,
          description: scheduleDoc.description,
          crop: scheduleDoc.crop,
          field: scheduleDoc.field,
          activityDate: scheduleDoc.scheduledDate || new Date(),
          quantity: numQuantity,
          quantityUnit: quantityUnitVal,
          cost: numCost,
          notes: notesVal || scheduleDoc.notes,
        });

        scheduleDoc.farmDiaryEntryId = diaryEntry._id.toString();
      }

      scheduleDoc.completedAt = new Date();
    }

    if (status) {
      scheduleDoc.status = status;
    }

    scheduleDoc.cost = numCost;
    scheduleDoc.quantity = numQuantity;
    scheduleDoc.quantityUnit = quantityUnitVal;
    scheduleDoc.notes = notesVal;

    await scheduleDoc.save();

    return NextResponse.json(
      {
        success: true,
        schedule: {
          ...scheduleDoc.toObject(),
          _id: scheduleDoc._id.toString(),
          sowingDate: new Date(scheduleDoc.sowingDate).toISOString(),
          scheduledDate: new Date(scheduleDoc.scheduledDate).toISOString(),
          completedAt: scheduleDoc.completedAt ? new Date(scheduleDoc.completedAt).toISOString() : null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PUT /api/crop-schedule/[id]:", error);
    return NextResponse.json(
      { success: false, error: sanitizeErrorMessage(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/crop-schedule/[id] — Delete schedule task (scoped to authenticated user)
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
        { success: false, error: "Invalid schedule ID provided." },
        { status: 400 }
      );
    }

    await connectDB();

    const deleted = await CropSchedule.findOneAndDelete({ _id: id, clerkId: userId });
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Schedule task not found or access denied." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Crop schedule task deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in DELETE /api/crop-schedule/[id]:", error);
    return NextResponse.json(
      { success: false, error: sanitizeErrorMessage(error) },
      { status: 500 }
    );
  }
}
