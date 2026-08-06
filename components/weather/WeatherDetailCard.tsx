"use client";

import React from "react";
import {
  Droplets,
  Wind,
  Gauge,
  Eye,
  CloudRain,
  Sunrise,
  Sunset,
  Sun,
  ShieldCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { GridContainer } from "@/components/layout/container";
import { IWeatherData } from "@/types/weather";

interface WeatherDetailCardProps {
  weather: IWeatherData;
}

export const WeatherDetailCard: React.FC<WeatherDetailCardProps> = ({
  weather,
}) => {
  const metrics = [
    {
      title: "Humidity",
      value: `${weather.humidity}%`,
      subtitle: weather.humidity > 70 ? "High Moisture" : "Moderate Humidity",
      icon: Droplets,
      color: "text-teal-600 bg-teal-100",
    },
    {
      title: "Wind Speed",
      value: `${weather.windSpeed} km/h`,
      subtitle: `Direction: ${weather.windDirection}`,
      icon: Wind,
      color: "text-blue-600 bg-blue-100",
    },
    {
      title: "Atmospheric Pressure",
      value: `${weather.pressure} hPa`,
      subtitle: "Stable Pressure System",
      icon: Gauge,
      color: "text-amber-600 bg-amber-100",
    },
    {
      title: "Visibility",
      value: `${weather.visibility} km`,
      subtitle: weather.visibility >= 10 ? "Clear Field View" : "Moderate Haze",
      icon: Eye,
      color: "text-indigo-600 bg-indigo-100",
    },
    {
      title: "Rain Probability",
      value: `${weather.rainProbability}%`,
      subtitle: weather.rainProbability > 50 ? "Shower Likely" : "Low Precipitation",
      icon: CloudRain,
      color: "text-cyan-600 bg-cyan-100",
    },
    {
      title: "UV Index",
      value: `${weather.uvIndex} / 10`,
      subtitle: "High Crop Photosynthesis",
      icon: Sun,
      color: "text-emerald-600 bg-emerald-100",
    },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-emerald-600" />
        <span>Atmospheric & Micro-Climate Telemetry</span>
      </h3>

      {/* Grid of 6 Detailed Metric Cards */}
      <GridContainer cols={3}>
        {metrics.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} variant="glass" hoverEffect>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {item.title}
                </span>
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {item.value}
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                {item.subtitle}
              </p>
            </Card>
          );
        })}
      </GridContainer>

      {/* Sunrise & Sunset Card */}
      <Card variant="glass" className="border-amber-100 bg-gradient-to-r from-amber-50/40 via-white to-amber-50/30 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-xs">
              <Sunrise className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Sunrise Time
              </span>
              <span className="text-xl font-extrabold text-slate-900">
                {weather.sunrise}
              </span>
              <span className="text-[11px] text-emerald-700 font-medium block">
                Morning Field Operations Start
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-slate-200/80 pt-4 sm:pt-0 sm:pl-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 shadow-xs">
              <Sunset className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Sunset Time
              </span>
              <span className="text-xl font-extrabold text-slate-900">
                {weather.sunset}
              </span>
              <span className="text-[11px] text-indigo-700 font-medium block">
                Evening Irrigation Threshold
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
