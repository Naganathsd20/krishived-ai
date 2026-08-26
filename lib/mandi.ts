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
function calculateDataFreshness(
  arrivalDateStr?: string
): "Live Agmarknet Data" | "Recent Data (1-3 Days Ago)" | "Agmarknet Historical Data" {
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

  if (!apiKey || apiKey === "demo_key" || apiKey.includes("YOUR_REAL_DATAGOV_API_KEY")) {
    return {
      success: false,
      totalRecords: 0,
      prices: [],
      error: "Mandi prices service is currently unconfigured. DATAGOV_API_KEY environment variable is required in .env.local file.",
    };
  }

  try {
    // Official Data.gov.in Resource ID for "Current Daily Price of Various Commodities from Various Markets (Mandi)"
    const DATA_GOV_RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";
    const resourceUrl = new URL(
      `https://api.data.gov.in/resource/${DATA_GOV_RESOURCE_ID}`
    );

    resourceUrl.searchParams.append("api-key", apiKey);
    resourceUrl.searchParams.append("format", "json");
    resourceUrl.searchParams.append("limit", "500");

    if (state && state.toLowerCase() !== "all states") {
      resourceUrl.searchParams.append("filters[state]", state);
    }
    if (district) {
      resourceUrl.searchParams.append("filters[district]", district);
    }
    if (commodity) {
      resourceUrl.searchParams.append("filters[commodity]", commodity);
    }
    if (market) {
      resourceUrl.searchParams.append("filters[market]", market);
    }

    console.log("[Mandi API] Requesting Data.gov.in with filters:", {
      state: state || "(All)",
      district: district || "(All)",
      commodity: commodity || "(All)",
      market: market || "(All)",
    });

    const res = await fetch(resourceUrl.toString(), {
      next: { revalidate: 1800 },
      headers: { Accept: "application/json" },
    });

    console.log("[Mandi API] Upstream response status:", res.status);

    if (res.status === 401 || res.status === 403) {
      return {
        success: false,
        totalRecords: 0,
        prices: [],
        error: "Invalid DATAGOV_API_KEY or key not authorized on Data.gov.in. Please check your API key in .env.local.",
      };
    }

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
      console.error("[Mandi API] Invalid payload structure returned:", data?.status, data?.message);
      return {
        success: false,
        totalRecords: 0,
        prices: [],
        error: "Invalid JSON response structure from official Agmarknet API.",
      };
    }

    let records: IAgmarknetRawRecord[] = data.records;
    console.log(`[Mandi API] Upstream returned ${records.length} records for initial query.`);

    // If direct API filters returned 0 records but we have broader search terms (e.g. commodity substring),
    // perform a secondary fallback query with state/district to check for substring commodity matches.
    if (records.length === 0 && commodity && (state || district)) {
      console.log("[Mandi API] Direct filters returned 0 records. Trying fallback broader query...");
      const fallbackUrl = new URL(`https://api.data.gov.in/resource/${DATA_GOV_RESOURCE_ID}`);
      fallbackUrl.searchParams.append("api-key", apiKey);
      fallbackUrl.searchParams.append("format", "json");
      fallbackUrl.searchParams.append("limit", "500");
      if (state && state.toLowerCase() !== "all states") {
        fallbackUrl.searchParams.append("filters[state]", state);
      }
      if (district) {
        fallbackUrl.searchParams.append("filters[district]", district);
      }

      const fallbackRes = await fetch(fallbackUrl.toString(), {
        next: { revalidate: 1800 },
        headers: { Accept: "application/json" },
      });

      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json().catch(() => null);
        if (fallbackData && Array.isArray(fallbackData.records)) {
          const commLower = commodity.toLowerCase();
          const mktLower = market.toLowerCase();
          records = fallbackData.records.filter((r: IAgmarknetRawRecord) => {
            const matchComm = !commLower || (r.commodity && r.commodity.toLowerCase().includes(commLower));
            const matchMkt = !mktLower || (r.market && r.market.toLowerCase().includes(mktLower));
            return matchComm && matchMkt;
          });
          console.log(`[Mandi API] Fallback broader query returned ${records.length} matching records.`);
        }
      }
    }

    const normalizedPrices: IMandiPrice[] = records.map((rec, idx) => {
      const minP = Math.max(0, Number(rec.min_price) || 0);
      const maxP = Math.max(0, Number(rec.max_price) || 0);
      const modalP = Math.max(0, Number(rec.modal_price) || minP || maxP);
      const freshness = calculateDataFreshness(rec.arrival_date);

      return {
        id: `mandi-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        state: rec.state || state || "India",
        district: rec.district || district || "Regional Market",
        market: rec.market || market || "APMC Mandi",
        commodity: rec.commodity || commodity || "Agricultural Crop",
        variety: rec.variety || rec.grade || "Standard",
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
