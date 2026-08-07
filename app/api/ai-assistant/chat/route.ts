import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import { generateFarmingChatResponse } from "@/lib/gemini";

function devLog(...args: any[]) {
  if (process.env.NODE_ENV === "development") {
    console.log("[API /api/ai-assistant/chat]", ...args);
  }
}

function devError(...args: any[]) {
  if (process.env.NODE_ENV === "development") {
    console.error("[API /api/ai-assistant/chat ERROR]", ...args);
  }
}

export async function POST(request: Request) {
  devLog("POST chat message request received");

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
      { success: false, error: "Unauthorized. Please sign in to use the AI Assistant." },
      { status: 401 }
    );
  }

  // 2. Parse & Validate Payload
  let body: any = {};
  try {
    body = await request.json();
  } catch (jsonErr) {
    return NextResponse.json(
      { success: false, error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  const { conversationId, message, image } = body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return NextResponse.json(
      { success: false, error: "Message content is required." },
      { status: 400 }
    );
  }

  // 3. Connect to Database
  try {
    await connectDB();
  } catch (dbErr: any) {
    devError("Database connection error:", dbErr);
    return NextResponse.json(
      { success: false, error: "Database connection failed." },
      { status: 500 }
    );
  }

  try {
    let conversation: any = null;
    let existingHistory: Array<{ sender: "user" | "ai"; text: string }> = [];

    // Check if conversationId is a valid MongoDB ObjectId
    const isValiObjectId =
      conversationId &&
      typeof conversationId === "string" &&
      mongoose.Types.ObjectId.isValid(conversationId);

    if (isValiObjectId) {
      conversation = await Conversation.findOne({
        _id: conversationId,
        clerkUserId: userId,
      });

      if (conversation && Array.isArray(conversation.messages)) {
        existingHistory = conversation.messages.map((m: any) => ({
          sender: m.sender,
          text: m.text,
        }));
      }
    }

    // 4. Generate Gemini AI Response
    devLog("Calling Gemini Assistant AI...");
    const aiResponseText = await generateFarmingChatResponse(
      existingHistory,
      message.trim(),
      image
    );

    const now = new Date();
    const userMsg = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sender: "user" as const,
      text: message.trim(),
      image: image || "",
      timestamp: now,
    };

    const aiMsg = {
      id: `ai-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sender: "ai" as const,
      text: aiResponseText,
      image: "",
      timestamp: new Date(now.getTime() + 1000),
    };

    let isNewConversation = false;

    if (!conversation) {
      isNewConversation = true;
      let cleanTitle = message.trim()
        .replace(/KrishiVed Advisory for:?/gi, "KrishiMitra Advice for")
        .replace(/KrishiVed AI Agricultural Advisory/gi, "KrishiMitra Advice")
        .replace(/KrishiVed Assistant/gi, "KrishiMitra")
        .replace(/KrishiVed Advisory/gi, "KrishiMitra Advice");

      if (cleanTitle.length > 40) {
        cleanTitle = cleanTitle.substring(0, 40) + "...";
      }

      conversation = await Conversation.create({
        clerkUserId: userId,
        title: cleanTitle,
        messages: [userMsg, aiMsg],
      });
      devLog(`Created new conversation ${conversation._id}`);
    } else {
      conversation.messages.push(userMsg, aiMsg);
      conversation.updatedAt = now;
      await conversation.save();
      devLog(`Updated existing conversation ${conversation._id}`);
    }

    return NextResponse.json(
      {
        success: true,
        conversationId: conversation._id.toString(),
        title: conversation.title,
        userMessage: userMsg,
        aiMessage: aiMsg,
      },
      { status: isNewConversation ? 201 : 200 }
    );
  } catch (error: any) {
    devError("POST chat message error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to process AI chat request.",
      },
      { status: 500 }
    );
  }
}
