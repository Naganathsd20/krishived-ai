import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import HarvestLog from "@/models/HarvestLog";
import FarmDiary from "@/models/FarmDiary";
import DiseaseAnalysis from "@/models/DiseaseAnalysis";
import SoilRecommendation from "@/models/SoilRecommendation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  TimeRangeOption,
  IAdvancedAnalyticsResponse,
  IKPISummary,
  IYieldAnalytics,
  IYieldCropEfficiency,
  ICropProductivityComparison,
  IExpenseAnalytics,
  IActivityCostByType,
  ICropCost,
  ICostTrendPoint,
  IActivityTrends,
  IActivityTrendPoint,
  IDiseaseAnalytics,
  IDiseaseSeverityDist,
  IDiseaseFrequency,
  IDiseaseTrendPoint,
  ISoilWeatherAnalytics,
  ISoilHealthTrendPoint,
  IDataQualityMetadata,
} from "@/types/advanced-analytics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Conversion factors to standard Acre
function normalizeAreaToAcres(area: number, unit: string): number {
  if (!area || area <= 0) return 0;
  const u = (unit || "").trim().toLowerCase();
  switch (u) {
    case "hectare":
    case "hectares":
      return area * 2.47105;
    case "guntha":
    case "gunthas":
      return area * 0.025;
    case "bigha":
    case "bighas":
      return area * 0.625;
    case "acre":
    case "acres":
    default:
      return area;
  }
}

// Conversion factors to standard Quintal
function normalizeYieldToQuintals(yieldVal: number, unit: string): number {
  if (!yieldVal || yieldVal <= 0) return 0;
  const u = (unit || "").trim().toLowerCase();
  switch (u) {
    case "kg":
    case "kgs":
    case "kilogram":
    case "kilograms":
      return yieldVal * 0.01;
    case "tonne":
    case "tonnes":
    case "ton":
    case "tons":
      return yieldVal * 10;
    case "quintal":
    case "quintals":
    default:
      return yieldVal;
  }
}

function sanitizeErrorMessage(rawError: unknown): string {
  if (typeof rawError === "string") {
    if (rawError.includes("Mongo") || rawError.includes("ECONNREFUSED") || rawError.includes("connect")) {
      return "Unable to retrieve analytics at this time. Please try again.";
    }
    return rawError;
  }
  if (rawError instanceof Error) {
    const msg = rawError.message;
    if (msg.includes("Mongo") || msg.includes("ECONNREFUSED") || msg.includes("connect")) {
      return "Unable to retrieve analytics at this time. Please try again.";
    }
    return msg;
  }
  return "Failed to load farm analytics.";
}

