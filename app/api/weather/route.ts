import { NextResponse } from "next/server";
import { fetchWeatherData } from "@/lib/weather";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

function sanitizeErrorMessage(rawError: unknown): string {
  if (typeof rawError === "string") {
    if (rawError.includes("API key") || rawError.includes("OpenWeather")) {
      return "Unable to fetch weather telemetry for the requested location.";
    }
    return rawError;
  }
  if (rawError instanceof Error) {
    const msg = rawError.message;
    if (msg.includes("API key") || msg.includes("OpenWeather")) {
      return "Unable to fetch weather telemetry for the requested location.";
    }
    return msg;
  }
  return "Failed to load weather data.";
}

export async function GET(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`weather-get:${clientIp}`, 30, 60 * 1000);

    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const rawCity = searchParams.get("city") || "Pune";

    // Input Validation: city name string sanitization
    const city = rawCity.trim().replace(/[^\w\s\-,.]/gi, "");

    if (!city || city.length > 50) {
      return NextResponse.json(
        { success: false, error: "Invalid city location parameter." },
        { status: 400 }
      );
    }

    const weatherData = await fetchWeatherData(city);

    return NextResponse.json({
      success: true,
      data: weatherData,
    });
  } catch (error) {
    console.error("Error in GET /api/weather:", error);
    const sanitizedMsg = sanitizeErrorMessage(error);

    return NextResponse.json(
      { success: false, error: sanitizedMsg },
      { status: 500 }
    );
  }
}
