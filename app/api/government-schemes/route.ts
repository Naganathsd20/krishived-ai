import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  VERIFIED_SCHEMES_CATALOG,
  SCHEME_CATEGORIES_LIST,
  SCHEME_STATES_LIST,
} from "@/lib/schemes-data";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { IGovernmentScheme, ISchemeResponse } from "@/types/scheme";

function sanitizeParam(input: string | null): string {
  if (!input) return "";
  return input.trim().replace(/[^\w\s\-,.]/gi, "").substring(0, 50);
}

export async function GET(request: Request) {
  try {
    // 1. Verify Clerk Authentication
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, totalRecords: 0, schemes: [], categories: [], states: [], error: "Unauthorized. Please sign in to access government schemes telemetry." },
        { status: 401 }
      );
    }

    // 2. Apply Rate Limiting (30 requests per minute per IP)
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`government-schemes:${userId}:${clientIp}`, 30, 60 * 1000);

    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, totalRecords: 0, schemes: [], categories: [], states: [], error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // 3. Parse & Sanitize Query Parameters
    const { searchParams } = new URL(request.url);
    const categoryFilter = sanitizeParam(searchParams.get("category"));
    const stateFilter = sanitizeParam(searchParams.get("state"));
    const searchFilter = sanitizeParam(searchParams.get("search")).toLowerCase();
    const farmerTypeFilter = sanitizeParam(searchParams.get("farmerType")).toLowerCase();

    // 4. Filter Schemes Catalog
    let filteredSchemes: IGovernmentScheme[] = [...VERIFIED_SCHEMES_CATALOG];

    if (categoryFilter && categoryFilter !== "All Categories") {
      filteredSchemes = filteredSchemes.filter(
        (s) => s.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    if (stateFilter && stateFilter !== "All States") {
      filteredSchemes = filteredSchemes.filter(
        (s) =>
          s.state.toLowerCase() === stateFilter.toLowerCase() ||
          s.state === "Central"
      );
    }

    if (farmerTypeFilter && farmerTypeFilter !== "all") {
      filteredSchemes = filteredSchemes.filter((s) =>
        s.farmerType.some((ft) => ft.toLowerCase().includes(farmerTypeFilter))
      );
    }

    if (searchFilter) {
      filteredSchemes = filteredSchemes.filter(
        (s) =>
          s.name.toLowerCase().includes(searchFilter) ||
          s.shortName.toLowerCase().includes(searchFilter) ||
          s.description.toLowerCase().includes(searchFilter) ||
          s.ministry.toLowerCase().includes(searchFilter) ||
          s.category.toLowerCase().includes(searchFilter)
      );
    }

    const responsePayload: ISchemeResponse = {
      success: true,
      totalRecords: filteredSchemes.length,
      schemes: filteredSchemes,
      categories: SCHEME_CATEGORIES_LIST,
      states: SCHEME_STATES_LIST,
    };

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/government-schemes:", error);
    return NextResponse.json(
      {
        success: false,
        totalRecords: 0,
        schemes: [],
        categories: [],
        states: [],
        error: "Unable to retrieve government schemes catalog at this time.",
      },
      { status: 500 }
    );
  }
}
