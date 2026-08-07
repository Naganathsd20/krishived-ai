import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Conversation from "@/models/Conversation";

function devLog(...args: any[]) {
  if (process.env.NODE_ENV === "development") {
    console.log("[API /api/ai-assistant/conversations/[id]]", ...args);
  }
}

function devError(...args: any[]) {
  if (process.env.NODE_ENV === "development") {
    console.error("[API /api/ai-assistant/conversations/[id] ERROR]", ...args);
  }
}

function safeFormatTime(dateVal: any): string {
  try {
    const d = dateVal ? new Date(dateVal) : new Date();
    if (isNaN(d.getTime())) {
      return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  devLog("GET single conversation request received");

  // 1. Verify Clerk Authentication
  let userId: string | null = null;
  try {
    const authObj = await auth();
    userId = authObj.userId;
  } catch (err: any) {
    devError("Auth check exception:", err);
    return NextResponse.json(
      { success: false, error: "Unauthorized. Auth check failed." },
      { status: 401 }
    );
  }

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Please sign in." },
      { status: 401 }
    );
  }

  const { id } = await params;

  // 2. Validate MongoDB ObjectId Format
  if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
    devLog(`Invalid ObjectId provided: ${id}`);
    return NextResponse.json(
      { success: false, error: "Invalid conversation ID format." },
      { status: 400 }
    );
  }

  // 3. Connect to DB
  try {
    await connectDB();
  } catch (dbErr: any) {
    devError("Database connection failed:", dbErr);
    return NextResponse.json(
      { success: false, error: "Database connection failure." },
      { status: 500 }
    );
  }

  // 4. Query Conversation
  try {
    const conversation = await Conversation.findOne({
      _id: id,
      clerkUserId: userId,
    }).lean();

    if (!conversation) {
      devLog(`Conversation not found for id: ${id}, user: ${userId}`);
      return NextResponse.json(
        { success: false, error: "Conversation not found." },
        { status: 404 }
      );
    }

    const formattedMessages = Array.isArray(conversation.messages)
      ? conversation.messages.map((m: any) => ({
          id: m.id || `msg-${Math.random()}`,
          sender: m.sender === "user" ? "user" : "ai",
          text: typeof m.text === "string" ? m.text : "",
          image: typeof m.image === "string" ? m.image : "",
          timestamp: safeFormatTime(m.timestamp),
        }))
      : [];

    devLog(`Successfully retrieved conversation ${id}`);

    return NextResponse.json(
      {
        success: true,
        conversation: {
          id: conversation._id.toString(),
          title: conversation.title || "Farming Conversation",
          messages: formattedMessages,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    devError("Fetch conversation error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error loading conversation." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  devLog("DELETE single conversation request received");

  // 1. Verify Clerk Authentication
  let userId: string | null = null;
  try {
    const authObj = await auth();
    userId = authObj.userId;
  } catch (err: any) {
    devError("Auth check exception:", err);
    return NextResponse.json(
      { success: false, error: "Unauthorized. Auth check failed." },
      { status: 401 }
    );
  }

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Please sign in." },
      { status: 401 }
    );
  }

  const { id } = await params;

  // 2. Validate MongoDB ObjectId
  if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
    devLog(`Invalid ObjectId for deletion: ${id}`);
    return NextResponse.json(
      { success: false, error: "Invalid conversation ID format." },
      { status: 400 }
    );
  }

  // 3. Connect to DB
  try {
    await connectDB();
  } catch (dbErr: any) {
    devError("Database connection failed:", dbErr);
    return NextResponse.json(
      { success: false, error: "Database connection failure." },
      { status: 500 }
    );
  }

  // 4. Delete Document
  try {
    const deleted = await Conversation.findOneAndDelete({
      _id: id,
      clerkUserId: userId,
    });

    if (!deleted) {
      devLog(`Conversation not found for deletion id: ${id}`);
      return NextResponse.json(
        { success: false, error: "Conversation not found or unauthorized." },
        { status: 404 }
      );
    }

    devLog(`Successfully deleted conversation ${id}`);

    return NextResponse.json(
      {
        success: true,
        message: "Conversation deleted successfully.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    devError("Delete conversation error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error deleting conversation." },
      { status: 500 }
    );
  }
}
