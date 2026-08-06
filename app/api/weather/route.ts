import { NextResponse } from "next/server";
import { fetchWeatherData } from "@/lib/weather";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city") || "Pune";

    const weatherData = await fetchWeatherData(city);

    return NextResponse.json({
      success: true,
      data: weatherData,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to load weather data.";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
