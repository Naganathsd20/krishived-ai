import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getOrCreateUser } from "@/lib/user";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const user = await getOrCreateUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Farmer profile not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      preferences: {
        language: user.language || "English",
        defaultLocation: user.defaultLocation || "Pune",
        defaultCrop: user.defaultCrop || "Wheat & Mustard",
        notificationPreferences: user.notificationPreferences || {
          diseaseAlerts: true,
          weatherAlerts: true,
          soilAdvisories: true,
        },
      },
      user,
    });
  } catch (error) {
    console.error("Error in GET /api/user/preferences:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch preferences." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { language, defaultLocation, defaultCrop, notificationPreferences } = body;

    await connectDB();

    const updateFields: Record<string, any> = {};

    if (typeof language === "string" && language.trim()) {
      updateFields.language = language.trim();
    }

    if (typeof defaultLocation === "string" && defaultLocation.trim()) {
      updateFields.defaultLocation = defaultLocation.trim();
    }

    if (typeof defaultCrop === "string" && defaultCrop.trim()) {
      updateFields.defaultCrop = defaultCrop.trim();
    }

    if (notificationPreferences && typeof notificationPreferences === "object") {
      updateFields.notificationPreferences = {
        diseaseAlerts: Boolean(notificationPreferences.diseaseAlerts),
        weatherAlerts: Boolean(notificationPreferences.weatherAlerts),
        soilAdvisories: Boolean(notificationPreferences.soilAdvisories),
      };
    }

    const updatedUser = await User.findOneAndUpdate(
      { clerkId: userId },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "Farmer profile not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Preferences updated successfully.",
      user: JSON.parse(JSON.stringify(updatedUser)),
    });
  } catch (error) {
    console.error("Error in PATCH /api/user/preferences:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save preferences. Please try again." },
      { status: 500 }
    );
  }
}
