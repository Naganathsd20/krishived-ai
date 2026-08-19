import { IMandiPrice, IMandiPriceResponse, IAgmarknetRawRecord } from "@/types/mandi";

interface CachedMandiPayload {
  data: IMandiPriceResponse;
  expiresAt: number;
}

const mandiMemoryCache = new Map<string, CachedMandiPayload>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes TTL

/**
 * Calculates real data freshness based on arrival_date string (e.g., "19/08/2026" or "2026-08-19").
 */
function calculateDataFreshness(arrivalDateStr?: string): "Live Agmarknet Data" | "Recent Data (1-3 Days Ago)" | "Agmarknet Historical Data" {
  if (!arrivalDateStr) return "Agmarknet Historical Data";

  try {
    let arrivalDate: Date;

    if (arrivalDateStr.includes("/")) {
      const parts = arrivalDateStr.split("/");
      if (parts.length === 3) {
        // DD/MM/YYYY
        arrivalDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      } else {
        arrivalDate = new Date(arrivalDateStr);
      }
    } else {
      arrivalDate = new Date(arrivalDateStr);
    }

    if (isNaN(arrivalDate.getTime())) {
      return "Agmarknet Historical Data";
    }

    const now = new Date();
    const diffMs = now.getTime() - arrivalDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return "Live Agmarknet Data";
    if (diffDays <= 3) return "Recent Data (1-3 Days Ago)";
    return "Agmarknet Historical Data";
  } catch {
    return "Agmarknet Historical Data";
  }
}

/**
 * Server-side helper to fetch and normalize official Agmarknet mandi market prices from data.gov.in
 */
export async function fetchMandiPrices(params: {
  state?: string;
  district?: string;
  commodity?: string;
  market?: string;
}): Promise<IMandiPriceResponse> {
  const state = params.state?.trim() || "";
  const district = params.district?.trim() || "";
  const commodity = params.commodity?.trim() || "";
  const market = params.market?.trim() || "";

  const cacheKey = `${state.toLowerCase()}:${district.toLowerCase()}:${commodity.toLowerCase()}:${market.toLowerCase()}`;
  const now = Date.now();

  // 1. Check server-side memory cache
  const cached = mandiMemoryCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  const apiKey = process.env.DATAGOV_API_KEY || process.env.AGMARKNET_API_KEY;

  if (!apiKey || apiKey === "demo_key") {
    return {
      success: false,
      totalRecords: 0,
      prices: [],
      error: "Mandi prices service is currently unconfigured. DATAGOV_API_KEY environment variable is required.",
    };
  }

  try {
    const resourceUrl = new URL(
      "https://api.data.gov.in/resource/9ef3b15a-0c14-4683-92f7-01b0e3507236"
    );

    resourceUrl.searchParams.append("api-key", apiKey);
    resourceUrl.searchParams.append("format", "json");
    resourceUrl.searchParams.append("limit", "50");

    if (state) resourceUrl.searchParams.append("filters[state]", state);
    if (district) resourceUrl.searchParams.append("filters[district]", district);
    if (commodity) resourceUrl.searchParams.append("filters[commodity]", commodity);
    if (market) resourceUrl.searchParams.append("filters[market]", market);

    const res = await fetch(resourceUrl.toString(), {
      next: { revalidate: 1800 },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return {
        success: false,
        totalRecords: 0,
        prices: [],
        error: `Upstream Agmarknet API returned status ${res.status}. Please try again later.`,
      };
    }

    const data = await res.json().catch(() => null);

    if (!data || !Array.isArray(data.records)) {
      return {
        success: false,
        totalRecords: 0,
        prices: [],
        error: "Invalid JSON response structure from official Agmarknet API.",
      };
    }

    const records: IAgmarknetRawRecord[] = data.records;

    const normalizedPrices: IMandiPrice[] = records.map((rec, idx) => {
      const minP = Number(rec.min_price) || 0;
      const maxP = Number(rec.max_price) || 0;
      const modalP = Number(rec.modal_price) || minP || maxP;
      const freshness = calculateDataFreshness(rec.arrival_date);

      return {
        id: `mandi-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        state: rec.state || state || "India",
        district: rec.district || district || "Regional Market",
        market: rec.market || market || "APMC Mandi",
        commodity: rec.commodity || commodity || "Agricultural Crop",
        variety: rec.variety || "Standard",
        arrivalDate: rec.arrival_date || new Date().toLocaleDateString("en-IN"),
        minPrice: minP,
        maxPrice: maxP,
        modalPrice: modalP,
        unit: "Rs. / Quintal",
        dataFreshness: freshness,
        source: "Agmarknet (data.gov.in)",
        updatedAt: new Date().toISOString(),
      };
    });

    const responsePayload: IMandiPriceResponse = {
      success: true,
      state: state || undefined,
      district: district || undefined,
      commodity: commodity || undefined,
      market: market || undefined,
      totalRecords: normalizedPrices.length,
      dataFreshness: normalizedPrices.length > 0 ? normalizedPrices[0].dataFreshness : "Agmarknet Historical Data",
      source: "Agmarknet (data.gov.in)",
      prices: normalizedPrices,
    };

    // Cache successful response
    mandiMemoryCache.set(cacheKey, {
      data: responsePayload,
      expiresAt: now + CACHE_TTL_MS,
    });

    return responsePayload;
  } catch (err) {
    console.error("Error fetching Agmarknet mandi prices:", err);
    return {
      success: false,
      totalRecords: 0,
      prices: [],
      error: "Unable to connect to official Agmarknet Mandi API. Please try again later.",
    };
  }
}
