import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Conversation from "@/models/Conversation";

// Helper for development-only logging
function devLog(...args: any[]) {
  if (process.env.NODE_ENV === "development") {
    console.log("[API /api/ai-assistant/conversations]", ...args);
  }
}

function devError(...args: any[]) {
  if (process.env.NODE_ENV === "development") {
    console.error("[API /api/ai-assistant/conversations ERROR]", ...args);
  }
}

// Safe Time Formatter
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

export async function GET() {
  devLog("GET request received");

  // 1. Verify Clerk Authentication
  let userId: string | null = null;
  try {
    const authObj = await auth();
    userId = authObj.userId;
  } catch (err: any) {
    devError("Clerk auth failed:", err);
    return NextResponse.json(
      { success: false, error: "Unauthorized. Auth verification failed." },
      { status: 401 }
    );
  }

  if (!userId) {
    devLog("User unauthenticated");
    return NextResponse.json(
      { success: false, error: "Unauthorized. Please sign in." },
      { status: 401 }
    );
  }

  // 2. Connect to MongoDB
  try {
    await connectDB();
  } catch (dbErr: any) {
    devError("MongoDB connection error:", dbErr);
    return NextResponse.json(
      { success: false, error: "Database connection failed." },
      { status: 500 }
    );
  }

  // 3. Query Database
  try {
    const conversations = await Conversation.find({ clerkUserId: userId })
      .sort({ updatedAt: -1 })
      .select("_id title messages createdAt updatedAt")
      .lean();

    if (!conversations || !Array.isArray(conversations) || conversations.length === 0) {
      devLog(`No conversations found for user ${userId}`);
      return NextResponse.json(
        {
          success: true,
          conversations: [],
        },
        { status: 200 }
      );
    }

    const formattedSessions = conversations.map((c: any) => {
      const messagesArray = Array.isArray(c.messages) ? c.messages : [];
      const lastMsg = messagesArray.length > 0 ? messagesArray[messagesArray.length - 1] : null;
      const updatedAtVal = c.updatedAt || c.createdAt || new Date();

      const updatedAtDate = new Date(updatedAtVal);
      const now = new Date();
      const validDate = isNaN(updatedAtDate.getTime()) ? now : updatedAtDate;
      const diffDays = Math.floor((now.getTime() - validDate.getTime()) / (1000 * 3600 * 24));

      let dateGroup: "Today" | "Yesterday" | "Previous 7 Days" | "Older" = "Older";
      if (diffDays === 0) dateGroup = "Today";
      else if (diffDays === 1) dateGroup = "Yesterday";
      else if (diffDays <= 7) dateGroup = "Previous 7 Days";

      // Clean preview text: strip legacy prefixes & markdown symbols
      let cleanText = lastMsg && typeof lastMsg.text === "string" ? lastMsg.text.trim() : "";
      cleanText = cleanText
        .replace(/KrishiVed AI Agricultural Advisory/gi, "KrishiMitra Agricultural Advice")
        .replace(/KrishiVed Advisory for:?/gi, "KrishiMitra Advice for")
        .replace(/KrishiVed Assistant/gi, "KrishiMitra")
        .replace(/KrishiVed Advisory/gi, "KrishiMitra Advice")
        .replace(/KrishiVed/gi, "KrishiMitra")
        .replace(/^###\s+|^##\s+|^#\s+/gm, "")
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/`/g, "")
        .replace(/^[-*]\s+/gm, "")
        .replace(/\n+/g, " ")
        .trim();

      const previewText = cleanText
        ? cleanText.substring(0, 55) + (cleanText.length > 55 ? "..." : "")
        : "No messages yet";

      let cleanTitle = typeof c.title === "string" && c.title.trim() ? c.title.trim() : "Farming Query";
      cleanTitle = cleanTitle
        .replace(/KrishiVed Advisory for:?/gi, "KrishiMitra Advice for")
        .replace(/KrishiVed AI Agricultural Advisory/gi, "KrishiMitra Advice")
        .replace(/KrishiVed Assistant/gi, "KrishiMitra")
        .replace(/KrishiVed Advisory/gi, "KrishiMitra Advice")
        .replace(/KrishiVed/gi, "KrishiMitra");

      return {
        id: c._id ? c._id.toString() : String(Math.random()),
        title: cleanTitle,
        dateGroup,
        timestamp: safeFormatTime(validDate),
        preview: previewText,
      };
    });

    devLog(`Successfully fetched ${formattedSessions.length} conversations for user ${userId}`);

    return NextResponse.json(
      {
        success: true,
        conversations: formattedSessions,
      },
      { status: 200 }
    );
  } catch (error: any) {
    devError("Fetch Conversations processing error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error fetching conversations." },
      { status: 500 }
    );
  }
}
