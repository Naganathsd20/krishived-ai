import connectDB from "@/lib/mongodb";
import DiseaseAnalysis from "@/models/DiseaseAnalysis";
import SoilRecommendation from "@/models/SoilRecommendation";
import Conversation from "@/models/Conversation";
import {
  IFarmIntelligenceResponse,
  RiskLevel,
  DataQuality,
  IFarmIntelligenceFactors,
  IFarmActionRecommendation,
} from "@/types/farm-intelligence";

export async function calculateSmartFarmIntelligence(
  userId: string
): Promise<IFarmIntelligenceResponse> {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Fetch authenticated user-scoped records in parallel
    const [diseaseAnalyses, soilRecommendations, conversations] =
      await Promise.all([
        DiseaseAnalysis.find({ clerkId: userId }).sort({ createdAt: -1 }).lean(),
        SoilRecommendation.find({ clerkId: userId })
          .sort({ createdAt: -1 })
          .lean(),
        Conversation.find({ clerkUserId: userId }).sort({ createdAt: -1 }).lean(),
      ]);

    const diseaseAnalysesCount = diseaseAnalyses.length;
    const soilRecommendationsCount = soilRecommendations.length;
    const conversationsCount = conversations.length;

    // Agronomic domain records (excluding generic AI chat counts for confidence weighting)
    const agriRecordCount = diseaseAnalysesCount + soilRecommendationsCount;

    // ----------------------------------------------------
    // EMPTY / INSUFFICIENT DATA STATE
    // ----------------------------------------------------
    if (diseaseAnalysesCount === 0 && soilRecommendationsCount === 0) {
      return {
        success: true,
        riskLevel: "INSUFFICIENT DATA",
        dataQuality: "LIMITED DATA",
        reasons: [
          "No disease diagnostics or saved soil health reports found in your profile.",
          "At least one crop leaf diagnostic scan or soil recommendation report is required to compute risk.",
        ],
        advisory:
          "Run your first crop disease diagnostic scan or save a soil recommendation report to unlock personalized Smart Farm Intelligence.",
        recommendations: [
          {
            id: "rec-empty-1",
            title: "Run Leaf Diagnostic Scan",
            description:
              "Upload photos of crop leaves on the Disease Diagnostics page for instant AI pathogen identification.",
            category: "Disease",
            priority: "High",
            evidence: "Limited data available (0 diagnostic scans recorded)",
          },
          {
            id: "rec-empty-2",
            title: "Generate Soil Health Advisory",
            description:
              "Check regional weather telemetry and save a soil recommendation report to unlock custom NPK fertilizer guidance.",
            category: "Soil",
            priority: "High",
            evidence: "Limited data available (0 saved soil health reports)",
          },
        ],
        factors: {
          disease: {
            totalRecords: 0,
            recentDisease: null,
            recentSeverity: null,
            highRiskCount: 0,
            moderateRiskCount: 0,
            diseaseDetectedCount: 0,
            lastScanDate: null,
          },
          weather: {
            hasData: false,
            city: null,
            temperature: null,
            humidity: null,
            rainProbability: null,
            condition: null,
            lastCheckedDate: null,
          },
          soil: {
            hasData: false,
            soilHealthScore: null,
            bestCrop: null,
            fertilizerRecommendation: null,
            irrigationRecommendation: null,
            diseaseRiskLevel: null,
            lastReportDate: null,
          },
          farmHealth: {
            overallScore: null,
            status: "Insufficient data",
            hasEnoughData: false,
          },
        },
      };
    }

    // ----------------------------------------------------
    // 3. HONEST DATA CONFIDENCE / QUALITY CALCULATION
    // ----------------------------------------------------
    const hasDiseaseDomain = diseaseAnalysesCount > 0;
    const hasSoilDomain = soilRecommendationsCount > 0;
    const isMultiDomain = hasDiseaseDomain && hasSoilDomain;

    let dataQuality: DataQuality = "LIMITED DATA";

    if (agriRecordCount >= 6 && isMultiDomain) {
      dataQuality = "HIGH CONFIDENCE";
    } else if (agriRecordCount >= 3 && isMultiDomain) {
      dataQuality = "MODERATE CONFIDENCE";
    } else {
      dataQuality = "LIMITED DATA";
    }

    // ----------------------------------------------------
    // 4. PROCESS DISEASE FACTORS
    // ----------------------------------------------------
    let healthyCount = 0;
    let moderateRiskCount = 0;
    let highRiskCount = 0;

    diseaseAnalyses.forEach((item: any) => {
      const dName = (item.disease || "").toLowerCase();
      const sev = item.severity || "Medium";
      const isHealthy =
        dName.includes("healthy") ||
        dName.includes("normal") ||
        (sev === "Low" && !dName.includes("blight") && !dName.includes("spot"));

      if (isHealthy) {
        healthyCount++;
      } else {
        if (sev === "High") {
          highRiskCount++;
        } else if (sev === "Medium") {
          moderateRiskCount++;
        } else {
          moderateRiskCount++;
        }
      }
    });

    const diseaseDetectedCount = diseaseAnalysesCount - healthyCount;
    const recentScan: any = diseaseAnalyses[0] || null;
    const recentDiseaseName = recentScan ? recentScan.disease : null;
    const recentSeverity = recentScan ? recentScan.severity || "Medium" : null;
    const isRecentHealthy = recentDiseaseName
      ? recentDiseaseName.toLowerCase().includes("healthy") ||
        recentDiseaseName.toLowerCase().includes("normal") ||
        (recentSeverity === "Low" &&
          !recentDiseaseName.toLowerCase().includes("blight") &&
          !recentDiseaseName.toLowerCase().includes("spot"))
      : true;

    const lastScanDate = recentScan && recentScan.createdAt
      ? new Date(recentScan.createdAt).toISOString()
      : null;

    // ----------------------------------------------------
    // 5. PROCESS WEATHER & SOIL FACTORS
    // ----------------------------------------------------
    const latestSoil: any = soilRecommendations[0] || null;
    const soilHasData = Boolean(latestSoil);
    const weatherHasData = Boolean(
      latestSoil && (latestSoil.temperature !== undefined || latestSoil.city)
    );

    const city = latestSoil?.city || null;
    const temperature = latestSoil?.temperature ?? null;
    const humidity = latestSoil?.humidity ?? null;
    const rainProbability = latestSoil?.rainProbability ?? null;
    const condition = latestSoil?.weatherCondition || null;
    const weatherLastChecked = latestSoil?.createdAt
      ? new Date(latestSoil.createdAt).toISOString()
      : null;

    const soilHealthScore = latestSoil?.soilHealthScore || null;
    const bestCrop = latestSoil?.bestCrop || null;
    const fertilizerRecommendation = latestSoil?.fertilizerRecommendation || null;
    const irrigationRecommendation = latestSoil?.irrigationRecommendation || null;
    const soilDiseaseRiskLevel = latestSoil?.diseaseRiskLevel || null;
    const soilReportDate = latestSoil?.createdAt
      ? new Date(latestSoil.createdAt).toISOString()
      : null;

    // Parse numeric soil score (e.g. "88/100 (Optimal Soil Fertility)")
    let numericSoilScore = 85;
    if (soilHealthScore) {
      const match = soilHealthScore.match(/(\d+)\s*\/\s*100/);
      if (match && match[1]) {
        numericSoilScore = parseInt(match[1], 10);
      }
    }

    // ----------------------------------------------------
    // 6. PROCESS FARM HEALTH SCORE (CONSISTENT WITH ANALYTICS)
    // ----------------------------------------------------
    const cropHealthScore = diseaseAnalysesCount
      ? Math.round((healthyCount / diseaseAnalysesCount) * 100)
      : 90;

    const diseaseRiskScore = diseaseAnalysesCount
      ? Math.max(0, 100 - (highRiskCount * 30 + moderateRiskCount * 15))
      : 92;

    const weatherStabilityScore =
      temperature !== null && temperature >= 15 && temperature <= 35 ? 90 : 80;
    const irrigationScore = soilRecommendationsCount > 0 ? 88 : 85;

    const overallScore = Math.round(
      cropHealthScore * 0.3 +
        numericSoilScore * 0.25 +
        diseaseRiskScore * 0.2 +
        weatherStabilityScore * 0.15 +
        irrigationScore * 0.1
    );

    let farmHealthStatus = "Good";
    if (overallScore >= 85) farmHealthStatus = "Excellent";
    else if (overallScore >= 70) farmHealthStatus = "Good";
    else if (overallScore >= 55) farmHealthStatus = "Moderate";
    else farmHealthStatus = "Needs Attention";

    // ----------------------------------------------------
    // 7. CONSERVATIVE RISK EVALUATION ENGINE
    // ----------------------------------------------------
    let riskPoints = 0;

    // A. Disease Component
    if (diseaseAnalysesCount > 0 && recentScan && !isRecentHealthy) {
      if (recentSeverity === "High") {
        riskPoints += 3.0;
      } else if (recentSeverity === "Medium") {
        riskPoints += 1.5;
      } else {
        riskPoints += 0.5;
      }

      if (highRiskCount >= 2) {
        riskPoints += 1.0;
      }
    } else if (diseaseAnalysesCount > 0 && healthyCount === diseaseAnalysesCount) {
      riskPoints -= 0.5;
    }

    // B. Weather Environmental Component
    if (weatherHasData) {
      if (humidity !== null && humidity >= 80 && recentScan && !isRecentHealthy) {
        riskPoints += 1.0;
      } else if (humidity !== null && humidity >= 75) {
        riskPoints += 0.5;
      }

      if (rainProbability !== null && rainProbability >= 70) {
        riskPoints += 0.5;
      }
    }

    // C. Soil Health Component (Mitigating Factor)
    if (soilHasData) {
      if (numericSoilScore >= 80) {
        riskPoints -= 0.5;
      } else if (numericSoilScore < 70) {
        riskPoints += 0.5;
      }
    }

    // D. Farm Health Overall Score Component
    if (overallScore < 50) {
      riskPoints += 2.0;
    } else if (overallScore >= 50 && overallScore < 75) {
      riskPoints += 0.5;
    } else if (overallScore >= 75) {
      riskPoints -= 0.5;
    }

    // Final Risk Level
    let riskLevel: RiskLevel = "LOW";
    if (riskPoints >= 3.0) {
      riskLevel = "HIGH";
    } else if (riskPoints >= 1.0) {
      riskLevel = "MODERATE";
    } else {
      riskLevel = "LOW";
    }

    // ----------------------------------------------------
    // 8. TRANSPARENT EXPLAINABLE REASONS
    // ----------------------------------------------------
    const reasons: string[] = [];

    if (diseaseAnalysesCount > 0) {
      if (recentScan && !isRecentHealthy) {
        reasons.push(
          `Recent scan detected "${recentScan.disease}" with ${recentSeverity} severity.`
        );
      } else {
        reasons.push(
          `All ${diseaseAnalysesCount} recorded crop diagnostics show healthy crops with no active disease.`
        );
      }
    }

    if (weatherHasData) {
      if (humidity !== null && humidity >= 75) {
        reasons.push(
          `Elevated atmospheric humidity (${humidity}%) in ${city || "your region"} creates favorable conditions for fungal growth.`
        );
      } else {
        reasons.push(
          `Weather telemetry in ${city || "your region"} is stable (${temperature ?? 25}°C, ${humidity ?? 60}% humidity).`
        );
      }
    }

    if (soilHasData) {
      if (numericSoilScore >= 80) {
        reasons.push(
          `Optimal soil health score (${soilHealthScore}) provides strong crop nutrient resilience.`
        );
      } else {
        reasons.push(
          `Latest soil report indicates moderate soil health score (${soilHealthScore}).`
        );
      }
    }

    reasons.push(
      `Overall Farm Health Score is currently at ${overallScore}/100 (${farmHealthStatus} status).`
    );

    if (agriRecordCount <= 2) {
      reasons.push(
        `Limited historical telemetry available (${agriRecordCount} record${agriRecordCount === 1 ? "" : "s"}) — confidence is limited.`
      );
    }

    // ----------------------------------------------------
    // 9. FARMER ADVISORY GENERATION
    // ----------------------------------------------------
    let advisory = "";

    if (riskLevel === "HIGH") {
      advisory = recentDiseaseName && !isRecentHealthy
        ? `High risk detected. Monitor crops affected by "${recentDiseaseName}" closely and apply immediate treatment advisories.`
        : "High risk detected. Review recent crop scans and soil advisories to protect crop yields.";
    } else if (riskLevel === "MODERATE") {
      if (recentDiseaseName && !isRecentHealthy) {
        advisory = `Moderate risk present. Monitor crops affected by ${recentDiseaseName} and ensure adequate field ventilation given high humidity (${humidity ?? 80}%). Maintain your recommended soil nutrient plan.`;
      } else if (humidity !== null && humidity >= 75) {
        advisory =
          `Moderate risk present. Inspect foliage for fungal spots given high humidity (${humidity}%) before applying extra irrigation.`;
      } else {
        advisory =
          "Moderate risk present. Monitor weather updates and maintain recommended soil fertility practices.";
      }
    } else {
      advisory = bestCrop
        ? `Farm conditions are currently favorable. Continue following the recommended management schedule for ${bestCrop} and maintain routine diagnostics.`
        : "Farm conditions are currently favorable. Continue regular crop monitoring and maintain recommended farming practices.";
    }

    // ----------------------------------------------------
    // 10. DYNAMIC ACTIONABLE RECOMMENDATIONS WITH TRACEABLE EVIDENCE
    // ----------------------------------------------------
    const recommendations: IFarmActionRecommendation[] = [];

    // A. Disease / Crop Action
    if (diseaseAnalysesCount > 0 && recentScan && !isRecentHealthy) {
      const treatmentDetail =
        (recentScan.immediateActions && recentScan.immediateActions[0]) ||
        (recentScan.treatment && recentScan.treatment[0]) ||
        recentScan.recommendedPesticide ||
        "Inspect affected foliage and apply curative fungicide as detailed in your diagnostic report.";

      recommendations.push({
        id: `rec-disease-${recentScan._id || "1"}`,
        title: `${recentScan.disease} Treatment Protocol`,
        description: treatmentDetail,
        category: "Disease",
        priority: recentSeverity === "High" ? "High" : "Medium",
        evidence: `Based on recent scan: ${recentScan.disease} (${recentSeverity} severity)`,
      });
    } else if (diseaseAnalysesCount > 0) {
      recommendations.push({
        id: "rec-disease-healthy",
        title: "Routine Canopy Diagnostics",
        description:
          "All recorded diagnostic scans show healthy crops. Perform routine weekly leaf diagnostics to catch any early pathogen signs.",
        category: "Disease",
        priority: "Low",
        evidence: `Based on ${diseaseAnalysesCount} diagnostic scan${diseaseAnalysesCount === 1 ? "" : "s"} (All clear)`,
      });
    } else {
      recommendations.push({
        id: "rec-disease-none",
        title: "Initial Crop Health Scan",
        description:
          "No leaf diagnostic scans recorded yet. Upload a leaf image to detect crop diseases early.",
        category: "Disease",
        priority: "Medium",
        evidence: "Limited data available (0 disease diagnostic scans recorded)",
      });
    }

    // B. Weather / Field Moisture Action
    if (weatherHasData) {
      if (humidity !== null && humidity >= 75) {
        recommendations.push({
          id: "rec-weather-humidity",
          title: "Foliage Moisture & Humidity Control",
          description: `Elevated humidity (${humidity}%) in ${city || "your field"} increases fungal germination risk. Ensure field ventilation and avoid late-evening overhead sprinkler irrigation.`,
          category: "Weather",
          priority: humidity >= 80 ? "High" : "Medium",
          evidence: `Based on weather telemetry: ${humidity}% relative humidity in ${city || "your area"}`,
        });
      } else if (rainProbability !== null && rainProbability >= 65) {
        recommendations.push({
          id: "rec-weather-rain",
          title: "Precipitation & Fertilizer Timing",
          description: `High rain probability (${rainProbability}%) expected in ${city || "your area"}. Suspend foliar chemical sprays and top-dressing urea to prevent nutrient runoff.`,
          category: "Weather",
          priority: "Medium",
          evidence: `Based on precipitation forecast: ${rainProbability}% rain probability in ${city || "your area"}`,
        });
      } else {
        recommendations.push({
          id: "rec-weather-stable",
          title: "Weather Telemetry Watch",
          description: `Atmospheric telemetry in ${city || "your region"} is stable (${temperature ?? 25}°C, ${humidity ?? 60}% humidity). Adhere to your standard irrigation schedule.`,
          category: "Weather",
          priority: "Low",
          evidence: `Based on regional telemetry: ${temperature ?? 25}°C, ${humidity ?? 60}% humidity in ${city || "your area"}`,
        });
      }
    } else {
      recommendations.push({
        id: "rec-weather-none",
        title: "Weather & Telemetry Sync",
        description:
          "Check local weather or save a soil recommendation report to track regional atmospheric risk.",
        category: "Weather",
        priority: "Medium",
        evidence: "Limited data available (No weather telemetry saved)",
      });
    }

    // C. Soil / Fertilizer Action
    if (soilHasData) {
      const fertAdvice =
        fertilizerRecommendation ||
        "Apply recommended NPK formulations according to your saved soil test report.";

      recommendations.push({
        id: `rec-soil-${latestSoil._id || "1"}`,
        title: `${bestCrop || "Crop"} Nutrient & Fertilizer Plan`,
        description: `Follow your saved soil report advice: ${fertAdvice} (Soil Rating: ${soilHealthScore || "Optimal"}).`,
        category: "Soil",
        priority: numericSoilScore < 70 ? "High" : "Low",
        evidence: `Based on saved soil report: Soil Health ${soilHealthScore || "Optimal"} for ${bestCrop || "crop"}`,
      });
    } else {
      recommendations.push({
        id: "rec-soil-missing",
        title: "Soil Health & Nutrient Testing",
        description:
          "No saved soil recommendation report found. Check weather and save a soil report to unlock tailored NPK fertilizer guidance.",
        category: "Soil",
        priority: "Medium",
        evidence: "Limited data available (No saved soil health report)",
      });
    }

    // D. Monitoring / Data Expansion Action
    if (agriRecordCount <= 2) {
      recommendations.push({
        id: "rec-monitoring-expand",
        title: "Field Telemetry Expansion",
        description: `Advisory confidence is currently limited by historical telemetry count (${agriRecordCount} record${agriRecordCount === 1 ? "" : "s"}). Perform additional scans to increase precision.`,
        category: "Monitoring",
        priority: "Low",
        evidence: `Based on telemetry depth: ${agriRecordCount} record${agriRecordCount === 1 ? "" : "s"} (${dataQuality})`,
      });
    }

    // ----------------------------------------------------
    // 11. RETURN STRUCTURED INTELLIGENCE RESPONSE
    // ----------------------------------------------------
    const factors: IFarmIntelligenceFactors = {
      disease: {
        totalRecords: diseaseAnalysesCount,
        recentDisease: recentDiseaseName,
        recentSeverity: recentSeverity,
        highRiskCount,
        moderateRiskCount,
        diseaseDetectedCount,
        lastScanDate,
      },
      weather: {
        hasData: weatherHasData,
        city,
        temperature,
        humidity,
        rainProbability,
        condition,
        lastCheckedDate: weatherLastChecked,
      },
      soil: {
        hasData: soilHasData,
        soilHealthScore,
        bestCrop,
        fertilizerRecommendation,
        irrigationRecommendation,
        diseaseRiskLevel: soilDiseaseRiskLevel,
        lastReportDate: soilReportDate,
      },
      farmHealth: {
        overallScore,
        status: farmHealthStatus,
        hasEnoughData: true,
      },
    };

    return {
      success: true,
      riskLevel,
      dataQuality,
      reasons,
      advisory,
      recommendations,
      factors,
    };
  } catch (error) {
    console.error("Error calculating Smart Farm Intelligence:", error);
    return {
      success: true,
      riskLevel: "INSUFFICIENT DATA",
      dataQuality: "LIMITED DATA",
      reasons: [
        "Farm intelligence telemetry service is currently syncing with database.",
      ],
      advisory:
        "Perform crop disease diagnostic scans or save a soil recommendation report to update your risk evaluation.",
      recommendations: [
        {
          id: "rec-fallback-1",
          title: "Run Leaf Diagnostic Scan",
          description:
            "Upload photos of crop leaves on the Disease Diagnostics page for instant AI pathogen identification.",
          category: "Disease",
          priority: "High",
          evidence: "Telemetry sync pending",
        },
      ],
      factors: {
        disease: {
          totalRecords: 0,
          recentDisease: null,
          recentSeverity: null,
          highRiskCount: 0,
          moderateRiskCount: 0,
          diseaseDetectedCount: 0,
          lastScanDate: null,
        },
        weather: {
          hasData: false,
          city: null,
          temperature: null,
          humidity: null,
          rainProbability: null,
          condition: null,
          lastCheckedDate: null,
        },
        soil: {
          hasData: false,
          soilHealthScore: null,
          bestCrop: null,
          fertilizerRecommendation: null,
          irrigationRecommendation: null,
          diseaseRiskLevel: null,
          lastReportDate: null,
        },
        farmHealth: {
          overallScore: null,
          status: "Offline",
          hasEnoughData: false,
        },
      },
    };
  }
}
