import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { fetchMandiPrices } from "@/lib/mandi";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

function sanitizeParam(input: string | null): string {
  if (!input) return "";
  return input.trim().replace(/[^\w\s\-,.]/gi, "").substring(0, 50);
}

function sanitizeErrorMessage(rawError: unknown): string {
  if (typeof rawError === "string") {
    if (rawError.includes("API key") || rawError.includes("DATAGOV") || rawError.includes("connect")) {
      return "Unable to fetch Agmarknet mandi market prices right now.";
    }
    return rawError;
  }
  if (rawError instanceof Error) {
    const msg = rawError.message;
    if (msg.includes("API key") || msg.includes("DATAGOV") || msg.includes("connect")) {
      return "Unable to fetch Agmarknet mandi market prices right now.";
    }
    return msg;
  }
  return "Failed to load mandi market prices.";
}

export async function GET(request: Request) {
  try {
    // 1. Verify Clerk Authentication
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in to view mandi market prices." },
        { status: 401 }
      );
    }

    // 2. Apply Rate Limiting (30 requests per minute per user/IP)
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`mandi-prices:${userId}:${clientIp}`, 30, 60 * 1000);

    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // 3. Parse & Sanitize Query Parameters
    const { searchParams } = new URL(request.url);
    const state = sanitizeParam(searchParams.get("state"));
    const district = sanitizeParam(searchParams.get("district"));
    const commodity = sanitizeParam(searchParams.get("commodity"));
    const market = sanitizeParam(searchParams.get("market"));

    // 4. Fetch Normalized Agmarknet Mandi Prices
    const result = await fetchMandiPrices({
      state,
      district,
      commodity,
      market,
    });

    if (!result.success) {
      const status = result.error?.includes("unconfigured") ? 503 : 502;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/mandi-prices:", error);
    const sanitizedMsg = sanitizeErrorMessage(error);

    return NextResponse.json(
      { success: false, totalRecords: 0, prices: [], error: sanitizedMsg },
      { status: 500 }
    );
  }
}
