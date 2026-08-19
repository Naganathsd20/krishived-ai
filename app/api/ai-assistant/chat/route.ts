import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import { generateFarmingChatResponse } from "@/lib/gemini";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

function sanitizeErrorMessage(rawError: unknown): string {
  if (typeof rawError === "string") {
    if (rawError.includes("Mongo") || rawError.includes("API key") || rawError.includes("GEMINI")) {
      return "Unable to process chat request right now. Please try again.";
    }
    return rawError;
  }
  if (rawError instanceof Error) {
    const msg = rawError.message;
    if (msg.includes("Mongo") || msg.includes("API key") || msg.includes("GEMINI") || msg.includes("connect")) {
      return "Unable to process chat request right now. Please try again.";
    }
    return msg;
  }
  return "Failed to process AI chat request.";
}

export async function POST(request: Request) {
  // 1. Verify Clerk Authentication
  let userId: string | null = null;
  try {
    const authObj = await auth();
    userId = authObj.userId;
  } catch {
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

  // 2. Apply Rate Limiting (15 chat messages per minute per user/IP)
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(`chat-post:${userId}:${clientIp}`, 15, 60 * 1000);

  if (!rateLimit.success) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  // 3. Parse & Validate Payload
  let body: any = {};
  try {
    body = await request.json();
  } catch {
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

  const trimmedMessage = message.trim();
  if (trimmedMessage.length > 2000) {
    return NextResponse.json(
      { success: false, error: "Message exceeds maximum allowed length of 2000 characters." },
      { status: 400 }
    );
  }

  if (image && typeof image === "string" && image.length > 5000000) {
    return NextResponse.json(
      { success: false, error: "Image data exceeds allowable size limit." },
      { status: 400 }
    );
  }

  // 4. Connect to Database
  try {
    await connectDB();
  } catch (dbErr) {
    console.error("Database connection error in chat endpoint:", dbErr);
    return NextResponse.json(
      { success: false, error: "Database connection failed. Please try again later." },
      { status: 500 }
    );
  }

  try {
    let conversation: any = null;
    let existingHistory: Array<{ sender: "user" | "ai"; text: string }> = [];

    // Check if conversationId is a valid MongoDB ObjectId
    const isValidObjectId =
      conversationId &&
      typeof conversationId === "string" &&
      mongoose.Types.ObjectId.isValid(conversationId);

    if (isValidObjectId) {
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

    // 5. Generate Gemini AI Response
    const aiResponseText = await generateFarmingChatResponse(
      existingHistory,
      trimmedMessage,
      image
    );

    const now = new Date();
    const userMsg = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sender: "user" as const,
      text: trimmedMessage,
      image: typeof image === "string" ? image : "",
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
      let cleanTitle = trimmedMessage
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
    } else {
      conversation.messages.push(userMsg, aiMsg);
      conversation.updatedAt = now;
      await conversation.save();
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
  } catch (error) {
    console.error("POST chat message error:", error);
    const sanitizedMsg = sanitizeErrorMessage(error);
    return NextResponse.json(
      {
        success: false,
        error: sanitizedMsg,
      },
      { status: 500 }
    );
  }
}