export async function GET(request: Request) {
  try {
    // 1. Clerk Authentication Check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in to view analytics." },
        { status: 401 }
      );
    }

    // 2. Rate Limiting Check
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`advanced-analytics:${userId}:${clientIp}`, 30, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    // 3. Query Parameter Extraction & Validation
    const { searchParams } = new URL(request.url);
    const rangeParam = (searchParams.get("range") || "30d").toLowerCase() as TimeRangeOption;
    const cropParam = searchParams.get("crop")?.trim() || "All";
    const customStart = searchParams.get("startDate");
    const customEnd = searchParams.get("endDate");

    const validRanges: TimeRangeOption[] = ["7d", "30d", "3m", "6m", "1y", "all"];
    const range: TimeRangeOption = validRanges.includes(rangeParam) ? rangeParam : "30d";

    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    if (customStart && customEnd) {
      const parsedStart = new Date(customStart);
      const parsedEnd = new Date(customEnd);
      if (isNaN(parsedStart.getTime()) || isNaN(parsedEnd.getTime())) {
        return NextResponse.json(
          { success: false, error: "Invalid custom date format provided." },
          { status: 400 }
        );
      }
      if (parsedStart > parsedEnd) {
        return NextResponse.json(
          { success: false, error: "Start date cannot be after end date." },
          { status: 400 }
        );
      }
      startDate = parsedStart;
      endDate = parsedEnd;
    } else {
      switch (range) {
        case "7d":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "3m":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case "6m":
          startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
          break;
        case "1y":
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        case "all":
        default:
          startDate = new Date(0);
          break;
      }
    }

    // 4. Connect DB
    await connectDB();

    // 5. Build Base Scoped Query Filters
    const isCropFiltered = cropParam !== "All" && cropParam.length > 0;
    const cropRegex = isCropFiltered ? new RegExp(`^${cropParam}$`, "i") : null;

    const harvestQuery: any = { clerkId: userId, harvestDate: { $gte: startDate, $lte: endDate } };
    const diaryQuery: any = { clerkId: userId, activityDate: { $gte: startDate, $lte: endDate } };
    const diseaseQuery: any = { clerkId: userId, createdAt: { $gte: startDate, $lte: endDate } };
    const soilQuery: any = { clerkId: userId, createdAt: { $gte: startDate, $lte: endDate } };

    if (cropRegex) {
      harvestQuery.crop = cropRegex;
      diaryQuery.crop = cropRegex;
    }

    // 6. Execute Parallel Database Queries
    const [harvestLogs, diaryEntries, diseaseAnalyses, soilRecommendations] = await Promise.all([
      HarvestLog.find(harvestQuery).sort({ harvestDate: -1 }).lean(),
      FarmDiary.find(diaryQuery).sort({ activityDate: -1 }).lean(),
      DiseaseAnalysis.find(diseaseQuery).sort({ createdAt: -1 }).lean(),
      SoilRecommendation.find(soilQuery).sort({ createdAt: -1 }).lean(),
    ]);

    // ------------------------------------------------------------------------
    // A. HARVEST & YIELD INTELLIGENCE ANALYTICS
    // ------------------------------------------------------------------------
    let totalHarvests = harvestLogs.length;
    let totalProductionQuintals = 0;
    let totalAreaAcres = 0;

    const cropSeasonMap: Record<string, { crop: string; season: string; totalYield: number; totalArea: number; count: number }> = {};
    const cropCompMap: Record<string, { crop: string; totalYield: number; totalArea: number; count: number }> = {};

    harvestLogs.forEach((log: any) => {
      const normYield = normalizeYieldToQuintals(log.totalYield || 0, log.yieldUnit || "Quintal");
      const normArea = normalizeAreaToAcres(log.cultivatedArea || 0, log.areaUnit || "Acre");

      totalProductionQuintals += normYield;
      totalAreaAcres += normArea;

      // Crop & Season grouping
      const cropName = log.crop || "Unknown Crop";
      const seasonName = log.season || "Kharif";
      const key = `${cropName}___${seasonName}`;

      if (!cropSeasonMap[key]) {
        cropSeasonMap[key] = { crop: cropName, season: seasonName, totalYield: 0, totalArea: 0, count: 0 };
      }
      cropSeasonMap[key].totalYield += normYield;
      cropSeasonMap[key].totalArea += normArea;
      cropSeasonMap[key].count += 1;

      // Crop Comparison grouping
      if (!cropCompMap[cropName]) {
        cropCompMap[cropName] = { crop: cropName, totalYield: 0, totalArea: 0, count: 0 };
      }
      cropCompMap[cropName].totalYield += normYield;
      cropCompMap[cropName].totalArea += normArea;
      cropCompMap[cropName].count += 1;
    });

    totalProductionQuintals = Math.round(totalProductionQuintals * 100) / 100;
    totalAreaAcres = Math.round(totalAreaAcres * 100) / 100;
    const avgYieldPerAcre = totalAreaAcres > 0 ? Math.round((totalProductionQuintals / totalAreaAcres) * 100) / 100 : 0;

    const byCropAndSeason: IYieldCropEfficiency[] = Object.values(cropSeasonMap).map((item) => ({
      crop: item.crop,
      season: item.season,
      totalYieldQuintals: Math.round(item.totalYield * 100) / 100,
      totalAreaAcres: Math.round(item.totalArea * 100) / 100,
      yieldPerAcre: item.totalArea > 0 ? Math.round((item.totalYield / item.totalArea) * 100) / 100 : 0,
      harvestCount: item.count,
    }));

    const cropComparison: ICropProductivityComparison[] = Object.values(cropCompMap).map((item) => ({
      crop: item.crop,
      totalYieldQuintals: Math.round(item.totalYield * 100) / 100,
      totalAreaAcres: Math.round(item.totalArea * 100) / 100,
      avgYieldPerAcre: item.totalArea > 0 ? Math.round((item.totalYield / item.totalArea) * 100) / 100 : 0,
      harvestCount: item.count,
    }));

    const yieldAnalytics: IYieldAnalytics = {
      hasData: totalHarvests > 0,
      totalHarvests,
      totalProductionQuintals,
      totalAreaAcres,
      avgYieldPerAcre,
      byCropAndSeason,
      cropComparison,
    };

    // ------------------------------------------------------------------------
    // B. FARM DIARY COST & EXPENSE ANALYTICS
    // ------------------------------------------------------------------------
    let totalExpenses = 0;
    const activityCount = diaryEntries.length;
    const activityCostMap: Record<string, { totalCost: number; count: number }> = {};
    const cropCostMap: Record<string, { totalCost: number; count: number }> = {};

    diaryEntries.forEach((entry: any) => {
      const costVal = typeof entry.cost === "number" && entry.cost > 0 ? entry.cost : 0;
      totalExpenses += costVal;

      const actType = entry.activityType || "Other";
      if (!activityCostMap[actType]) {
        activityCostMap[actType] = { totalCost: 0, count: 0 };
      }
      activityCostMap[actType].totalCost += costVal;
      activityCostMap[actType].count += 1;

      const cropName = entry.crop || "General Field";
      if (!cropCostMap[cropName]) {
        cropCostMap[cropName] = { totalCost: 0, count: 0 };
      }
      cropCostMap[cropName].totalCost += costVal;
      cropCostMap[cropName].count += 1;
    });

    totalExpenses = Math.round(totalExpenses * 100) / 100;

    const byActivity: IActivityCostByType[] = Object.entries(activityCostMap).map(([type, val]) => ({
      activityType: type,
      totalCost: Math.round(val.totalCost * 100) / 100,
      count: val.count,
      percentage: totalExpenses > 0 ? Math.round((val.totalCost / totalExpenses) * 100) : 0,
    }));

    const byCrop: ICropCost[] = Object.entries(cropCostMap).map(([crop, val]) => ({
      crop,
      totalCost: Math.round(val.totalCost * 100) / 100,
      count: val.count,
    }));

    // Cost trend temporal buckets
    const costBucketMap: Record<string, { cost: number; count: number; dateISO: string }> = {};
    diaryEntries.forEach((entry: any) => {
      const d = new Date(entry.activityDate);
      if (isNaN(d.getTime())) return;

      const label =
        range === "7d" || range === "30d"
          ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : d.toLocaleDateString("en-US", { year: "numeric", month: "short" });

      if (!costBucketMap[label]) {
        costBucketMap[label] = { cost: 0, count: 0, dateISO: d.toISOString() };
      }
      costBucketMap[label].cost += entry.cost || 0;
      costBucketMap[label].count += 1;
    });

    const costTrends: ICostTrendPoint[] = Object.entries(costBucketMap).map(([label, val]) => ({
      periodLabel: label,
      dateISO: val.dateISO,
      cost: Math.round(val.cost * 100) / 100,
      count: val.count,
    })).reverse();

    const expenseAnalytics: IExpenseAnalytics = {
      hasData: activityCount > 0,
      totalExpenses,
      activityCount,
      byActivity,
      byCrop,
      costTrends,
    };

    // ------------------------------------------------------------------------
    // C. ACTIVITY TRENDS & FREQUENCY ANALYTICS
    // ------------------------------------------------------------------------
    const activityBucketMap: Record<string, { count: number; cost: number; dateISO: string }> = {};
    const activityTypeCountMap: Record<string, number> = {};

    diaryEntries.forEach((entry: any) => {
      const d = new Date(entry.activityDate);
      if (isNaN(d.getTime())) return;

      const label =
        range === "7d" || range === "30d"
          ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : d.toLocaleDateString("en-US", { year: "numeric", month: "short" });

      if (!activityBucketMap[label]) {
        activityBucketMap[label] = { count: 0, cost: 0, dateISO: d.toISOString() };
      }
      activityBucketMap[label].count += 1;
      activityBucketMap[label].cost += entry.cost || 0;

      const actType = entry.activityType || "Other";
      activityTypeCountMap[actType] = (activityTypeCountMap[actType] || 0) + 1;
    });

    const trendPoints: IActivityTrendPoint[] = Object.entries(activityBucketMap).map(([label, val]) => ({
      periodLabel: label,
      dateISO: val.dateISO,
      activityCount: val.count,
      totalCost: Math.round(val.cost * 100) / 100,
    })).reverse();

    const byType = Object.entries(activityTypeCountMap).map(([type, count]) => ({
      activityType: type,
      count,
    }));

    const activityTrends: IActivityTrends = {
      hasData: activityCount > 0,
      hasEnoughTrendData: trendPoints.length >= 2,
      trend: trendPoints,
      byType,
    };

    // ------------------------------------------------------------------------
    // D. PATHOGEN & DISEASE ANALYTICS
    // ------------------------------------------------------------------------
    const totalScans = diseaseAnalyses.length;
    let healthyCount = 0;
    const severityDistribution: IDiseaseSeverityDist = { Low: 0, Medium: 0, High: 0 };
    const diseaseFreqMap: Record<string, { count: number; severity: "Low" | "Medium" | "High" | "Healthy" }> = {};
    const diseaseTrendMap: Record<string, { count: number; highRisk: number; dateISO: string }> = {};

    diseaseAnalyses.forEach((item: any) => {
      const dName = item.disease || "Unknown Disease";
      const sev = (item.severity || "Medium") as "Low" | "Medium" | "High";
      const isHealthy =
        dName.toLowerCase().includes("healthy") ||
        dName.toLowerCase().includes("normal") ||
        (sev === "Low" && !dName.toLowerCase().includes("blight") && !dName.toLowerCase().includes("spot"));

      if (isHealthy) {
        healthyCount++;
      } else {
        severityDistribution[sev] = (severityDistribution[sev] || 0) + 1;
      }

      if (!diseaseFreqMap[dName]) {
        diseaseFreqMap[dName] = { count: 0, severity: isHealthy ? "Healthy" : sev };
      }
      diseaseFreqMap[dName].count += 1;

      // Trend bucket
      const d = new Date(item.createdAt);
      if (!isNaN(d.getTime())) {
        const label =
          range === "7d" || range === "30d"
            ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
            : d.toLocaleDateString("en-US", { year: "numeric", month: "short" });

        if (!diseaseTrendMap[label]) {
          diseaseTrendMap[label] = { count: 0, highRisk: 0, dateISO: d.toISOString() };
        }
        diseaseTrendMap[label].count += 1;
        if (sev === "High" && !isHealthy) {
          diseaseTrendMap[label].highRisk += 1;
        }
      }
    });

    const diseaseDetectedCount = totalScans - healthyCount;
    const healthyPercentage = totalScans > 0 ? Math.round((healthyCount / totalScans) * 100) : 0;

    const topDiseases: IDiseaseFrequency[] = Object.entries(diseaseFreqMap).map(([disease, val]) => ({
      disease,
      count: val.count,
      percentage: totalScans > 0 ? Math.round((val.count / totalScans) * 100) : 0,
      severity: val.severity,
    })).sort((a, b) => b.count - a.count);

    const incidentsTrend: IDiseaseTrendPoint[] = Object.entries(diseaseTrendMap).map(([label, val]) => ({
      periodLabel: label,
      dateISO: val.dateISO,
      scanCount: val.count,
      highRiskCount: val.highRisk,
    })).reverse();

    const diseaseAnalytics: IDiseaseAnalytics = {
      hasData: totalScans > 0,
      hasEnoughTrendData: incidentsTrend.length >= 2,
      totalScans,
      diseaseDetectedCount,
      healthyCount,
      healthyPercentage,
      severityDistribution,
      topDiseases,
      incidentsTrend,
    };

    // ------------------------------------------------------------------------
    // E. SOIL & MICRO-CLIMATE ANALYTICS
    // ------------------------------------------------------------------------
    const totalSoilRecords = soilRecommendations.length;
    let scoreSum = 0;
    let scoreCount = 0;
    let tempSum = 0;
    let humSum = 0;
    let rainSum = 0;

    const weatherCondMap: Record<string, number> = {};
    const recommendedCropMap: Record<string, number> = {};
    const soilProgression: ISoilHealthTrendPoint[] = [];

    soilRecommendations.forEach((r: any) => {
      if (r.soilHealthScore) {
        const match = String(r.soilHealthScore).match(/(\d+)\s*\/\s*100/);
        if (match && match[1]) {
          const val = parseInt(match[1], 10);
          scoreSum += val;
          scoreCount++;

          const d = new Date(r.createdAt);
          soilProgression.push({
            dateISO: isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString(),
            score: val,
            city: r.city || "Local Field",
          });
        }
      }

      if (typeof r.temperature === "number") tempSum += r.temperature;
      if (typeof r.humidity === "number") humSum += r.humidity;
      if (typeof r.rainProbability === "number") rainSum += r.rainProbability;

      const cond = r.weatherCondition || "Clear";
      weatherCondMap[cond] = (weatherCondMap[cond] || 0) + 1;

      const best = r.bestCrop;
      if (best) {
        recommendedCropMap[best] = (recommendedCropMap[best] || 0) + 1;
      }
    });

    const avgSoilHealthScore = scoreCount > 0 ? Math.round(scoreSum / scoreCount) : null;
    let soilHealthStatus = "Insufficient Data";
    if (avgSoilHealthScore !== null) {
      if (avgSoilHealthScore >= 80) soilHealthStatus = "Optimal Fertility";
      else if (avgSoilHealthScore >= 60) soilHealthStatus = "Moderate Fertility";
      else soilHealthStatus = "Needs Nutrient Management";
    }

    const avgTemperature = totalSoilRecords > 0 ? Math.round((tempSum / totalSoilRecords) * 10) / 10 : null;
    const avgHumidity = totalSoilRecords > 0 ? Math.round(humSum / totalSoilRecords) : null;
    const avgRainProbability = totalSoilRecords > 0 ? Math.round(rainSum / totalSoilRecords) : null;

    const weatherConditions = Object.entries(weatherCondMap).map(([condition, count]) => ({ condition, count }));
    const recommendedCrops = Object.entries(recommendedCropMap).map(([crop, count]) => ({ crop, count }));

    const soilWeatherAnalytics: ISoilWeatherAnalytics = {
      hasData: totalSoilRecords > 0,
      hasEnoughTrendData: soilProgression.length >= 2,
      avgSoilHealthScore,
      soilHealthStatus,
      avgTemperature,
      avgHumidity,
      avgRainProbability,
      weatherConditions,
      recommendedCrops,
      soilProgression: soilProgression.reverse(),
    };

    // ------------------------------------------------------------------------
    // F. KPI SUMMARY
    // ------------------------------------------------------------------------
    const kpiSummary: IKPISummary = {
      totalExpenses,
      totalActivities: activityCount,
      totalHarvests,
      totalProductionQuintals,
      avgYieldPerAcre,
      avgSoilScore: avgSoilHealthScore,
      diseaseScanCount: totalScans,
    };

    // ------------------------------------------------------------------------
    // G. DATA QUALITY METADATA
    // ------------------------------------------------------------------------
    const totalUserRecords = totalHarvests + activityCount + totalScans + totalSoilRecords;
    const hasEnoughTrendData =
      trendPoints.length >= 2 || incidentsTrend.length >= 2 || soilProgression.length >= 2;

    let status: "OPTIMAL_DATA" | "INSUFFICIENT_DATA" | "NO_DATA" = "OPTIMAL_DATA";
    const notes: string[] = [];

    if (totalUserRecords === 0) {
      status = "NO_DATA";
      notes.push("No historical farm records exist yet for this account.");
    } else if (!hasEnoughTrendData) {
      status = "INSUFFICIENT_DATA";
      notes.push("Fewer than 2 historical date points exist in the selected time range.");
    }

    if (totalHarvests === 0) notes.push("No harvest logs recorded yet.");
    if (activityCount === 0) notes.push("No farm diary tasks recorded yet.");
    if (totalScans === 0) notes.push("No leaf disease diagnostics recorded yet.");
    if (totalSoilRecords === 0) notes.push("No soil recommendation advisories saved yet.");

    const dataQuality: IDataQualityMetadata = {
      hasHarvestData: totalHarvests > 0,
      hasDiaryData: activityCount > 0,
      hasDiseaseData: totalScans > 0,
      hasSoilData: totalSoilRecords > 0,
      hasEnoughTrendData,
      status,
      notes,
    };

    // ------------------------------------------------------------------------
    // RESPONSE PAYLOAD
    // ------------------------------------------------------------------------
    const responsePayload: IAdvancedAnalyticsResponse = {
      success: true,
      timeRange: range,
      selectedCrop: cropParam,
      period: {
        startISO: startDate.toISOString(),
        endISO: endDate.toISOString(),
      },
      kpiSummary,
      yieldAnalytics,
      expenseAnalytics,
      activityTrends,
      diseaseAnalytics,
      soilWeatherAnalytics,
      dataQuality,
    };

    return NextResponse.json(responsePayload, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
      },
    });
  } catch (error) {
    console.error("Error in GET /api/advanced-analytics:", error);
    const sanitizedMsg = sanitizeErrorMessage(error);
    return NextResponse.json(
      { success: false, error: sanitizedMsg },
      { status: 500 }
    );
  }
}
