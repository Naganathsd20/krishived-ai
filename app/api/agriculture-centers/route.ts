import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import AgricultureCenter from "@/models/AgricultureCenter";
import { ensureAgricultureCentersSeeded, VERIFIED_AGRICULTURE_CENTERS } from "@/lib/seed-agriculture-centers";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { AgricultureCenterType, IAgricultureCenterResponse, IAgricultureCenter } from "@/types/agriculture-center";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const VALID_TYPES: AgricultureCenterType[] = ["KVK", "GovtOffice", "University", "SoilLab", "FarmerService"];

// Haversine distance formula calculation in kilometers
function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function sanitizeErrorMessage(rawError: unknown): string {
  if (typeof rawError === "string") {
    if (rawError.includes("Mongo") || rawError.includes("ECONNREFUSED") || rawError.includes("connect") || rawError.includes("SSL")) {
      return "Unable to retrieve agriculture support centers. Please try again.";
    }
    return rawError;
  }
  if (rawError instanceof Error) {
    const msg = rawError.message;
    if (msg.includes("Mongo") || msg.includes("ECONNREFUSED") || msg.includes("connect") || msg.includes("SSL")) {
      return "Unable to retrieve agriculture support centers. Please try again.";
    }
    return msg;
  }
  return "Failed to load agriculture centers.";
}

export async function GET(request: Request) {
  try {
    // 1. Clerk Authentication Check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in to search agriculture centers." },
        { status: 401 }
      );
    }

    // 2. Rate Limiting Check
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`agri-centers:${userId}:${clientIp}`, 30, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    // 3. Extract Query Parameters
    const { searchParams } = new URL(request.url);
    const rawState = searchParams.get("state")?.trim() || "Karnataka";
    const targetState = rawState === "Maharashtra" ? "Maharashtra" : "Karnataka";
    const districtParam = searchParams.get("district")?.trim() || "";
    const typeParam = searchParams.get("type")?.trim() || "";
    const searchParam = searchParams.get("search")?.trim() || "";
    const latParam = searchParams.get("lat") || searchParams.get("latitude");
    const lngParam = searchParams.get("lng") || searchParams.get("longitude");
    const radiusParam = parseInt(searchParams.get("radius") || "50", 10);
    const pageParam = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limitParam = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "15", 10)));

    // Parameter Validations
    let userLat: number | null = null;
    let userLng: number | null = null;

    if (latParam && lngParam) {
      const parsedLat = parseFloat(latParam);
      const parsedLng = parseFloat(lngParam);
      if (!isNaN(parsedLat) && !isNaN(parsedLng) && parsedLat >= -90 && parsedLat <= 90 && parsedLng >= -180 && parsedLng <= 180) {
        userLat = parsedLat;
        userLng = parsedLng;
      } else {
        return NextResponse.json(
          { success: false, error: "Invalid latitude or longitude coordinates provided." },
          { status: 400 }
        );
      }
    }

    const radiusKm = Math.min(500, Math.max(1, isNaN(radiusParam) ? 50 : radiusParam));

    // 4. Build Base Filter Query (Strictly enforce selected State)
    const filterQuery: any = {
      isVerified: true,
      state: { $regex: new RegExp(`^${targetState}$`, "i") },
    };

    if (districtParam && districtParam !== "All Districts") {
      const cleanDistrict = districtParam.split("/")[0].trim();
      filterQuery.district = { $regex: new RegExp(cleanDistrict, "i") };
    }

    if (typeParam && typeParam !== "All" && VALID_TYPES.includes(typeParam as AgricultureCenterType)) {
      filterQuery.type = typeParam;
    }

    if (searchParam) {
      const sanitizedSearch = searchParam.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(sanitizedSearch, "i");
      filterQuery.$and = [
        { state: { $regex: new RegExp(`^${targetState}$`, "i") } },
        {
          $or: [
            { name: searchRegex },
            { address: searchRegex },
            { district: searchRegex },
          ],
        },
      ];
      delete filterQuery.state;
    }

    // 5. Connect DB & Execute Query with graceful local catalog fallback on connection error
    let rawDocs: any[] = [];
    let isDbConnected = false;

    try {
      await connectDB();
      await ensureAgricultureCentersSeeded();
      rawDocs = await AgricultureCenter.find(filterQuery)
        .sort({ state: 1, district: 1, name: 1 })
        .lean();
      isDbConnected = true;
    } catch (dbError) {
      console.warn("[Agri Centers API] Database connection error, using verified local catalog fallback:", dbError instanceof Error ? dbError.message : dbError);

      // Fallback: Filter VERIFIED_AGRICULTURE_CENTERS in memory
      rawDocs = VERIFIED_AGRICULTURE_CENTERS.filter((c) => {
        if (c.state.toLowerCase() !== targetState.toLowerCase()) return false;

        if (districtParam && districtParam !== "All Districts") {
          const cleanDist = districtParam.split("/")[0].trim().toLowerCase();
          if (!c.district.toLowerCase().includes(cleanDist)) return false;
        }

        if (typeParam && typeParam !== "All" && VALID_TYPES.includes(typeParam as AgricultureCenterType)) {
          if (c.type !== typeParam) return false;
        }

        if (searchParam) {
          const searchLower = searchParam.toLowerCase();
          const matchName = c.name.toLowerCase().includes(searchLower);
          const matchAddress = c.address.toLowerCase().includes(searchLower);
          const matchDist = c.district.toLowerCase().includes(searchLower);
          if (!matchName && !matchAddress && !matchDist) return false;
        }

        return true;
      });
    }

    // Map documents/objects to clean response interface
    let processedCenters: IAgricultureCenter[] = rawDocs.map((doc: any, idx: number) => {
      const lng = doc.location?.coordinates?.[0] || 0;
      const lat = doc.location?.coordinates?.[1] || 0;

      let distanceKm: number | null = null;
      if (userLat !== null && userLng !== null && lat !== 0 && lng !== 0) {
        distanceKm = calculateHaversineKm(userLat, userLng, lat, lng);
      }

      return {
        _id: doc._id ? doc._id.toString() : `center-${idx}-${doc.name.replace(/\s+/g, "-").toLowerCase()}`,
        name: doc.name,
        type: doc.type as AgricultureCenterType,
        address: doc.address,
        district: doc.district,
        state: doc.state,
        pincode: doc.pincode || null,
        phone: doc.phone || null,
        email: doc.email || null,
        website: doc.website || null,
        location: doc.location || { type: "Point", coordinates: [0, 0] },
        officialSource: doc.officialSource || "ICAR / Ministry of Agriculture & Farmers Welfare, Govt of India",
        sourceUrl: doc.sourceUrl || null,
        isVerified: Boolean(doc.isVerified),
        lastVerified: doc.lastVerified ? new Date(doc.lastVerified).toISOString() : new Date().toISOString(),
        distanceKm,
      };
    });

    // Distance Radius Filtering & Distance Sorting when coordinates are present (strictly matching selected state)
    if (userLat !== null && userLng !== null) {
      processedCenters = processedCenters.filter(
        (c) =>
          c.state?.toLowerCase() === targetState.toLowerCase() &&
          c.distanceKm !== null &&
          c.distanceKm !== undefined &&
          c.distanceKm <= radiusKm
      );
      processedCenters.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
    }

    // 6. Dynamic Distinct States (Restricted to Karnataka & Maharashtra) and Districts for target State
    const availableStates = ["Karnataka", "Maharashtra"];
    let availableDistricts: string[] = [];

    if (isDbConnected) {
      try {
        const distinctDistricts = await AgricultureCenter.distinct("district", {
          isVerified: true,
          state: { $regex: new RegExp(`^${targetState}$`, "i") },
        });
        availableDistricts = (distinctDistricts as string[]).sort();
      } catch {
        availableDistricts = [...new Set(VERIFIED_AGRICULTURE_CENTERS.filter((c) => c.state.toLowerCase() === targetState.toLowerCase()).map((c) => c.district))].sort();
      }
    } else {
      availableDistricts = [...new Set(VERIFIED_AGRICULTURE_CENTERS.filter((c) => c.state.toLowerCase() === targetState.toLowerCase()).map((c) => c.district))].sort();
    }

    // 7. Pagination Calculations
    const total = processedCenters.length;
    const totalPages = Math.ceil(total / limitParam) || 1;
    const skip = (pageParam - 1) * limitParam;
    const paginatedCenters = processedCenters.slice(skip, skip + limitParam);

    // 8. Response Payload
    const responsePayload: IAgricultureCenterResponse = {
      success: true,
      centers: paginatedCenters,
      pagination: {
        page: pageParam,
        limit: limitParam,
        total,
        totalPages,
      },
      availableStates,
      availableDistricts,
    };

    return NextResponse.json(responsePayload, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    });
  } catch (error) {
    console.error("Error in GET /api/agriculture-centers:", error);
    const sanitizedMsg = sanitizeErrorMessage(error);
    return NextResponse.json(
      { success: false, error: sanitizedMsg },
      { status: 500 }
    );
  }
}
